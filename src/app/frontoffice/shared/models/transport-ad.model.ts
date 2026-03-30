export interface TransportAdRequest {
  price: number;
  availableSeats: number;
  transportType: string;
  tripId: number;
}

export interface TransportAdResponse {
  adId: number;
  price: number;
  availableSeats: number;
  transportType: string;
  tripId: number;
  departureLocation: string;
  destination: string;
  vehicleLicensePlate: string;
}
