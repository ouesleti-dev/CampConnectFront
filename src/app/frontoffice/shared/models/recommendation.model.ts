export interface TripRecommendationRequest {
  departureLocation: string;
  destination: string;
  passengerCount: number;
  maxPrice: number;
  preferredType: string;
}

export interface TripRecommendationResponse {
  tripId: number;
  departureLocation: string;
  destination: string;
  distance: number;
  departureDate: string;
  adId: number;
  price: number;
  availableSeats: number;
  transportType: string;
  vehicleLicensePlate: string;
  score: number;
}
