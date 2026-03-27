import { Component, OnInit} from '@angular/core';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';

@Component({
  selector: 'app-rent-list',
  templateUrl: './rent-list.component.html',
  styleUrl: './rent-list.component.css'
})
export class RentListComponent implements OnInit {
  equipments: EquipmentResponse[] = [];
  isLoading = true;

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.equipmentService.getVerifiedEquipments().subscribe({
      next: (data) => {
        this.equipments = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

}
