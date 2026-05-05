import { Component, OnInit } from '@angular/core';
import { RentalService } from '../../../../shared/services/rental.service';
import { RentalResponse, RentalRequest } from '../../../../shared/models/rental.model';

@Component({
  selector: 'app-my-rentals',
  templateUrl: './my-rentals.component.html',
  styleUrl: './my-rentals.component.css'
})
export class MyRentalsComponent implements OnInit {

  rentals: RentalResponse[] = [];
  editingRental: RentalResponse | null = null;
  editSuccess = '';
  editError = '';
  isUpdating = false;

  // ✅ Calendrier
  leftMonth: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  rightMonth: Date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  startDate: Date | null = null;
  endDate: Date | null = null;
  hoveredDate: Date | null = null;
  reservedRanges: { startDate: Date, endDate: Date }[] = [];

  weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  months = ['janvier','février','mars','avril','mai','juin',
            'juillet','août','septembre','octobre','novembre','décembre'];

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.loadRentals();
  }

  loadRentals(): void {
    this.rentalService.getMyRentals().subscribe({
      next: (data) => this.rentals = data,
      error: (err) => console.error(err)
    });
  }

  // ✅ Ouvrir modal édition avec calendrier
  openEdit(rental: RentalResponse): void {
    this.editingRental = rental;
    this.editSuccess = '';
    this.editError = '';
    this.startDate = rental.startDate ? new Date(rental.startDate) : null;
    this.endDate = rental.endDate ? new Date(rental.endDate) : null;
    this.hoveredDate = null;

    // Centrer le calendrier sur le mois du startDate
    if (this.startDate) {
      this.leftMonth = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
      this.rightMonth = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 1);
    }

    // Charger les dates réservées
    this.rentalService.getReservedDates(rental.equipmentId).subscribe({
      next: (dates) => {
        this.reservedRanges = dates.map(d => ({
          startDate: new Date(d.startDate),
          endDate: new Date(d.endDate)
        }));
      },
      error: () => this.reservedRanges = []
    });
  }

  closeEdit(): void {
    this.editingRental = null;
    this.startDate = null;
    this.endDate = null;
    this.hoveredDate = null;
    this.editSuccess = '';
    this.editError = '';
  }

  // ✅ Navigation calendrier
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
        return;
      }
      if (date < this.startDate) {
        this.endDate = this.startDate;
        this.startDate = date;
      } else {
        this.endDate = date;
      }
      return;
    }

    this.startDate = date;
    this.endDate = null;
    this.hoveredDate = null;
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

  // ✅ Soumettre la modification
  submitEdit(): void {
  if (!this.editingRental) return;

  if (!this.startDate || !this.endDate) {
    this.editError = 'Please select start and end dates on the calendar.';
    return;
  }

  this.isUpdating = true;
  this.editError = '';

  const dto: RentalRequest = {
    equipmentId: this.editingRental.equipmentId,
    startDate: this.formatDate(this.startDate),   // ✅ String au lieu de Date
    endDate: this.formatDate(this.endDate)          // ✅ String au lieu de Date
  };

  this.rentalService.updateRental(this.editingRental.rentalId, dto).subscribe({
    next: () => {
      this.editSuccess = 'Rental updated successfully!';
      this.isUpdating = false;
      this.loadRentals();
      setTimeout(() => this.closeEdit(), 1500);
    },
    error: (err) => {
      this.editError = err.error?.message || 'Failed to update rental.';
      this.isUpdating = false;
    }
  });
}

  // ✅ Supprimer
  deleteRental(id: number): void {
    if (!confirm('Are you sure you want to delete this rental?')) return;
    this.rentalService.deleteRental(id).subscribe({
      next: () => this.loadRentals(),
      error: (err) => alert(err.error?.message || 'Failed to delete rental.')
    });
  }
}