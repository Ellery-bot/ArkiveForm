export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  categories: string[];
  active: boolean;
  quantity: number;
}
