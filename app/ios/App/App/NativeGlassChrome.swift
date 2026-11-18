import Capacitor
import UIKit
import WebKit

private final class WeakScriptMessageHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?

    init(target: WKScriptMessageHandler) {
        self.target = target
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        target?.userContentController(userContentController, didReceive: message)
    }
}

@MainActor
final class MenufyBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler {
    private let chrome = NativeGlassChrome()
    private var heartSnapshot: [[String: Any]] = []
    private var heartScrollObservation: NSKeyValueObservation?

    override func webView(with frame: CGRect, configuration: WKWebViewConfiguration) -> WKWebView {
        configuration.userContentController.add(
            WeakScriptMessageHandler(target: self),
            contentWorld: .page,
            name: "menufyNativeChrome"
        )
        return super.webView(with: frame, configuration: configuration)
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        chrome.onAction = { [weak self] action in
            self?.runChromeAction(action)
        }
        chrome.onHeartTap = { [weak self] slug in
            guard let data = try? JSONEncoder().encode(slug),
                  let value = String(data: data, encoding: .utf8) else { return }
            self?.webView?.evaluateJavaScript("window.__menufyChrome?.heartTap(\(value))")
        }
        heartScrollObservation = webView?.scrollView.observe(\.contentOffset, options: [.new]) { [weak self] _, _ in
            DispatchQueue.main.async { [weak self] in self?.refreshNativeHearts() }
        }
        view.addSubview(chrome)
        chrome.frame = view.bounds
        chrome.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        chrome.frame = view.bounds
        chrome.updateSafeArea(view.safeAreaInsets)
        view.bringSubviewToFront(chrome)
        refreshNativeHearts()
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "menufyNativeChrome", let payload = message.body as? [String: Any] else { return }
        var convertedPayload = payload
        if let rects = payload["rects"] as? [String: Any], let webView {
            var convertedRects = rects
            for key in ["map", "filter", "search"] {
                guard let value = rects[key] as? [String: Any],
                      let x = (value["x"] as? NSNumber)?.doubleValue,
                      let y = (value["y"] as? NSNumber)?.doubleValue,
                      let width = (value["w"] as? NSNumber)?.doubleValue,
                      let height = (value["h"] as? NSNumber)?.doubleValue,
                      width > 0, height > 0 else { continue }
                let webRect = CGRect(x: x, y: y, width: width, height: height)
                let nativeRect = webView.convert(webRect, to: chrome)
                convertedRects[key] = [
                    "x": nativeRect.minX,
                    "y": nativeRect.minY,
                    "w": nativeRect.width,
                    "h": nativeRect.height,
                ]
            }
            convertedPayload["rects"] = convertedRects
        }
        if let hearts = payload["hearts"] as? [[String: Any]] { heartSnapshot = hearts }
        convertedPayload["hearts"] = positionedHeartSnapshot()
        chrome.update(convertedPayload)
    }

    private func refreshNativeHearts() {
        chrome.update(["hearts": positionedHeartSnapshot()])
    }

    private func positionedHeartSnapshot() -> [[String: Any]] {
        guard let webView else { return [] }
        let scrollY = webView.scrollView.contentOffset.y
        return heartSnapshot.compactMap { heart in
            guard let x = (heart["x"] as? NSNumber)?.doubleValue,
                  let y = (heart["y"] as? NSNumber)?.doubleValue,
                  let width = (heart["w"] as? NSNumber)?.doubleValue,
                  let height = (heart["h"] as? NSNumber)?.doubleValue,
                  width > 0, height > 0 else { return nil }
            let webRect = CGRect(x: x, y: y - scrollY, width: width, height: height)
            let nativeRect = webView.convert(webRect, to: chrome)
            return [
                "slug": heart["slug"] as? String ?? "",
                "active": heart["active"] as? Bool ?? false,
                "x": nativeRect.minX,
                "y": nativeRect.minY,
                "w": nativeRect.width,
                "h": nativeRect.height,
            ]
        }
    }

