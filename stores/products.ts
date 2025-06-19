import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Product {
  id: number
  Nom: string
  prix: number
  anscienPrix?: number
  image?: { url: string }
  category?: { id: number; Nom: string }
}

interface Category {
  id: number
  Nom: string
  isMainCategory: boolean
  parentCategory?: number | null
}

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const selectedCategory = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const STRAPI_BASE_URL = 'https://kind-duck-a00ba31603.strapiapp.com'
  const API_URL = `${STRAPI_BASE_URL}/api`

  // Fonction pour construire l'URL complète d'une image
  const getStrapiImageUrl = (url: string): string => {
    if (!url) return ''
    return url.startsWith('/uploads') 
      ? `${STRAPI_BASE_URL}${url}`
      : url
  }

  // Récupération des catégories et sous-catégories
  async function fetchCategories() {
    try {
      loading.value = true
      error.value = null

      // Récupérer à la fois les catégories et sous-catégories
      const [categoriesRes, subcategoriesRes] = await Promise.all([
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/sous-categories`)
      ])

      if (!categoriesRes.ok || !subcategoriesRes.ok) {
        throw new Error('Failed to fetch categories')
      }

      const categoriesData = await categoriesRes.json()
      const subcategoriesData = await subcategoriesRes.json()

      // Traiter les catégories principales
      const mainCategories = (categoriesData.data || categoriesData).map((item: any) => ({
        id: item.id,
        Nom: item.attributes?.Nom || item.Nom,
        isMainCategory: true,
        parentCategory: null
      }))

      // Traiter les sous-catégories
      const subCategories = (subcategoriesData.data || subcategoriesData).map((item: any) => ({
        id: item.id,
        Nom: item.attributes?.nom || item.nom,
        isMainCategory: false,
        parentCategory: item.attributes?.category?.data?.id || item.category?.id || null
      }))

      // Combiner les deux listes
      categories.value = [...mainCategories, ...subCategories]

    } catch (err) {
      error.value = 'Erreur lors du chargement des catégories'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Récupération des produits
  async function fetchProducts() {
    try {
      loading.value = true
      error.value = null

      const res = await fetch(`${API_URL}/produits?populate=*`)
      if (!res.ok) throw new Error('Échec de la récupération des produits')

      const response = await res.json()
      const productsData = response.data || response

      products.value = productsData.map((product: any) => {
        // Gestion de l'image
        let imageUrl: string | undefined = undefined
        
        if (product.attributes?.image?.data) {
          // Structure Strapi v4
          const imageData = product.attributes.image.data
          if (Array.isArray(imageData) && imageData.length > 0) {
            imageUrl = imageData[0].attributes?.url
          } else if (imageData?.attributes?.url) {
            imageUrl = imageData.attributes.url
          }
        } else if (product.image && Array.isArray(product.image) && product.image.length > 0) {
          // Structure Strapi v3
          const firstImage = product.image[0]
          if (firstImage.url) {
            imageUrl = getStrapiImageUrl(firstImage.url)
          }
        }

        // Gestion de la catégorie
        let category = null
        if (product.attributes?.category?.data) {
          // Strapi v4
          const catData = product.attributes.category.data
          category = {
            id: catData.id,
            Nom: catData.attributes?.Nom || catData.Nom
          }
        } else if (product.category) {
          // Strapi v3
          category = {
            id: product.category.id,
            Nom: product.category.Nom
          }
        }

        return {
          id: product.id,
          Nom: product.attributes?.Nom || product.Nom,
          prix: product.attributes?.prix ? Number(product.attributes.prix) : Number(product.prix),
          anscienPrix: product.attributes?.anscienPrix ? Number(product.attributes.anscienPrix) : 
                      product.anscienPrix ? Number(product.anscienPrix) : undefined,
          image: imageUrl ? { url: imageUrl } : undefined,
          category: category
        }
      })

    } catch (err) {
      error.value = 'Erreur lors du chargement des produits'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Chargement complet des données
  async function loadAllData() {
    try {
      loading.value = true
      await Promise.all([fetchCategories(), fetchProducts()])
    } catch (err) {
      error.value = 'Erreur lors du chargement des données'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // Filtrage des produits
  const filteredProducts = computed(() => {
    if (!selectedCategory.value) return products.value
    
    const selectedCat = categories.value.find(c => c.id === selectedCategory.value)
    
    if (selectedCat?.isMainCategory) {
      // Si c'est une catégorie principale, on prend tous les produits de cette catégorie
      // et tous les produits des sous-catégories de cette catégorie
      const subCategoryIds = categories.value
        .filter(c => c.parentCategory === selectedCategory.value)
        .map(c => c.id)
      
      return products.value.filter(product => 
        product.category?.id === selectedCategory.value || 
        subCategoryIds.includes(product.category?.id)
      )
    } else {
      // Si c'est une sous-catégorie, on prend seulement les produits de cette sous-catégorie
      return products.value.filter(product => 
        product.category?.id === selectedCategory.value
      )
    }
  })

  // Sélection d'une catégorie
  function selectCategory(categoryId: number | null) {
    selectedCategory.value = categoryId
  }

  // Réinitialisation des filtres
  function resetFilters() {
    selectedCategory.value = null
  }

  return {
    products,
    categories,
    filteredProducts,
    selectedCategory,
    loading,
    error,
    fetchCategories,
    fetchProducts,
    loadAllData,
    selectCategory,
    resetFilters,
    getStrapiImageUrl
  }
})