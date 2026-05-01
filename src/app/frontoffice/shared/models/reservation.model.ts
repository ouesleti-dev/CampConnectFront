export interface ReservationRequest {
  reservationDate: string;
  seatCount: number;
  status: string;
  transportAdId: number;
}

export interface ReservationResponse {
  reservationId: number;
  reservationDate: string;
  seatCount: number;
  status: string;
  transportAdId: number;
  adPrice: number;
  departureLocation: string;
  destination: string;
  departureLat?: number | null;
  departureLng?: number | null;
  destinationLat?: number | null;
  destinationLng?: number | null;
  userEmail: string;
}

export interface ReservationDetailsResponse {
  reservationId: number;
  destination: string;
  destinationLat?: number | null;
  destinationLng?: number | null;
  price: number;
  vehicle: string;
  seats: number;
  status: string;
}
