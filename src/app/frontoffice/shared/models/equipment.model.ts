// src/app/frontoffice/shared/models/equipment.model.ts

export interface EquipmentRequest {
  name: string;
  type: string;
  description: string;
  aviability: string;
  state: string;
  price: number;
  picture: string;
}

export interface EquipmentResponse {
  idEquipement: number;
  name: string;
  type: string;
  description: string;
  owner: string;
  aviability: string;
  verified: boolean;
  state: string;
  price: number;
  picture: string;
}

export enum EquipmentType {
  TENTS = 'TENTS',
  SLEEPING_BAGS = 'SLEEPING_BAGS',
  BACKPACKS = 'BACKPACKS',
  COOKING_EQUIPMENT = 'COOKING_EQUIPMENT',
  LIGHTING = 'LIGHTING',
  CLOTHING = 'CLOTHING',
  FOOTWEAR = 'FOOTWEAR',
  TOOLS = 'TOOLS',
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT',
  FURNITURE = 'FURNITURE',
  OTHER = 'OTHER'
}

export enum EquipmentState {
  Reserve = 'Reserve',
  Not_Reserve = 'Not_Reserve'
}