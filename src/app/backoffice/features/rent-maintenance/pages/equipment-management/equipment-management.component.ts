import { Component,  OnInit } from '@angular/core';
import { EquipmentService } from './../../../../../frontoffice/shared/services/equipment.service';
import { EquipmentResponse } from './../../../../../frontoffice/shared/models/equipment.model';
@Component({
  selector: 'app-equipment-management',
  templateUrl: './equipment-management.component.html',
  styleUrl: './equipment-management.component.css'
})
export class EquipmentManagementComponent implements OnInit {
  verifiedEquipments: EquipmentResponse[] = [];
  unverifiedEquipments: EquipmentResponse[] = [];
  activeTab: 'verified' | 'unverified' = 'unverified';
  successMessage = '';
  errorMessage = '';

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.equipmentService.getVerifiedEquipments().subscribe({
      next: (data) => this.verifiedEquipments = data,
      error: (err) => console.error(err)
    });
    this.equipmentService.getUnverifiedEquipments().subscribe({
      next: (data) => this.unverifiedEquipments = data,
      error: (err) => console.error(err)
    });
  }

  verify(id: number): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.equipmentService.verifyEquipment(id).subscribe({
      next: () => {
        this.successMessage = 'Équipement vérifié avec succès !';
        this.loadAll();
      },
      error: () => this.errorMessage = 'Erreur lors de la vérification'
    });
  }
delete(id: number): void {
  if (confirm('Supprimer cet équipement ?')) {
    this.equipmentService.deleteEquipment(id).subscribe({
      next: () => {
        this.successMessage = 'Équipement supprimé avec succès !';
        this.loadAll();
      },
      error: () => this.errorMessage = 'Erreur lors de la suppression'
    });
  }
}
}
