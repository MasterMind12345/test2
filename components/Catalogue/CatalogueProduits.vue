<template>
  <div class="catalogue-container">
    <!-- Filtres par catégorie -->
    <div class="filters-section">
      <h2 class="section-title">Filtrer par catégorie</h2>
      <div class="categories-list">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
        >
          <label class="category-checkbox">
            <input 
              type="checkbox" 
              :value="category.id" 
              v-model="selectedCategories"
              @change="filterProducts"
            >
            <span class="checkmark"></span>
            {{ category.Nom }} <!-- Nom des catégories -->
          </label>
        </div>
      </div>
      <p v-if="errorCategories" class="text-red-500 text-sm mt-2">
        {{ errorCategories }} <!-- Afficher l'erreur spécifique aux catégories si elle existe -->
      </p>
    </div>

    <!-- Liste des produits filtrés -->
    <div class="products-section">
      <div class="section-header">
        <h2 class="section-title">Catalogue des produits</h2>
        <!-- Le bouton "Voir le panier" est géré par la Navbar -->
        <div class="product-count">{{ filteredProducts.length }} produits</div>
      </div>
      
      <div v-if="loading" class="loading">Chargement en cours...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      
      <div v-else class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id"
          class="product-card"
          @click="selectProduct(product)"
        >
          <div class="product-badge" v-if="product.anscienPrix">PROMO</div>
          <div class="product-image-container">
            <img
              v-if="product.image?.[0]?.url"
              :src="getStrapiImageUrl(product.image[0].url)"
              :alt="product.Nom" 
              class="product-image"
              loading="lazy"
            />
            <div v-else class="image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Image non disponible</span>
            </div>
            <button class="quick-view-btn">Voir plus</button>
          </div>
          <div class="product-info">
            <div class="product-category">{{ product.category?.Nom }}</div> 
            <h3 class="product-name">{{ product.Nom }}</h3> 
            
            <div class="price-container">
              <div class="current-price">{{ product.prix }} FCFA</div>
              <div class="old-price" v-if="product.anscienPrix">
                {{ product.anscienPrix }} FCFA
              </div>
            </div>
            
            <div class="product-actions">
              <button class="add-to-cart-btn" @click.stop="handleAddToCart(product)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Ajouter
              </button>
              <button class="wishlist-btn" @click.stop="toggleWishlist(product)">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message de notification d'ajout au panier -->
    <transition name="fade">
      <div v-if="showNotification" 
           class="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ notificationMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCartStore } from '@/stores/cart'; 
// navigateTo n'est plus nécessaire ici car la navigation du panier est dans Navbar.vue

// Interface pour un produit tel que reçu de l'API et adapté pour le panier
interface ProductData {
  id: number;
  Nom: string; 
  prix: number;
  anscienPrix?: number;
  image?: Array<{ url: string }>; // Tableau d'images avec URL
  category?: { id: number; Nom: string }; // Catégorie du produit
}

// Initialisation du store Pinia
const cartStore = useCartStore();

const categories = ref<any[]>([]); 
const products = ref<ProductData[]>([]); 
const selectedCategories = ref<number[]>([]); 
const loading = ref<boolean>(true); 
const error = ref<string | null>(null); 
const errorCategories = ref<string | null>(null); 

// Variables pour la notification d'ajout au panier
const showNotification = ref<boolean>(false);
const notificationMessage = ref<string>('');
let notificationTimeout: NodeJS.Timeout | null = null; 

const STRAPI_BASE_URL = 'https://kind-duck-a00ba31603.strapiapp.com';
const API_URL = `${STRAPI_BASE_URL}/api`;

