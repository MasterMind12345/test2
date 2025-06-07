<template>
  <div class="cart-page-container">
    <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">Votre Panier</h1>
    
    <div v-if="cartStore.items.length === 0" class="empty-cart-message">
      <p>Votre panier est vide pour le moment.</p>
      <NuxtLink to="/" class="continue-shopping-button">
        Continuer mes achats
      </NuxtLink>
    </div>

    <div v-else class="cart-content">
      <div class="cart-items-list">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item-card">
          <img :src="item.image || 'https://placehold.co/100x100/eeeeee/aaaaaa?text=No+Image'" :alt="item.name" class="cart-item-image">
          <div class="cart-item-details">
            <h3 class="cart-item-name">{{ item.name }}</h3>
            <!-- Nouvelle section pour la description -->
            <p class="cart-item-description">
              Description de l'article (à récupérer de l'API si disponible)
            </p>
            <p class="cart-item-price">{{ item.price }} FCFA</p>
            <div class="cart-item-quantity-controls">
              <!-- Bouton pour diminuer la quantité -->
              <button @click="cartStore.removeItem(item.id)" class="quantity-button" aria-label="Diminuer la quantité">-</button>
              <span class="quantity-display">{{ item.quantity }}</span>
              <!-- Bouton pour augmenter la quantité -->
              <button @click="cartStore.addItem(item)" class="quantity-button" aria-label="Augmenter la quantité">+</button>
            </div>
            <!-- Bouton pour supprimer complètement l'article -->
            <button @click="cartStore.clearItem(item.id)" class="remove-item-button">Supprimer</button>
          </div>
        </div>
      </div>

      <div class="cart-summary">
        <h2 class="text-2xl font-semibold mb-4">Résumé du panier</h2>
        <div class="summary-line">
          <span>Nombre total d'articles:</span>
          <span>{{ cartStore.totalItems }}</span>
        </div>
        <div class="summary-line">
          <span>Sous-total:</span>
          <span>{{ cartStore.totalPrice }} FCFA</span>
        </div>
        <!-- Coût de livraison -->
        <div class="summary-line">
          <span>Coût de livraison:</span>
          <span>{{ cartStore.locationCost }} FCFA</span>
          <button @click="openLocationModal" class="location-button">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Modifier
          </button>
        </div>
        <hr class="summary-divider">
        <div class="summary-line font-bold text-xl">
          <span>Total à payer:</span>
          <span>{{ cartStore.grandTotal }} FCFA</span>
        </div>
        <button @click="checkout" class="checkout-button">Procéder au paiement</button>
        <button @click="cartStore.clearCart()" class="clear-cart-button">Vider le panier</button>
      </div>
    </div>

    <!-- Fenêtre modale de localisation -->
    <div v-if="showLocationModal" class="modal-overlay" @click.self="closeLocationModal">
      <div class="modal-content">
        <h2 class="modal-title">Choisir votre lieu de livraison</h2>
        <button @click="closeLocationModal" class="modal-close-button">&times;</button>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="city-select">Ville:</label>
            <select id="city-select" v-model="selectedCity" class="form-select">
              <option :value="null" disabled>Sélectionner une ville</option>
              <option v-for="city in availableCities" :key="city.name" :value="city.name">{{ city.name }}</option>
            </select>
          </div>

          <div class="form-group" v-if="selectedCity">
            <label for="neighborhood-select">Quartier:</label>
            <select id="neighborhood-select" v-model="selectedNeighborhood" class="form-select">
              <option :value="null" disabled>Sélectionner un quartier</option>
              <option v-for="neighborhood in availableNeighborhoods" :key="neighborhood.name" :value="neighborhood.name">{{ neighborhood.name }}</option>
            </select>
          </div>

          <div class="form-group" v-if="selectedNeighborhood && tempLocationCost !== null">
            <label>Coût de livraison estimé:</label>
            <p class="cost-display">{{ tempLocationCost }} FCFA</p>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="applyLocation" :disabled="!selectedNeighborhood" class="apply-button">
            Appliquer la localisation
          </button>
          <button @click="closeLocationModal" class="cancel-button">Annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useCartStore } from '@/stores/cart';
import { navigateTo } from '#app';

const cartStore = useCartStore();

// État de la fenêtre modale
const showLocationModal = ref(false);
const selectedCity = ref<string | null>(null);
const selectedNeighborhood = ref<string | null>(null);
const tempLocationCost = ref<number | null>(null); // Coût affiché dans la modale avant application

// Données fictives pour les villes et quartiers
// En production, ces données viendraient d'une API
const locationData = ref([
  {
    name: 'Douala',
    neighborhoods: [
      { name: 'Bonanjo', cost: 1000 },
      { name: 'Akwa', cost: 1200 },
      { name: 'Bali', cost: 800 },
      { name: 'Deido', cost: 1500 },
    ],
  },
  {
    name: 'Yaoundé',
    neighborhoods: [
      { name: 'Bastoo', cost: 900 },
      { name: 'Mokolo', cost: 1100 },
      { name: 'Mfandena', cost: 1300 },
    ],
  },
  {
    name: 'Bafoussam',
    neighborhoods: [
      { name: 'Djeleng', cost: 700 },
      { name: 'Kamkop', cost: 950 },
    ],
  },
]);

// Computed pour les villes disponibles
const availableCities = computed(() => {
  return locationData.value.map(city => ({ name: city.name }));
});

