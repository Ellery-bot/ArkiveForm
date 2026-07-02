export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  image_urls?: string[];
  categories: string[];
  active: boolean;
  quantity: number;
}