// Fonction pour récupérer l'URL complète d'une image Strapi
const getStrapiImageUrl = (url: string): string => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_BASE_URL}${url}`;
};

// Computed pour filtrer les produits selon les catégories sélectionnées
const filteredProducts = computed<ProductData[]>(() => {
  if (selectedCategories.value.length === 0) return products.value;
  return products.value.filter(product => {
    const categoryId = product.category?.id;
    return categoryId && selectedCategories.value.includes(categoryId);
  });
});

// Récupération des catégories depuis Strapi (sans l'objet 'attributes')
const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/categories`);
    console.log(`Requête catégories - URL: ${API_URL}/categories, Statut: ${res.status}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Erreur HTTP lors du fetch catégories: ${res.status}, Réponse: ${errorText}`);
      errorCategories.value = `Impossible de charger les catégories (code: ${res.status}). Vérifiez l'API Strapi.`;
      throw new Error(`HTTP error! status: ${res.status}. Réponse: ${errorText}`);
    }
    const json = await res.json();
    console.log('Réponse JSON catégories:', json);
    
    // Assurez-vous que json.data est un tableau, sinon utilisez json comme tableau si c'est le cas
    const categoriesData = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

    if (categoriesData.length === 0) {
        console.warn('Aucune donnée de catégorie valide trouvée dans la réponse API.', json);
        categories.value = [];
        errorCategories.value = 'Aucune catégorie disponible ou structure de réponse API invalide.';
        return; 
    }
    
    // Mappage des catégories: Accès direct à 'Nom' sur l'objet de données principal
    // Filtre pour n'inclure que les catégories avec un ID et un Nom valides
    categories.value = categoriesData.map((item: any) => ({ 
      id: item.id, 
      Nom: item.Nom // Accès direct à 'Nom'
    })).filter((cat: any) => cat.id !== undefined && cat.Nom); // S'assure que ID et Nom existent
    
    // Si après le mappage, la liste est vide, il peut y avoir un problème de structure de données
    if (categories.value.length === 0 && categoriesData.length > 0) {
      console.error('Les catégories ont été reçues, mais leur structure est inattendue après mappage.', categoriesData);
      errorCategories.value = 'Les catégories ont été chargées mais les noms ou IDs sont introuvables. Vérifiez la structure de l\'API.';
    } else {
      errorCategories.value = null; 
    }

  }
  catch (err: any) { 
    console.error('Erreur fetch catégories:', err);
    if (!errorCategories.value || errorCategories.value.includes('Impossible de charger les catégories')) { 
      errorCategories.value = `Impossible de charger les catégories (problème réseau ou API). Détails: ${err.message || err}`;
    }
    throw err; 
  }
};

// Récupération des produits avec images et catégories (sans l'objet 'attributes')
const fetchProducts = async () => {
  try {
    // Utilise 'populate[image]=true' et 'populate[category]=true' pour obtenir les données d'image et de catégorie
    // La requête est correcte pour demander les relations
    const res = await fetch(`${API_URL}/produits?populate[image]=true&populate[category]=true`); 
    console.log(`Requête produits - URL: ${API_URL}/produits?populate[image]=true&populate[category]=true, Statut: ${res.status}`);
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Erreur HTTP lors du fetch produits: ${res.status}, Réponse: ${errorText}`);
        throw new Error(`HTTP error! status: ${res.status}. Réponse: ${errorText}`);
    }
    const json = await res.json();
    console.log('Réponse JSON produits:', json);

    if (!json.data || !Array.isArray(json.data)) {
        console.error('Erreur: La réponse de l\'API produits ne contient pas un tableau de données valide.', json);
        return []; 
    }

    // Mappage pour extraire les données de produits, en assumant une structure aplatie
    return json.data.map((item: any) => {
      // Accès direct aux champs du produit (Nom, prix, anscienPrix)
      const productName = item.Nom || 'Sans nom';
      const productPrice = item.prix ? Number(item.prix).toLocaleString() : 'N/A';

      // Accès aux images: Si item.image est directement un tableau d'objets image avec 'url'
      const images = Array.isArray(item.image) ? item.image : [];
      const imageUrls = images.map((img: any) => ({ url: img.url })); // Assumant que l'URL est directement sur l'objet image

      // Accès à la catégorie: Si item.category est directement l'objet catégorie
      const category = item.category 
        ? { id: item.category.id, Nom: item.category.Nom } // Accès direct aux propriétés de la catégorie
        : null;

      return {
        id: item.id, // L'ID est toujours au niveau racine
        Nom: productName, 
        prix: productPrice,
        anscienPrix: item.anscienPrix, // Accès direct
        image: imageUrls,
        category: category
      };
    });
  } catch (err: any) {
    console.error('Erreur fetch produits:', err);
    throw err; 
  }
};


// Chargement complet des données au montage du composant
const loadAllData = async (): Promise<void> => {
  try {
    loading.value = true;
    await fetchCategories(); // Charge les catégories en premier
    products.value = await fetchProducts(); // Charge les produits (avec images et catégories)
  } catch (err: any) {
    console.error('Erreur globale lors du chargement des données dans loadAllData:', err);
    error.value = `Impossible de charger les données (problème réseau ou API). Détails: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const filterProducts = (): void => {
  console.log('Catégories sélectionnées pour le filtre:', selectedCategories.value);
};

const showAddedToCartNotification = (productName: string) => {
  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
  }
  notificationMessage.value = `"${productName}" a été ajouté au panier !`;
  showNotification.value = true;
  notificationTimeout = setTimeout(() => {
    showNotification.value = false;
    notificationMessage.value = '';
    notificationTimeout = null;
  }, 3000);
};

const handleAddToCart = (product: ProductData): void => {
  cartStore.addItem({
    id: product.id,
    name: product.Nom,  
    price: product.prix,
    image: product.image?.[0]?.url ? getStrapiImageUrl(product.image[0].url) : undefined,
  });
  console.log('Produit ajouté au panier:', product.Nom); 
  console.log('Panier actuel (items):', cartStore.items.value);
  console.log('Panier actuel (totalPrice):', cartStore.totalPrice);
  showAddedToCartNotification(product.Nom); 
};

// goToCartPage est maintenant dans Navbar.vue
// const goToCartPage = () => {
//   navigateTo('/panier'); 
// };

const selectProduct = (product: ProductData): void => {
  console.log('Produit sélectionné:', product);
};

const toggleWishlist = (product: ProductData): void => {
  console.log('Ajout/Retrait de la Wishlist:', product.Nom); 
};

onMounted(loadAllData);
</script>

<style scoped>
/* Vos styles CSS existants pour le catalogue */
.catalogue-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
  display: flex;
  gap: 40px;
}

