import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
)

export function restaurantImageUrl(image: string): string {
  const prefix = "restaurant-images/";
  return image.startsWith(prefix)
    ? supabase.storage.from("restaurant-images").getPublicUrl(image.slice(prefix.length)).data.publicUrl
    : image;
}
