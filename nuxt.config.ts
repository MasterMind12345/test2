import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/tailwind.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  modules: [
    'shadcn-nuxt',
    '@pinia/nuxt' // Ajout du module Pinia
  ],
  
  // Configuration de Pinia
  pinia: {
    autoImports: [
      'defineStore', // Import automatique de defineStore
      ['defineStore', 'definePiniaStore'], // Alias supplémentaire
    ],
  },

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  }
})