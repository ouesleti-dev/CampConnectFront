import { Component, OnInit } from '@angular/core';
import { MaintenanceService, MaintenanceSlot, ImpactResult }
  from '../../../../shared/services/maintenancescheduler.service';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';

@Component({
  selector: 'app-maintenance-scheduler',
  templateUrl: './maintenance-scheduler.component.html',
  styleUrls: ['./maintenance-scheduler.component.css']
})
export class MaintenanceSchedulerComponent implements OnInit {

  equipmentId  = 0;
  durationDays = 3;
  kinds        = ['preventive', 'corrective'];
  selectedKind = 'preventive';
  description  = '';

  myEquipments: EquipmentResponse[] = [];
  slots:        MaintenanceSlot[] = [];
  selectedSlot: MaintenanceSlot | null = null;
  impact:       ImpactResult | null = null;
  loading       = false;
  confirmed     = false;
  error         = '';

  constructor(
    private svc: MaintenanceService,
    private equipmentService: EquipmentService
  ) {}

  ngOnInit(): void {
    this.equipmentService.getMyEquipments().subscribe({
      next:  (data) => this.myEquipments = data,
      error: ()     => this.error = 'Erreur chargement équipements'
    });
  }

  onEquipmentChange(): void {
    this.slots        = [];
    this.selectedSlot = null;
    this.impact       = null;
    this.confirmed    = false;
    this.error        = '';
  }

  loadSlots(): void {
    if (this.equipmentId === 0) return;
    this.loading      = true;
    this.error        = '';
    this.slots        = [];
    this.impact       = null;
    this.confirmed    = false;
    this.selectedSlot = null;

    this.svc.getSuggestedSlots(this.equipmentId, this.durationDays).subscribe({
      next:  s => { this.slots = s; this.loading = false; },
      error: e => { this.error = e.error?.message || 'Erreur chargement'; this.loading = false; }
    });
  }

  select(slot: MaintenanceSlot): void {
    this.selectedSlot = slot;
    this.confirmed    = false;
    this.svc.getImpact(
      this.equipmentId,
      slot.start.substring(0, 10),
      slot.end.substring(0, 10)
    ).subscribe(impact => this.impact = impact);
  }

  confirm(): void {
    if (!this.selectedSlot) return;
    this.svc.confirm({
      equipmentId: this.equipmentId,
      startDate:   this.selectedSlot.start.substring(0, 10),
      endDate:     this.selectedSlot.end.substring(0, 10),
      description: this.description || 'Maintenance planifiée',
      kind:        this.selectedKind
    }).subscribe({
      next:  () => { this.confirmed = true; },
      error: e  => { this.error = e.error?.message || 'Erreur confirmation'; }
    });
  }
}