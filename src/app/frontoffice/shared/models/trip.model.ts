export interface TripRequest {
  departureLocation: string;
  destination: string;
  departureDate: string;
  distance: number;
  vehicleId: number;
  departureLat?: number | null;
  departureLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
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
  departureLat?: number | null;
  departureLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
}
