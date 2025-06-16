  
  <script setup lang="ts">


  // Nuxt 3 auto-importe votre composant CatalogueProduits
  // car il est dans `components/catalogue/CatalogueProduits.vue`.
  // Vous n'avez donc PAS besoin d'un import explicite ici dans la plupart des cas.
  
  // Si pour une raison quelconque l'auto-import ne fonctionne pas, vous pouvez essayer :
   import CatalogueProduits from '~/components/Catalogue/CatalogueProduits.vue';
  </script>
  


  <template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-extrabold text-gray-800 mb-8 text-center">Découvrez nos produits</h1>
  
      <CatalogueProduits />
  
      <div class="mt-12 text-center">
        <NuxtLink to="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out">
          Retour à l'accueil
        </NuxtLink>
      </div>
    </div>
  </template>

  <style scoped>
  /* Ajoutez des styles spécifiques à cette page si nécessaire */
  </style>