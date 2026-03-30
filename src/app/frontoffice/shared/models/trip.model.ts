export interface TripRequest {
  departureLocation: string;
  destination: string;
  departureDate: string;
  distance: number;
  vehicleId: number;
}

export interface TripResponse {
  tripId: number;
  departureLocation: string;
  destination: string;
  departureDate: string;
  distance: number;
  vehicleId: number;
  vehicleLicensePlate: string;
  vehicleType: string;
}
