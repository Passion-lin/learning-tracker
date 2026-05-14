const DB_NAME = 'learning-tracker';
const DB_VERSION = 1;
const STORE = 'entries';

let db;

export function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE)) {
        const store = d.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

function tx(mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export function addEntry(entry) {
  return new Promise((resolve, reject) => {
    const req = tx('readwrite').add(entry);
    req.onsuccess = () => resolve(entry.id);
    req.onerror = () => reject(req.error);
  });
}

export function getAllEntries() {
  return new Promise((resolve, reject) => {
    const req = tx('readonly').getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function getEntry(id) {
  return new Promise((resolve, reject) => {
    const req = tx('readonly').get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function updateEntry(entry) {
  return new Promise((resolve, reject) => {
    const req = tx('readwrite').put(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function deleteEntry(id) {
  return new Promise((resolve, reject) => {
    const req = tx('readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
