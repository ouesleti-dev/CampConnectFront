export interface TransportAiPriceRequest {
  distance_km: number;
  passenger_count: number;
  hour: number;
  weekday: number;
}

export interface TransportAiCoordinatesRequest {
  pickupLatitude: number;
  pickupLongitude: number;
  destinationLatitude: number;
  destinationLongitude: number;
  passengerCount: number;
  hour: number;
  weekday: number;
}

export interface TransportAiPriceResponse {
  predictedPrice?: number;
  predicted_price?: number;
  estimatedPrice?: number;
  estimated_price?: number;
  price?: number;
  prediction?: number;
  currency?: string;
  message?: string;
}

export type TransportAiPriceResult = TransportAiPriceResponse | number;
