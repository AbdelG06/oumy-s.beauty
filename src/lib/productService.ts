// ...existing code...
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
    price: 29.99,
    image: '/src/assets/serum.jpg',
    description: 'Sérum pour illuminer la peau',
    category: 'Soins',
    stock: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const productService = {
  getAllProducts: (): Product[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
    try {
      return JSON.parse(raw) as Product[];
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
      return DEFAULT_PRODUCTS;
    }
  },

  createProduct: (data: Partial<Product>): Product => {
    const products = productService.getAllProducts();
    const id = (data.id || data.name || `prod-${Date.now()}`).toString().replace(/\s+/g, '-').toLowerCase();
    let imageUrl = data.image || '';
    if (data.imageFile) {
      imageUrl = URL.createObjectURL(data.imageFile);
    }
    const newProduct: Product = {
      id,
      name: data.name || 'Untitled',
      price: data.price ?? 0,
      image: imageUrl,
      description: data.description || '',
      category: data.category,
      stock: data.stock ?? 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedProducts = [...products, newProduct];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    return newProduct;
  },

  setAllProducts: (products: Product[]): Product[] => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  },

  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null => {
    const products = productService.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    let imageUrl = updates.image ?? products[index].image;
    if (updates.imageFile) imageUrl = URL.createObjectURL(updates.imageFile);

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      image: imageUrl,
      updatedAt: new Date().toISOString()
    };
    products[index] = updatedProduct;
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
    const fixed = products.map(product => {
      if (!product.image || product.image.includes('/src/assets/')) {
        const def = DEFAULT_PRODUCTS.find(p => p.id === product.id);
        if (def) return { ...product, image: def.image };
      }
      return product;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fixed));
    return fixed;
  },

  savePhotos: (): Product[] => {
    const products = productService.getAllProducts();
    // Ici on pourrait implémenter une logique de persist d'images si besoin
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products;
  }
};
// ...existing code...