import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Product {
  id: number
  Nom: string
  prix: number
  anscienPrix?: number
  image?: string | { url: string }
  category?: { id: number; Nom: string }
  subcategory?: { id: number; Nom: string }
}

interface Category {
  id: number
  Nom: string
  subcategories: Subcategory[]
}

interface Subcategory {
  id: number
  Nom: string
}

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const subcategories = ref<Subcategory[]>([])
  const selectedCategory = ref<number | null>(null)
  const selectedSubcategory = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const STRAPI_BASE_URL = 'https://kind-duck-a00ba31603.strapiapp.com'
  const API_URL = `${STRAPI_BASE_URL}/api`

const filteredProducts = computed(() => {
  if (!selectedSubcategory.value) {
    return selectedCategory.value
      ? products.value.filter(product => 
          product.category?.id === selectedCategory.value
        )
      : products.value;
  }
  
  // Filtrer par sous-catégorie
  return products.value.filter(product => 
    product.subcategory?.id === selectedSubcategory.value
  );
});

  // Fonction pour construire l'URL complète d'une image
const getStrapiImageUrl = (url: string): string => {
  if (!url) return '';
  // Pour Strapi v3, les URLs commencent généralement par /uploads
  return url.startsWith('/uploads') 
    ? `${STRAPI_BASE_URL}${url}`
    : url;
}

  // Récupération des catégories (Strapi v3)

  async function fetchCategories() {
  try {
    loading.value = true
    const res = await fetch(`${API_URL}/categories`)
    if (!res.ok) throw new Error('Failed to fetch categories')
    
    const { data } = await res.json() // Destructure pour obtenir le tableau data
    categories.value = data.map((item: any) => ({
      id: item.id,
      Nom: item.Nom,
      subcategories: [] // Initialisé vide, sera rempli par fetchSubcategories
    }))
  } catch (err) {
    error.value = 'Erreur lors du chargement des catégories'
    console.error(err)
  } finally {
    loading.value = false
  }
}
async function fetchSubcategories() {
  try {
    loading.value = true;
    const res = await fetch(`${API_URL}/sous-categories?populate=*`);
    if (!res.ok) throw new Error('Failed to fetch subcategories');
    
    const response = await res.json();
    const subcategoriesData = response.data || [];

    // Mapper les sous-catégories
    subcategories.value = subcategoriesData.map((sub: any) => ({
      id: sub.id,
      Nom: sub.attributes?.nom || sub.nom, // Prend en compte les deux cas
      categoryId: sub.attributes?.category?.data?.id // Pour Strapi v4
    }));

    // Mettre à jour les catégories avec leurs sous-catégories
    categories.value = categories.value.map(category => {
      return {
        ...category,
        subcategories: subcategoriesData
          .filter((sub: any) => {
            // Vérifie si la sous-catégorie appartient à cette catégorie
            const subCategoryId = sub.attributes?.category?.data?.id;
            return subCategoryId === category.id;
          })
          .map((sub: any) => ({
            id: sub.id,
            Nom: sub.attributes?.nom || sub.nom
          }))
      };
    });

  } catch (err) {
    error.value = 'Erreur lors du chargement des sous-catégories';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

async function fetchProducts() {
  try {
    loading.value = true;
    const res = await fetch(`${API_URL}/produits?populate=*`);
    if (!res.ok) throw new Error('Échec de la récupération des produits');
    const response = await res.json();
    const productsData = response.data || response;

    products.value = productsData.map((product: any) => {
      // Gestion de l'image
      let imageUrl: string | undefined = undefined;
      
      if (product.attributes?.image?.data) {
        // Strapi v4 structure
        const imageData = product.attributes.image.data;
        if (Array.isArray(imageData) && imageData.length > 0) {
          imageUrl = imageData[0].attributes?.url;
        } else if (imageData?.attributes?.url) {
          imageUrl = imageData.attributes.url;
        }
      } else if (product.image && Array.isArray(product.image) && product.image.length > 0) {
        // Strapi v3 structure
        const firstImage = product.image[0];
        if (firstImage.url) {
          imageUrl = getStrapiImageUrl(firstImage.url);
        }
      }

      // Gestion des relations (Strapi v4)
      const category = product.attributes?.category?.data;
      const subcategory = product.attributes?.subcategory?.data;

      return {
        id: product.id,
        Nom: product.attributes?.Nom || product.Nom,
        prix: product.attributes?.prix ? Number(product.attributes.prix) : Number(product.prix),
        anscienPrix: product.attributes?.anscienPrix ? Number(product.attributes.anscienPrix) : product.anscienPrix ? Number(product.anscienPrix) : undefined,
        image: imageUrl ? { url: imageUrl } : undefined,
        category: category
          ? { 
              id: category.id, 
              Nom: category.attributes?.Nom || category.Nom 
            }
          : undefined,
        subcategory: subcategory
          ? { 
              id: subcategory.id, 
              Nom: subcategory.attributes?.Nom || subcategory.nom || subcategory.Nom 
            }
          : undefined
      };
    });

  } catch (err) {
    error.value = 'Erreur lors du chargement des produits';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
  // Récupération des détails complets d'un produit (Strapi v3)
  async function fetchProductDetails(productId: number) {
    try {
      const res = await fetch(`${API_URL}/products/${productId}`)
      if (!res.ok) throw new Error('Failed to fetch product details')
      
      const data = await res.json()
      return {
        category: data.category 
          ? { id: data.category.id, Nom: data.category.Nom }
          : undefined,
        subcategory: data.subcategory
          ? { id: data.subcategory.id, Nom: data.subcategory.Nom }
          : undefined
      }
    } catch (err) {
      console.error('Error fetching product details:', err)
      return { category: undefined, subcategory: undefined }
    }
  }

  // Chargement complet des données
async function loadAllData() {
  try {
    loading.value = true;
    await Promise.all([fetchCategories(), fetchSubcategories()]);
    await fetchProducts();
  } catch (err) {
    error.value = 'Erreur lors du chargement des données';
    console.error(err);
  } finally {
    loading.value = false;
  }
}
  function selectCategory(categoryId: number | null) {
    selectedCategory.value = categoryId
    selectedSubcategory.value = null
  }

  function selectSubcategory(subcategoryId: number | null) {
    selectedSubcategory.value = subcategoryId
  }

  function resetFilters() {
    selectedCategory.value = null
    selectedSubcategory.value = null
  }

  return {
    products,
    categories,
    subcategories,
    filteredProducts,
    selectedCategory,
    selectedSubcategory,
    loading,
    error,
    getStrapiImageUrl,
    fetchCategories,
    fetchSubcategories,
    fetchProducts,
    selectCategory,
    selectSubcategory,
    resetFilters,
    loadAllData
  }
})