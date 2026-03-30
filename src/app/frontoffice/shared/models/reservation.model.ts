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
  userEmail: string;
}
