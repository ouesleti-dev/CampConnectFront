export interface StoryRequest {
  equipmentId: number;
  promoCode: string;
  discount: number;
  message: string;
}

export interface StoryResponse {
  idStory: number;
  equipmentId: number;
  equipmentName: string;
  ownerEmail: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  promoCode: string;
  message: string;
  active: boolean;
  createdAt: string;
  expiresAt: string;
  minutesRemaining: number;
}