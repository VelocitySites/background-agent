export type AvatarMode = "random" | "customize" | "photo";

export interface AvatarConfig {
  mode: AvatarMode;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  bodyType: number;
  facialFeatures: number;
  photoUrl?: string;
  startingStyle?: string;
}

export const AVATAR_STORAGE_KEY = "revolution_avatar";

export const SKIN_TONES = [
  "#FFDFC4",
  "#F0C08A",
  "#CD9A6E",
  "#8D6346",
  "#5C3D2E",
  "#3B2219",
];

export const HAIR_STYLES = ["Short", "Medium", "Long", "Curly", "Wavy", "Bald"];

export const HAIR_COLORS = [
  "#1A1A1A",
  "#4A3728",
  "#8B4513",
  "#D4A574",
  "#C0C0C0",
  "#8E3A3A",
];

export const BODY_TYPES = ["Slim", "Athletic", "Average", "Curvy", "Plus"];

export const DEFAULT_AVATAR: AvatarConfig = {
  mode: "customize",
  skinTone: 2,
  hairStyle: 0,
  hairColor: 0,
  bodyType: 2,
  facialFeatures: 0,
};

export function loadAvatar(): AvatarConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AvatarConfig>;
    return {
      ...DEFAULT_AVATAR,
      ...parsed,
      skinTone: clampIndex(parsed.skinTone, SKIN_TONES.length),
      hairStyle: clampIndex(parsed.hairStyle, HAIR_STYLES.length),
      hairColor: clampIndex(parsed.hairColor, HAIR_COLORS.length),
      bodyType: clampIndex(parsed.bodyType, BODY_TYPES.length),
    };
  } catch {
    return null;
  }
}

export function saveAvatar(avatar: AvatarConfig) {
  localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatar));
  window.dispatchEvent(new Event("revolution-avatar-changed"));
}

/** Downscale a portrait so it fits in localStorage and draws quickly. */
export function readPortrait(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(blobUrl);
        reject(new Error("Could not read that photo."));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(blobUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      reject(new Error("Could not read that photo."));
    };
    img.src = blobUrl;
  });
}

function clampIndex(value: number | undefined, length: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(length - 1, Math.max(0, value));
}
