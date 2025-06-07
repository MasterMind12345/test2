<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Flame, Zap, Star, Percent, Clock, Monitor, ChefHat, Wind, Grid3X3, ShoppingCart, Search, Folder, FileText, UserIcon, Package, Heart, LogOut, Menu, BadgePercent, ShoppingBag } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const showResults = ref(false)
const isLoading = ref(false)
const cartCount = ref(0)


import { useCartStore } from '@/stores/cart'; 
import { navigateTo } from '#app'; 

const forceReloadCart = () => {
  navigateTo('/panier');
}

console.log('Routes:', router.getRoutes()) 


// Déclare cartStore comme un ref qui peut être null au début.
// Cela gère le cas où le store n'est pas encore initialisé, notamment lors du SSR.
const cartStore = ref<ReturnType<typeof useCartStore> | null>(null);

// Initialise le store Pinia uniquement lorsque le composant est monté sur le client.
// Cela évite les erreurs "Cannot read properties of undefined" liées au SSR.
onMounted(() => {
  cartStore.value = useCartStore();
  // Optionnel: Logs de débogage pour voir l'état du store
  console.log('Navbar: cartStore initialisé sur mounted:', cartStore.value);
  if (cartStore.value) {
    console.log('Navbar: totalItems sur mounted:', cartStore.value.totalItems);
  }
});














const navigateTo = (path: string) => {
  router.push(path)
}

const getStrapiImageUrl = (url: string) => {
  if (!url) return ''
  return url.startsWith('http') ? url : `https://kind-duck-a00ba31603.strapiapp.com${url}`
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showResults.value = false
    return
  }

  isLoading.value = true
  showResults.value = true
  
  try {
    const response = await fetch(
      `https://kind-duck-a00ba31603.strapiapp.com/api/produits?filters[Nom][$contains]=${encodeURIComponent(searchQuery.value)}&populate=image`
    )
    
    if (!response.ok) throw new Error('Erreur lors de la recherche')
    
    const data = await response.json()
    
    searchResults.value = data.data.map((item: any) => ({
      id: item.id,
      Nom: item.Nom || 'Sans nom',
      prix: item.prix ? Number(item.prix).toLocaleString() + ' FCFA' : 'N/A',
      image: item.image || [],
      categorie: item.categorie?.Nom || 'Non catégorisé'
    }))
    
  } catch (error) {
    console.error('Erreur de recherche:', error)
    searchResults.value = []
  } finally {
    isLoading.value = false
  }
}

const navigateToProduct = (product: any) => {
  router.push(`/produits/${product.id}`)
  searchQuery.value = ''
  searchResults.value = []
  showResults.value = false
}

const closeResults = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}


</script>

