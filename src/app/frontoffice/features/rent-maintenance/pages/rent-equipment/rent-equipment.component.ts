import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RentalService } from '../../../../shared/services/rental.service';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';

@Component({
  selector: 'app-rent-equipment',
  templateUrl: './rent-equipment.component.html',
  styleUrl: './rent-equipment.component.css'
})
export class RentEquipmentComponent implements OnInit {
  equipments: EquipmentResponse[] = [];
  selectedEquipment: EquipmentResponse | null = null;
  rentalForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  leftMonth: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  rightMonth: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  startDate: Date | null = null;
  endDate: Date | null = null;
  hoveredDate: Date | null = null;
  reservedRanges: { startDate: Date, endDate: Date }[] = [];

  weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  months = ['janvier','février','mars','avril','mai','juin',
            'juillet','août','septembre','octobre','novembre','décembre'];

  constructor(
    private fb: FormBuilder,
    private rentalService: RentalService,
    private equipmentService: EquipmentService
  ) {
    this.rentalForm = this.fb.group({
      equipmentId: ['', Validators.required],
      startDate:   ['', Validators.required],
      endDate:     ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.equipmentService.getVerifiedEquipments().subscribe({
      next: (data) => this.equipments = data,
      error: (err) => console.error(err)
    });
  }

  onEquipmentChange(event: Event): void {
    const id = Number((event.target as HTMLSelectElement).value);
    this.selectedEquipment = this.equipments.find(e => e.idEquipement === id) || null;
    this.startDate = null;
    this.endDate = null;
    this.hoveredDate = null;
    this.reservedRanges = [];
    this.rentalForm.patchValue({ startDate: '', endDate: '' });
    if (id) {
      this.rentalService.getReservedDates(id).subscribe({
        next: (dates) => {
          this.reservedRanges = dates.map(d => ({
            startDate: new Date(d.startDate),
            endDate: new Date(d.endDate)
          }));
        }
      });
    }
  }

  prevMonth(): void {
    this.leftMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() - 1, 1);
    this.rightMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() + 1, 1);
  }

  nextMonth(): void {
    this.leftMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() + 1, 1);
    this.rightMonth = new Date(this.leftMonth.getFullYear(), this.leftMonth.getMonth() + 1, 1);
  }

  getDaysInMonth(date: Date): (Date | null)[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const days: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }

  onDateClick(date: Date): void {
    if (this.isReserved(date)) return;

    if (!this.startDate) {
      this.startDate = date;
      this.endDate = null;
      this.hoveredDate = null;
      return;
    }

    if (this.startDate && !this.endDate) {
      if (date.toDateString() === this.startDate.toDateString()) {
        this.startDate = null;
        this.endDate = null;
        this.rentalForm.patchValue({ startDate: '', endDate: '' });
        return;
      }
      if (date < this.startDate) {
        this.endDate = this.startDate;
        this.startDate = date;
      } else {
        this.endDate = date;
      }
      this.rentalForm.patchValue({
        startDate: this.formatDate(this.startDate),
        endDate: this.formatDate(this.endDate!)
      });
      return;
    }

    // Reset et recommence
    this.startDate = date;
    this.endDate = null;
    this.hoveredDate = null;
    this.rentalForm.patchValue({ startDate: '', endDate: '' });
  }

  onDateHover(date: Date): void {
    if (this.startDate && !this.endDate) {
      this.hoveredDate = date;
    }
  }

  isReserved(date: Date): boolean {
    return this.reservedRanges.some(r => date >= r.startDate && date <= r.endDate);
  }

  isStart(date: Date): boolean {
    return !!this.startDate && date.toDateString() === this.startDate.toDateString();
  }

  isEnd(date: Date): boolean {
    return !!this.endDate && date.toDateString() === this.endDate.toDateString();
  }

  isInRange(date: Date): boolean {
    const end = this.endDate || this.hoveredDate;
    if (!this.startDate || !end) return false;
    const min = this.startDate < end ? this.startDate : end;
    const max = this.startDate < end ? end : this.startDate;
    return date > min && date < max;
  }

  formatDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().split('T')[0];
  }

  formatDisplay(date: Date | null): string {
    if (!date) return '--/--/----';
    return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
  }

  getTotalDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const diff = this.endDate.getTime() - this.startDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  getTotalPrice(): number {
    if (!this.selectedEquipment) return 0;
    return this.getTotalDays() * (this.selectedEquipment.price || 0);
  }

  onSubmit(): void {
    if (this.rentalForm.invalid || !this.startDate || !this.endDate) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.rentalService.requestRental(this.rentalForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Rental request sent successfully!';
        this.rentalForm.reset();
        this.startDate = null;
        this.endDate = null;
        this.hoveredDate = null;
        this.selectedEquipment = null;
        this.reservedRanges = [];
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Equipment not available for these dates';
      }
    });
  }
}