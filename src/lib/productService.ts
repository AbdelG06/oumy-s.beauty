export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  imageFile?: File;
  description: string;
  category?: string;
  stock?: number;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'oumy_beauty_products';

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'serum',
    name: 'Sérum Éclat',
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

  },

  // Corriger les images cassées
  fixBrokenImages: (): Product[] => {
    const products = productService.getAllProducts();
    const fixedProducts = products.map(product => {
      if (!product.image || product.image.includes('/src/assets/')) {
        const defaultProduct = DEFAULT_PRODUCTS.find(p => p.id === product.id);
        if (defaultProduct) {
          return { ...product, image: defaultProduct.image };
        }
      }
      return product;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixedProducts));
    return fixedProducts;
  },

  // Sauvegarder les photos dans le localStorage
  savePhotos: (): Product[] => {
    const products = productService.getAllProducts();
    // Forcer la sauvegarde de toutes les images
    const savedProducts = products.map(product => {
      if (product.image && !product.image.includes('blob:')) {
        // Si l'image n'est pas un blob temporaire, la sauvegarder
        return product;
      }
      return product;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedProducts));
    return savedProducts;
  }

};

