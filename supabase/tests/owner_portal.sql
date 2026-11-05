-- Integration checks for a disposable database with the initial schema and owner_portal.sql.
-- All test data is rolled back. Do not run against production.
begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'owner@menufy-test.invalid'),
  ('10000000-0000-0000-0000-000000000002', 'other@menufy-test.invalid'),
  ('10000000-0000-0000-0000-000000000003', 'admin@menufy-test.invalid');
update public.profiles set role = 'admin' where id = '10000000-0000-0000-0000-000000000003';
set local role anon;
do $$ begin
  perform public.submit_owned_restaurant('{}');
  raise exception 'FAIL: anonymous submission allowed';
exception when insufficient_privilege then null; end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select set_config('test.restaurant_id', public.submit_owned_restaurant('{
  "name":"Test bistro", "ico":"12345678", "city":"Bratislava", "district":"Staré Mesto",
  "address":"Testová 10", "email":"bistro@menufy-test.invalid", "phone":"+421900000000",
  "cuisine":"Slovenská", "lat":48.15, "lng":17.11
}')::text, true);
do $$ declare target uuid := current_setting('test.restaurant_id')::uuid; begin
  if not exists (select 1 from public.restaurants where id = target and status = 'pending') then raise exception 'FAIL: owner cannot see pending restaurant'; end if;
  if not exists (select 1 from public.restaurant_users where restaurant_id = target and user_id = auth.uid()) then raise exception 'FAIL: missing ownership'; end if;
  begin
    update public.restaurants set status = 'active' where id = target;
    raise exception 'FAIL: owner self-approved';
  exception when insufficient_privilege then null; end;
  begin
    perform public.review_restaurant_application(target, true);
    raise exception 'FAIL: owner approved via RPC';
  exception when insufficient_privilege then null; end;
  perform public.save_owned_menu(target, 'daily', current_date, 'draft', '[{"name":"Polievka", "price_cents":350, "allergens":[1,7]}]');
  begin
    perform public.save_owned_menu(target, 'daily', current_date, 'published', '[{"name":"Polievka", "price_cents":350, "allergens":[]}]');
    raise exception 'FAIL: pending restaurant published';
  exception when insufficient_privilege then null; end;
  begin
    perform public.save_owned_menu(target, 'daily', current_date, 'draft', '[{"name":"Chyba", "price_cents":-1, "allergens":[]}]');
    raise exception 'FAIL: negative price accepted';
  exception when invalid_parameter_value then null; end;
  if not exists (select 1 from public.menu_items i join public.menus m on m.id = i.menu_id where m.restaurant_id = target and i.name = 'Polievka') then raise exception 'FAIL: invalid save did not roll back'; end if;
  begin
    perform public.save_owned_menu(target, 'daily', current_date, 'draft', '[{"name":"Chyba", "price_cents":350, "allergens":[15]}]');
    raise exception 'FAIL: invalid allergen accepted';
  exception when invalid_parameter_value then null; end;
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
do $$ declare target uuid := current_setting('test.restaurant_id')::uuid; begin
  if exists (select 1 from public.restaurants where id = target) then raise exception 'FAIL: unrelated user sees application'; end if;
  if exists (select 1 from public.menus where restaurant_id = target) then raise exception 'FAIL: unrelated user sees draft'; end if;
  begin
    perform public.save_owned_menu(target, 'daily', current_date, 'draft', '[{"name":"Hacked", "price_cents":100, "allergens":[]}]');
    raise exception 'FAIL: unrelated user edited menu';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.restaurant_users values (auth.uid(), target, 'owner');
    raise exception 'FAIL: unrelated user claimed restaurant';
  exception when insufficient_privilege then null; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ declare target uuid := current_setting('test.restaurant_id')::uuid; begin
  if exists (select 1 from public.restaurants where id = target) or exists (select 1 from public.menus where restaurant_id = target)
  then raise exception 'FAIL: anonymous visitor sees pending content'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
do $$ declare target uuid := current_setting('test.restaurant_id')::uuid; begin
  if not exists (select 1 from public.restaurants where id = target and status = 'pending') then raise exception 'FAIL: admin cannot see queue'; end if;
  perform public.review_restaurant_application(target, true);
end $$;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
do $$ declare target uuid := current_setting('test.restaurant_id')::uuid; begin
  perform public.save_owned_menu(target, 'daily', current_date, 'published', '[{"name":"Nová polievka", "price_cents":425, "allergens":[7]}]');
  perform public.save_owned_menu(target, 'standard', null, 'published', '[{"name":"Rezeň", "price_cents":990, "allergens":[1,3]}]');
  perform public.save_owned_menu(target, 'daily', current_date + 1, 'draft', '[{"name":"Zajtra", "price_cents":700, "allergens":[]}]');
  if (select count(*) from public.menus where restaurant_id = target and kind = 'daily' and date = current_date) <> 1 then raise exception 'FAIL: duplicate daily menu'; end if;
  if exists (select 1 from public.menu_items i join public.menus m on m.id = i.menu_id where m.restaurant_id = target and i.name = 'Polievka') then raise exception 'FAIL: old items not replaced'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ declare target uuid := current_setting('test.restaurant_id')::uuid; begin
  if not exists (select 1 from public.restaurants where id = target and status = 'active') then raise exception 'FAIL: approved restaurant not public'; end if;
  if (select count(*) from public.menus where restaurant_id = target) <> 2 then raise exception 'FAIL: published menus missing or draft leaked'; end if;
  if (select count(*) from public.menu_items i join public.menus m on m.id = i.menu_id where m.restaurant_id = target) <> 2 then raise exception 'FAIL: published items missing or draft items leaked'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select public.save_owned_menu(current_setting('test.restaurant_id')::uuid, 'daily', current_date, 'draft', '[{"name":"Stiahnuté menu", "price_cents":400, "allergens":[]}]');
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  if exists (select 1 from public.menus where restaurant_id = current_setting('test.restaurant_id')::uuid and kind = 'daily') then raise exception 'FAIL: unpublished menu remains public'; end if;
end $$;
rollback;
