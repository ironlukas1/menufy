-- ---------------------------------------------------------------------------
-- DEV ONLY – wipe every Menufy table so 0001_init.sql can be applied from
-- scratch. Use this on a project whose schema was left half-applied (or whose
-- placeholder tables have the wrong shape). It deletes all rows in these
-- tables; there is no undo.
-- ---------------------------------------------------------------------------

drop table if exists
  public.notification_reads,
  public.notifications,
  public.favorites,
  public.restaurant_users,
  public.menu_items,
  public.menus,
  public.restaurant_reviews,
  public.restaurant_type_links,
  public.restaurant_types,
  public.profiles,
  public.restaurants
cascade;

-- Left over from earlier runs; recreated by 0001_init.sql.
drop trigger if exists on_auth_user_created on auth.users;
