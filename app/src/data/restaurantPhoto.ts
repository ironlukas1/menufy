import { IMAGE_EXTENSIONS, MAX_RESTAURANT_IMAGE_SIZE } from "./restaurantSettings.ts";

export function restaurantPhotoType(bytes: Uint8Array): string | null {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}
function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Fotografiu sa nepodarilo načítať. Vyberte ju znova."));
    reader.onerror = () => reject(new Error("Súbor sa nepodarilo prečítať. Uložte fotografiu do zariadenia a vyberte ju znova."));
    reader.onabort = () => reject(new Error("Načítanie fotografie bolo prerušené. Vyberte ju znova."));
    reader.readAsDataURL(blob);
  });
}
export async function prepareRestaurantPhoto(source: File): Promise<{ file: File; preview: string }> {
  if (source.size <= 0 || source.size > MAX_RESTAURANT_IMAGE_SIZE) throw new Error("Fotografia musí mať najviac 5 MB a nesmie byť prázdna.");
  const type = restaurantPhotoType(new Uint8Array(await source.slice(0, 16).arrayBuffer()));
  if (!type) throw new Error("Obsah súboru nie je JPG, PNG ani WebP. Exportujte fotografiu do jedného z týchto formátov; samotné premenovanie prípony nestačí.");
  const extension = IMAGE_EXTENSIONS[type];
  const file = new File([source], `${source.name.replace(/\.[^.]+$/, "")}.${extension}`, { type, lastModified: source.lastModified });
  const preview = await dataUrl(file);
  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) resolve();
      else reject(new Error("Fotografia nemá platné rozmery. Skúste ju znova exportovať ako PNG alebo JPG."));
      image.onload = null; image.onerror = null;
    };
    image.onerror = () => {
      image.onload = null; image.onerror = null;
      reject(new Error("Obrázok sa nepodarilo zobraziť. Súbor môže byť poškodený. Skúste ho znova exportovať ako PNG alebo JPG."));
    };
    image.src = preview;
  });
  return { file, preview };
}
