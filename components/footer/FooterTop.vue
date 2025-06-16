<template>
  <div class="py-8 px-4 sm:px-6 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-4 border-b">
    <div class="text-center md:text-left">
      <h2 class="text-xl font-semibold text-gray-50">Inscrivez-vous à notre newsletter</h2>
      <p class="text-sm text-gray-50">Recevez les offres et actualités en avant-première.</p>
    </div>
    <form @submit.prevent class="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email"
        placeholder="Votre email"
        class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
      />
      <button
        type="submit"
        class="bg-gray-950 text-white px-4 py-2 rounded-md hover:bg-orange-600 sm:hover:bg-orange-600 cursor-pointer  transition"
      >
        S'inscrire
      </button>
    </form>
  </div>
</template>
