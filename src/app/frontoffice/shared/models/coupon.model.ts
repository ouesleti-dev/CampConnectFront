export interface CouponRequest {
  code: string;
  discountPercentage: number;
  expirationDate: string;
  maxUses: number;
}

export interface CouponResponse {
  idCoupon: number;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  maxUses: number;
  currentUses: number;
  active: boolean;
  valid: boolean;
  message: string;
}
