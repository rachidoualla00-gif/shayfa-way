/**
 * AUTH SYSTEM (Real)
 * Manages user sessions, role-based access, and login/logout flows.
 */
import { api } from "./api.js";

class Auth {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.currentUser = this.token ? this.decode(this.token) : null;

        // Listen for Login Events
        window.addEventListener('auth:login', (e) => {
            this.currentUser = e.detail;
            this.redirect();
        });

        // Listen for Logout
        window.addEventListener('auth:logout', () => {
            this.currentUser = null;
            this.redirect();
        });
    }

    async login(email, password) {
        try {
            const { user, token } = await api.login(email, password);
            if (token) {
                this.token = token;
                this.currentUser = user;
                window.dispatchEvent(new CustomEvent('auth:login', { detail: user }));
                return user;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    logout() {
        api.logout(); // Clears storage & reload
    }

    decode(token) {
        try {
            const base64 = token.split('-').pop(); // Simple Mock Decode
            return JSON.parse(atob(base64));
        } catch (e) {
            return null;
        }
    }

    checkAuth() {
        if (!this.token) {
            if (window.location.pathname.includes('admin.html')) {
                return false;
            }
        }
        return true;
    }

    redirect() {
        if (this.currentUser && this.currentUser.role === 'admin') {
            if (!window.location.href.includes('admin.html')) {
                window.location.href = 'admin.html';
            }
        } else {
            if (window.location.href.includes('admin.html')) {
                window.location.href = 'index.html';
            }
        }
    }
}

export const auth = new Auth();
