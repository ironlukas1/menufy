import { IMAGE_EXTENSIONS, MAX_RESTAURANT_IMAGE_PIXELS, MAX_RESTAURANT_IMAGE_SIZE } from "./restaurantSettings.ts";

export function restaurantPhotoType(bytes: Uint8Array): string | null {
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

const u16 = (bytes: Uint8Array, at: number) => (bytes[at] << 8) | bytes[at + 1];
const u32 = (bytes: Uint8Array, at: number) =>
  ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;

// Read dimensions from PNG IHDR / JPEG SOF before handing the bytes to Image().
// A huge but compressed image could otherwise exhaust memory during decoding.
export function imageHeaderDimensions(bytes: Uint8Array, type: string | null): { width: number; height: number } | null {
  if (type === "image/png") {
    if (bytes.length < 24 || String.fromCharCode(...bytes.slice(12, 16)) !== "IHDR") return null;
    return { width: u32(bytes, 16), height: u32(bytes, 20) };
  }
  if (type === "image/jpeg") {
    let at = 2;
    while (at + 8 < bytes.length) {
      if (bytes[at] !== 0xff) {
        at += 1;
        continue;
      }
      while (bytes[at] === 0xff && at < bytes.length) at += 1;
      const marker = bytes[at++];
      if (marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (at + 1 >= bytes.length) break;
      const length = u16(bytes, at);
      if (length < 2 || at + length > bytes.length) break;
      const isSof = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isSof) return { width: u16(bytes, at + 5), height: u16(bytes, at + 3) };
      at += length;
    }
  }
  return null;
}

const tooManyPixels = (width: number, height: number) =>
  !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || width * height > MAX_RESTAURANT_IMAGE_PIXELS;
const dimensionError = () => "Fotografia je príliš veľká. Limit je 25 miliónov pixelov.";

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
  const header = new Uint8Array(await source.slice(0, Math.min(source.size, 512 * 1024)).arrayBuffer());
  const type = restaurantPhotoType(header);
  if (!type) throw new Error("Obsah súboru nie je JPG, PNG ani WebP. Exportujte fotografiu do jedného z týchto formátov; samotné premenovanie prípony nestačí.");
  const declared = imageHeaderDimensions(header, type);
  if (declared && tooManyPixels(declared.width, declared.height)) throw new Error(dimensionError());
  const extension = IMAGE_EXTENSIONS[type];
  const file = new File([source], `${source.name.replace(/\.[^.]+$/, "")}.${extension}`, { type, lastModified: source.lastModified });
  const preview = await dataUrl(file);
  await new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0 && !tooManyPixels(image.naturalWidth, image.naturalHeight)) resolve();
      else reject(new Error(tooManyPixels(image.naturalWidth, image.naturalHeight) ? dimensionError() : "Fotografia nemá platné rozmery. Skúste ju znova exportovať ako PNG alebo JPG."));
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
