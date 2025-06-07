// stores/cart.ts
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as Array<{id: number, quantity: number}>,
    count: 0
  }),
  actions: {
    addToCart(productId: number) {
      const existingItem = this.items.find(item => item.id === productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        this.items.push({ id: productId, quantity: 1 });
      }
      
      this.count = this.items.reduce((total, item) => total + item.quantity, 0);
    },
    removeFromCart(productId: number) {
      this.items = this.items.filter(item => item.id !== productId);
      this.count = this.items.reduce((total, item) => total + item.quantity, 0);
    },
    clearCart() {
      this.items = [];
      this.count = 0;
    }
  },
  getters: {
    totalItems: (state) => state.count,
    cartItems: (state) => state.items
  }
});