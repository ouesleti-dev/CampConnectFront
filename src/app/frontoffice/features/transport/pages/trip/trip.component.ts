import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TripService } from '../../../../shared/services/trip.service';
import { TripRequest, TripResponse } from '../../../../shared/models/trip.model';

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css']
})
export class TripComponent implements OnInit {
  tripForm!: FormGroup;
  myTrips: TripResponse[] = [];
  selectedVehicleId: number | null = null;
  isLoading = false;
  showForm = false;
  editMode = false;
  editTripId: number | null = null;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe(params => {
      if (params['vehicleId']) {
        this.selectedVehicleId = Number(params['vehicleId']);
        this.tripForm.patchValue({ vehicleId: this.selectedVehicleId });
        this.loadTripsByVehicle(this.selectedVehicleId);
      } else {
        this.selectedVehicleId = null;
        this.loadAllTrips();
      }
    });
  }

  private initForm(): void {
    this.tripForm = this.fb.group({
      departureLocation: ['', [Validators.required, Validators.minLength(2)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
      departureDate: ['', Validators.required],
      distance: [0, [Validators.required, Validators.min(1)]],
      vehicleId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  loadAllTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data: TripResponse[]) => {
        this.myTrips = data;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des trajets.';
      }
    });
  }

  loadTripsByVehicle(vehicleId: number): void {
    this.tripService.getTripsByVehicleId(vehicleId).subscribe({
      next: (data: TripResponse[]) => {
        this.myTrips = data;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des trajets.';
      }
    });
  }

  onSubmit(): void {
    if (this.tripForm.invalid) {
      this.tripForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    const tripPayload: TripRequest = {
      departureLocation: this.tripForm.get('departureLocation')?.value as string,
      destination: this.tripForm.get('destination')?.value as string,
      departureDate: this.tripForm.get('departureDate')?.value as string,
      distance: Number(this.tripForm.get('distance')?.value),
      vehicleId: Number(this.tripForm.get('vehicleId')?.value)
    };

    if (this.editMode && this.editTripId !== null) {
      this.tripService.updateTrip(this.editTripId, tripPayload).subscribe({
        next: (_updatedTrip: TripResponse) => {
          this.successMessage = 'Trajet modifie avec succes.';
          this.finishSubmit();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Erreur lors de la modification du trajet.';
        }
      });
      return;
    }

    this.tripService.createTrip(tripPayload).subscribe({
      next: (_createdTrip: TripResponse) => {
        this.successMessage = 'Trajet ajoute avec succes.';
        this.finishSubmit();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l ajout du trajet.';
      }
    });
  }

  editTrip(trip: TripResponse): void {
    this.clearMessages();
    this.editMode = true;
    this.showForm = true;
    this.editTripId = trip.tripId;
    this.tripForm.patchValue({
      departureLocation: trip.departureLocation,
      destination: trip.destination,
      departureDate: trip.departureDate,
      distance: trip.distance,
      vehicleId: trip.vehicleId
    });
  }

  deleteTrip(tripId: number): void {
    this.clearMessages();

    this.tripService.deleteTrip(tripId).subscribe({
      next: (_response: string) => {
        this.successMessage = 'Trajet supprime avec succes.';
        this.refreshTrips();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression du trajet.';
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
    }
  }

  goBack(): void {
    this.router.navigate(['/transport']);
  }

  goToAds(tripId: number): void {
    this.router.navigate(['/transport/transport-ads'], { queryParams: { tripId } });
  }

  resetForm(): void {
    this.tripForm.reset({
      departureLocation: '',
      destination: '',
      departureDate: '',
      distance: 0,
      vehicleId: this.selectedVehicleId
    });
    this.editMode = false;
    this.editTripId = null;
    this.isLoading = false;
    this.showForm = false;
    this.clearMessages();
  }

  private finishSubmit(): void {
    this.isLoading = false;
    this.refreshTrips();
    this.resetForm();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private refreshTrips(): void {
    if (this.selectedVehicleId !== null) {
      this.loadTripsByVehicle(this.selectedVehicleId);
      return;
    }

    this.loadAllTrips();
  }
}
