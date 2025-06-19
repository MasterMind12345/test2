<template>
  <div class="catalogue-container">
    <!-- Bouton pour réinitialiser les filtres -->
    <div v-if="productsStore.selectedCategory || productsStore.selectedSubcategory" 
         class="reset-filters-container">
      <Button 
        variant="outline" 
        size="sm" 
        @click="productsStore.resetFilters"
        class="reset-filters-btn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Réinitialiser les filtres
      </Button>
    </div>

    <!-- Section des produits -->
    <div class="products-section">
      <div class="section-header">
        <h2 class="section-title">
          {{ currentFilterTitle }}
        </h2>
        <div class="product-count">
          {{ productsStore.filteredProducts.length }} produits
        </div>
      </div>
      
      <div v-if="productsStore.loading" class="loading">
        <div class="spinner"></div>
        Chargement en cours...
      </div>
      
      <div v-else-if="productsStore.error" class="error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        {{ productsStore.error }}
      </div>
      
      <div v-else class="products-grid">
        <div 
          v-for="product in productsStore.filteredProducts" 
          :key="product.id"
          class="product-card"
          @click="selectProduct(product)"
        >
          <div class="product-badge" v-if="product.anscienPrix">PROMO</div>
          <div class="product-image-container">
<img 
  v-if="product.image?.url" 
  :src="product.image.url" 
  :alt="product.Nom"
  class="product-image"
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
              <div class="current-price">{{ formatPrice(product.prix) }} FCFA</div>
              <div class="old-price" v-if="product.anscienPrix">
                {{ formatPrice(product.anscienPrix) }} FCFA
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

    <!-- Notification d'ajout au panier -->
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
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { computed, ref } from 'vue'

const productsStore = useProductsStore()
const cartStore = useCartStore()

onMounted(async () => {
  await productsStore.loadAllData()
})

// Notification
const showNotification = ref(false)
const notificationMessage = ref('')
let notificationTimeout: NodeJS.Timeout | null = null

const STRAPI_BASE_URL = 'https://kind-duck-a00ba31603.strapiapp.com'

const getStrapiImageUrl = (url: string): string => {
  if (!url) return ''
  return url.startsWith('/uploads') 
    ? `https://kind-duck-a00ba31603.strapiapp.com${url}`
    : url
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('fr-FR')
}

const currentFilterTitle = computed(() => {
  if (productsStore.selectedCategory) {
    const category = productsStore.categories.find(
      c => c.id === productsStore.selectedCategory
    );
    return category?.Nom || 'Produits';
  }
  return 'Tous les produits';
});
const handleAddToCart = (product: any): void => {
  cartStore.addItem({
    id: product.id,
    name: product.Nom,
    price: product.prix,
    image: product.image?.[0]?.url ? getStrapiImageUrl(product.image[0].url) : undefined,
  })
  
  showNotification.value = true
  notificationMessage.value = `"${product.Nom}" ajouté au panier`
  
  if (notificationTimeout) {
    clearTimeout(notificationTimeout)
  }
  
  notificationTimeout = setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

const selectProduct = (product: any): void => {
  console.log('Produit sélectionné:', product)
  // Vous pouvez implémenter la navigation vers la page du produit ici
}

const toggleWishlist = (product: any): void => {
  console.log('Wishlist:', product)
}
</script>

<style scoped>
.catalogue-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 30px 20px;
}

.reset-filters-container {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.reset-filters-btn {
  display: flex;
  align-items: center;
}

.products-section {
  width: 100%;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading {
  color: #666;
}

.loading .spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #e74c3c;
  display: flex;
  align-items: center;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 15px;
  }
  
  .product-image-container {
    height: 180px;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>