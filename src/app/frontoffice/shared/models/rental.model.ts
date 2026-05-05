export interface RentalRequest {
  equipmentId: number;
  startDate: string;
  endDate: string;
}

export interface RentalResponse {
  rentalId: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  verified: boolean;
  renterEmail: string;
  ownerEmail: string;
  equipmentId: number;
  equipmentName: string;
}