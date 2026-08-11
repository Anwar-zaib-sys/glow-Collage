const DB_NAME = 'glowcollage';
const DB_VERSION = 1;
const STORE_NAME = 'designs';

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function storeRequest(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        let req;
        try {
          req = fn(store);
        } catch (err) {
          reject(err);
          return;
        }
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error || new Error('IndexedDB request failed'));
        tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction failed'));
      })
  );
}

/** @returns {Promise<Array<{ id, name, createdAt, updatedAt, thumbnail }>>} */
export async function listDesigns() {
  const all = await storeRequest('readonly', (store) => store.getAll());
  return (all || [])
    .map(({ id, name, createdAt, updatedAt, thumbnail }) => ({
      id,
      name,
      createdAt,
      updatedAt,
      thumbnail: thumbnail || null,
    }))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/** @returns {Promise<object|undefined>} */
export function getDesign(id) {
  return storeRequest('readonly', (store) => store.get(id));
}

/** @param {object} record full design record including snapshot */
export function putDesign(record) {
  return storeRequest('readwrite', (store) => store.put(record));
}

export function deleteDesign(id) {
  return storeRequest('readwrite', (store) => store.delete(id));
}

export function createDesignId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `design-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
