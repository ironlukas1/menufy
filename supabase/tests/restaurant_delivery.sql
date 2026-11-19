-- Disposable database: initial schema, owner_portal.sql, restaurant_settings.sql, restaurant_delivery.sql.
begin;
insert into auth.users (id,email) values
 ('60000000-0000-0000-0000-000000000001','delivery-owner@test.invalid'),
 ('60000000-0000-0000-0000-000000000002','delivery-other@test.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000001',true);
select set_config('test.delivery_restaurant',public.submit_owned_restaurant('{
 "name":"Delivery Bistro","ico":"12345678","city":"Bratislava","district":"Ružinov",
 "address":"Testová 12","email":"bistro@test.invalid","phone":"+421900000000","cuisine":"Slovenská","lat":48.15,"lng":17.11
}')::text,true);
select set_config('test.delivery_payload','{
 "name":"Delivery Bistro","city":"Bratislava","district":"Ružinov","address":"Testová 12",
 "email":"bistro@test.invalid","phone":"+421900000000","web":"","tagline":"","cuisine":"Slovenská",
 "lat":48.15,"lng":17.11,"image":"","hours":[],"delivery_available":true,"delivery_eta":"30 – 45 min",
 "delivery_links":[{"name":"Wolt","url":"https://wolt.com/sk/svk/bratislava/restaurant/test"}],"status":"active"
}',true);
do $$ declare saved jsonb; invalid jsonb; target uuid := current_setting('test.delivery_restaurant')::uuid; begin
 saved := public.update_owned_restaurant(target,current_setting('test.delivery_payload')::jsonb);
 if saved->'delivery_links'->0->>'name' <> 'Wolt' or saved->>'delivery_eta' <> '' or saved->>'status' <> 'pending'
 then raise exception 'FAIL: links, external time or approval'; end if;
 -- Older clients cannot erase links by omitting the new field.
 saved := public.update_owned_restaurant(target,current_setting('test.delivery_payload')::jsonb - 'delivery_links');
 if jsonb_array_length(saved->'delivery_links') <> 1 then raise exception 'FAIL: old client erased links'; end if;
 for invalid in select value from jsonb_array_elements('[
  [{"name":"Wolt","url":"https://wolt.com.evil.test/test"}],
  [{"name":"Wolt","url":"javascript:alert(1)"}],
  [{"name":"Wolt","url":"https://evil.test/test"}],
  [{"name":"Wolt","url":"https://wolt.com/"}],
  [{"name":"Wolt","url":"https://wolt.com/a"},{"name":"Wolt","url":"https://wolt.com/b"}],
  [{"name":"Unknown","url":"https://wolt.com/test"}],null,{}
 ]'::jsonb) loop
  begin
   perform public.update_owned_restaurant(target,current_setting('test.delivery_payload')::jsonb || jsonb_build_object('delivery_links',invalid));
   raise exception 'FAIL: invalid link accepted';
  exception when invalid_parameter_value then null; end;
 end loop;
 saved := public.update_owned_restaurant(target,current_setting('test.delivery_payload')::jsonb || '{"delivery_links":[]}');
 if saved->'delivery_links' <> '[]'::jsonb or saved->>'delivery_eta' <> '30 – 45 min'
 then raise exception 'FAIL: unlink or own estimate'; end if;
end $$;
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000002',true);
do $$ begin
 begin
  perform public.update_owned_restaurant(current_setting('test.delivery_restaurant')::uuid,current_setting('test.delivery_payload')::jsonb);
  raise exception 'FAIL: other user edited delivery';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
 begin
  perform public.update_owned_restaurant(current_setting('test.delivery_restaurant')::uuid,current_setting('test.delivery_payload')::jsonb);
  raise exception 'FAIL: anonymous delivery edit';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