    private func runChromeAction(_ action: String) {
        let script: String
        switch action {
        case "toggleMap", "toggleFilters", "toggleSearch":
            script = "window.__menufyChrome?.\(action)()"
        case "home": script = "window.__menufyChrome?.navigate('/')"
        case "saved": script = "window.__menufyChrome?.navigate('/saved')"
        case "notifications": script = "window.__menufyChrome?.navigate('/notifications')"
        case "account": script = "window.__menufyChrome?.navigate('/account')"
        default: return
        }
        webView?.evaluateJavaScript(script)
    }
}

@MainActor
private final class NativeGlassChrome: UIView, UITabBarDelegate {
    private struct Tab {
        let title: String
        let symbol: String
        let action: String
    }

    private let tabItems = [
        Tab(title: "Domov", symbol: "house", action: "home"),
        Tab(title: "Uložené", symbol: "heart", action: "saved"),
        Tab(title: "Upozornenia", symbol: "bell", action: "notifications"),
        Tab(title: "Účet", symbol: "person", action: "account"),
    ]
    private let topKeys = ["map", "filter", "search"]
    private let bottomBar = UITabBar()
    private var legacyTopGlass: [String: UIVisualEffectView] = [:]
    private var topButtons: [String: UIButton] = [:]
    private var legacyHeartGlass: [String: UIVisualEffectView] = [:]
    private var heartButtons: [String: UIButton] = [:]
    private var heartFrames: [String: CGRect] = [:]
    private var filterBadge: UILabel?
    private var topFrames: [String: CGRect] = [:]
    private var selectedTab = 0
    private var safeInsets = UIEdgeInsets.zero
    private var darkAppearance = false
    private var panelsOpen = false
    private var isBrowsing = true

    var onAction: ((String) -> Void)?
    var onHeartTap: ((String) -> Void)?

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .clear
        isUserInteractionEnabled = true

        for key in topKeys {
            if #unavailable(iOS 26.0) {
                let glass = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
                glass.isUserInteractionEnabled = false
                glass.clipsToBounds = true
                addSubview(glass)
                legacyTopGlass[key] = glass
            }

