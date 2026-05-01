import { Component, OnInit } from '@angular/core';
import { EquipmentService } from './../../../../../frontoffice/shared/services/equipment.service';

@Component({
  selector: 'app-equipment-stats',
  templateUrl: './equipment-stats.component.html',
  styleUrls: ['./equipment-stats.component.css']
})
export class EquipmentStatsComponent implements OnInit {

  stats: any[] = [];
  loading = false;

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loading = true;

    this.equipmentService.getEquipmentStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stats', err);
        this.loading = false;
      }
    });
  }

  getRatingClass(rating: number): string {
    if (!rating) return 'bg-secondary';
    if (rating >= 4) return 'bg-success';
    if (rating >= 2.5) return 'bg-warning text-dark';
    return 'bg-danger';
  }
}