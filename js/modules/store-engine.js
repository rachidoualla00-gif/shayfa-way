/**
 * STORE ENGINE (E-Commerce)
 * Full Cart, Checkout, and Order Logic.
 */
import { api } from "../services/api.js";

class StoreEngine {
    constructor() {
        this.cart = [];
        this.currentOrder = null;
    }

    async init() {
        // Load User Cart (Handle Guest Mode)
        const token = localStorage.getItem('auth_token');
        const userId = token ? JSON.parse(atob(token.split('-').pop())).id : 'guest-user';

        const carts = await api.get('cart');

        // Find existing cart for user
        this.cart = (carts && carts.find(c => c.userId === userId && c.status === 'open')) || await this.createCart(userId);
    }

    async createCart(userId) {
        const newCart = {
            id: 'cart-' + Date.now(),
            userId,
            items: [],
            total: 0,
            status: 'open',
            createdAt: new Date().toISOString()
        };
        await api.post('cart', newCart);
        return newCart;
    }

    async addToCart(product) {
        // Logic: Check if exists, update Qty
        const existing = this.cart.items.find(i => i.productId === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.items.push({
                productId: product.id,
                title: product.title,
                price: product.price,
                qty: 1,
                image: product.image
            });
        }

        await this.syncCart();
        return this.cart;
    }

    async removeFromCart(productId) {
        this.cart.items = this.cart.items.filter(i => i.productId !== productId);
        await this.syncCart();
        return this.cart;
    }

    async updateQty(productId, qty) {
        const item = this.cart.items.find(i => i.productId === productId);
        if (item) {
            item.qty = qty;
            if (item.qty <= 0) await this.removeFromCart(productId);
            else await this.syncCart();
        }
    }

    async syncCart() {
        // Recalculate Total
        this.cart.total = this.cart.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        this.cart.updatedAt = new Date().toISOString();

        // Persist
        await api.put('cart', this.cart.id, this.cart);
    }

    async checkout(paymentDetails) {
        // --- SIMULATED PAYMENT GATEWAY (Stripe Mock) ---
        await new Promise(r => setTimeout(r, 1500)); // Processing...

        if (!paymentDetails || !paymentDetails.cardNumber) throw new Error("Invalid Payment Details");

        // Create Order
        const order = {
            id: 'ord-' + Date.now(),
            cartId: this.cart.id,
            userId: this.cart.userId,
            items: [...this.cart.items],
            total: this.cart.total,
            status: 'paid',
            paymentMethod: 'visa',
            shippingAddress: paymentDetails.address,
            createdAt: new Date().toISOString()
        };

        // Save Order
        await api.post('orders', order);

        // Clear Cart (Close it)
        this.cart.status = 'converted';
        await api.put('cart', this.cart.id, this.cart);

        // Create New Cart
        this.cart = await this.createCart(this.cart.userId);

        return order;
    }
}

export const storeEngine = new StoreEngine();
