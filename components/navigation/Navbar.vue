<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductsStore } from '@/stores/products';
import { useCartStore } from '@/stores/cart';

// Icônes Lucide Vue
import { 
  Flame, Zap, Star, Percent, Clock, Monitor, ChefHat, Wind, Grid3X3, 
  ShoppingCart, Search, Folder, FileText, User, Package, Heart, 
  LogOut, Menu, BadgePercent, ShoppingBag, LogIn, UserPlus, ChevronRight, ChevronDown 
} from 'lucide-vue-next';

// Composants UI Shadcn Vue
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const router = useRouter();
const productsStore = useProductsStore();
const cartStore = useCartStore();

// Variables d'état
const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const showResults = ref(false);
const isLoading = ref(false);
const isAuthenticated = ref(false);
const authDialogOpen = ref(false);
const authMode = ref<'login' | 'register'>('login');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const currentUser = ref<any | null>(null);

const STRAPI_URL = 'https://kind-duck-a00ba31603.strapiapp.com/api';

// Fonctions d'authentification
const handleLogin = async () => {
  errorMessage.value = '';
  try {
    const response = await fetch(`${STRAPI_URL}/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();
    if (data.error) {
      errorMessage.value = data.error.message;
      return;
    }

    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    isAuthenticated.value = true;
    currentUser.value = data.user;
    authDialogOpen.value = false;
    resetForm();
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    errorMessage.value = 'Erreur réseau ou serveur. Veuillez réessayer.';
  }
};

const handleRegister = async () => {
  errorMessage.value = '';
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Les mots de passe ne correspondent pas.';
    return;
  }

  try {
    const response = await fetch(`${STRAPI_URL}/auth/local/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: email.value.split('@')[0],
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();
    if (data.error) {
      errorMessage.value = data.error.message;
      return;
    }

    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('user', JSON.stringify(data.user));
    isAuthenticated.value = true;
    currentUser.value = data.user;
    authDialogOpen.value = false;
    resetForm();
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    errorMessage.value = 'Erreur réseau ou serveur. Veuillez réessayer.';
  }
};

const handleLogout = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('user');
  isAuthenticated.value = false;
  currentUser.value = null;
  router.push('/');
};

const resetForm = () => {
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
  errorMessage.value = '';
};

const toggleAuth = (mode: 'login' | 'register') => {
  authMode.value = mode;
  resetForm();
  authDialogOpen.value = true;
};