.filters-section {
  flex: 0 0 280px;
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  height: fit-content;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.product-count {
  color: #666;
  font-size: 0.9rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.category-item {
  display: flex;
  align-items: center;
}

.category-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #444;
  transition: color 0.2s;
}

.category-checkbox:hover {
  color: #2c3e50;
}

.checkmark {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .checkmark {
  background-color: #2c3e50;
  border-color: #2c3e50;
}

.products-section {
  flex: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #e74c3c;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 2;
}

.product-image-container {
  height: 220px;
  background: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease;
  padding: 20px;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  color: #aaa;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.image-placeholder svg {
  width: 40px;
  height: 40px;
  color: #ddd;
}

.quick-view-btn {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
  background: rgba(44, 62, 80, 0.9);
  color: white;
  border: none;
  padding: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
}

.product-card:hover .quick-view-btn {
  bottom: 0;
  opacity: 1;
}

.product-info {
  padding: 18px;
}

.product-category {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-bottom: 5px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.current-price {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.2rem;
}

.old-price {
  font-size: 0.9rem;
  color: #e74c3c;
  text-decoration: line-through;
}

.product-actions {
  display: flex;
  gap: 8px;
}

.add-to-cart-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #2c3e50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.add-to-cart-btn:hover {
  background: #1a252f;
}

.add-to-cart-btn svg {
  width: 16px;
  height: 16px;
}

.wishlist-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 1px solid #eee;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.wishlist-btn:hover {
  background: #f1f3f5;
  border-color: #ddd;
}

.wishlist-btn svg {
  width: 18px;
  height: 18px;
  color: #7f8c8d;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
}

.loading {
  color: #666;
}

.error {
  color: #e74c3c;
}

@media (max-width: 992px) {
  .catalogue-container {
    flex-direction: column;
    gap: 30px;
  }
  
  .filters-section {
    flex: 0 0 auto;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  
  .product-image-container {
    height: 180px;
  }
  
.section-title {
    font-size: 1.5rem;
  }
}

/* Styles pour la transition de la notification */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Styles pour le bouton "Voir le panier" - ces styles ne sont plus utilisés ici mais maintenus pour référence */
.view-cart-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: #3498db; 
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2);
  margin-left: auto; 
}

.view-cart-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
}

.view-cart-button svg {
  width: 20px;
  height: 20px;
}
</style>
