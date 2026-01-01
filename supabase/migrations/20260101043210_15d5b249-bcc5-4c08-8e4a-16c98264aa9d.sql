-- Add wholesale_price column to products table
ALTER TABLE public.products 
ADD COLUMN wholesale_price numeric NOT NULL DEFAULT 0;