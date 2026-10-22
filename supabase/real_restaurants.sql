-- 4 real restaurants (generated from app/src/data/restaurants.ts). Re-runnable.
-- Run after the backend migration; favorites need these rows (FK restaurant_id).
begin;

insert into public.restaurants
  (slug, name, initials, tagline, city, district, address, phone, email, web, rating, rating_count, lat, lng,
   delivery_available, delivery_eta, hours, image, gallery, status)
values
  ('venturska-klubovna', 'Ventúrska Klubovňa', 'VK', 'Pub a reštaurácia v centre', 'Bratislava', 'Staré Mesto', 'Ventúrska 1, Staré Mesto', '+421 901 902 362', 'venturska@nasaklubovna.sk', 'klubovna.sk', 0, 0, 48.1421, 17.1063, false, '', '[["Pondelok","11:00 – 24:00"],["Utorok","11:00 – 24:00"],["Streda","11:00 – 24:00"],["Štvrtok","11:00 – 24:00"],["Piatok","11:00 – 24:00"],["Sobota","11:00 – 24:00"],["Nedeľa","11:00 – 24:00"]]'::jsonb, 'https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('bevanda-river-park', 'Bevanda River Park', 'BR', 'Obedové menu a pizza pri Dunaji', 'Bratislava', 'Staré Mesto', 'Dvořákovo nábrežie 10, Staré Mesto', '+421 905 551 705', 'river@bevanda.sk', 'riverpark.bevanda.sk', 0, 0, 48.1418, 17.0888, true, 'do 14:00', '[["Pondelok","10:30 – 14:30"],["Utorok","10:30 – 14:30"],["Streda","10:30 – 14:30"],["Štvrtok","10:30 – 14:30"],["Piatok","10:30 – 14:30"],["Sobota","Zatvorené"],["Nedeľa","Zatvorené"]]'::jsonb, 'https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('hostinec-na-sanci', 'Hostinec Na Šanci', 'HŠ', 'Hostinec so slovenskou kuchyňou', 'Bratislava', 'Staré Mesto', 'Šancová 54, Staré Mesto', '+421 903 804 445', 'hostinecnasanci@gmail.com', 'facebook.com/hostinec.nasanci', 0, 0, 48.1566, 17.1143, true, '', '[["Pondelok","11:00 – 24:00"],["Utorok","11:00 – 24:00"],["Streda","11:00 – 24:00"],["Štvrtok","11:00 – 24:00"],["Piatok","11:00 – 01:00"],["Sobota","15:00 – 01:00"],["Nedeľa","15:00 – 23:00"]]'::jsonb, 'https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active'),
  ('pizza-4-you', 'Pizza 4 You', 'P4', 'Nočná donáška pizze', 'Bratislava', 'Petržalka', 'Kopčianska 16, Petržalka', '', '', '', 0, 0, 48.1194, 17.0961, true, '75 min', '[["Pondelok","20:00 – 04:00"],["Utorok","20:00 – 04:00"],["Streda","20:00 – 04:00"],["Štvrtok","20:00 – 04:00"],["Piatok","20:00 – 04:00"],["Sobota","20:00 – 04:00"],["Nedeľa","Zatvorené"]]'::jsonb, 'https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900', '["https://images.unsplash.com/photo-1564759296729-771e78c26df7?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1564759224907-65b945ff0e84?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900","https://images.unsplash.com/photo-1565895405227-31cffbe0cf86?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900"]'::jsonb, 'active')
on conflict (slug) do nothing;

insert into public.restaurant_type_links (restaurant_id, type_id)
select r.id, t.id
from (values
  ('venturska-klubovna', 'slovenska'),
  ('bevanda-river-park', 'slovenska'),
  ('bevanda-river-park', 'talianska'),
  ('hostinec-na-sanci', 'slovenska'),
  ('pizza-4-you', 'talianska')
) v (slug, type)
join public.restaurants r on r.slug = v.slug
join public.restaurant_types t on t.slug = v.type
on conflict do nothing;

insert into public.menus (restaurant_id, kind, date, status, published_at)
select r.id, v.kind, v.date::date, 'published', coalesce((v.date || ' 06:45+00')::timestamptz, now())
from (values
  ('venturska-klubovna', 'daily', '2026-10-22'),
  ('venturska-klubovna', 'daily', '2026-10-23'),
  ('bevanda-river-park', 'daily', '2026-10-22'),
  ('bevanda-river-park', 'daily', '2026-10-23'),
  ('hostinec-na-sanci', 'daily', '2026-10-22'),
  ('hostinec-na-sanci', 'daily', '2026-10-23')
) v (slug, kind, date)
join public.restaurants r on r.slug = v.slug
on conflict do nothing;

insert into public.menu_items (menu_id, name, description, weight, price_cents, allergens, tag, position)
select m.id, v.name, v.description, v.weight, v.price_cents, v.allergens::smallint[], v.tag, v.position
from (values
  ('venturska-klubovna', 'daily', '2026-10-22', 0, 'Šampiňónová polievka', 'Samostatne 2,60 €', '0,25 l', 150, '{1,7}', 'Polievka'),
  ('venturska-klubovna', 'daily', '2026-10-22', 1, 'Vyprážaný syr, varené zemiaky s maslom, tatárska omáčka', 'Menu podávame 11:00 – 14:00', '350 g', 700, '{1,3,7,10}', 'Menu 1'),
  ('venturska-klubovna', 'daily', '2026-10-22', 2, 'Moravský vrabec, kapusta, knedľa', 'Menu podávame 11:00 – 14:00', '400 / 150 g', 740, '{1,3,7,12}', 'Menu 2'),
  ('venturska-klubovna', 'daily', '2026-10-22', 3, 'Chilli con carne, ryža, listový šalát', 'Menu podávame 11:00 – 14:00', '350 / 150 g', 800, '{1,12}', 'Menu 3'),
  ('venturska-klubovna', 'daily', '2026-10-23', 0, 'Gulášová polievka', 'Samostatne 2,60 €', '0,25 l', 150, '{1}', 'Polievka'),
  ('venturska-klubovna', 'daily', '2026-10-23', 1, 'Palacinky s tvarohom, čokoláda a šľahačka', 'Menu podávame 11:00 – 14:00', '300 g', 700, '{1,3,7}', 'Vege'),
  ('venturska-klubovna', 'daily', '2026-10-23', 2, 'Zemiaková placka plnená bravčovým mäsom a kuracou pečeňou', 'Menu podávame 11:00 – 14:00', '400 / 150 g', 740, '{1,3,7}', 'Menu 1'),
  ('venturska-klubovna', 'daily', '2026-10-23', 3, 'Morčacia roláda, šunka, niva, pyré, kapustový šalát, baby špenát', 'Menu podávame 11:00 – 14:00', '350 / 150 g', 800, '{1,3,7,12}', 'Menu 2'),
  ('bevanda-river-park', 'daily', '2026-10-22', 0, 'Cícerová s opraženou slaninkou', '', '0,28 l', 170, '{}', 'Polievka'),
  ('bevanda-river-park', 'daily', '2026-10-22', 1, 'Vývar s hovädzím mäsom, zeleninou a rezancami', '', '0,28 l', 170, '{1,3,9}', 'Polievka'),
  ('bevanda-river-park', 'daily', '2026-10-22', 2, 'Pečené kuracie stehno, dusená ryža, hlávkový šalát', '', '250 / 200 / 10 g', 690, '{}', 'Menu 1'),
  ('bevanda-river-park', 'daily', '2026-10-22', 3, 'Grilovaná bravčová panenka v trojfarebnom korení, julienne hranolky, demi glacé', '', '150 / 200 g', 850, '{}', 'Menu 2'),
  ('bevanda-river-park', 'daily', '2026-10-22', 4, 'Zapekané batatové lodičky s cheddarom, prosciuttom a vajíčkom', 'Bylinkový dressing', '350 g', 690, '{3,7}', 'Menu 3'),
  ('bevanda-river-park', 'daily', '2026-10-22', 5, 'Šúľance plnené makom a slivkovým lekvárom', 'Maková posýpka, maslo', '380 g', 650, '{1,3,7}', 'Vege'),
  ('bevanda-river-park', 'daily', '2026-10-22', 6, 'Grilovaný tuniak, grilovaná zelenina, varené baby zemiaky', 'Bylinková majonéza', '200 / 100 / 100 / 20 g', 1090, '{3,4,7}', 'Menu 4'),
  ('bevanda-river-park', 'daily', '2026-10-22', 7, 'Vegan špagety aglio olio e peperoncino', 'Grilované cherry, kešu parmezán', '380 g', 850, '{1,8}', 'Vegán'),
  ('bevanda-river-park', 'daily', '2026-10-22', 8, 'Šalát s grilovaným syrom halloumi a malinovým dresingom', 'Pizza chlieb', '300 g', 850, '{1,3,7}', 'Vege'),
  ('bevanda-river-park', 'daily', '2026-10-22', 9, 'Pizza Contadina', 'Salsa, mozzarella, slanina, niva, cibuľa', '500 g', 750, '{1,7}', 'Pizza'),
  ('bevanda-river-park', 'daily', '2026-10-22', 10, 'Pizza sandwich s chorizom, feta syrom, salsou a kapari', '', '250 g', 600, '{1,3,7}', 'Pizza'),
  ('bevanda-river-park', 'daily', '2026-10-23', 0, 'Brokolicovo-batatový krém s krutónmi', '', '0,28 l', 170, '{1,3,7}', 'Polievka'),
  ('bevanda-river-park', 'daily', '2026-10-23', 1, 'Vývar so slepačím mäsom, zeleninou a rezancami', '', '0,28 l', 170, '{1,3,9}', 'Polievka'),
  ('bevanda-river-park', 'daily', '2026-10-23', 2, 'Restované kuracie pečienky na cibuľke, dusená ryža, kyslá uhorka', '', '150 / 200 / 30 g', 690, '{1,12}', 'Menu 1'),
  ('bevanda-river-park', 'daily', '2026-10-23', 3, 'Vyprážaný bravčový rezeň, slovenský cibuľový šalát s pažítkou', '', '130 / 250 g', 690, '{1,3,7}', 'Menu 2'),
  ('bevanda-river-park', 'daily', '2026-10-23', 4, 'Grilovaný encián, hranolky, brusnice', '', '120 / 200 / 20 g', 690, '{7}', 'Vege'),
  ('bevanda-river-park', 'daily', '2026-10-23', 5, 'Šalát s grilovaným syrom halloumi a malinovým dresingom', 'Pizza chlieb', '300 g', 850, '{1,3,7}', 'Vege'),
  ('bevanda-river-park', 'daily', '2026-10-23', 6, 'Grilovaný tuniak, grilovaná zelenina, varené baby zemiaky', 'Bylinková majonéza', '200 / 100 / 100 / 20 g', 1090, '{3,4,7}', 'Menu 3'),
  ('bevanda-river-park', 'daily', '2026-10-23', 7, 'Vegan špagety aglio olio e peperoncino', 'Grilované cherry, kešu parmezán', '380 g', 850, '{1,8}', 'Vegán'),
  ('bevanda-river-park', 'daily', '2026-10-23', 8, 'Pizza Mexico', 'Salsa, mozzarella, saláma, klobása, fazuľa, baranie rohy', '500 g', 750, '{1,7}', 'Pizza'),
  ('bevanda-river-park', 'daily', '2026-10-23', 9, 'Pizza sandwich s chorizom, feta syrom, salsou a kapari', '', '250 g', 600, '{1,3,7}', 'Pizza'),
  ('hostinec-na-sanci', 'daily', '2026-10-22', 0, 'Čevapčiči s varenými zemiakmi, horčicou a cibuľou', 'Polievka: kelová s klobáskou', '', 790, '{}', 'Menu 1'),
  ('hostinec-na-sanci', 'daily', '2026-10-22', 1, 'Vyprážaný bravčový rezeň s varenými zemiakmi a domácou tatárskou omáčkou', 'Polievka: kelová s klobáskou', '', 790, '{}', 'Menu 2'),
  ('hostinec-na-sanci', 'daily', '2026-10-22', 2, 'Kurací gyros s hranolkami a tzatziki šalátom', 'Polievka: kelová s klobáskou', '', 790, '{}', 'Menu 3'),
  ('hostinec-na-sanci', 'daily', '2026-10-22', 3, 'Zeleninový šalát s grilovaným oštiepkom a dresingom', 'Polievka: kelová s klobáskou', '', 790, '{}', 'Vege'),
  ('hostinec-na-sanci', 'daily', '2026-10-23', 0, 'Bravčové plátky v horčicovej omáčke, opekané zemiaky, miešaný šalát', 'Polievka: cibuľová so syrom', '', 790, '{}', 'Menu 1'),
  ('hostinec-na-sanci', 'daily', '2026-10-23', 1, 'Hovädzí mexický chilli burger so syrom, hranolky, tatárska omáčka', 'Polievka: cibuľová so syrom', '', 890, '{}', 'Menu 2'),
  ('hostinec-na-sanci', 'daily', '2026-10-23', 2, 'Kurací gyros s hranolkami a tzatziki šalátom', 'Polievka: cibuľová so syrom', '', 790, '{}', 'Menu 3'),
  ('hostinec-na-sanci', 'daily', '2026-10-23', 3, 'Zeleninový šalát s grilovaným oštiepkom a dresingom', 'Polievka: cibuľová so syrom', '', 790, '{}', 'Vege')
) v (slug, kind, date, position, name, description, weight, price_cents, allergens, tag)
join public.restaurants r on r.slug = v.slug
join public.menus m on m.restaurant_id = r.id and m.kind = v.kind and m.date is not distinct from v.date::date
where not exists (select 1 from public.menu_items x where x.menu_id = m.id and x.position = v.position);

commit;
