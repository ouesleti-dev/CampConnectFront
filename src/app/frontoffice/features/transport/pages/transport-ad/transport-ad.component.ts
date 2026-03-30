import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransportAdService } from '../../../../shared/services/transport-ad.service';
import { TripService } from '../../../../shared/services/trip.service';
import { ReservationService } from '../../../../shared/services/reservation.service';
import {
  TransportAdRequest,
  TransportAdResponse
} from '../../../../shared/models/transport-ad.model';
import { TripResponse } from '../../../../shared/models/trip.model';
import { ReservationRequest } from '../../../../shared/models/reservation.model';

@Component({
  selector: 'app-transport-ad',
  templateUrl: './transport-ad.component.html',
  styleUrls: ['./transport-ad.component.css']
})
export class TransportAdComponent implements OnInit {
  adForm!: FormGroup;
  reservationForm!: FormGroup;
  myAds: TransportAdResponse[] = [];
  currentTrip: TripResponse | null = null;
  selectedAd: TransportAdResponse | null = null;
  selectedTripId: number | null = null;
  isLoading = false;
  showForm = false;
  showReservationForm = false;
  editMode = false;
  editAdId: number | null = null;
  successMessage = '';
  errorMessage = '';

  readonly transportTypes: string[] = ['Ride_sharing', 'Public_transport'];

  constructor(
    private fb: FormBuilder,
    private transportAdService: TransportAdService,
    private tripService: TripService,
    private reservationService: ReservationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe(params => {
      if (params['tripId']) {
        this.selectedTripId = Number(params['tripId']);
        this.adForm.patchValue({ tripId: this.selectedTripId });
        this.tripService.getTripById(this.selectedTripId).subscribe({
          next: (trip: TripResponse) => {
            this.currentTrip = trip;
          },
          error: (err: any) => {
            console.error(err);
          }
        });
        this.loadAds(this.selectedTripId);
      } else {
        this.currentTrip = null;
        this.selectedTripId = null;
        this.loadAllAds();
      }
    });
  }

  private initForm(): void {
    this.adForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(1)]],
      availableSeats: [1, [Validators.required, Validators.min(1)]],
      transportType: ['', Validators.required],
      tripId: [null, [Validators.required, Validators.min(1)]]
    });

    this.reservationForm = this.fb.group({
      seatCount: [1, [Validators.required, Validators.min(1)]],
      reservationDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  loadAds(tripId?: number): void {
    if (tripId !== undefined) {
      this.transportAdService.getByTripId(tripId).subscribe({
        next: (data: TransportAdResponse[]) => {
          this.myAds = data;
        },
        error: (err: any) => {
          console.error(err);
          this.errorMessage = err?.error?.message || 'Erreur lors du chargement des annonces.';
        }
      });
      return;
    }

    this.loadAllAds();
  }

  private loadAllAds(): void {
    this.transportAdService.getAllAds().subscribe({
      next: (data: TransportAdResponse[]) => {
        this.myAds = data;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des annonces.';
      }
    });
  }

  onSubmit(): void {
    if (this.adForm.invalid) {
      this.adForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    const adPayload: TransportAdRequest = {
      price: Number(this.adForm.get('price')?.value),
      availableSeats: Number(this.adForm.get('availableSeats')?.value),
      transportType: this.adForm.get('transportType')?.value as string,
      tripId: Number(this.adForm.get('tripId')?.value)
    };

    if (this.editMode && this.editAdId !== null) {
      this.transportAdService.updateAd(this.editAdId, adPayload).subscribe({
        next: (_updatedAd: TransportAdResponse) => {
          this.successMessage = 'Annonce modifiee avec succes.';
          this.finishSubmit();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Erreur lors de la modification de l annonce.';
        }
      });
      return;
    }

    this.transportAdService.createAd(adPayload).subscribe({
      next: (_createdAd: TransportAdResponse) => {
        this.successMessage = 'Annonce ajoutee avec succes.';
        this.finishSubmit();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l ajout de l annonce.';
      }
    });
  }

  editAd(ad: TransportAdResponse): void {
    this.clearMessages();
    this.editMode = true;
    this.showForm = true;
    this.editAdId = ad.adId;
    this.adForm.patchValue({
      price: ad.price,
      availableSeats: ad.availableSeats,
      transportType: ad.transportType,
      tripId: ad.tripId
    });
  }

  deleteAd(adId: number): void {
    this.clearMessages();

    this.transportAdService.deleteAd(adId).subscribe({
      next: (_response: string) => {
        this.successMessage = 'Annonce supprimee avec succes.';
        this.refreshAds();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression de l annonce.';
      }
    });
  }

  reserveAd(ad: TransportAdResponse): void {
    this.clearMessages();
    this.selectedAd = ad;
    this.showReservationForm = true;
    this.reservationForm.patchValue({
      seatCount: 1,
      reservationDate: new Date().toISOString().split('T')[0]
    });
  }

  cancelReservation(): void {
    this.showReservationForm = false;
    this.selectedAd = null;
    this.reservationForm.reset({
      seatCount: 1,
      reservationDate: new Date().toISOString().split('T')[0]
    });
  }

  submitReservation(): void {
    if (this.reservationForm.invalid || !this.selectedAd) {
      return;
    }

    const req: ReservationRequest = {
      reservationDate: this.reservationForm.value.reservationDate as string,
      seatCount: Number(this.reservationForm.value.seatCount),
      status: 'CONFIRMED',
      transportAdId: this.selectedAd.adId
    };

    this.reservationService.createReservation(req).subscribe({
      next: () => {
        this.successMessage = 'Reservation confirmee !';
        this.cancelReservation();
        if (this.selectedTripId !== null) {
          this.loadAds(this.selectedTripId);
        }
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la reservation';
      }
    });
  }

  resetForm(): void {
    this.adForm.reset({
      price: 0,
      availableSeats: 1,
      transportType: '',
      tripId: this.selectedTripId
    });
    this.editMode = false;
    this.editAdId = null;
    this.isLoading = false;
    this.showForm = false;
    this.clearMessages();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
    }
  }

  goBack(): void {
    this.router.navigate(['/transport/trips']);
  }

  private finishSubmit(): void {
    this.isLoading = false;
    this.refreshAds();
    this.resetForm();
  }

  private refreshAds(): void {
    if (this.selectedTripId !== null) {
      this.loadAds(this.selectedTripId);
      return;
    }

    this.loadAllAds();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
