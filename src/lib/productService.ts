export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  imageFile?: File; // Fichier d'image temporaire
  description: string;
  category?: string;
  stock?: number;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "oumy_beauty_products";

// Produits par défaut
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "serum",
    name: "Sérum Éclat",
    price: 100,
    image: "/product-serum.jpg",
    description: "Illumine et unifie le teint grâce à un complexe vitaminé.",
    category: "Soins",
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "cream",
    name: "Crème Hydratante",
    price: 122,
    image: "/product-cream.jpg",
    description: "Hydratation 24h, texture velours inspirée du rose gold.",
    category: "Soins",
    stock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "palette",
    name: "Palette Nude",
    price: 99,
    image: "/product-palette.jpg",
    description: "Tons naturels et élégants pour un regard doux au quotidien.",
    category: "Maquillage",
    stock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const productService = {
  // Récupérer tous les produits
  getAllProducts: (): Product[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Si aucun produit stocké, initialiser avec les produits par défaut
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    } catch (error) {
      console.error("Erreur lors de la récupération des produits:", error);
      return DEFAULT_PRODUCTS;
    }
  },

  // Récupérer un produit par ID
  getProductById: (id: string): Product | null => {
    const products = productService.getAllProducts();
    return products.find(p => p.id === id) || null;
  },

  // Ajouter un nouveau produit
  addProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Product => {
    const products = productService.getAllProducts();
    
    // Gérer l'image : si c'est un fichier, créer une URL temporaire
    let imageUrl = product.image;
    if (product.imageFile) {
      imageUrl = URL.createObjectURL(product.imageFile);
    } else if (!product.image) {
      imageUrl = "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produit";
    }
    
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedProducts = [...products, newProduct];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    return newProduct;
  },

  // Mettre à jour un produit
  updateProduct: (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): Product | null => {
    const products = productService.getAllProducts();
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) return null;
    
    // Gérer l'image : si c'est un fichier, créer une URL temporaire
    let imageUrl = updates.image || products[productIndex].image;
    if (updates.imageFile) {
      imageUrl = URL.createObjectURL(updates.imageFile);
    }
    
    const updatedProduct: Product = {
      ...products[productIndex],
      ...updates,
      image: imageUrl,
      updatedAt: new Date().toISOString()
    };
    
    products[productIndex] = updatedProduct;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return updatedProduct;
  },

  // Supprimer un produit
  deleteProduct: (id: string): boolean => {
    const products = productService.getAllProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    
    if (filteredProducts.length === products.length) {
      return false; // Produit non trouvé
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProducts));
    return true;
  },

  // Réinitialiser les produits par défaut
  resetToDefault: (): Product[] => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
};
