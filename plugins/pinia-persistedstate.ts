// plugins/pinia-persistedstate.ts
import { defineNuxtPlugin } from '#app';
// Assurez-vous que le chemin vers votre store Pinia est correct ici !
import { useCartStore } from '@/stores/cart';

export default defineNuxtPlugin((nuxtApp) => {
  const cartStore = useCartStore();

  // Ce code ne s'exécute que dans le navigateur (côté client)
  if (process.client) {
    // Tente de charger le panier depuis localStorage au démarrage de l'application
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        // Applique les données sauvegardées au store Pinia
        cartStore.$patch(JSON.parse(savedCart));
      } catch (e) {
        // En cas d'erreur de parsing (données corrompues), affiche une erreur
        console.error("Erreur lors du chargement du panier depuis localStorage:", e);
        // Et optionnellement, supprime les données corrompues pour éviter des problèmes futurs
        localStorage.removeItem('cart');
      }
    }

    // Surveille toutes les modifications du store Pinia
    // et les sauvegarde immédiatement dans localStorage
    cartStore.$subscribe((mutation, state) => {
      localStorage.setItem('cart', JSON.stringify(state));
    }, { detached: true }); // detached: true est recommandé pour une meilleure gestion de la mémoire
  }
});