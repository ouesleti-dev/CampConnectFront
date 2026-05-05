export interface MaintenancePrediction {
  equipmentId: number;
  equipmentName: string;
  totalScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
}