<template>
  <div class="w-full">
    <!-- Top banner -->
    <div class="bg-gradient-to-r from-primary/95 to-secondary/95 text-white text-center py-2 text-sm font-medium">
      Espace promotionnel
    </div>
    
    <!-- Phone number bar -->
    <div class="bg-background border-b py-2 px-4">
      <div class="container mx-auto flex justify-end items-center text-sm">
        <span class="mr-4 text-muted-foreground">Commandez par appel au</span>
        <span class="text-xl font-bold text-primary">+237 655 04 53 45</span>
      </div>
    </div>

    <!-- Main navigation -->
    <nav class="bg-background/95 border-b shadow-sm sticky top-0 z-40 backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between py-4">
          <!-- Logo -->
          <NuxtLink to="" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div class="bg-primary p-2 rounded-lg shadow-sm">
              <ShoppingBag class="w-6 h-6 text-primary-foreground" :stroke-width="2.5" />
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold text-foreground">Shopitech</span>
              <span class="text-xs text-muted-foreground -mt-1 hidden sm:block">ECOMMERCE</span>
            </div>
          </NuxtLink>

          <!-- Search bar (version desktop) -->
          <div class="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <form @submit.prevent="performSearch" class="relative w-full flex">
              <Input
                v-model="searchQuery"
                type="text"
                placeholder="Que recherchez-vous ?"
                class="flex-1 rounded-r-none border-r-0 focus-visible:ring-background"
                @focus="showResults = true"
                @blur="closeResults"
                @input="performSearch"
              />
              <Button
                type="submit"
                class="rounded-l-none bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-6"
              >
                <Search class="w-5 h-5" :stroke-width="2.5" />
                Rechercher
              </Button>
            </form>

            <!-- Résultats de recherche -->
            <div 
              v-if="showResults && (searchResults.length > 0 || isLoading)"
              class="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto"
            >
              <div v-if="isLoading" class="p-4 text-center text-muted-foreground">
                Chargement...
              </div>
              <div v-else-if="searchResults.length === 0" class="p-4 text-center text-muted-foreground">
                Aucun résultat trouvé
              </div>
              <div v-else>
                <div 
                  v-for="product in searchResults"
                  :key="product.id"
                  class="p-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3 border-b"
                  @click="navigateToProduct(product)"
                >
                  <div class="w-12 h-12 bg-muted rounded-md flex-shrink-0 overflow-hidden">
                    <img 
                      v-if="product.image?.[0]?.url"
                      :src="getStrapiImageUrl(product.image[0].url)"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-muted">
                      <Package class="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium truncate">{{ product.Nom }}</h4>
                    <p class="text-sm text-muted-foreground">{{ product.prix }}</p>
                    <p class="text-xs text-muted-foreground">{{ product.categorie }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right side actions -->
          <div class="flex items-center space-x-2">
            <!-- Categories menu button -->
            <Sheet>
              <SheetTrigger as-child>
                <Button variant="outline" size="sm" class="hidden sm:flex items-center space-x-1">
                  <Grid3X3 class="w-4 h-4" :stroke-width="2.5" />
                  <span class="hidden lg:inline">Catégories</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="w-96 p-0">
                <div class="flex flex-col h-full">
                  <SheetHeader class="p-6 border-b bg-muted/30">
                    <div class="flex items-center space-x-3">
                      <div class="bg-primary p-2 rounded-lg">
                        <Grid3X3 class="w-5 h-5 text-primary-foreground" :stroke-width="2.5" />
                      </div>
                      <div>
                        <SheetTitle class="text-lg">Toutes les catégories</SheetTitle>
                        <p class="text-sm text-muted-foreground">Explorez notre catalogue</p>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div class="flex-1 overflow-y-auto p-4">
                    <div class="space-y-2">
                      <div v-for="category in categoriesTree" :key="category.id" class="border rounded-lg">
                        <Collapsible v-model:open="category.isOpen">
                          <CollapsibleTrigger as-child>
                            <Button
                              variant="ghost"
                              class="w-full justify-between p-4 h-auto hover:bg-muted/50"
                            >
                              <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <component :is="category.icon" class="w-5 h-5 text-primary" :stroke-width="2.5" />
                                </div>
                                <div class="text-left">
                                  <div class="font-medium">{{ category.name }}</div>
                                  <div class="text-sm text-muted-foreground">{{ category.count }} articles</div>
                                </div>
                              </div>
                              <ChevronRight 
                                class="w-4 h-4 text-muted-foreground transition-transform duration-200" 
                                :class="{ 'rotate-90': category.isOpen }"
                                :stroke-width="2.5" 
                              />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent class="border-t bg-muted/20">
                            <div class="p-2 space-y-1">
                              <div v-for="subcategory in category.subcategories" :key="subcategory.id">
                                <Collapsible v-model:open="subcategory.isOpen">
                                  <CollapsibleTrigger as-child>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      class="w-full justify-between pl-6 text-left hover:bg-background"
                                    >
                                      <div class="flex items-center space-x-2">
                                        <Folder class="w-4 h-4 text-muted-foreground" :stroke-width="2.5" />
                                        <span>{{ subcategory.name }}</span>
                                      </div>
                                      <ChevronRight 
                                        class="w-3 h-3 text-muted-foreground transition-transform duration-200" 
                                        :class="{ 'rotate-90': subcategory.isOpen }"
                                        :stroke-width="2.5" 
                                      />
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent class="ml-8 mt-1 space-y-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      class="w-full justify-start pl-6 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                      v-for="item in subcategory.items"
                                      :key="item"
                                    >
                                      <FileText class="w-3 h-3 mr-2" :stroke-width="2.5" />
                                      {{ item }}
                                    </Button>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <!-- Mobile hamburger menu -->
            <Sheet>
              <SheetTrigger as-child>
                <Button
                  variant="ghost"
                  size="sm"
                  class="sm:hidden p-2"
                >
                  <Menu class="w-6 h-6" :stroke-width="2.5" />
                  <span class="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="w-80 p-0">
                <div class="flex flex-col h-full">
                  <SheetHeader class="p-6 border-b bg-muted/30">
                    <div class="flex items-center space-x-3">
                      <div class="bg-primary p-2 rounded-lg">
                        <ShoppingBag class="w-5 h-5 text-primary-foreground" :stroke-width="2.5" />
                      </div>
                      <div>
                        <SheetTitle>Shopitech</SheetTitle>
                        <p class="text-sm text-muted-foreground">Menu principal</p>
                      </div>
                    </div>
                  </SheetHeader>
                  
                  <div class="flex-1 overflow-y-auto">
                    <!-- User section -->
                    <div class="p-4 border-b bg-muted/20">
                      <div class="flex items-center space-x-1">
                        <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <UserIcon class="w-5 h-5 text-primary" :stroke-width="2.5" />
                        </div>
                        <div>
                          <p class="font-medium">yannick</p>
                          <p class="text-sm text-muted-foreground">iamyannick@gmail.com</p>
                        </div>
                      </div>
                    </div>

                    <!-- Categories for mobile -->
                    <div class="p-4">
                      <h3 class="font-semibold mb-4 flex items-center">
                        <Grid3X3 class="w-5 h-5 mr-2 text-primary" :stroke-width="2.5" />
                        Catégories
                      </h3>
                      <!-- Tree structure for mobile -->
                      <div class="space-y-1">
                        <div v-for="category in categoriesTree" :key="category.id">
                          <Collapsible v-model:open="category.isOpenMobile">
                            <CollapsibleTrigger as-child>
                              <Button
                                variant="ghost"
                                class="w-full justify-between p-3 h-auto hover:bg-muted/50"
                              >
                                <div class="flex items-center space-x-3">
                                  <component :is="category.icon" class="w-5 h-5 text-primary" :stroke-width="2.5" />
                                  <span class="font-medium">{{ category.name }}</span>
                                </div>
                                <ChevronRight 
                                  class="w-4 h-4 transition-transform duration-200" 
                                  :class="{ 'rotate-90': category.isOpenMobile }"
                                  :stroke-width="2.5" 
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent class="ml-4 mt-1 space-y-1">
                              <div v-for="subcategory in category.subcategories" :key="subcategory.id">
                                <Collapsible v-model:open="subcategory.isOpenMobile">
                                  <CollapsibleTrigger as-child>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      class="w-full justify-between pl-4 hover:bg-muted/30"
                                    >
                                      <div class="flex items-center space-x-2">
                                        <Folder class="w-4 h-4 text-muted-foreground" :stroke-width="2.5" />
                                        <span>{{ subcategory.name }}</span>
                                      </div>
                                      <ChevronRight 
                                        class="w-3 h-3 transition-transform duration-200" 
                                        :class="{ 'rotate-90': subcategory.isOpenMobile }"
                                        :stroke-width="2.5" 
                                      />
                                    </Button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent class="ml-6 mt-1 space-y-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      class="w-full justify-start text-muted-foreground hover:text-foreground"
                                      v-for="item in subcategory.items"
                                      :key="item"
                                    >
                                      {{ item }}
                                    </Button>
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <!-- User account -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" size="sm" class="hidden sm:flex items-center space-x-2">
                  <div class="w-8 h-8 flex items-center justify-center">
                    <UserIcon class="w-4 h-4 text-primary" :stroke-width="2.5" />
                  </div>
                  <div class="text-left hidden lg:block">
                    <div class="text-sm font-medium">yannick</div>
                  </div>
                  <ChevronDown class="w-4 h-4 hidden lg:block" :stroke-width="2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <div class="px-3 py-2 border-b">
                  <p class="font-medium">yannick</p>
                  <p class="text-sm text-muted-foreground">iamyannick@gmail.com</p>
                  <p class="text-sm text-muted-foreground">
                    +237 655 37 77 30
                  </p>
                </div>
                <DropdownMenuItem @click="navigateTo('/profil')">
                  <UserIcon class="w-4 h-4 mr-2" :stroke-width="2.5" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem @click="navigateTo('/commandes')">
                  <Package class="w-4 h-4 mr-2" :stroke-width="2.5" />
                  Mes commandes
                </DropdownMenuItem>
                <DropdownMenuItem @click="navigateTo('/favoris')">
                  <Heart class="w-4 h-4 mr-2" :stroke-width="2.5" />
                  Mes favoris
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="text-destructive">
                  <LogOut class="w-4 h-4 mr-2" :stroke-width="2.5" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

    
  
<NuxtLink 
  to="/panier" 
  class="global-cart-button"
  aria-label="panier"
>
  <ShoppingCart class="h-6 w-6" :stroke-width="2.5" />
  <span v-if="cartStore?.totalItems > 0" class="cart-item-count">
    {{ cartStore.totalItems }}
  </span>
</NuxtLink>




 
          </div>
        </div>

        <!-- Mobile search -->
        <div class="md:hidden pb-4">
          <form class="relative flex">
            <Input
              type="text"
              placeholder="Que recherchez-vous ?"
              class="flex-1 rounded-r-none border-r-0 focus-visible:ring-primary"
            />
            <Button
              type="submit"
              class="rounded-l-none bg-primary hover:bg-primary/90 text-primary-foreground px-4"
            >
              <Search class="w-5 h-5" :stroke-width="2.5" />
            </Button>
          </form>
        </div>
      </div>
    </nav>

    <!-- Promotions bar -->
    <div class="bg-muted/30 border-b overflow-x-auto">
      <div class="container mx-auto px-4">
        <div class="flex items-center space-x-6 py-3 text-sm whitespace-nowrap">
          <NuxtLink 
            v-for="promo in promotions" 
            :key="promo.id"
            :to="promo.link"
            class="flex items-center space-x-2 cursor-pointer hover:text-primary transition-colors"
          >
            <component :is="promo.icon" class="w-4 h-4 text-primary" :stroke-width="2.5" />
            <span class="font-medium">{{ promo.title }}</span>
            <Badge variant="secondary" class="text-xs">{{ promo.discount }}</Badge>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

/* Styles de l'en-tête principal de la barre de navigation */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f8f8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky; /* Rends l'en-tête "collant" en haut de la page */
  top: 0; /* Positionne en haut */
  z-index: 999; /* Assure que la navbar est au-dessus des autres éléments */
}

