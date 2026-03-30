export interface VehicleRequest {
  licensePlate: string;
  vehicleType: string;
  capacity: number;
  status: string;
}

export interface VehicleResponse {
  vehicleId: number;
  licensePlate: string;
  vehicleType: string;
  capacity: number;
  status: string;
  ownerId: number;
  ownerEmail: string;
}