// Computed pour les quartiers disponibles en fonction de la ville sélectionnée
const availableNeighborhoods = computed(() => {
  const city = locationData.value.find(c => c.name === selectedCity.value);
  return city ? city.neighborhoods : [];
});

// Watcher pour calculer le coût lorsque le quartier sélectionné change
watch(selectedNeighborhood, (newNeighborhood) => {
  if (newNeighborhood && selectedCity.value) {
    const city = locationData.value.find(c => c.name === selectedCity.value);
    const neighborhood = city?.neighborhoods.find(n => n.name === newNeighborhood);
    tempLocationCost.value = neighborhood ? neighborhood.cost : null;
  } else {
    tempLocationCost.value = null;
  }
}, { immediate: true });

// Fonction pour ouvrir la modale
const openLocationModal = () => {
  showLocationModal.value = true;
  // Réinitialise les sélections et le coût temporaire à l'ouverture de la modale
  selectedCity.value = null;
  selectedNeighborhood.value = null;
  tempLocationCost.value = null;
};

// Fonction pour fermer la modale
const closeLocationModal = () => {
  showLocationModal.value = false;
};

// Fonction pour appliquer le coût de livraison au store Pinia
const applyLocation = () => {
  if (tempLocationCost.value !== null) {
    cartStore.setLocationCost(tempLocationCost.value);
    closeLocationModal();
  } else {
    alert('Veuillez sélectionner une ville et un quartier valides.');
  }
};

// Fonction de simulation pour le paiement
const checkout = () => {
  alert(`Procédure de paiement non implémentée.\nTotal à payer: ${cartStore.grandTotal} FCFA\nPanier vidé.`);
  cartStore.clearCart();
  navigateTo('/'); 
};

// Optionnel: Pour déboguer l'état du panier au chargement de la page
onMounted(() => {
  console.log('Page Panier chargée. Contenu du panier:', cartStore.items.value);
});
</script>

<style scoped>
.cart-page-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Inter', sans-serif;
}

.empty-cart-message {
  text-align: center;
  padding: 50px;
  color: #7f8c8d;
  font-size: 1.2rem;
}

.continue-shopping-button {
  display: inline-block;
  margin-top: 20px;
  padding: 12px 25px;
  background-color: #2c3e50;
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.continue-shopping-button:hover {
  background-color: #1a252f;
}

.cart-content {
  display: flex;
  gap: 30px;
  flex-wrap: wrap; /* Permet un retour à la ligne sur les petits écrans */
}

.cart-items-list {
  flex: 3;
  min-width: 300px; /* Assure que la liste ne devient pas trop petite */
}

.cart-item-card {
  display: flex;
  align-items: flex-start; /* Alignement du haut pour les descriptions */
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
  padding: 15px;
  gap: 15px;
}

.cart-item-image {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: #eee;
  padding: 5px;
  flex-shrink: 0; /* Empêche l'image de rétrécir */
}

.cart-item-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.cart-item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.cart-item-description {
  font-size: 0.85rem;
  color: #555;
  margin-bottom: 10px;
}

.cart-item-price {
  font-size: 0.95rem;
  color: #34495e;
  font-weight: 500;
  margin-bottom: 10px;
}

.cart-item-quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
}

.quantity-button {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #ecf0f1;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.quantity-button:hover {
  background-color: #dde1e2;
  border-color: #a0a0a0;
}

.quantity-display {
  padding: 0 10px;
  font-size: 1rem;
  color: #2c3e50;
}

.remove-item-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.2s ease;
}

.remove-item-button:hover {
  background-color: #c0392b;
}

.cart-summary {
  flex: 1;
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: fit-content;
  min-width: 250px; /* Assure que le résumé ne devient pas trop petit */
}

.summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center; /* Pour aligner le bouton de localisation */
  margin-bottom: 10px;
  font-size: 1rem;
  color: #34495e;
}

.summary-divider {
  border: 0;
  border-top: 1px solid #eee;
  margin: 15px 0;
}

.checkout-button {
  width: 100%;
  padding: 12px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.checkout-button:hover {
  background-color: #229954;
}

.clear-cart-button {
  width: 100%;
  padding: 10px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.clear-cart-button:hover {
  background-color: #7f8c8d;
}

.location-button {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.2s ease;
}

.location-button:hover {
  background-color: #2980b9;
}

/* Styles pour la modale */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  position: relative;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.modal-close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-close-button:hover {
  color: #2c3e50;
}

.modal-body {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background-color: #f8f8f8;
  appearance: none; /* Supprime le style par défaut du select */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1.2rem;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.cost-display {
  font-size: 1.2rem;
  font-weight: bold;
  color: #27ae60;
  text-align: center;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.apply-button, .cancel-button {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.apply-button {
  background-color: #27ae60;
  color: white;
  border: none;
}

.apply-button:hover:not(:disabled) {
  background-color: #229954;
}

.apply-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #ecf0f1;
  color: #34495e;
  border: 1px solid #ddd;
}

.cancel-button:hover {
  background-color: #dde1e2;
  border-color: #c0c0c0;
}

@media (max-width: 768px) {
  .cart-content {
    flex-direction: column;
  }
  .cart-items-list, .cart-summary {
    width: 100%;
    min-width: unset;
  }
  .modal-content {
    padding: 20px;
  }
  .modal-title {
    font-size: 1.5rem;
  }
}
</style>
