// shared/models/demand.model.ts
export interface DemandDecision {
  equipmentId: number;
  equipmentName: string;
  basePrice: number;
  currentRentals: number;
  previousRentals: number;
  averageRating: number;
  trend: number;
  ratingScore: number;
  demandScore: number;
  prediction: string;   // GROWING / STABLE / DECLINING
  action: string;       // INCREASE_PRICE / SLIGHT_INCREASE / DECREASE_PRICE / KEEP_PRICE
  suggestedPrice: number;
  trendExplanation: string;
  priceRecommendation: string;
}