/* Style du logo de l'application */
.app-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

/* Styles pour les liens de navigation */
.main-nav .nav-link {
  margin-left: 1.5rem;
  color: #34495e;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.main-nav .nav-link:hover {
  color: #2c3e50;
}

/* Conteneur de l'icône du panier pour le positionnement */
.cart-icon-container {
  /* Pas de styles spécifiques ici, le style est sur le bouton lui-même */
}

/* Styles appliqués au composant Button (shadcn/ui) via la classe 'global-cart-button' */
.global-cart-button {
  background-color: #3498db; /* Couleur de fond bleue pour le bouton panier */
  color: white; /* Couleur du texte blanc */
  padding: 0.75rem 1rem; /* Espacement interne */
  border-radius: 9999px; /* Forme de pilule pour le bouton */
  display: flex; /* Utilise flexbox pour aligner l'icône et le texte */
  align-items: center; /* Centre verticalement les éléments */
  gap: 0.5rem; /* Espace entre l'icône et le texte */
  cursor: pointer; /* Indique que l'élément est cliquable */
  border: none; /* Pas de bordure par défaut (shadcn/ui Button peut avoir sa propre bordure) */
  font-weight: 600; /* Gras pour le texte */
  transition: background-color 0.2s ease-in-out; /* Transition douce sur le survol */
  position: relative; /* Nécessaire pour positionner le compteur d'articles */
}

