import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../../../shared/services/equipment.service';

@Component({
  selector: 'app-equipment-search',
  templateUrl: './equipment-search.component.html'
})
export class EquipmentSearchComponent implements OnInit {

  filters = {
    type: '' as string | null,
    state: '' as string | null,
    maxPrice: null as number | null
  };

  results: any[] = [];
  loading = false;

  constructor(private equipmentService: EquipmentService) {}

  ngOnInit(): void {
    this.search(); // load all at start
  }

  search(): void {
    this.loading = true;

    // ✅ normalize values for backend compatibility
    const type = this.filters.type && this.filters.type !== '' 
      ? this.filters.type 
      : undefined;

    const state = this.filters.state && this.filters.state !== '' 
      ? this.filters.state 
      : undefined;

    const maxPrice = this.filters.maxPrice !== null 
      ? this.filters.maxPrice 
      : undefined;

    this.equipmentService.searchEquipments(type, state, maxPrice)
      .subscribe({
        next: (data) => {
          this.results = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.loading = false;
        }
      });
  }
}