export interface CartItem {
  productId?: string;
  productName: string;
  category: string;
  subType?: string;
  quantity: number;
  price: number;
  total: number;
  customerId?: string;
  customerName?: string;
}