.global-cart-button:hover {
  background-color: #2980b9; /* Couleur de fond au survol */
}

.global-cart-button svg {
  width: 1.5rem; /* Largeur de l'icône SVG */
  height: 1.5rem; /* Hauteur de l'icône SVG */
}

/* Styles pour le compteur d'articles dans le panier */
.cart-item-count {
  position: absolute; /* Positionnement absolu par rapport au bouton parent */
  top: -8px; /* Décalage vers le haut */
  right: -8px; /* Décalage vers la droite */
  background-color: #e74c3c; /* Couleur de fond rouge */
  color: white; /* Couleur du texte blanc */
  font-size: 0.75rem; /* Taille de police plus petite */
  font-weight: bold; /* Texte en gras */
  border-radius: 50%; /* Forme circulaire */
  padding: 0.25rem 0.5rem; /* Espacement interne */
  line-height: 1; /* Assure un bon alignement vertical du texte */
  min-width: 20px; /* Largeur minimale pour l'affichage */
  text-align: center; /* Centre le texte */
  display: flex; /* Utilise flexbox pour centrer le texte */
  justify-content: center; /* Centre horizontalement le texte */
  align-items: center; /* Centre verticalement le texte */
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--primary));
  border-radius: 2px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--primary) / 0.8);
}
</style>
