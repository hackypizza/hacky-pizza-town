export { fetchLiveStoreData } from './neonClient';

export async function fetchLiveDatabase() {
  try {
    const res = await fetch('/api?ts=' + Date.now());
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (e) {
    console.error('Database fetch error:', e);
    return null;
  }
}

// Clean fallback exports (no mock dummy items)
export const DEFAULT_BRANCHES: any[] = [];
export const DEFAULT_CATEGORIES: any[] = [];
export const DEFAULT_MENU_ITEMS: any[] = [];
export const DEFAULT_COUPONS: any[] = [];
