import supabase from './supabaseClient';
import { Product } from './productService';

const TABLE = 'products';
const BUCKET = 'product-photos';

async function uploadImageDataUrl(filename: string, dataUrl: string): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  // dataUrl like "data:image/png;base64,....."
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/);
  if (!match) throw new Error('Invalid data URL');
  const mime = match[1];
  const b64 = match[2];
  const buffer = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  const { data, error: uploadErr } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: mime,
    upsert: true
  } as any);
  if (uploadErr) throw uploadErr;
  const publicData = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return publicData.data.publicUrl;
}

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

export async function pushLocalToRemote(localProducts: Product[]): Promise<Product[]> {
  if (!supabase) throw new Error('Supabase not configured');
  // Ensure bucket exists is not done here; assume created in Supabase dashboard
  const rows = [] as any[];
  for (const p of localProducts) {
    let imageUrl = p.image;
    // If image is a data URL, upload it to storage and replace with public URL
    if (typeof imageUrl === 'string' && imageUrl.startsWith('data:')) {
      try {
        const filename = `${p.id}_${Date.now()}`;
        imageUrl = await uploadImageDataUrl(filename, imageUrl);
      } catch (e) {
        console.warn('Failed to upload image for', p.id, e);
      }
    }
    rows.push({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: imageUrl,
      category: p.category,
      stock: p.stock ?? 0,
      created_at: p.createdAt,
      updated_at: p.updatedAt
    });
  }

  const { data, error } = await supabase.from(TABLE).upsert(rows, { onConflict: 'id', returning: 'representation' } as any);
  if (error) throw error;

  // Map returned rows to Product[] shape
  const returned = (data as any[]).map(d => ({
    id: d.id,
    name: d.name,
    price: Number(d.price),
    image: d.image,
    description: d.description,
    category: d.category,
    stock: d.stock ?? 0,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));

  return returned as Product[];
}
