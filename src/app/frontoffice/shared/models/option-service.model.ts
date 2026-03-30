export interface OptionServiceRequest {
  name: string;
  optionType: string;
  vehicleId: number;
}

export interface OptionServiceResponse {
  optionId: number;
  name: string;
  optionType: string;
  vehicleId: number;
  vehicleLicensePlate: string;
  vehicleType: string;
}
