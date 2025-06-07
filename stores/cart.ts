import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// Interface pour un produit dans le panier
// Le 'name' est utilisé pour le store, correspondant au 'Nom' du produit Strapi
interface CartProduct {
  id: number;
  name: string; 
  price: number;
  image?: string; // URL complète de l'image
  quantity: number; // Nouvelle propriété pour la quantité
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartProduct[]>([]);
  const locationCost = ref<number>(0); // Nouveau: Coût de livraison

  // Getter: Nombre total d'articles dans le panier
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Getter: Prix total des articles dans le panier (hors livraison)
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  // Nouveau Getter: Grand total (articles + livraison)
  const grandTotal = computed(() => {
    return totalPrice.value + locationCost.value;
  });

  // Action: Ajoute ou incrémente un article dans le panier
  const addItem = (product: Omit<CartProduct, 'quantity'>) => {
    const existingItem = items.value.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++; // Incrémente la quantité si l'article existe
    } else {
      items.value.push({ ...product, quantity: 1 }); // Ajoute avec quantité 1 sinon
    }
  };

  // Action: Diminue la quantité ou retire l'article si quantité = 1
  const removeItem = (productId: number) => {
    const existingItemIndex = items.value.findIndex(item => item.id === productId);
    if (existingItemIndex > -1) {
      const existingItem = items.value[existingItemIndex];
      if (existingItem.quantity > 1) {
        existingItem.quantity--; // Diminue la quantité
      } else {
        items.value.splice(existingItemIndex, 1); // Retire complètement l'article
      }
    }
  };

  // Action: Retire complètement un article du panier (indépendamment de la quantité)
  const clearItem = (productId: number) => {
    items.value = items.value.filter(item => item.id !== productId);
  };

  // Action: Vide tout le panier
  const clearCart = () => {
    items.value = [];
    locationCost.value = 0; // Réinitialise aussi le coût de livraison
  };

  // Nouvelle Action: Définit le coût de livraison
  const setLocationCost = (cost: number) => {
    locationCost.value = cost;
  };

  return { 
    items, 
    locationCost, // Exposer le coût de livraison
    totalItems, 
    totalPrice, 
    grandTotal, // Exposer le grand total
    addItem, 
    removeItem, 
    clearItem, 
    clearCart, 
    setLocationCost // Exposer l'action pour définir le coût
  };
});
