-- Disposable database only, with initial schema + owner_portal + member_reviews + google_ratings.
begin;
insert into auth.users(id,email) values
 ('60000000-0000-0000-0000-000000000001','google-owner@test.invalid'),
 ('60000000-0000-0000-0000-000000000002','google-other@test.invalid'),
 ('60000000-0000-0000-0000-000000000003','google-admin@test.invalid');
update public.profiles set role='admin' where id='60000000-0000-0000-0000-000000000003';
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000001',true);
select set_config('test.google_restaurant',public.submit_owned_restaurant('{
 "name":"Google Test Bistro","ico":"12345678","city":"Bratislava","district":"Ružinov","address":"Testová 12",
 "email":"bistro@test.invalid","phone":"+421900000000","cuisine":"Slovenská","lat":48.15,"lng":17.11
}')::text,true);
select public.set_restaurant_google_place(current_setting('test.google_restaurant')::uuid,'ChIJtestRestaurant123');
do $$ begin
 if not exists(select 1 from public.restaurants where id=current_setting('test.google_restaurant')::uuid and google_place_id='ChIJtestRestaurant123' and status='pending') then raise exception 'FAIL: owner linkage changed status'; end if;
 begin
  perform public.set_restaurant_google_place(current_setting('test.google_restaurant')::uuid,'https://maps.google.com');
  raise exception 'FAIL: map URL accepted as ID';
 exception when invalid_parameter_value then null; end;
end $$;
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000002',true);
do $$ begin
 begin
  perform public.set_restaurant_google_place(current_setting('test.google_restaurant')::uuid,'ChIJattacker12345');
  raise exception 'FAIL: unrelated user changed linkage';
 exception when insufficient_privilege then null; end;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin
  perform public.set_restaurant_google_place(current_setting('test.google_restaurant')::uuid,'ChIJattacker12345');
  raise exception 'FAIL: anonymous link edit allowed';
 exception when insufficient_privilege then null; end;
 if exists(select 1 from public.restaurant_community_ratings()) then raise exception 'FAIL: fabricated ratings returned'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000003',true);
select public.review_restaurant_application(current_setting('test.google_restaurant')::uuid,true);
select public.set_restaurant_google_place(current_setting('test.google_restaurant')::uuid,'ChIJadminLinked123');
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000001',true);
insert into public.restaurant_reviews(restaurant_id,user_id,author,stars,body)
values(current_setting('test.google_restaurant')::uuid,auth.uid(),'Test Owner',4,'Real member experience');
reset role;
insert into public.restaurant_reviews(restaurant_id,author,stars,body)
values(current_setting('test.google_restaurant')::uuid,'Imported sample',5,'Imported prototype content');
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if not exists(select 1 from public.restaurant_community_ratings() where rating=4 and rating_count=1) then raise exception 'FAIL: imported sample mixed into member rating'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','60000000-0000-0000-0000-000000000001',true);
select public.set_restaurant_google_place(current_setting('test.google_restaurant')::uuid,'');
do $$ begin
 if not exists(select 1 from public.restaurants where id=current_setting('test.google_restaurant')::uuid and google_place_id is null and status='active') then raise exception 'FAIL: unlink changed approval'; end if;
end $$;
rollback;
