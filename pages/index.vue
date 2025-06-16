<template>
  <div>
    <Navbar />
    <ProductCarousel />
    <Catalogue />
    <Footer />
  </div>
</template>

<script setup>
import Navbar from '~/components/navigation/Navbar.vue'
import ProductCarousel from '~/components/Produit/ProductCarousel.vue'
import Catalogue from '~/components/Catalogue/CatalogueProduits.vue'
import Footer from '~/components/footer/Footer.vue'
</script>
