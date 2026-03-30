import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationService } from '../../shared/services/reservation.service';
import {
  ReservationRequest,
  ReservationResponse
} from '../../shared/models/reservation.model';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {
  reservations: ReservationResponse[] = [];
  reservationForm!: FormGroup;
  editReservationId: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.reservationForm = this.fb.group({
      reservationDate: ['', Validators.required],
      seatCount: [1, [Validators.required, Validators.min(1)]]
    });

    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.getMyReservations().subscribe({
      next: (reservations: ReservationResponse[]) => {
        this.reservations = reservations;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des reservations.';
      }
    });
  }

  editReservation(reservation: ReservationResponse): void {
    this.clearMessages();
    this.editReservationId = reservation.reservationId;
    this.reservationForm.patchValue({
      reservationDate: reservation.reservationDate,
      seatCount: reservation.seatCount
    });
  }

  updateReservation(reservation: ReservationResponse): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    const request: ReservationRequest = {
      reservationDate: this.reservationForm.get('reservationDate')?.value as string,
      seatCount: Number(this.reservationForm.get('seatCount')?.value),
      status: reservation.status,
      transportAdId: reservation.transportAdId
    };

    this.reservationService.updateReservation(reservation.reservationId, request).subscribe({
      next: () => {
        this.successMessage = 'Reservation modifiee avec succes.';
        this.cancelEdit();
        this.loadReservations();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la modification de la reservation.';
      }
    });
  }

  deleteReservation(reservationId: number): void {
    this.clearMessages();

    this.reservationService.deleteReservation(reservationId).subscribe({
      next: () => {
        this.successMessage = 'Reservation supprimee avec succes.';
        if (this.editReservationId === reservationId) {
          this.cancelEdit();
        }
        this.loadReservations();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression de la reservation.';
      }
    });
  }

  cancelEdit(): void {
    this.editReservationId = null;
    this.reservationForm.reset({
      reservationDate: '',
      seatCount: 1
    });
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
