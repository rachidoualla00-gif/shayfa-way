/**
 * SHAYFA WAY - CONSOLIDATED APP CORE (V10)
 */
import { db } from "./services/db.js";

const mainContent = document.getElementById('main-content');
const loader = document.getElementById('boot-loader');

// --- BOOT PROCESS ---
async function boot() {
    console.log("System: Cold Boot Starting...");

    try {
        await db.ready;
        console.log("System: DB Online.");

        // Initial Data Seeding
        const config = await db.get('system', 'config');
        if (!config) {
            console.log("System: Seeding First-Run Data...");
            await db.put('system', { id: 'config', seeded: true });

            // Seed Quran
            await db.put('quran', { id: '1', title: 'Al-Fatiha', number: 1, type: 'Meccan', verses: 7 });
            await db.put('quran', { id: '2', title: 'Al-Baqarah', number: 2, type: 'Medinan', verses: 286 });

            // Seed Products
            await db.put('products', { id: 'p1', title: 'Premium Prayer Mat', price: 45.00 });
            await db.put('products', { id: 'p2', title: 'Smart Tasbih', price: 15.00 });
        }

        // Hide Loader
        loader.style.display = 'none';

        // Start Home
        navigate('home');

    } catch (err) {
        console.error("System: Boot Failed!", err);
        loader.innerHTML = `<p style="color:red">Boot Error: ${err.message}</p><button onclick="location.reload()">Retry</button>`;
    }
}

// --- ROUTER & RENDERERS ---
window.navigate = async function (pageId) {
    console.log("Navigating to:", pageId);

    // UI Update
    document.querySelectorAll('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.page === pageId));
    mainContent.innerHTML = '<div style="padding:40px; text-align:center"><div class="spinner" style="margin: 0 auto"></div></div>';

    // View Logic
    switch (pageId) {
        case 'home': renderHome(); break;
        case 'quran': renderQuran(); break;
        case 'store': renderStore(); break;
        case 'prayer': renderPrayer(); break;
        default: renderHome();
    }
};

async function renderHome() {
    const times = { fajr: '05:15', dhuhr: '12:45', asr: '16:10', maghrib: '18:50', isha: '20:15' };

    mainContent.innerHTML = `
        <div class="hero">
            <div style="font-size: 0.9rem; opacity: 0.8;">Friday, 20 February 2026</div>
            <div style="font-size: 2.5rem; font-weight: 700; margin: 10px 0;">Dhuhr</div>
            <div style="background: rgba(0,0,0,0.1); display: inline-block; padding: 6px 15px; border-radius: 20px;">Adhan in 02:30:15</div>
            
            <div style="display: flex; justify-content: space-around; margin-top: 30px; font-size: 0.8rem;">
                <div>Fajr<br><b>${times.fajr}</b></div>
                <div>Dhuhr<br><b>${times.dhuhr}</b></div>
                <div>Asr<br><b>${times.asr}</b></div>
                <div>Maghrib<br><b>${times.maghrib}</b></div>
                <div>Isha<br><b>${times.isha}</b></div>
            </div>
        </div>

        <div class="grid">
            <div class="grid-item" onclick="navigate('quran')"><i class="fa-solid fa-book-quran"></i>Quran</div>
            <div class="grid-item" onclick="navigate('prayer')"><i class="fa-solid fa-person-praying"></i>Salah</div>
            <div class="grid-item" onclick="navigate('store')"><i class="fa-solid fa-bag-shopping"></i>Shop</div>
            <div class="grid-item" onclick="navigate('home')"><i class="fa-solid fa-kaaba"></i>Qibla</div>
        </div>

        <div class="card">
            <h4 style="margin:0 0 10px; color:var(--primary)">Verse of the Day</h4>
            <p style="margin:0; line-height:1.6; font-size:0.95rem;">"Verily, with every hardship comes ease."</p>
            <small style="color:#888">Surah Ash-Sharh (94:5)</small>
        </div>
    `;
}

async function renderQuran() {
    const surahs = await db.get('quran');
    mainContent.innerHTML = `
        <div style="padding:20px;">
            <h3>Holy Quran</h3>
            <div class="card" style="background: var(--primary); color: white;">
                <h4 style="margin:0">Reading Progress</h4>
                <div style="height:6px; background:rgba(255,255,255,0.2); border-radius:10px; margin:15px 0;">
                    <div style="height:100%; width:12%; background:white; border-radius:10px;"></div>
                </div>
                <small>12% Completed • Page 24</small>
            </div>
            
            <div style="margin-top:20px;">
                ${surahs.map(s => `
                    <div class="card" style="display:flex; justify-content:space-between; align-items:center; margin:10px 0; padding:15px;">
                        <div>
                            <b style="font-size:1.1rem;">${s.title}</b><br>
                            <small style="color:#888">${s.type} • ${s.verses} Verses</small>
                        </div>
                        <div style="font-weight:700; color:var(--primary)">${s.number}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

async function renderStore() {
    const products = await db.get('products');
    mainContent.innerHTML = `
        <div style="padding:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Islamic Store</h3>
                <i class="fa-solid fa-cart-shopping" style="color:var(--primary)"></i>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:20px;">
                ${products.map(p => `
                    <div class="card" style="margin:0; padding:15px; text-align:center;">
                        <div style="height:100px; background:#eee; border-radius:15px; margin-bottom:10px; display:flex; align-items:center; justify-content:center;">
                            <i class="fa-solid fa-box-open" style="font-size:2rem; color:#ccc"></i>
                        </div>
                        <b style="font-size:0.9rem;">${p.title}</b>
                        <div style="color:var(--primary); font-weight:700; margin:8px 0;">$${p.price.toFixed(2)}</div>
                        <button style="border:none; padding:8px 15px; background:var(--primary); color:white; border-radius:10px; font-weight:600; font-size:0.8rem;">Add</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Start
boot();
