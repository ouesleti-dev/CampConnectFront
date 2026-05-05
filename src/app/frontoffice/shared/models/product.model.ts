export interface ProductRequest {
  nameProduct: string;
  descriptionProduct: string;
  priceProduct: number;
  quantityProduct: number;
  photoProduct: string;
  locationProduct: string;
  category: string;
  productState: string;
}

export interface ProductResponse {
  idProduct: number;
  nameProduct: string;
  descriptionProduct: string;
  priceProduct: number;
  quantityProduct: number;
  photoProduct: string;
  locationProduct: string;
  category: string;
  productState: string;
  productStatus: string;
  addedDate: string;
  userId: number;
  sellerName: string;
}

export enum ProductCategory {
  TENTS = 'TENTS',
  SLEEPING_BAGS = 'SLEEPING_BAGS',
  BACKPACKS = 'BACKPACKS',
  COOKING_EQUIPMENT = 'COOKING_EQUIPMENT',
  LIGHTING = 'LIGHTING',
  CLOTHING = 'CLOTHING',
  FOOTWEAR = 'FOOTWEAR',
  TOOLS = 'TOOLS',
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT',
  FURNITURE = 'FURNITURE',
  OTHER = 'OTHER'
}

export enum ProductState {
  AVAILABLE = 'AVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  UNAVAILABLE = 'UNAVAILABLE'
}

export enum ProductStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}
