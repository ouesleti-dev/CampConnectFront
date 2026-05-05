import { Component } from '@angular/core';
import { EquipmentService } from '../../../../shared/services/equipment.service';

@Component({
  selector: 'app-equipment-recommendation',
  templateUrl: './equipment-recommendation.component.html',
  styleUrls: ['./equipment-recommendation.component.scss']
})
export class EquipmentRecommendationComponent {
  form = { place: 'foret', season: 'summer', people: 1, duration_days: 1, budget: 100 };
  message = '';
  cards: any[] = [];
  loading = false;
  error = '';

  places = ['foret', 'plage', 'montagne', 'desert'];
  seasons = ['summer', 'winter', 'spring', 'autumn'];

  constructor(private equipmentService: EquipmentService) {}

  recommend(): void {
    this.loading = true;
    this.error = '';
    this.cards = [];
    this.equipmentService.getRecommendations(this.form).subscribe({
      next: (res) => { this.message = res.message; this.cards = res.available_equipments; this.loading = false; },
      error: () => { this.error = 'Erreur connexion FastAPI port 8000.'; this.loading = false; }
    });
  }
}