            let button = UIButton(type: .system)
            button.accessibilityIdentifier = key
            button.accessibilityLabel = topAccessibilityLabel(for: key, active: false)
            button.tintColor = brandGreen
            if #available(iOS 26.0, *) {
                var configuration = UIButton.Configuration.glass()
                configuration.image = UIImage(systemName: topSymbol(for: key, active: false))
                configuration.baseForegroundColor = .label
                button.configuration = configuration
            } else {
                button.setImage(UIImage(systemName: topSymbol(for: key, active: false)), for: .normal)
            }
            button.addTarget(self, action: #selector(topButtonTapped(_:)), for: .touchUpInside)
            addSubview(button)
            topButtons[key] = button
        }

        let badge = UILabel()
        badge.font = .systemFont(ofSize: 10, weight: .bold)
        badge.textAlignment = .center
        badge.textColor = .white
        badge.backgroundColor = brandGreen
        badge.layer.cornerRadius = 9
        badge.clipsToBounds = true
        badge.isHidden = true
        badge.isUserInteractionEnabled = false
        addSubview(badge)
        filterBadge = badge

        // Use UIKit's own tab bar so iOS supplies its real Liquid Glass
        // material and selection interaction instead of a custom-drawn copy.
        bottomBar.delegate = self
        bottomBar.tintColor = brandGreen
        bottomBar.unselectedItemTintColor = .secondaryLabel
        bottomBar.itemPositioning = .fill
        bottomBar.items = tabItems.map { item in
            let selectedSymbol = item.symbol == "heart" ? "heart.fill"
                : item.symbol == "bell" ? "bell.fill"
                : item.symbol == "person" ? "person.fill"
                : item.symbol
            return UITabBarItem(
                title: item.title,
                image: UIImage(systemName: item.symbol),
                selectedImage: UIImage(systemName: selectedSymbol)
            )
        }
        bottomBar.selectedItem = bottomBar.items?.first
        let pan = UIPanGestureRecognizer(target: self, action: #selector(didPanBottomBar(_:)))
        pan.cancelsTouchesInView = false
        bottomBar.addGestureRecognizer(pan)
        addSubview(bottomBar)

    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func updateSafeArea(_ insets: UIEdgeInsets) {
        safeInsets = insets
        setNeedsLayout()
    }

    func update(_ payload: [String: Any]) {
        if let browsing = payload["browse"] as? Bool { isBrowsing = browsing }
        if let rects = payload["rects"] as? [String: Any] {
            for key in topKeys {
                guard let value = rects[key] as? [String: Any],
                      let x = (value["x"] as? NSNumber)?.doubleValue,
                      let y = (value["y"] as? NSNumber)?.doubleValue,
                      let width = (value["w"] as? NSNumber)?.doubleValue,
                      let height = (value["h"] as? NSNumber)?.doubleValue,
                      width > 0, height > 0 else {
                    topFrames[key] = nil
                    continue
                }
                topFrames[key] = CGRect(x: x, y: y, width: width, height: height)
            }
        }
        if let open = payload["open"] as? [String: Bool] {
            updateTopState(key: "map", active: open["map"] ?? false)
            updateTopState(key: "filter", active: open["filters"] ?? false)
            updateTopState(key: "search", active: open["search"] ?? false)
            let nextPanelsOpen = open.values.contains(true)
            if nextPanelsOpen != panelsOpen {
                panelsOpen = nextPanelsOpen
                if !panelsOpen {
                    bottomBar.isHidden = false
                }
                UIView.animate(withDuration: 0.2) {
                    self.bottomBar.alpha = self.panelsOpen ? 0 : 1
                } completion: { _ in
                    self.bottomBar.isHidden = self.panelsOpen
                }
            }
        }
        if let hearts = payload["hearts"] as? [[String: Any]] {
            updateHeartButtons(hearts)
        }
        if let count = payload["count"] as? Int, let badge = filterBadge {
            badge.text = count > 9 ? "9+" : String(count)
            badge.isHidden = count <= 0 || topFrames["filter"] == nil
        }
        if let dark = payload["dark"] as? Bool, dark != darkAppearance {
            darkAppearance = dark
            overrideUserInterfaceStyle = dark ? .dark : .light
        }
        if let index = payload["activeTab"] as? Int, tabItems.indices.contains(index) {
            selectedTab = index
            if let items = bottomBar.items, items.indices.contains(index) {
                bottomBar.selectedItem = items[index]
            }
        }
        setNeedsLayout()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        if isBrowsing {
            let size: CGFloat = 44
            let gap: CGFloat = 8
            let right = bounds.width - 14
            let y = safeInsets.top + 6
            let fallback: [String: CGRect] = [
                "search": CGRect(x: right - size, y: y, width: size, height: size),
                "filter": CGRect(x: right - size * 2 - gap, y: y, width: size, height: size),
                "map": CGRect(x: right - size * 3 - gap * 2, y: y, width: size, height: size),
            ]
            for key in topKeys where topFrames[key] == nil {
                topFrames[key] = fallback[key]
            }
        }
        for key in topKeys {
            let frame = topFrames[key] ?? .zero
            legacyTopGlass[key]?.frame = frame
            legacyTopGlass[key]?.layer.cornerRadius = frame.height / 2
            topButtons[key]?.frame = frame
            topButtons[key]?.isHidden = frame.isEmpty
        }
        if let filterFrame = topFrames["filter"] {
            filterBadge?.frame = CGRect(x: filterFrame.maxX - 6, y: filterFrame.minY - 4, width: 18, height: 18)
        }

        for (slug, button) in heartButtons {
            let rect = heartFrames[slug] ?? .zero
            let frame = bounds.intersects(rect) ? rect : .zero
            button.frame = frame
            button.isHidden = frame.isEmpty
            legacyHeartGlass[slug]?.frame = frame
            legacyHeartGlass[slug]?.layer.cornerRadius = frame.height / 2
        }

        let barHeight: CGFloat = 80
        let barWidth = max(0, min(bounds.width, 540))
        for slug in heartButtons.keys {
            if let glass = legacyHeartGlass[slug] { bringSubviewToFront(glass) }
            if let button = heartButtons[slug] { bringSubviewToFront(button) }
        }
        bottomBar.frame = CGRect(
            x: (bounds.width - barWidth) / 2,
            y: bounds.height - safeInsets.bottom - 4 - barHeight,
            width: barWidth,
            height: barHeight
        )
        bringSubviewToFront(bottomBar)
        for key in topKeys {
            if let glass = legacyTopGlass[key] { bringSubviewToFront(glass) }
            if let button = topButtons[key] { bringSubviewToFront(button) }
        }
        if let badge = filterBadge { bringSubviewToFront(badge) }
    }

    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        guard !isHidden, alpha > 0.01 else { return nil }
        for key in topKeys.reversed() {
            guard let button = topButtons[key], !button.isHidden, button.frame.contains(point) else { continue }
            let localPoint = button.convert(point, from: self)
            if let target = button.hitTest(localPoint, with: event) { return target }
        }
        if !bottomBar.isHidden, bottomBar.frame.contains(point) {
            let localPoint = bottomBar.convert(point, from: self)
            if let target = bottomBar.hitTest(localPoint, with: event) { return target }
        }
        for slug in heartButtons.keys {
            guard let button = heartButtons[slug], !button.isHidden, button.frame.contains(point) else { continue }
            let localPoint = button.convert(point, from: self)
            if let target = button.hitTest(localPoint, with: event) { return target }
        }
        return nil
    }

    private func updateHeartButtons(_ values: [[String: Any]]) {
        var visible = Set<String>()
        for value in values {
            guard let slug = value["slug"] as? String, !slug.isEmpty,
                  let x = (value["x"] as? NSNumber)?.doubleValue,
                  let y = (value["y"] as? NSNumber)?.doubleValue,
                  let width = (value["w"] as? NSNumber)?.doubleValue,
                  let height = (value["h"] as? NSNumber)?.doubleValue,
                  width > 0, height > 0 else { continue }
            visible.insert(slug)
            let active = value["active"] as? Bool ?? false
            let button: UIButton
            if let existing = heartButtons[slug] {
                button = existing
            } else {
                if #unavailable(iOS 26.0) {
                    let glass = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
                    glass.isUserInteractionEnabled = false
                    glass.clipsToBounds = true
                    addSubview(glass)
                    legacyHeartGlass[slug] = glass
                }
                let created = UIButton(type: .system)
                created.accessibilityIdentifier = slug
                created.addTarget(self, action: #selector(heartButtonTapped(_:)), for: .touchUpInside)
                addSubview(created)
                heartButtons[slug] = created
                button = created
            }
            heartFrames[slug] = CGRect(x: x, y: y, width: width, height: height)
            updateHeartState(button, active: active)
        }
        for slug in Array(heartFrames.keys) where !visible.contains(slug) {
            heartFrames[slug] = nil
        }
    }

    private func updateHeartState(_ button: UIButton, active: Bool) {
        let symbol = active ? "heart.fill" : "heart"
        button.accessibilityLabel = active ? "Odobrať z obľúbených" : "Pridať do obľúbených"
        if #available(iOS 26.0, *) {
            var configuration = button.configuration ?? UIButton.Configuration.glass()
            configuration.image = UIImage(systemName: symbol)
            configuration.baseForegroundColor = active ? brandGreen : .label
            button.configuration = configuration
        } else {
            button.setImage(UIImage(systemName: symbol), for: .normal)
            button.tintColor = active ? brandGreen : .label
        }
    }

    @objc private func heartButtonTapped(_ sender: UIButton) {
        guard let slug = sender.accessibilityIdentifier else { return }
        onHeartTap?(slug)
    }

    private func updateTopState(key: String, active: Bool) {
        guard let button = topButtons[key] else { return }
        let symbol = topSymbol(for: key, active: active)
        if #available(iOS 26.0, *) {
            var configuration = button.configuration ?? UIButton.Configuration.glass()
            configuration.image = UIImage(systemName: symbol)
            configuration.baseForegroundColor = active ? brandGreen : .label
            button.configuration = configuration
        } else {
            button.setImage(UIImage(systemName: symbol), for: .normal)
            button.tintColor = active ? brandGreen : .label
        }
        button.tintColor = brandGreen
        button.isSelected = active
        button.accessibilityLabel = topAccessibilityLabel(for: key, active: active)
    }

    private func topSymbol(for key: String, active: Bool) -> String {
        let symbol: String
        switch key {
        case "map": symbol = active ? "xmark" : "map"
        case "search": symbol = active ? "xmark" : "magnifyingglass"
        default: symbol = "line.3.horizontal.decrease"
        }
        return symbol
    }

    func tabBar(_ tabBar: UITabBar, didSelect item: UITabBarItem) {
        guard let index = tabBar.items?.firstIndex(of: item), tabItems.indices.contains(index) else { return }
        selectTab(index, navigate: true)
    }

    private func topAccessibilityLabel(for key: String, active: Bool) -> String {
        switch key {
        case "map": return active ? "Zavrieť mapu" : "Otvoriť mapu"
        case "filter": return active ? "Zavrieť filtre" : "Filtre"
        default: return active ? "Zavrieť hľadanie" : "Hľadať"
        }
    }

    @objc private func topButtonTapped(_ sender: UIButton) {
        guard let key = sender.accessibilityIdentifier else { return }
        let action = key == "filter" ? "toggleFilters" : key == "map" ? "toggleMap" : "toggleSearch"
        onAction?(action)
    }

    @objc private func didPanBottomBar(_ gesture: UIPanGestureRecognizer) {
        let location = gesture.location(in: bottomBar)
        switch gesture.state {
        case .began:
            updateTabFromX(location.x)
        case .changed:
            updateTabFromX(location.x)
        case .ended:
            updateTabFromX(location.x)
            settleDragSelection()
            onAction?(tabItems[selectedTab].action)
        case .cancelled, .failed:
            settleDragSelection()
        default:
            break
        }
    }

    private func updateTabFromX(_ x: CGFloat) {
        let itemWidth = bottomBar.bounds.width / CGFloat(tabItems.count)
        guard itemWidth > 0 else { return }
        let clampedX = min(max(x, itemWidth / 2), bottomBar.bounds.width - itemWidth / 2)
        let index = min(tabItems.count - 1, max(0, Int(clampedX / itemWidth)))
        if selectedTab != index {
            selectedTab = index
            if let items = bottomBar.items, items.indices.contains(index) {
                bottomBar.selectedItem = items[index]
            }
        }
    }

    private func selectTab(_ index: Int, navigate: Bool) {
        guard tabItems.indices.contains(index) else { return }
        selectedTab = index
        if let items = bottomBar.items, items.indices.contains(index) {
            bottomBar.selectedItem = items[index]
        }
        if navigate { onAction?(tabItems[index].action) }
    }

    private func settleDragSelection() {
        // The system tab bar owns the selection animation; no custom spring is
        // added when a drag ends.
    }

    private var brandGreen: UIColor {
        UIColor(red: 23.0 / 255.0, green: 107.0 / 255.0, blue: 67.0 / 255.0, alpha: 1)
    }
}
