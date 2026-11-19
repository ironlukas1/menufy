-- Disposable database only: requires initial schema, owner_portal.sql and restaurant_settings.sql.
begin;
insert into auth.users (id,email) values
 ('40000000-0000-0000-0000-000000000001','settings-owner@test.invalid'),
 ('40000000-0000-0000-0000-000000000002','settings-other@test.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000001',true);
select set_config('test.settings_restaurant',public.submit_owned_restaurant('{
 "name":"Settings Bistro","ico":"12345678","city":"Bratislava","district":"Ružinov",
 "address":"Testová 12","email":"bistro@test.invalid","phone":"+421900000000","cuisine":"Slovenská","lat":48.15,"lng":17.11
}')::text,true);
select set_config('test.settings_photo',current_setting('test.settings_restaurant')||'/50000000-0000-0000-0000-000000000001.png',true);
insert into storage.objects (bucket_id,name) values ('restaurant-images',current_setting('test.settings_photo'));
select set_config('test.settings_payload',jsonb_build_object(
 'name','Updated Bistro','city','Bratislava','district','Ružinov','address','Nová ulica 20',
 'email','contact@test.invalid','phone','+421911222333','web','https://bistro.sk/menu','tagline','Fresh food',
 'cuisine','Talianska','lat',48.16,'lng',17.12,'image','restaurant-images/'||current_setting('test.settings_photo'),
 'delivery_available',true,'delivery_eta','30 – 45 min','hours',jsonb_build_array(
  jsonb_build_array('Pondelok','20:00 – 04:00'),jsonb_build_array('Utorok','11:00 – 24:00'),
  jsonb_build_array('Streda','Zatvorené'),jsonb_build_array('Štvrtok','11:00 – 22:00'),
  jsonb_build_array('Piatok','11:00 – 22:00'),jsonb_build_array('Sobota','Zatvorené'),jsonb_build_array('Nedeľa','Zatvorené')
 ),'status','active','ico','99999999','slug','attacker-slug'
)::text,true);
do $$ declare target uuid:=current_setting('test.settings_restaurant')::uuid; saved jsonb; begin
 saved:=public.update_owned_restaurant(target,current_setting('test.settings_payload')::jsonb);
 if saved->>'name'<>'Updated Bistro' or saved->>'address'<>'Nová ulica 20' or saved->>'image'<>'restaurant-images/'||current_setting('test.settings_photo') then raise exception 'FAIL: profile changes not saved'; end if;
 if saved->>'status'<>'pending' or saved->>'ico'<>'12345678' or saved->>'slug'='attacker-slug' then raise exception 'FAIL: protected fields changed'; end if;
 if not exists (select 1 from public.restaurant_type_links l join public.restaurant_types t on t.id=l.type_id where l.restaurant_id=target and t.name='Talianska') then raise exception 'FAIL: cuisine not updated'; end if;
 delete from storage.objects where bucket_id='restaurant-images' and name=current_setting('test.settings_photo');
 if not exists (select 1 from storage.objects where name=current_setting('test.settings_photo')) then raise exception 'FAIL: active photo deleted'; end if;
 begin
  perform public.update_owned_restaurant(target,current_setting('test.settings_payload')::jsonb||'{"web":"javascript:alert(1)"}');
  raise exception 'FAIL: unsafe website accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.update_owned_restaurant(target,current_setting('test.settings_payload')::jsonb||'{"hours":[["Pondelok","99:00 – 22:00"]]}');
  raise exception 'FAIL: invalid hours accepted';
 exception when invalid_parameter_value then null; end;
 begin
  perform public.update_owned_restaurant(target,current_setting('test.settings_payload')::jsonb||jsonb_build_object('image','restaurant-images/'||target||'/50000000-0000-0000-0000-000000000099.png'));
  raise exception 'FAIL: missing upload accepted';
 exception when invalid_parameter_value then null; end;
 if (select name from public.restaurants where id=target)<>'Updated Bistro' then raise exception 'FAIL: validation damaged stored profile'; end if;
end $$;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000002',true);
do $$ begin
 begin
  perform public.update_owned_restaurant(current_setting('test.settings_restaurant')::uuid,current_setting('test.settings_payload')::jsonb);
  raise exception 'FAIL: other user edited profile';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects (bucket_id,name) values ('restaurant-images',current_setting('test.settings_restaurant')||'/50000000-0000-0000-0000-000000000002.jpg');
  raise exception 'FAIL: other user uploaded to owner folder';
 exception when insufficient_privilege then null; end;
 if exists (select 1 from storage.objects where name=current_setting('test.settings_photo')) then raise exception 'FAIL: other user listed photo objects'; end if;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin
  perform public.update_owned_restaurant(current_setting('test.settings_restaurant')::uuid,current_setting('test.settings_payload')::jsonb);
  raise exception 'FAIL: anonymous profile edit allowed';
 exception when insufficient_privilege then null; end;
 begin
  insert into storage.objects (bucket_id,name) values ('restaurant-images',current_setting('test.settings_photo'));
  raise exception 'FAIL: anonymous photo upload allowed';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','40000000-0000-0000-0000-000000000001',true);
do $$ begin
 perform public.update_owned_restaurant(current_setting('test.settings_restaurant')::uuid,current_setting('test.settings_payload')::jsonb||'{"image":"","hours":[]}');
 delete from storage.objects where bucket_id='restaurant-images' and name=current_setting('test.settings_photo');
 if exists (select 1 from storage.objects where name=current_setting('test.settings_photo')) then raise exception 'FAIL: unused photo not removable'; end if;
 begin
  insert into storage.objects(bucket_id,name) values ('restaurant-images',current_setting('test.settings_restaurant')||'/bad.svg');
  raise exception 'FAIL: invalid photo path allowed';
 exception when insufficient_privilege then null; end;
end $$;
rollback;
