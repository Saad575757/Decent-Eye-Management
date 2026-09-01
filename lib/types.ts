export interface CartItem {
  productId?: string | null;
  productName: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
}
