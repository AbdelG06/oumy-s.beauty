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
    price: 100,
    image: '/product-serum.jpg',
    description: 'Illumine et unifie le teint grâce à un complexe vitaminé.',
    category: 'Soins',
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cream',
    name: 'Crème Hydratante',
    price: 122,
    image: '/product-cream.jpg',
    description: 'Hydratation 24h, texture velours inspirée du rose gold.',
    category: 'Soins',
    stock: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'palette',
    name: 'Palette Nude',
    price: 99,
    image: '/product-palette.jpg',
    description: 'Tons naturels et élégants pour un regard doux au quotidien.',
    category: 'Maquillage',
    stock: 25,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const productService = {
  getAllProducts: (): Product[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
      }
      const parsed = JSON.parse(raw) as Product[];
      return parsed.map(p => {
        if (!p.image || p.image.includes('/src/assets/')) {
          const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
          if (def) return { ...p, image: def.image };
        }
        return p;
      });
    } catch (e) {
      console.error('productService.getAllProducts error', e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
  },

  getProductById: (id: string): Product | null => {
    const products = productService.getAllProducts();
    return products.find(p => p.id === id) || null;
  },

  addProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const products = productService.getAllProducts();
    let imageUrl = (product as any).image as string | undefined;
    if ((product as any).imageFile) {
      imageUrl = await productService.convertFileToBase64((product as any).imageFile);
    }
    if (!imageUrl) imageUrl = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produit';
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...products, newProduct];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newProduct;
  },

  updateProduct: async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> => {
    const products = productService.getAllProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    let imageUrl = (updates as any).image || products[idx].image;
    if ((updates as any).imageFile) {
      imageUrl = await productService.convertFileToBase64((updates as any).imageFile);
    }
    const updatedProduct: Product = {
      ...products[idx],
      ...updates,
      image: imageUrl,
      updatedAt: new Date().toISOString()
    };
    products[idx] = updatedProduct;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return updatedProduct;
  },

  deleteProduct: (id: string): boolean => {
    const products = productService.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  resetToDefault: (): Product[] => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  },

  fixBrokenImages: (): Product[] => {
    const products = productService.getAllProducts();
    const fixed = products.map(p => {
      if (!p.image || p.image.includes('/src/assets/')) {
        const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
        if (def) return { ...p, image: def.image };
      }
      return p;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
    return fixed;
  },

  savePhotos: (): Product[] => {
    const products = productService.getAllProducts();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  },

  convertFileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Erreur conversion'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

