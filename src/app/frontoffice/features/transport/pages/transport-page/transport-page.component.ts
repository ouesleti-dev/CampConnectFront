import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../../../shared/services/vehicle.service';
import { TripService } from '../../../../shared/services/trip.service';
import { TransportAdService } from '../../../../shared/services/transport-ad.service';
import { ReservationService } from '../../../../shared/services/reservation.service';
import {
  VehicleRequest,
  VehicleResponse
} from '../../../../shared/models/vehicle.model';
import { TripResponse } from '../../../../shared/models/trip.model';
import { TransportAdResponse } from '../../../../shared/models/transport-ad.model';
import { ReservationRequest } from '../../../../shared/models/reservation.model';

@Component({
  selector: 'app-transport-page',
  templateUrl: './transport-page.component.html',
  styleUrls: ['./transport-page.component.css']
})
export class TransportPageComponent implements OnInit {
  vehicleForm!: FormGroup;
  reservationForm!: FormGroup;
  vehicles: VehicleResponse[] = [];
  tripsByVehicle: { [vehicleId: number]: TripResponse[] } = {};
  adsByTrip: { [tripId: number]: TransportAdResponse[] } = {};
  showReservationForm = false;
  selectedAd: TransportAdResponse | null = null;
  isLoading = false;
  showForm = false;
  editMode = false;
  editVehicleId: number | null = null;
  successMessage = '';
  errorMessage = '';

  readonly vehicleTypes: string[] = ['Car', 'Bus', 'Van', 'Truck', 'Motorcycle'];
  readonly statusOptions: string[] = ['active', 'inactive', 'maintenance'];

  constructor(
    private fb: FormBuilder,
    private vehicleService: VehicleService,
    private tripService: TripService,
    private transportAdService: TransportAdService,
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.vehicleForm = this.fb.group({
      licensePlate: ['', [Validators.required, Validators.minLength(3)]],
      vehicleType: ['', Validators.required],
      capacity: [1, [Validators.required, Validators.min(1)]],
      status: ['active', Validators.required]
    });

    this.reservationForm = this.fb.group({
      seatCount: [1, [Validators.required, Validators.min(1)]],
      reservationDate: [new Date().toISOString().split('T')[0], Validators.required]
    });

    this.loadVehicles();
  }

  loadVehicles(): void {
    this.vehicleService.getAllVehicles().subscribe({
      next: (vehicles: VehicleResponse[]) => {
        this.vehicles = vehicles;
        this.tripsByVehicle = {};
        this.adsByTrip = {};
        vehicles.forEach(v => this.loadTripsByVehicle(v.vehicleId));
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadTripsByVehicle(vehicleId: number): void {
    this.tripService.getTripsByVehicleId(vehicleId).subscribe({
      next: (trips: TripResponse[]) => {
        this.tripsByVehicle[vehicleId] = trips;
        trips.forEach(t => this.loadAdsByTrip(t.tripId));
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  loadAdsByTrip(tripId: number): void {
    this.transportAdService.getByTripId(tripId).subscribe({
      next: (ads: TransportAdResponse[]) => {
        this.adsByTrip[tripId] = ads;
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  addVehicle(vehicle: VehicleRequest): void {
    this.vehicleService.addVehicle(vehicle).subscribe({
      next: (_createdVehicle: VehicleResponse) => {
        this.successMessage = 'Vehicule ajoute avec succes.';
        this.finishSubmit();
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l ajout du vehicule.';
      }
    });
  }

  editVehicle(vehicle: VehicleResponse): void {
    this.clearMessages();
    this.editMode = true;
    this.showForm = true;
    this.editVehicleId = vehicle.vehicleId;
    this.vehicleForm.patchValue({
      licensePlate: vehicle.licensePlate,
      vehicleType: vehicle.vehicleType,
      capacity: vehicle.capacity,
      status: vehicle.status
    });
  }

  deleteVehicle(vehicleId: number): void {
    this.clearMessages();

    this.vehicleService.deleteVehicle(vehicleId).subscribe({
      next: (_response: string) => {
        this.successMessage = 'Vehicule supprime avec succes.';
        this.loadVehicles();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression du vehicule.';
      }
    });
  }

  goToOptions(vehicleId: number): void {
    this.router.navigate(['/transport/options'], { queryParams: { vehicleId } });
  }

  goToTrips(vehicleId: number): void {
    this.router.navigate(['/transport/trips'], { queryParams: { vehicleId } });
  }

  goToAds(tripId: number): void {
    this.router.navigate(['/transport/transport-ads'], { queryParams: { tripId } });
  }

  openReservation(ad: TransportAdResponse): void {
    this.clearMessages();
    this.selectedAd = ad;
    this.showReservationForm = true;
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
        this.successMessage = '🎫 Réservation confirmée !';
        this.errorMessage = '';
        this.cancelReservation();
        this.loadVehicles();
      },
      error: (err: any) => {
        console.error('Reservation error:', err);
        this.errorMessage = err?.error?.message || err?.error || 'Erreur lors de la réservation. Code: ' + err?.status;
      }
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    const vehiclePayload: VehicleRequest = {
      licensePlate: this.vehicleForm.get('licensePlate')?.value as string,
      vehicleType: this.vehicleForm.get('vehicleType')?.value as string,
      capacity: Number(this.vehicleForm.get('capacity')?.value),
      status: this.vehicleForm.get('status')?.value as string
    };

    if (this.editMode && this.editVehicleId !== null) {
      this.vehicleService.updateVehicle(this.editVehicleId, vehiclePayload).subscribe({
        next: (_updatedVehicle: VehicleResponse) => {
          this.successMessage = 'Vehicule modifie avec succes.';
          this.finishSubmit();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Erreur lors de la modification du vehicule.';
        }
      });
      return;
    }

    this.addVehicle(vehiclePayload);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.vehicleForm.reset({
      licensePlate: '',
      vehicleType: '',
      capacity: 1,
      status: 'active'
    });
    this.editMode = false;
    this.editVehicleId = null;
    this.isLoading = false;
    this.showForm = false;
    this.clearMessages();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge-active';
      case 'inactive':
        return 'badge-inactive';
      case 'maintenance':
        return 'badge-maintenance';
      default:
        return '';
    }
  }

  private finishSubmit(): void {
    this.isLoading = false;
    this.loadVehicles();
    this.resetForm();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
