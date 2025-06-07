<template>
  <div class="carousel-wrapper">
    <h2 class="carousel-title">Nos Produits</h2>

    <div v-if="loading" class="loading">Chargement...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="carousel-container" ref="carouselContainer">
      <button class="carousel-arrow left" @click="scrollLeft">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
        </svg>
      </button>
      
      <div class="carousel-track" :style="{ transform: `translateX(${translateX}px)` }" ref="carouselTrack">
        <div
          v-for="(product, index) in duplicatedProducts"
          :key="index"
          class="carousel-item"
          @click="selectProduct(product)"
        >
          <div class="image-container">
            <img
              v-if="product.image?.[0]?.url"
              :src="getStrapiImageUrl(product.image[0].url)"
              :alt="product.Nom"
              class="product-image"
              loading="lazy"
            />
            <div v-else class="image-placeholder">
              <span>Pas d'image</span>
            </div>
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.Nom }}</div>
            <div class="product-price">{{ product.prix }} FCFA</div>
          </div>
        </div>
      </div>
      
      <button class="carousel-arrow right" @click="scrollRight">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const translateX = ref(0);
const scrollSpeed = 0.5;
const carouselContainer = ref(null);
const carouselTrack = ref(null);
const animationFrame = ref(null);
const isManualScroll = ref(false);

const duplicatedProducts = computed(() => [...products.value, ...products.value]);

const getStrapiImageUrl = (url) => {
  return url.startsWith('http') ? url : `https://kind-duck-a00ba31603.strapiapp.com:${url}`;
};

const selectProduct = (product) => {
  console.log('Produit sélectionné:', product);
};

const scrollLeft = () => {
  isManualScroll.value = true;
  const containerWidth = carouselContainer.value?.clientWidth || 0;
  translateX.value += Math.min(containerWidth * 0.6, 250);
  
  // Réinitialise le flag après un court délai
  setTimeout(() => {
    isManualScroll.value = false;
  }, 300);
};

const scrollRight = () => {
  isManualScroll.value = true;
  const containerWidth = carouselContainer.value?.clientWidth || 0;
  translateX.value -= Math.min(containerWidth * 0.6, 250);
  
  // Réinitialise le flag après un court délai
  setTimeout(() => {
    isManualScroll.value = false;
  }, 300);
};

const animate = () => {
  if (isManualScroll.value) {
    animationFrame.value = requestAnimationFrame(animate);
    return;
  }

  const containerWidth = carouselContainer.value?.clientWidth || 0;
  const trackWidth = carouselTrack.value?.scrollWidth || 0;

  translateX.value -= scrollSpeed;

  // Réinitialisation de la position lorsque la moitié du carrousel est défilée
  if (Math.abs(translateX.value) >= trackWidth / 2) {
    translateX.value = 0;
  }

  animationFrame.value = requestAnimationFrame(animate);
};

onMounted(async () => {
  try {
    const res = await fetch('https://kind-duck-a00ba31603.strapiapp.com/api/produits?populate=image');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json = await res.json();
    
    products.value = json.data.map(item => ({
      id: item.id,
      Nom: item.Nom || 'Sans nom',
      prix: item.prix ? Number(item.prix).toLocaleString() : 'N/A',
      image: Array.isArray(item.image) ? item.image : []
    }));

    animationFrame.value = requestAnimationFrame(animate);
  } catch (err) {
    error.value = 'Erreur lors du chargement des produits';
    console.error('Erreur fetch produits:', err);
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (animationFrame.value) {
    cancelAnimationFrame(animationFrame.value);
  }
});
</script>

<style scoped>
.carousel-wrapper {
  width: 100%;
  background: linear-gradient(to right, #f9f9f9, #ffffff);
  padding: 40px 0;
  overflow: hidden;
  position: relative;
}

.carousel-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
}

.loading,
.error {
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  padding: 20px;
}

.carousel-container {
  width: 100%;
  overflow: hidden;
  height: 260px;
  position: relative;
}

.carousel-track {
  display: flex;
  flex-wrap: nowrap;
  will-change: transform;
}

.carousel-item {
  flex: 0 0 auto;
  width: 220px;
  margin-right: 24px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  padding: 16px;
  text-align: center;
  transition: transform 0.4s ease-out;
  cursor: pointer;
}

.carousel-item:hover {
  transform: translateY(-8px) scale(1.03);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  z-index: 10;
}

.image-container {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
  border-radius: 10px;
  background-color: #f5f5f5;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-item:hover .product-image {
  transform: scale(1.05);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  color: #888;
  font-size: 0.9rem;
}

.product-info {
  padding: 0 8px;
}

.product-name {
  font-weight: 600;
  font-size: 1rem;
  color: #444;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price {
  font-weight: 700;
  color: #2c3e50;
  font-size: 1.1rem;
}

.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
}

.carousel-arrow:hover {
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.carousel-arrow svg {
  width: 24px;
  height: 24px;
  color: #333;
}

.carousel-arrow.left {
  left: 10px;
}

.carousel-arrow.right {
  right: 10px;
}

@media (max-width: 768px) {
  .carousel-item {
    width: 180px;
  }

  .image-container {
    height: 140px;
  }

  .carousel-title {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  .carousel-arrow {
    width: 36px;
    height: 36px;
    opacity: 1;
    visibility: visible;
  }
  
  .carousel-arrow svg {
    width: 20px;
    height: 20px;
  }
}
</style>