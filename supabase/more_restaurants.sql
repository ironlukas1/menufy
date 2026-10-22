-- 9 more restaurants (generated from app/src/data/restaurants.ts). Re-runnable.
-- Run after the backend migration; favorites need these rows (FK restaurant_id).
begin;

insert into public.restaurants
  (slug, name, initials, tagline, city, district, address, phone, email, web, rating, rating_count, lat, lng,
   delivery_available, delivery_eta, hours, image, gallery, status)
values
  ('lotus-pho', 'Lotus Pho', 'LP', 'Vietnamská kuchyňa', 'Bratislava', 'Staré Mesto', 'Obchodná 38, Staré Mesto', '+421 917 440 218', 'ahoj@lotuspho.sk', 'lotuspho.sk', 4.6, 241, 48.1468, 17.1072, true, '20 – 35 min', '[["Pondelok","11:00 – 21:00"],["Utorok","11:00 – 21:00"],["Streda","11:00 – 21:00"],["Štvrtok","11:00 – 21:00"],["Piatok","11:00 – 21:00"],["Sobota","12:00 – 21:00"],["Nedeľa","Zatvorené"]]'::jsonb, 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('dvor-u-kohuta', 'Dvor u Kohúta', 'DK', 'Tradičná slovenská reštaurácia', 'Bratislava', 'Petržalka', 'Romanova 21, Petržalka', '+421 902 318 744', 'rezervacie@dvorukohuta.sk', 'dvorukohuta.sk', 4.4, 176, 48.1205, 17.1043, false, '', '[["Pondelok","10:30 – 22:00"],["Utorok","10:30 – 22:00"],["Streda","10:30 – 22:00"],["Štvrtok","10:30 – 22:00"],["Piatok","10:30 – 22:00"],["Sobota","11:00 – 22:00"],["Nedeľa","11:00 – 20:00"]]'::jsonb, 'https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('green-bowl', 'Green Bowl', 'GB', 'Vegánske bowly a šaláty', 'Bratislava', 'Nové Mesto', 'Račianska 66, Nové Mesto', '+421 911 520 336', 'hello@greenbowl.sk', 'greenbowl.sk', 4.7, 158, 48.1665, 17.1295, true, '25 – 40 min', '[["Pondelok","10:00 – 18:00"],["Utorok","10:00 – 18:00"],["Streda","10:00 – 18:00"],["Štvrtok","10:00 – 18:00"],["Piatok","10:00 – 18:00"],["Sobota","Zatvorené"],["Nedeľa","Zatvorené"]]'::jsonb, 'https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('pasta-fresca', 'Pasta Fresca', 'PF', 'Čerstvé domáce cestoviny', 'Bratislava', 'Ružinov', 'Ružinovská 42, Ružinov', '+421 944 672 019', 'ciao@pastafresca.sk', 'pastafresca.sk', 4.5, 203, 48.153, 17.161, true, '30 – 45 min', '[["Pondelok","11:00 – 22:00"],["Utorok","11:00 – 22:00"],["Streda","11:00 – 22:00"],["Štvrtok","11:00 – 22:00"],["Piatok","11:00 – 22:00"],["Sobota","12:00 – 22:00"],["Nedeľa","12:00 – 21:00"]]'::jsonb, 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('smash-point', 'Smash Point', 'SP', 'Smash burgery', 'Bratislava', 'Petržalka', 'Einsteinova 19, Petržalka', '+421 908 761 552', 'burger@smashpoint.sk', 'smashpoint.sk', 4.3, 289, 48.134, 17.119, true, '25 – 40 min', '[["Pondelok","11:00 – 22:00"],["Utorok","11:00 – 22:00"],["Streda","11:00 – 22:00"],["Štvrtok","11:00 – 22:00"],["Piatok","11:00 – 22:00"],["Sobota","11:00 – 23:00"],["Nedeľa","12:00 – 21:00"]]'::jsonb, 'https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('taverna-mykonos', 'Taverna Mykonos', 'TM', 'Grécka kuchyňa', 'Bratislava', 'Nové Mesto', 'Vajnorská 100, Nové Mesto', '+421 915 203 887', 'info@tavernamykonos.sk', 'tavernamykonos.sk', 4.6, 134, 48.164, 17.151, false, '', '[["Pondelok","11:00 – 22:00"],["Utorok","11:00 – 22:00"],["Streda","11:00 – 22:00"],["Štvrtok","11:00 – 22:00"],["Piatok","11:00 – 22:00"],["Sobota","12:00 – 22:00"],["Nedeľa","12:00 – 21:00"]]'::jsonb, 'https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('sushi-kumo', 'Sushi Kumo', 'KU', 'Japonská kuchyňa', 'Košice', 'Sever', 'Watsonova 4, Košice', '+421 907 834 120', 'objednavky@sushikumo.sk', 'sushikumo.sk', 4.5, 87, 48.7355, 21.244, true, '35 – 50 min', '[["Pondelok","11:00 – 21:00"],["Utorok","11:00 – 21:00"],["Streda","11:00 – 21:00"],["Štvrtok","11:00 – 21:00"],["Piatok","11:00 – 21:00"],["Sobota","12:00 – 21:00"],["Nedeľa","Zatvorené"]]'::jsonb, 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('trattoria-luna', 'Trattoria Luna', 'TL', 'Talianska kuchyňa', 'Košice', 'Staré Mesto', 'Mlynská 12, Košice', '+421 905 447 391', 'prenotazioni@trattorialuna.sk', 'trattorialuna.sk', 4.4, 112, 48.719, 21.262, true, '30 – 45 min', '[["Pondelok","11:00 – 22:00"],["Utorok","11:00 – 22:00"],["Streda","11:00 – 22:00"],["Štvrtok","11:00 – 22:00"],["Piatok","11:00 – 22:00"],["Sobota","12:00 – 22:00"],["Nedeľa","12:00 – 21:00"]]'::jsonb, 'https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('bistro-zahradka', 'Bistro Záhradka', 'BZ', 'Domáca a vegetariánska kuchyňa', 'Košice', 'Juh', 'Južná trieda 48, Košice', '+421 918 556 230', 'obed@bistrozahradka.sk', 'bistrozahradka.sk', 4.7, 64, 48.706, 21.261, false, '', '[["Pondelok","10:30 – 15:30"],["Utorok","10:30 – 15:30"],["Streda","10:30 – 15:30"],["Štvrtok","10:30 – 15:30"],["Piatok","10:30 – 15:30"],["Sobota","Zatvorené"],["Nedeľa","Zatvorené"]]'::jsonb, 'https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active')
on conflict (slug) do nothing;

insert into public.restaurant_type_links (restaurant_id, type_id)
select r.id, t.id
from (values
  ('lotus-pho', 'azijska'),
  ('dvor-u-kohuta', 'slovenska'),
  ('green-bowl', 'veganska'),
  ('pasta-fresca', 'talianska'),
  ('smash-point', 'burger'),
  ('taverna-mykonos', 'stredomorska'),
  ('sushi-kumo', 'azijska'),
  ('trattoria-luna', 'talianska'),
  ('trattoria-luna', 'stredomorska'),
  ('bistro-zahradka', 'slovenska'),
  ('bistro-zahradka', 'veganska')
) v (slug, type)
join public.restaurants r on r.slug = v.slug
join public.restaurant_types t on t.slug = v.type
on conflict do nothing;

insert into public.menus (restaurant_id, kind, date, status, published_at)
select r.id, v.kind, v.date::date, 'published', coalesce((v.date || ' 06:45+00')::timestamptz, now())
from (values
  ('lotus-pho', 'daily', '2026-10-22'),
  ('lotus-pho', 'daily', '2026-10-23'),
  ('lotus-pho', 'standard', null),
  ('dvor-u-kohuta', 'daily', '2026-10-22'),
  ('dvor-u-kohuta', 'daily', '2026-10-23'),
  ('dvor-u-kohuta', 'standard', null),
  ('green-bowl', 'daily', '2026-10-22'),
  ('green-bowl', 'daily', '2026-10-23'),
  ('green-bowl', 'standard', null),
  ('pasta-fresca', 'daily', '2026-10-22'),
  ('pasta-fresca', 'daily', '2026-10-23'),
  ('pasta-fresca', 'standard', null),
  ('smash-point', 'daily', '2026-10-22'),
  ('smash-point', 'daily', '2026-10-23'),
  ('smash-point', 'standard', null),
  ('taverna-mykonos', 'daily', '2026-10-22'),
  ('taverna-mykonos', 'daily', '2026-10-23'),
  ('taverna-mykonos', 'standard', null),
  ('sushi-kumo', 'daily', '2026-10-22'),
  ('sushi-kumo', 'daily', '2026-10-23'),
  ('sushi-kumo', 'standard', null),
  ('trattoria-luna', 'daily', '2026-10-22'),
  ('trattoria-luna', 'daily', '2026-10-23'),
  ('trattoria-luna', 'standard', null),
  ('bistro-zahradka', 'daily', '2026-10-22'),
  ('bistro-zahradka', 'daily', '2026-10-23'),
  ('bistro-zahradka', 'standard', null)
) v (slug, kind, date)
join public.restaurants r on r.slug = v.slug
on conflict do nothing;

insert into public.menu_items (menu_id, name, description, weight, price_cents, allergens, tag, position)
select m.id, v.name, v.description, v.weight, v.price_cents, v.allergens::smallint[], v.tag, v.position
from (values
  ('lotus-pho', 'daily', '2026-10-22', 0, 'Pho bo', 'Hovädzí vývar, ryžové rezance, bylinky', '0,5 l', 420, '{6,9}', 'Polievka'),
  ('lotus-pho', 'daily', '2026-10-22', 1, 'Bun cha', 'Grilovaná bravčovina, rezance, rybacia omáčka', '380 g', 940, '{4,6}', 'Menu 1'),
  ('lotus-pho', 'daily', '2026-10-22', 2, 'Tofu s bok choy', 'Restované tofu, zázvor, jazmínová ryža', '350 g', 860, '{6,11}', 'Vegán'),
  ('lotus-pho', 'daily', '2026-10-23', 0, 'Kuracia pho ga', 'Kurací vývar, rezance, limetka', '0,5 l', 400, '{6,9}', 'Polievka'),
  ('lotus-pho', 'daily', '2026-10-23', 1, 'Kari s kuracím mäsom', 'Kokosové kari, sladké zemiaky, ryža', '380 g', 920, '{6}', 'Menu 1'),
  ('lotus-pho', 'daily', '2026-10-23', 2, 'Zeleninové jarné závitky', 'Ryžový papier, mäta, arašidová omáčka', '4 ks', 790, '{5,6}', 'Vegán'),
  ('lotus-pho', 'standard', null, 0, 'Banh mi s bravčovinou', 'Bageta, pečená bravčovina, nakladaná zelenina', '300 g', 850, '{1,3,6}', 'Stále'),
  ('dvor-u-kohuta', 'daily', '2026-10-22', 0, 'Kapustnica s klobásou', 'Kyslá kapusta, sušené slivky, hríby', '0,33 l', 310, '{1,7}', 'Polievka'),
  ('dvor-u-kohuta', 'daily', '2026-10-22', 1, 'Vyprážaný rezeň, zemiakový šalát', 'Bravčové stehno, domáci šalát', '150 / 200 g', 920, '{1,3,10}', 'Menu 1'),
  ('dvor-u-kohuta', 'daily', '2026-10-22', 2, 'Strapačky s kyslou kapustou', 'Zemiakové halušky, kapusta, slanina', '380 g', 820, '{1,3}', 'Menu 2'),
  ('dvor-u-kohuta', 'daily', '2026-10-23', 0, 'Zemiaková kyslá polievka', 'Smotana, kôpor, zemiaky', '0,33 l', 290, '{7,9}', 'Polievka'),
  ('dvor-u-kohuta', 'daily', '2026-10-23', 1, 'Sviečková na smotane, knedľa', 'Hovädzie, smotanová omáčka, brusnice', '150 / 200 g', 1040, '{1,3,7,9,10}', 'Menu 1'),
  ('dvor-u-kohuta', 'daily', '2026-10-23', 2, 'Vyprážaný syr, hranolky', 'Eidam, tatárska omáčka', '120 / 200 g', 840, '{1,3,7,10}', 'Vege'),
  ('dvor-u-kohuta', 'standard', null, 0, 'Bryndzové pirohy', 'Bryndza, smotana, slaninka', '350 g', 860, '{1,3,7}', 'Stále'),
  ('green-bowl', 'daily', '2026-10-22', 0, 'Šošovicový dahl', 'Červená šošovica, kokos, koriander', '0,33 l', 340, '{9}', 'Polievka'),
  ('green-bowl', 'daily', '2026-10-22', 1, 'Buddha bowl s falafelom', 'Quinoa, hummus, pečená zelenina', '400 g', 930, '{11}', 'Vegán'),
  ('green-bowl', 'daily', '2026-10-22', 2, 'Teriyaki tempeh bowl', 'Tempeh, ryža, edamame, sezam', '380 g', 950, '{1,6,11}', 'Fit'),
  ('green-bowl', 'daily', '2026-10-23', 0, 'Paradajková s bazalkou', 'Pečené paradajky, olivový olej', '0,33 l', 320, '{}', 'Polievka'),
  ('green-bowl', 'daily', '2026-10-23', 1, 'Cícerové kari bowl', 'Cícer, špenát, basmati', '400 g', 890, '{}', 'Vegán'),
  ('green-bowl', 'daily', '2026-10-23', 2, 'Šalát s pečenou tekvicou', 'Rukola, tekvica, granátové jablko, orechy', '320 g', 870, '{8}', 'Fit'),
  ('green-bowl', 'standard', null, 0, 'Raw cheesecake', 'Kešu, datle, maliny', '120 g', 460, '{8}', 'Dezert'),
  ('pasta-fresca', 'daily', '2026-10-22', 0, 'Minestrone', 'Zeleninová polievka s cestovinou', '0,33 l', 300, '{1,9}', 'Polievka'),
  ('pasta-fresca', 'daily', '2026-10-22', 1, 'Tagliatelle al ragù', 'Domáce tagliatelle, hovädzie ragù', '350 g', 980, '{1,3,9}', 'Menu 1'),
  ('pasta-fresca', 'daily', '2026-10-22', 2, 'Ravioli so špenátom a ricottou', 'Maslo, šalvia, parmezán', '320 g', 940, '{1,3,7}', 'Vege'),
  ('pasta-fresca', 'daily', '2026-10-23', 0, 'Krémová z pečeného cesnaku', 'Smotana, krutóny', '0,33 l', 310, '{1,7}', 'Polievka'),
  ('pasta-fresca', 'daily', '2026-10-23', 1, 'Pappardelle s hubami', 'Hríby, tymián, parmezán', '350 g', 960, '{1,3,7}', 'Vege'),
  ('pasta-fresca', 'daily', '2026-10-23', 2, 'Spaghetti carbonara', 'Guanciale, žĺtok, pecorino', '330 g', 990, '{1,3,7}', 'Menu 1'),
  ('pasta-fresca', 'standard', null, 0, 'Tiramisu', 'Mascarpone, espresso, kakao', '140 g', 490, '{1,3,7}', 'Dezert'),
  ('smash-point', 'daily', '2026-10-22', 0, 'Cheddar smash, hranolky', 'Dvojitý hovädzí smash, cheddar, cibuľa', '300 / 150 g', 990, '{1,3,7,10}', 'Menu 1'),
  ('smash-point', 'daily', '2026-10-22', 1, 'Crispy chicken burger', 'Chrumkavé kuracie, coleslaw, majonéza', '320 / 150 g', 950, '{1,3,7}', 'Menu 2'),
  ('smash-point', 'daily', '2026-10-22', 2, 'Beyond smash', 'Rastlinný burger, vegánsky syr', '300 / 150 g', 1020, '{1,6,10}', 'Vegán'),
  ('smash-point', 'daily', '2026-10-23', 0, 'Bacon smash, batátové hranolky', 'Slanina, BBQ omáčka, cheddar', '320 / 150 g', 1050, '{1,3,7,10}', 'Menu 1'),
  ('smash-point', 'daily', '2026-10-23', 1, 'Halloumi burger', 'Grilovaný halloumi, pesto, rukola', '300 / 150 g', 960, '{1,7,8}', 'Vege'),
  ('smash-point', 'standard', null, 0, 'Domáca limonáda', 'Citrón, mäta', '0,5 l', 350, '{}', 'Nápoj'),
  ('taverna-mykonos', 'daily', '2026-10-22', 0, 'Avgolemono', 'Kurací vývar s citrónom a vajcom', '0,33 l', 330, '{3,9}', 'Polievka'),
  ('taverna-mykonos', 'daily', '2026-10-22', 1, 'Gyros tanier, tzatziki', 'Bravčový gyros, pita, hranolky', '200 / 150 g', 970, '{1,7}', 'Menu 1'),
  ('taverna-mykonos', 'daily', '2026-10-22', 2, 'Grécky šalát s fetou', 'Paradajky, uhorka, olivy, feta', '300 g', 820, '{7}', 'Vege'),
  ('taverna-mykonos', 'daily', '2026-10-23', 0, 'Fazuľová fasolada', 'Biela fazuľa, paradajky, zeler', '0,33 l', 300, '{9}', 'Polievka'),
  ('taverna-mykonos', 'daily', '2026-10-23', 1, 'Musaka', 'Baklažán, mleté mäso, bešamel', '380 g', 1010, '{1,3,7}', 'Menu 1'),
  ('taverna-mykonos', 'standard', null, 0, 'Souvlaki z grilu', 'Kuracie špízy, pita, tzatziki', '250 g', 1120, '{1,7}', 'Stále'),
  ('sushi-kumo', 'daily', '2026-10-22', 0, 'Miso polievka', 'Tofu, wakame, jarná cibuľka', '0,3 l', 290, '{6}', 'Polievka'),
  ('sushi-kumo', 'daily', '2026-10-22', 1, 'Sushi set 12 ks', 'Losos, avokádo, uhorka', '12 ks', 1190, '{1,4,6,11}', 'Menu 1'),
  ('sushi-kumo', 'daily', '2026-10-22', 2, 'Yasai yakisoba', 'Pšeničné rezance, zelenina, sója', '350 g', 880, '{1,6,11}', 'Vege'),
  ('sushi-kumo', 'daily', '2026-10-23', 0, 'Miso polievka', 'Tofu, wakame, jarná cibuľka', '0,3 l', 290, '{6}', 'Polievka'),
  ('sushi-kumo', 'daily', '2026-10-23', 1, 'Chicken katsu curry', 'Vyprážané kuracie, japonské kari, ryža', '380 g', 990, '{1,3,6,9}', 'Menu 1'),
  ('sushi-kumo', 'standard', null, 0, 'Poke bowl s lososom', 'Ryža, losos, edamame, mango', '400 g', 1240, '{4,6,11}', 'Stále'),
  ('trattoria-luna', 'daily', '2026-10-22', 0, 'Ribollita', 'Toskánska fazuľová polievka s chlebom', '0,33 l', 320, '{1,9}', 'Polievka'),
  ('trattoria-luna', 'daily', '2026-10-22', 1, 'Pizza diavola', 'Pikantná saláma, mozzarella', '450 g', 960, '{1,7}', 'Menu 1'),
  ('trattoria-luna', 'daily', '2026-10-22', 2, 'Penne all''arrabbiata', 'Paradajky, čili, petržlen', '350 g', 830, '{1}', 'Vegán'),
  ('trattoria-luna', 'daily', '2026-10-23', 0, 'Krémová z cukety', 'Cuketa, parmezán', '0,33 l', 300, '{7}', 'Polievka'),
  ('trattoria-luna', 'daily', '2026-10-23', 1, 'Risotto ai frutti di mare', 'Krevety, mušle, biele víno', '350 g', 1180, '{2,7,12,14}', 'Menu 1'),
  ('trattoria-luna', 'standard', null, 0, 'Pizza margherita', 'San Marzano, mozzarella, bazalka', '420 g', 840, '{1,7}', 'Stále'),
  ('bistro-zahradka', 'daily', '2026-10-22', 0, 'Hrášková s mätou', 'Zelený hrášok, mäta, krutóny', '0,33 l', 280, '{1,7}', 'Polievka'),
  ('bistro-zahradka', 'daily', '2026-10-22', 1, 'Kurací paprikáš, halušky', 'Kuracie stehno, smotanová omáčka', '150 / 250 g', 860, '{1,3,7}', 'Menu 1'),
  ('bistro-zahradka', 'daily', '2026-10-22', 2, 'Pečená zelenina s kuskusom', 'Cuketa, paprika, hummus', '350 g', 790, '{1,11}', 'Vegán'),
  ('bistro-zahradka', 'daily', '2026-10-23', 0, 'Šošovicová na kyslo', 'Šošovica, ocot, bobkový list', '0,33 l', 280, '{9}', 'Polievka'),
  ('bistro-zahradka', 'daily', '2026-10-23', 1, 'Plnená paprika, paradajková omáčka', 'Mleté mäso, ryža, zemiaky', '300 / 200 g', 880, '{1,7}', 'Menu 1'),
  ('bistro-zahradka', 'daily', '2026-10-23', 2, 'Zeleninové rizoto', 'Hrášok, mrkva, bylinky', '350 g', 760, '{7}', 'Vege'),
  ('bistro-zahradka', 'standard', null, 0, 'Domáca jablková štrúdľa', 'Jablká, škorica, orechy', '150 g', 340, '{1,3,7,8}', 'Dezert')
) v (slug, kind, date, position, name, description, weight, price_cents, allergens, tag)
join public.restaurants r on r.slug = v.slug
join public.menus m on m.restaurant_id = r.id and m.kind = v.kind and m.date is not distinct from v.date::date
where not exists (select 1 from public.menu_items x where x.menu_id = m.id and x.position = v.position);

insert into public.restaurant_reviews (restaurant_id, author, stars, reviewed_on, body)
select r.id, v.author, v.stars, v.reviewed_on, v.body
from (values
  ('lotus-pho', 'Lucia H.', 5, 'pred 3 dňami', 'Vývar ako vo Vietname, porcia obrovská.'),
  ('lotus-pho', 'Tomáš B.', 4, 'pred 2 týždňami', 'Rýchla obsluha, cez obed sa čaká na stôl.'),
  ('dvor-u-kohuta', 'Milan R.', 4, 'pred týždňom', 'Poctivá slovenská klasika, rezeň cez celý tanier.'),
  ('green-bowl', 'Simona V.', 5, 'pred 4 dňami', 'Konečne vegánske menu, ktoré zasýti.'),
  ('green-bowl', 'Ondrej P.', 4, 'pred 3 týždňami', 'Chutné, len by mohlo byť viac sedenia.'),
  ('pasta-fresca', 'Andrea S.', 5, 'pred 5 dňami', 'Cestoviny robia ráno priamo v podniku, je to cítiť.'),
  ('smash-point', 'Patrik L.', 4, 'pred 2 dňami', 'Burger chrumká na okrajoch presne ako má.'),
  ('taverna-mykonos', 'Eva D.', 5, 'pred týždňom', 'Musaka ako na dovolenke.'),
  ('sushi-kumo', 'Katarína M.', 5, 'pred 4 dňami', 'Najlepšie sushi na Severe, ryba vždy čerstvá.'),
  ('trattoria-luna', 'Róbert K.', 4, 'pred 2 týždňami', 'Pizza z pece na drevo, príjemná terasa.'),
  ('bistro-zahradka', 'Mária G.', 5, 'pred 3 dňami', 'Varia ako babka, ceny super.')
) v (slug, author, stars, reviewed_on, body)
join public.restaurants r on r.slug = v.slug
where not exists (select 1 from public.restaurant_reviews x where x.restaurant_id = r.id and x.author = v.author);

commit;
