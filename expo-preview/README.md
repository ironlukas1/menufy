# menufy · Expo Go preview

The menufy app in `../app` is a Vite web app (packaged natively with Capacitor).
Expo Go cannot run a Capacitor app, so this little Expo project is a thin
`WebView` shell that loads the Vite dev server and lets you try the real UI on
an iPhone through Expo Go — no macOS or Xcode needed.

## 1. Start the web app

```bash
cd ../app
pnpm dev --host 0.0.0.0 --port 5173 --strictPort
```

`--host` is required so the phone can reach the server over the network.

Optional, for API-backed screens (recommended): start the backend in another
terminal so the Vite proxy on `/api` has something to talk to.

```bash
cd ../backend
pnpm dev          # http://localhost:3001
```

## 2. Start Expo

```bash
cd ../expo-preview
npm start
```

Scan the QR code with the Camera app on the iPhone and open it in Expo Go.

The app resolves the web app URL automatically: it takes the host Metro is
served from and appends `:5173`. If the phone and the laptop are on the same
Wi-Fi this just works.

## 3. If the phone cannot reach the laptop

Blocked networks (campus Wi-Fi, guest networks, AP isolation) need two tunnels:
one for Expo/Metro and one for the Vite server.

```bash
# terminal 1 – expose the web app
npx cloudflared tunnel --url http://localhost:5173
# -> https://something.trycloudflare.com
```

Vite refuses unknown hostnames by default, so use the preview config that
relaxes `server.allowedHosts`:

```bash
cd ../app
pnpm dev --config vite.config.preview.ts --host 0.0.0.0 --port 5173 --strictPort
```

```bash
# terminal 2 – Expo over a tunnel, with the URL from above
cd expo-preview
EXPO_PUBLIC_MENUFY_URL=https://something.trycloudflare.com npx expo start --tunnel
```

The default Expo tunnel needs `npx expo login` once (`--no-browser` for
username/password). Without an account, `npx expo start --tunnel ngrok` works
anonymously. The CLI prints an `exp://…on.expo.app` URL (or read
`launchAsset.url` from `http://localhost:8081/`).

You can also point the WebView at any other URL, e.g. the deployed web app:

```bash
EXPO_PUBLIC_MENUFY_URL=https://menufy.sk npm start
```

## Notes

- This folder is only a preview harness. Real iOS builds use `../app/ios`
  (Capacitor + Xcode).
- Everything native stays in Expo Go: `react-native-webview` is bundled with
  Expo Go, so no development build is needed.
- Pull requests to this folder should not contain app business logic.
