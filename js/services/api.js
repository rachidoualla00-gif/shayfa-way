/**
 * API SIMULATOR
 * Routes calls to the local IndexedDB database with network latency simulation.
 */
import { db } from "./db.js";

const LATENCY = 150; // ms

class API {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    async delay() {
        return new Promise(resolve => setTimeout(resolve, LATENCY));
    }

    // --- GENERIC API METHODS ---
    async get(collection, id = null) {
        await this.delay();
        try {
            return await db.get(collection, id);
        } catch (e) {
            console.error("API Error (GET):", e);
            throw new Error("Network Request Failed: " + e.message);
        }
    }

    async post(collection, data) {
        await this.delay();
        try {
            return await db.add(collection, data);
        } catch (e) {
            console.error("API Error (POST):", e);
            throw new Error("Database Write Failed: " + e.message);
        }
    }

    async put(collection, id, data = {}) {
        await this.delay();
        try {
            if (!id && !data.id) throw new Error("Missing ID for update");
            const finalData = { ...data, id: id || data.id };
            return await db.put(collection, finalData); // Upsert
        } catch (e) {
            console.error("API Error (PUT):", e);
            throw new Error("Update Failed: " + e.message);
        }
    }

    async delete(collection, id) {
        await this.delay();
        try {
            return await db.delete(collection, id);
        } catch (e) {
            console.error("API Error (DELETE):", e);
            throw new Error("Delete Failed: " + e.message);
        }
    }

    // --- AUTHENTICATION ---
    async login(email, password) {
        await this.delay();
        const users = await db.get('users');
        const user = users && users.find(u => u.email === email && u.password === password);

        if (user) {
            const token = "JWT-MOCK-" + btoa(JSON.stringify({ id: user.id, role: user.role, exp: Date.now() + 86400000 }));
            localStorage.setItem('auth_token', token);
            this.token = token;
            return { user, token };
        } else {
            // Auto-create Admin heavily simplifies first-run experience
            if ((!users || users.length === 0) && email === 'admin@shayfaway.com' && password === 'admin') {
                const newAdmin = { id: 'sys-admin', email, password, role: 'admin' };
                await db.add('users', newAdmin);
                const token = "JWT-MOCK-" + btoa(JSON.stringify({ id: newAdmin.id, role: newAdmin.role, exp: Date.now() + 86400000 }));
                localStorage.setItem('auth_token', token);
                this.token = token;
                return { user: newAdmin, token };
            }
            throw new Error("Invalid Credentials");
        }
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.token = null;
        window.location.reload();
    }
}

export const api = new API();
