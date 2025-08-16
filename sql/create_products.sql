-- SQL to create products table for Oumy's Beauty
CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text,
  description text,
  price numeric,
  image text,
  category text,
  stock int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
