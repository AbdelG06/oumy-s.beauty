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

// Convert a File to a persistent Data URL so it can be synced across devices
const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const productService = {
  getAllProducts: (): Product[] => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Product[];
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    const products = productService.getAllProducts();
    const id = (data.id || data.name || `prod-${Date.now()}`).toString().replace(/\s+/g, '-').toLowerCase();
    let imageUrl = data.image || '';
    if (data.imageFile) {
      imageUrl = await fileToDataUrl(data.imageFile);
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

  updateProduct: async (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>): Promise<Product | null> => {
    const products = productService.getAllProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    let imageUrl = updates.image ?? products[index].image;
    if (updates.imageFile) imageUrl = await fileToDataUrl(updates.imageFile);

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

  fixBrokenImages: (): Product[] => {
    const products = productService.getAllProducts();
    const fixed = products.map(product => {
      if (!product.image || product.image.includes('/src/assets/')) {
        return { ...product, image: '/placeholder.svg' };
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