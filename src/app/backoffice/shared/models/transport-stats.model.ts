export interface GroupedStatResponse {
  label: string;
  value: number;
}

export interface TransportStatsResponse {
  totalReservations: number;
  totalVehicles: number;
  totalTrips: number;
  totalAds: number;
  totalReservedSeats: number;
  totalRevenue: number;
  reservationsByTransportType: GroupedStatResponse[];
  reservationsByDestination: GroupedStatResponse[];
}