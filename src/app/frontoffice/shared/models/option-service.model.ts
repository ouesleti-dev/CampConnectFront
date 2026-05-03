export interface OptionServiceRequest {
  name: string;
  price: number;
  optionType: string;
  vehicleId: number;
}

export interface OptionServiceResponse {
  optionId: number;
  name: string;
  price: number;
  optionType: string;
  vehicleId: number;
  vehicleLicensePlate: string;
  vehicleType: string;
}
