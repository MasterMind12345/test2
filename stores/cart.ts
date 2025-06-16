import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

interface CartProduct {
  id: number;
  name: string; 
  price: number; // S'assurer que ceci est bien un nombre
  image?: string;
  quantity: number; // S'assurer que ceci est bien un nombre
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartProduct[]>([]);
  const locationCost = ref<number>(0);

  // --- Getters ---
  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalPrice = computed(() =>
    // Les multiplications ici assument que price et quantity sont des nombres
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  const grandTotal = computed(() =>
    // L'addition ici assume que totalPrice et locationCost sont des nombres
    totalPrice.value + locationCost.value
  );

  // --- Actions ---
  const addItem = (product: Omit<CartProduct, 'quantity'>) => {
    const existingItem = items.value.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  };

  const removeItem = (productId: number) => {
    const index = items.value.findIndex(item => item.id === productId);
    if (index > -1) {
      const item = items.value[index];
      if (item.quantity > 1) {
        item.quantity--;
      } else {
        items.value.splice(index, 1);
      }
    }
  };

  const clearItem = (productId: number) => {
    items.value = items.value.filter(item => item.id !== productId);
  };

  const clearCart = () => {
    items.value = [];
    locationCost.value = 0;
  };

  const setLocationCost = (cost: number) => {
    locationCost.value = cost;
  };

  const loadCart = () => {
    if (typeof localStorage !== 'undefined') {
      const savedItems = localStorage.getItem('cartItems');
      const savedLocationCost = localStorage.getItem('cartLocationCost');

      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems) as CartProduct[];
          // Assure que price et quantity sont des nombres lors du chargement
          items.value = parsed.map(p => ({
            ...p,
            price: Number(p.price),
            quantity: Number(p.quantity)
          }));
        } catch (e) {
          console.error("Erreur parsing panier", e);
          items.value = [];
        }
      }

      if (savedLocationCost) {
        try {
          // Assure que locationCost est un nombre lors du chargement
          locationCost.value = parseFloat(savedLocationCost) || 0;
        } catch (e) {
          console.error("Erreur parsing coût livraison", e);
          locationCost.value = 0;
        }
      }
    }
  };

  // --- Watchers ---
  watch(items, (newItems) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(newItems));
    }
  }, { deep: true });

  watch(locationCost, (newCost) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cartLocationCost', JSON.stringify(newCost));
    }
  });

  // --- Initialisation (optionnel) ---
  if (typeof window !== 'undefined') {
    loadCart();
  }

  return {
    items,
    locationCost,
    totalItems,
    totalPrice,
    grandTotal,
    addItem,
    removeItem,
    clearItem,
    clearCart,
    setLocationCost,
    loadCart,
  };
});