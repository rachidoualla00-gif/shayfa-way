/**
 * QURAN ENGINE
 * Manages Reading, Tracking (Khatm), and PDF Logic.
 */
import { api } from "../services/api.js";

class QuranEngine {
    constructor() {
        this.currentKhatm = null;
        this.surahs = []; // Cache
    }

    async init() {
        // Load Content
        this.surahs = await api.get('quran');

        // Load User Progress (Handle Guest Mode)
        const token = localStorage.getItem('auth_token');
        const userId = token ? JSON.parse(atob(token.split('-').pop())).id : 'guest-user';

        const khatms = await api.get('khatm');
        this.currentKhatm = khatms.find(k => k.userId === userId && k.status === 'active');

        if (!this.currentKhatm) {
            // Start Default Khatm
            this.currentKhatm = await this.startNewKhatm(userId);
        }
    }

    async startNewKhatm(userId) {
        const newKhatm = {
            id: 'khatm-' + Date.now(),
            userId,
            status: 'active',
            startDate: new Date().toISOString(),
            progress: 0, // Percentage
            lastPage: 1,
            lastSurah: 1,
            completedPages: 0,
            goalPerDay: 4 // Standard (1 Juz per month approx)
        };
        await api.post('khatm', newKhatm);
        return newKhatm;
    }

    async updateProgress(page, surahId) {
        if (!this.currentKhatm) return;

        this.currentKhatm.lastPage = page;
        this.currentKhatm.lastSurah = surahId;

        // Calculate Percentage (Standard Quran ~604 pages)
        const totalPages = 604;
        this.currentKhatm.completedPages = page; // Simplified logic (assuming linear reading)
        this.currentKhatm.progress = Math.round((page / totalPages) * 100);
        this.currentKhatm.lastReadAt = new Date().toISOString();

        await api.put('khatm', this.currentKhatm.id, this.currentKhatm);
        return this.currentKhatm;
    }

    async getSurah(number) {
        if (this.surahs.length === 0) this.surahs = await api.get('quran');
        return this.surahs.find(s => s.number == number);
    }
}

export const quranEngine = new QuranEngine();
