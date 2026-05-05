export interface OrderLineRequest {
  productId: number;
  quantity: number;
}

export interface OrderRequest {
  userId: number;
  deliveryAddress: string;
  paymentMethod: string;
  items: OrderLineRequest[];
  couponCode?: string;
}

export interface OrderLineDTO {
  idOrderLine: number;
  requestedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productPrice: number;
}

export interface OrderDTO {
  idOrder: number;
  orderDate: string;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  orderLines: OrderLineDTO[];
  couponCode?: string;
  discountAmount?: number;
}

export interface CartItem {
  product: any;
  quantity: number;
}