// Fonctions de recherche
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    showResults.value = false;
    return;
  }

  isLoading.value = true;
  showResults.value = true;
  
  try {
    const response = await fetch(
      `${STRAPI_URL}/produits?filters[Nom][$contains]=${encodeURIComponent(searchQuery.value)}&populate=image`
    );
    
    if (!response.ok) throw new Error('Erreur lors de la recherche');
    
    const data = await response.json();
    
    searchResults.value = data.data.map((item: any) => ({
      id: item.id,
      Nom: item.attributes?.Nom || item.Nom,
      prix: item.attributes?.prix ? Number(item.attributes.prix).toLocaleString() + ' FCFA' : 'N/A',
      image: item.attributes?.image?.data || item.image,
      categorie: item.attributes?.category?.data?.attributes?.Nom || item.category?.Nom || 'Non catégorisé'
    }));
    
  } catch (error) {
    console.error('Erreur de recherche:', error);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const navigateToProduct = (product: any) => {
  router.push(`/produits/${product.id}`);
  searchQuery.value = '';
  searchResults.value = [];
  showResults.value = false;
};

const closeResults = () => {
  setTimeout(() => {
    showResults.value = false;
  }, 200);
};

// Données factices pour les promotions
const promotions = ref([
  { id: 1, title: 'Flash Sales', icon: Flame, discount: '-20%', link: '/promotions/flash-sales' },
  { id: 2, title: 'Offres Éclair', icon: Zap, discount: '-15%', link: '/promotions/offres-eclair' },
  { id: 3, title: 'Nouveautés', icon: Star, discount: 'New', link: '/nouveautes' },
  { id: 4, title: 'Top Ventes', icon: Percent, discount: 'Populaire', link: '/top-ventes' },
  { id: 5, title: 'Dernière Chance', icon: Clock, discount: '-10%', link: '/derniere-chance' },
]);

// Initialisation
onMounted(() => {
  const jwt = localStorage.getItem('jwt');
  if (jwt) {
    isAuthenticated.value = true;
    const user = localStorage.getItem('user');
    if (user) {
      currentUser.value = JSON.parse(user);
    }
  }
  
  // Charger les catégories depuis le store
  productsStore.fetchCategories();
});
</script>

<template>
  <div class="w-full">
    <!-- Bandeau promotionnel -->
    <div class="bg-gradient-to-r from-primary/95 to-secondary/95 text-white text-center py-2 text-sm font-medium">
      Espace promotionnel
    </div>
    
    <!-- Barre de contact -->
    <div class="bg-background border-b py-2 px-4">
      <div class="container mx-auto flex justify-end items-center text-sm">
        <span class="mr-4 text-muted-foreground">Commandez par appel au</span>
        <span class="text-xl font-bold text-primary">+237 655 04 53 45</span>
      </div>
    </div>

    <!-- Navigation principale -->
    <nav class="bg-background/95 border-b shadow-sm sticky top-0 z-40 backdrop-blur-sm">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between py-4">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div class="bg-primary p-2 rounded-lg shadow-sm">
              <ShoppingBag class="w-6 h-6 text-primary-foreground" :stroke-width="2.5" />
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold text-foreground">Shopitech</span>
              <span class="text-xs text-muted-foreground -mt-1 hidden sm:block">ECOMMERCE</span>
            </div>
          </NuxtLink>

          <!-- Recherche (desktop) -->
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
                      v-if="product.image?.attributes?.url || product.image?.[0]?.url"
                      :src="product.image?.attributes?.url || 
                            (product.image[0].url.startsWith('http') ? product.image[0].url : `https://kind-duck-a00ba31603.strapiapp.com${product.image[0].url}`)"
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

          <!-- Actions utilisateur -->
          <div class="flex items-center space-x-2">
            <!-- Menu catégories (desktop) -->
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
                      <div 
                        v-for="category in productsStore.categories.filter(c => c.isMainCategory)" 
                        :key="category.id" 
                        class="border rounded-lg"
                      >
                        <Collapsible v-model:open="category.isOpen">
                          <CollapsibleTrigger as-child>
                            <Button
                              variant="ghost"
                              class="w-full justify-between p-4 h-auto hover:bg-muted/50"
                              @click="productsStore.selectCategory(category.id)"
                            >
                              <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Monitor class="w-5 h-5 text-primary" :stroke-width="2.5" />
                                </div>
                                <div class="text-left">
                                  <div class="font-medium">{{ category.Nom }}</div>
                                  <div class="text-sm text-muted-foreground">
                                    {{ productsStore.categories.filter(c => c.parentCategory === category.id).length }} sous-catégories
                                  </div>
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
                              <Button
                                v-for="subcategory in productsStore.categories.filter(c => c.parentCategory === category.id)"
                                :key="subcategory.id"
                                variant="ghost"
                                size="sm"
                                class="w-full justify-start pl-6 hover:bg-background"
                                @click="productsStore.selectCategory(subcategory.id)"
                              >
                                <Folder class="w-4 h-4 mr-2 text-muted-foreground" :stroke-width="2.5" />
                                {{ subcategory.Nom }}
                              </Button>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <!-- Menu mobile -->
            <Sheet>
              <SheetTrigger as-child>
                <Button variant="ghost" size="sm" class="sm:hidden p-2">
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
                    <!-- Authentification mobile -->
                    <div v-if="!isAuthenticated" class="p-4 border-b bg-muted/20 flex flex-col space-y-2">
                      <Button @click="toggleAuth('login')" class="w-full">
                        <LogIn class="w-4 h-4 mr-2" :stroke-width="2.5" />
                        Se connecter
                      </Button>
                      <Button @click="toggleAuth('register')" variant="outline" class="w-full">
                        <UserPlus class="w-4 h-4 mr-2" :stroke-width="2.5" />
                        S'inscrire
                      </Button>
                    </div>

                    <!-- Profil mobile -->
                    <div v-else class="p-4 border-b bg-muted/20">
                      <Button variant="ghost" class="w-full justify-start h-auto py-2" @click="router.push('/profil')">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User class="w-4 h-4 text-primary" :stroke-width="2.5" />
                          </div>
                          <div class="flex flex-col items-start">
                            <span class="font-medium">Mon profil</span>
                            <span class="text-xs text-muted-foreground">{{ currentUser?.username || 'Utilisateur' }}</span>
                            <span class="text-xs text-muted-foreground">{{ currentUser?.email || 'email@exemple.com' }}</span>
                          </div>
                        </div>
                      </Button>
                    </div>

                    <!-- Catégories mobile -->
                    <div class="p-4">
                      <h3 class="font-semibold mb-4 flex items-center">
                        <Grid3X3 class="w-5 h-5 mr-2 text-primary" :stroke-width="2.5" />
                        Catégories
                      </h3>
                      <div class="space-y-1">
                        <div 
                          v-for="category in productsStore.categories.filter(c => c.isMainCategory)" 
                          :key="category.id"
                        >
                          <Collapsible v-model:open="category.isOpenMobile">
                            <CollapsibleTrigger as-child>
                              <Button
                                variant="ghost"
                                class="w-full justify-between p-3 h-auto hover:bg-muted/50"
                                @click="productsStore.selectCategory(category.id)"
                              >
                                <div class="flex items-center space-x-3">
                                  <Monitor class="w-5 h-5 text-primary" :stroke-width="2.5" />
                                  <span class="font-medium">{{ category.Nom }}</span>
                                </div>
                                <ChevronRight 
                                  class="w-4 h-4 transition-transform duration-200" 
                                  :class="{ 'rotate-90': category.isOpenMobile }"
                                  :stroke-width="2.5" 
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent class="ml-4 mt-1 space-y-1">
                              <Button
                                v-for="subcategory in productsStore.categories.filter(c => c.parentCategory === category.id)"
                                :key="subcategory.id"
                                variant="ghost"
                                size="sm"
                                class="w-full justify-start pl-6 hover:bg-background"
                                @click="productsStore.selectSubcategory(subcategory.id)"
                              >
                                <Folder class="w-4 h-4 mr-2 text-muted-foreground" :stroke-width="2.5" />
                                {{ subcategory.Nom }}
                              </Button>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </div>

                    <!-- Menu utilisateur mobile -->
                    <div v-if="isAuthenticated" class="p-4 space-y-1">
                      <Button variant="ghost" class="w-full justify-start" @click="router.push('/commandes')">
                        <Package class="w-4 h-4 mr-2" :stroke-width="2.5" />
                        Mes commandes
                      </Button>
                      <Button variant="ghost" class="w-full justify-start" @click="router.push('/favoris')">
                        <Heart class="w-4 h-4 mr-2" :stroke-width="2.5" />
                        Mes favoris
                      </Button>
                      <Button 
                        variant="ghost" 
                        class="w-full justify-start text-destructive" 
                        @click="handleLogout"
                      >
                        <LogOut class="w-4 h-4 mr-2" :stroke-width="2.5" />
                        Se déconnecter
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <!-- Panier -->
            <NuxtLink to="/panier" class="global-cart-button" aria-label="panier">
              <ShoppingCart class="h-6 w-6" :stroke-width="2.5" />
              <span v-if="cartStore.totalItems > 0" class="cart-item-count">
                {{ cartStore.totalItems }}
              </span>
            </NuxtLink>

            <!-- Authentification desktop -->
            <template v-if="!isAuthenticated">
              <Button 
                variant="outline" 
                size="sm" 
                class="hidden sm:flex items-center space-x-2"
                @click="toggleAuth('login')"
              >
                <LogIn class="w-4 h-4" :stroke-width="2.5" />
                <span class="hidden lg:inline">Se connecter</span>
              </Button>

              <Button 
                variant="default" 
                size="sm" 
                class="hidden sm:flex items-center space-x-2"
                @click="toggleAuth('register')"
              >
                <UserPlus class="w-4 h-4" :stroke-width="2.5" />
                <span class="hidden lg:inline">S'inscrire</span>
              </Button>
            </template>

            <!-- Menu utilisateur desktop -->
            <template v-else>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="outline" size="sm" class="hidden sm:flex items-center space-x-2">
                    <div class="w-8 h-8 flex items-center justify-center">
                      <User class="w-4 h-4 text-primary" :stroke-width="2.5" />
                    </div>
                    <div class="text-left hidden lg:block">
                      <div class="text-sm font-medium">Mon compte</div>
                    </div>
                    <ChevronDown class="w-4 h-4 hidden lg:block" :stroke-width="2.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-56">
                  <DropdownMenuItem @click="router.push('/profil')" class="flex flex-col items-start h-auto py-2">
                    <div class="flex items-center space-x-2 mb-1">
                      <User class="w-4 h-4 text-primary" :stroke-width="2.5" />
                      <span class="text-base font-semibold">Mon profil</span>
                    </div>
                    <span class="text-xs text-muted-foreground pl-6">{{ currentUser?.username || 'Utilisateur' }}</span>
                    <span class="text-xs text-muted-foreground pl-6">{{ currentUser?.email || 'email@exemple.com' }}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="router.push('/commandes')">
                    <Package class="w-4 h-4 mr-2" :stroke-width="2.5" />
                    Mes commandes
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="router.push('/favoris')">
                    <Heart class="w-4 h-4 mr-2" :stroke-width="2.5" />
                    Mes favoris
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive" @click="handleLogout">
                    <LogOut class="w-4 h-4 mr-2" :stroke-width="2.5" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </template>
          </div>
        </div>

        <!-- Recherche mobile -->
        <div class="md:hidden pb-4 relative">
          <form @submit.prevent="performSearch" class="relative flex">
            <Input
              v-model="searchQuery"
              type="text"
              placeholder="Que recherchez-vous ?"
              class="flex-1 rounded-r-none border-r-0 focus-visible:ring-primary"
              @focus="showResults = true"
              @blur="closeResults"
              @input="performSearch"
            />
            <Button
              type="submit"
              class="rounded-l-none bg-primary hover:bg-primary/90 text-primary-foreground px-4"
            >
              <Search class="w-5 h-5" :stroke-width="2.5" />
            </Button>
          </form>

          <!-- Résultats de recherche mobile -->
          <div 
            v-if="showResults && (searchResults.length > 0 || isLoading)"
            class="absolute left-0 right-0 z-50 mt-1 bg-background border rounded-lg shadow-lg max-h-96 overflow-y-auto"
            style="width: calc(100% - 2rem); margin-left: 1rem;"
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
                    v-if="product.image?.attributes?.url || product.image?.[0]?.url"
                    :src="product.image?.attributes?.url || 
                          (product.image[0].url.startsWith('http') ? product.image[0].url : `https://kind-duck-a00ba31603.strapiapp.com${product.image[0].url}`)"
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
      </div>
    </nav>

    <!-- Promotions -->
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

    <!-- Modale d'authentification -->
    <Dialog v-model:open="authDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{{ authMode === 'login' ? 'Connexion' : 'Inscription' }}</DialogTitle>
          <DialogDescription>
            {{ authMode === 'login' 
              ? 'Connectez-vous pour accéder à votre compte' 
              : 'Créez un compte pour bénéficier de nos services' }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="grid gap-4 py-4">
          <div v-if="errorMessage" class="text-red-500 text-sm p-2 bg-red-50 rounded">
            {{ errorMessage }}
          </div>
          
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="email" class="text-right">
              Email
            </Label>
            <Input 
              id="email" 
              v-model="email" 
              type="email" 
              class="col-span-3" 
              placeholder="votre@email.com"
            />
          </div>
          
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="password" class="text-right">
              Mot de passe
            </Label>
            <Input 
              id="password" 
              v-model="password" 
              type="password" 
              class="col-span-3" 
              placeholder="•••••••"
            />
          </div>
          
          <div v-if="authMode === 'register'" class="grid grid-cols-4 items-center gap-4">
            <Label for="confirm-password" class="text-right">
              Confirmer
            </Label>
            <Input 
              id="confirm-password" 
              v-model="confirmPassword" 
              type="password" 
              class="col-span-3" 
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            @click="authMode = authMode === 'login' ? 'register' : 'login'; resetForm()"
          >
            {{ authMode === 'login' ? 'Créer un compte' : 'Déjà un compte ?' }}
          </Button>
          <Button 
            type="submit" 
            @click="authMode === 'login' ? handleLogin() : handleRegister()"
          >
            {{ authMode === 'login' ? 'Se connecter' : "S'inscrire" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}

.global-cart-button {
  position: relative;
  background-color: #3498db;
  color: white;
  padding: 0.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease-in-out;
  margin-left: 0.5rem;
}

.global-cart-button:hover {
  background-color: #2a7ab9;
}

.cart-item-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #e74c3c;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  border-radius: 50%;
  padding: 2px 6px;
  min-width: 20px;
  text-align: center;
  line-height: 1.2;
}

/* Animation pour la modale */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>