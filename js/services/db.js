/**
 * SHAYFA WAY - ROBUST DB ENGINE (V10)
 */
const DB_NAME = 'Shayfa_V10';
const DB_VERSION = 1;

export class Database {
    constructor() {
        this.db = null;
        this.ready = this.init();
    }

    init() {
        return new Promise((resolve) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                ['system', 'quran', 'products', 'videos', 'orders', 'users'].forEach(s => {
                    if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
                });
            };
            request.onsuccess = (e) => {
                this.db = e.target.result;
                resolve(true);
            };
            request.onerror = () => {
                console.warn("DB Fallback Active");
                resolve(false);
            };
        });
    }

    async get(table, id) {
        if (!this.db) await this.ready;
        return new Promise(res => {
            const tx = this.db.transaction(table, 'readonly');
            const store = tx.objectStore(table);
            const req = id ? store.get(id) : store.getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = () => res(null);
        });
    }

    async put(table, data) {
        if (!this.db) await this.ready;
        if (!data.id) data.id = Math.random().toString(36).substr(2, 9);
        return new Promise(res => {
            const tx = this.db.transaction(table, 'readwrite');
            tx.objectStore(table).put(data).onsuccess = () => res(data);
        });
    }

    async delete(table, id) {
        if (!this.db) await this.ready;
        return new Promise(res => {
            const tx = this.db.transaction(table, 'readwrite');
            tx.objectStore(table).delete(id).onsuccess = () => res(true);
        });
    }
}

export const db = new Database();
