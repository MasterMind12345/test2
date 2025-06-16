<template>
  <div class="bg-white text-gray-800">
    <!-- Hero -->
    <section class="bg-indigo-600 text-white py-16">
           <!-- Bouton en haut à gauche -->
    <div class="absolute top-4 left-4 z-10">
        <NuxtLink
        to="/"
        class="bg-white text-indigo-600 font-semibold px-3 py-1 text-sm rounded-full hover:bg-gray-100 transition md:px-6 md:py-3 md:text-base"
        >
        Découvrir la boutique
        </NuxtLink>
    </div>

      <div class="max-w-5xl mx-auto px-4 text-center">
        <h1 class="text-4xl font-bold mb-4">Comment acheter sur notre boutique</h1>
        <p class="text-lg text-indigo-100">
          Suivez ces quelques étapes simples pour commander en toute sérénité.
        </p>
      </div>
    </section>

    <!-- Étapes -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-3xl font-semibold text-center text-indigo-700 mb-12">Étapes d'achat</h2>
        <div class="grid md:grid-cols-2 gap-10">
          <div class="flex items-start space-x-4">
            <div class="text-indigo-600 text-3xl font-bold">1</div>
            <div>
              <h3 class="text-xl font-semibold">Parcourez nos produits</h3>
              <p class="text-gray-600">Explorez les différentes catégories pour découvrir nos articles tendance.</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="text-indigo-600 text-3xl font-bold">2</div>
            <div>
              <h3 class="text-xl font-semibold">Ajoutez au panier</h3>
              <p class="text-gray-600">Cliquez sur "Ajouter au panier" pour chaque produit souhaité.</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="text-indigo-600 text-3xl font-bold">3</div>
            <div>
              <h3 class="text-xl font-semibold">Passez commande</h3>
              <p class="text-gray-600">Accédez à votre panier, vérifiez votre sélection puis cliquez sur "Commander".</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="text-indigo-600 text-3xl font-bold">4</div>
            <div>
              <h3 class="text-xl font-semibold">Créez un compte ou connectez-vous</h3>
              <p class="text-gray-600">Cela nous permet de suivre votre commande et de vous tenir informé.</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="text-indigo-600 text-3xl font-bold">5</div>
            <div>
              <h3 class="text-xl font-semibold">Choisissez la livraison</h3>
              <p class="text-gray-600">Sélectionnez le mode de livraison qui vous convient le mieux.</p>
            </div>
          </div>

          <div class="flex items-start space-x-4">
            <div class="text-indigo-600 text-3xl font-bold">6</div>
            <div>
              <h3 class="text-xl font-semibold">Payez en toute sécurité</h3>
              <p class="text-gray-600">Finalisez votre achat via nos méthodes de paiement 100% sécurisées.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Astuces / FAQ rapide -->
    <section class="bg-gray-50 py-16">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-2xl font-bold text-indigo-700 mb-6 text-center">Questions fréquentes</h2>
        <div class="space-y-6">
          <details class="bg-white p-4 rounded-xl shadow">
            <summary class="cursor-pointer font-semibold text-indigo-600">Puis-je commander sans créer de compte ?</summary>
            <p class="text-gray-700 mt-2">Non, un compte est nécessaire pour assurer le suivi de votre commande et la communication.</p>
          </details>
          <details class="bg-white p-4 rounded-xl shadow">
            <summary class="cursor-pointer font-semibold text-indigo-600">Quels sont les moyens de paiement acceptés ?</summary>
            <p class="text-gray-700 mt-2">Nous acceptons les paiements par carte bancaire, PayPal, et Mobile Money (si disponible dans votre pays).</p>
          </details>
          <details class="bg-white p-4 rounded-xl shadow">
            <summary class="cursor-pointer font-semibold text-indigo-600">Quand vais-je recevoir ma commande ?</summary>
            <p class="text-gray-700 mt-2">Cela dépend du mode de livraison choisi. Généralement, entre 2 et 5 jours ouvrés.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-indigo-600 text-white py-12 mt-10">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <h3 class="text-2xl font-bold mb-4">Prêt(e) à faire votre shopping?</h3>
        <NuxtLink to="/" class="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition">
          Découvrir la boutique
        </NuxtLink>
      </div>
    </section>
  </div>
  <Footer />
</template>
