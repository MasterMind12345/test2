<template>
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-6">Votre Panier</h1>
  
      <div v-if="cartStore.itemCount === 0" class="text-center text-gray-600">
        <p>Votre panier est vide.</p>
        <NuxtLink to="/" class="text-blue-500 hover:underline mt-4 inline-block">Commencer vos achats</NuxtLink>
      </div>
  
      <div v-else>
        <div class="bg-white shadow-md rounded-lg p-6">
          <div v-for="item in cartStore.items" :key="item.id" class="flex items-center justify-between border-b pb-4 mb-4">
            <div class="flex items-center">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-20 h-20 object-cover rounded-md mr-4">
              <div>
                <h2 class="text-xl font-semibold">{{ item.name }}</h2>
                <p class="text-gray-600">€{{ item.price.toFixed(2) }}</p>
              </div>
            </div>
            <div class="flex items-center">
              <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition duration-200">
                -
              </button>
              <input type="number" :value="item.quantity"
                     @change="event => cartStore.updateQuantity(item.id, parseInt((event.target as HTMLInputElement).value))"
                     class="w-16 text-center border-t border-b py-1 focus:outline-none" min="1">
              <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      class="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition duration-200">
                +
              </button>
              <button @click="cartStore.removeFromCart(item.id)"
                      class="ml-4 text-red-500 hover:text-red-700 transition duration-200">
                Supprimer
              </button>
            </div>
          </div>
  
          <div class="flex justify-end items-center mt-6 pt-4 border-t">
            <p class="text-xl font-bold mr-4">Total: €{{ cartStore.cartTotal.toFixed(2) }}</p>
            <NuxtLink to="/checkout"
                      class="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300">
              Procéder au paiement
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useCartStore } from '@/stores/cart'; // Ajustez le chemin si nécessaire
  
  const cartStore = useCartStore();
  </script>
  
  <style scoped>
  /* Ajoutez un style de base ou utilisez un framework CSS comme Tailwind CSS */
  </style>