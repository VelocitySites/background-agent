export const LOOKS_STORAGE_KEY = "revolution_looks";
export const LOOKS_EVENT = "revolution-looks-changed";

export interface SavedLook {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
}

export function loadLooks(): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOOKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedLook[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (look) => look && Array.isArray(look.itemIds) && typeof look.id === "string"
    );
  } catch {
    return [];
  }
}

export function addLook(itemIds: string[], name: string): SavedLook {
  const looks = loadLooks();
  const signature = [...itemIds].sort().join("|");
  const existing = looks.find(
    (look) => [...look.itemIds].sort().join("|") === signature
  );
  if (existing) {
    if (existing.name !== name && name) {
      const renamed = looks.map((look) =>
        look.id === existing.id ? { ...look, name } : look
      );
      persist(renamed);
      return { ...existing, name };
    }
    return existing;
  }

  const look: SavedLook = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `look-${Date.now()}`,
    name: name || "Saved look",
    itemIds,
    createdAt: new Date().toISOString(),
  };
  persist([look, ...looks].slice(0, 24));
  return look;
}

export function removeLook(id: string) {
  persist(loadLooks().filter((look) => look.id !== id));
}

function persist(looks: SavedLook[]) {
  localStorage.setItem(LOOKS_STORAGE_KEY, JSON.stringify(looks));
  window.dispatchEvent(new Event(LOOKS_EVENT));
}
