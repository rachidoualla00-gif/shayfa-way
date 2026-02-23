/**
 * PUBLIC ADMIN PANEL LOGIC (PRODUCTION V3)
 * NO LOGIN / NO AUTH REQUIRED - Direct access to the persistent database.
 */
import { api } from "./services/api.js";

// --- STATE ---
const STATE = {
    view: 'dashboard',
    data: {}
};

// --- DOM ---
const dashScreen = document.getElementById('dashboard-screen');
const contentArea = document.getElementById('content-area');
const viewTitle = document.getElementById('view-title');

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Admin: Public Mode Active.");

    try {
        // Auto-load dashboard on boot
        await loadView('dashboard');
    } catch (err) {
        console.error("ADMIN_INIT_ERROR:", err);
        contentArea.innerHTML = `<div class="error" style="padding:20px; color:red;">
            Failed to connect to Database: ${err.message}<br>
            <button onclick="location.reload()">Retry</button>
        </div>`;
    }

    // Setup Sidebar Navigation
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.target.closest('a').getAttribute('href').substring(1);
            loadView(view);
        });
    });
});

async function loadView(view) {
    STATE.view = view;
    contentArea.innerHTML = '<div class="loading">Fetching Real-time Data...</div>';

    // Update Title
    viewTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);

    // Highlight Nav
    document.querySelectorAll('.sidebar a').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar a[href="#${view}"]`);
    if (activeLink) activeLink.classList.add('active');

    try {
        switch (view) {
            case 'dashboard': await renderDashboard(); break;
            case 'pages': await renderPages(); break;
            case 'quran': await renderQuran(); break;
            case 'store': await renderStore(); break;
            case 'videos': await renderVideos(); break;
            case 'orders': await renderOrders(); break;
            case 'settings': await renderSettings(); break;
            default: contentArea.innerHTML = '<h2>View Development in Progress</h2>';
        }
    } catch (e) {
        contentArea.innerHTML = `<div class="error">Database Sync Error: ${e.message}</div>`;
    }
}

// --- RENDERERS ---

async function renderDashboard() {
    const usersCount = (await api.get('users') || []).length;
    const orders = await api.get('orders') || [];
    const products = await api.get('products') || [];
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    contentArea.innerHTML = `
        <div class="grid-container" style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div class="card">
                <h3>Total Installs</h3>
                <h1>${usersCount}</h1>
            </div>
            <div class="card">
                <h3>Total Revenue</h3>
                <h1 style="color:var(--primary)">$${revenue.toFixed(2)}</h1>
            </div>
            <div class="card">
                <h3>Store Products</h3>
                <h1>${products.length}</h1>
            </div>
        </div>
        
        <div style="margin-top: 40px;">
            <h3>Recent Orders</h3>
            <table>
                <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>
                </thead>
                <tbody>
                    ${orders.length ? orders.slice(0, 5).map(o => `
                        <tr><td>${o.id}</td><td>User_${o.userId.slice(-4)}</td><td>$${o.total}</td><td>${o.status.toUpperCase()}</td></tr>
                    `).join('') : '<tr><td colspan="4">No orders yet.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

async function renderPages() {
    const pages = await api.get('pages') || [];
    contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Page Structure</h2>
            <button onclick="alert('Module locked for core stability')">+ Add Page</button>
        </div>
        <table>
            <thead><tr><th>ID</th><th>Title</th><th>Sections</th></tr></thead>
            <tbody>
                ${pages.map(p => `<tr><td>${p.id}</td><td>${p.title || 'Dynamic'}</td><td>${p.sections?.length || 0}</td></tr>`).join('')}
            </tbody>
        </table>
    `;
}

async function renderQuran() {
    const surahs = await api.get('quran') || [];
    contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Quran Management</h2>
            <button onclick="promptAdd('quran')">+ Add Surah/PDF</button>
        </div>
        <table>
            <thead><tr><th>#</th><th>Surah Name</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
                ${surahs.map(s => `<tr><td>${s.number || s.id}</td><td>${s.title}</td><td>${s.type}</td><td><button class="delete" onclick="deleteItem('quran', '${s.id}')">Delete</button></td></tr>`).join('')}
            </tbody>
        </table>
    `;
}

async function renderStore() {
    const products = await api.get('products') || [];
    contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Store Inventory</h2>
            <button onclick="promptAdd('products')">+ Add Product</button>
        </div>
        <table>
            <thead><tr><th>Product Name</th><th>Price</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
                ${products.map(p => `<tr><td>${p.title}</td><td>$${p.price}</td><td>${p.category}</td><td><button class="delete" onclick="deleteItem('products', '${p.id}')">Delete</button></td></tr>`).join('')}
            </tbody>
        </table>
    `;
}

async function renderVideos() {
    const videos = await api.get('videos') || [];
    contentArea.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2>Video Content</h2>
            <button onclick="promptAdd('videos')">+ Upload Video Link</button>
        </div>
        <table>
            <thead><tr><th>Title</th><th>Duration</th><th>Category</th></tr></thead>
            <tbody>
                ${videos.map(v => `<tr><td>${v.title}</td><td>${v.duration}</td><td>${v.category}</td></tr>`).join('')}
            </tbody>
        </table>
    `;
}

async function renderOrders() {
    const orders = await api.get('orders') || [];
    contentArea.innerHTML = `
        <h2>Customer Orders</h2>
        <table>
            <thead><tr><th>Date</th><th>Order ID</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
                ${orders.map(o => `<tr><td>${new Date(o.createdAt).toLocaleDateString()}</td><td>${o.id}</td><td>${o.items?.length || 0}</td><td>$${o.total}</td><td>${o.status}</td></tr>`).join('')}
            </tbody>
        </table>
    `;
}

async function renderSettings() {
    contentArea.innerHTML = `
        <h2>Global App Settings</h2>
        <div class="card" style="max-width: 500px;">
            <label>API Mode: <b>Production</b></label><br><br>
            <label>Database: <b>IndexedDB (Persistent)</b></label><br><br>
            <label>Push Notifications: <b>Enabled</b></label><br><br>
            <button onclick="location.reload()">Force Sync</button>
        </div>
    `;
}

// --- GLOBAL ACTIONS ---
window.deleteItem = async (col, id) => {
    if (confirm("Permanently delete this item?")) {
        await api.delete(col, id);
        loadView(STATE.view);
    }
};

window.promptAdd = async (col) => {
    const title = prompt("Enter Title/Name:");
    if (title) {
        let obj = { title };
        if (col === 'products') { obj.price = parseFloat(prompt("Price:")) || 0; obj.category = prompt("Category:"); }
        if (col === 'videos') { obj.duration = "00:00"; obj.category = "New"; }
        if (col === 'quran') { obj.number = parseInt(prompt("Surah Number:")) || 0; obj.type = "Meccan"; }

        await api.post(col, obj);
        loadView(STATE.view);
    }
};
