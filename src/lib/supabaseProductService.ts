import supabase from './supabaseClient';
import { Product } from './productService';

const TABLE = 'products';

export async function fetchRemoteProducts(): Promise<Product[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data as any[]).map(d => ({
    id: d.id,
    name: d.name,
    description: d.description,
    price: Number(d.price),
    image: d.image,
    category: d.category,
    stock: d.stock ?? 0,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

export async function pushLocalToRemote(localProducts: Product[]): Promise<void> {
  if (!supabase) throw new Error('Supabase not configured');
  // Upsert all products by id
  const rows = localProducts.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    category: p.category,
    stock: p.stock ?? 0,
    created_at: p.createdAt,
    updated_at: p.updatedAt
  }));

  const { error } = await supabase.from(TABLE).upsert(rows, { onConflict: ['id'] });
  if (error) throw error;
}
