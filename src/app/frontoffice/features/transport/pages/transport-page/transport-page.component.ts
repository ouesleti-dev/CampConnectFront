import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { LocationDisplayService } from '../../../../shared/services/location-display.service';

interface TripDisplayResponse extends TripResponse {
  displayDepartureLocation: string;
  displayDestinationLocation: string;
}

@Component({
  selector: 'app-transport-page',
  templateUrl: './transport-page.component.html',
  styleUrls: ['./transport-page.component.css']
})
export class TransportPageComponent implements OnInit {
  vehicleForm!: FormGroup;
  reservationForm!: FormGroup;
  vehicles: VehicleResponse[] = [];
  tripsByVehicle: { [vehicleId: number]: TripDisplayResponse[] } = {};
  adsByTrip: { [tripId: number]: TransportAdResponse[] } = {};
  showReservationForm = false;
  selectedAd: TransportAdResponse | null = null;
  selectedAdDisplayDepartureLocation = '';
  selectedAdDisplayDestinationLocation = '';
  isLoading = false;
  showForm = false;
  editMode = false;
  editVehicleId: number | null = null;
  successMessage = '';
  errorMessage = '';

  // Booking options variables
  availableOptions: any[] = [];
  selectedOptions: any[] = [];
  isLoadingOptions = false;

  readonly vehicleTypes: string[] = ['Car', 'Bus', 'Van', 'Truck', 'Motorcycle'];
  readonly statusOptions: string[] = ['active', 'inactive', 'maintenance'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private vehicleService: VehicleService,
    private tripService: TripService,
    private transportAdService: TransportAdService,
    private reservationService: ReservationService,
    private locationDisplayService: LocationDisplayService,
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
      this.vehicles = [...vehicles].sort(
        (a, b) => b.vehicleId - a.vehicleId
      );

      this.tripsByVehicle = {};
      this.adsByTrip = {};

      this.vehicles.forEach(v => this.loadTripsByVehicle(v.vehicleId));
    },
    error: (err: any) => {
      console.error(err);
    }
  });
}

  loadTripsByVehicle(vehicleId: number): void {
    this.tripService.getTripsByVehicleId(vehicleId).subscribe({
      next: (trips: TripResponse[]) => {
        const displayTrips = trips.map((trip: TripResponse): TripDisplayResponse => ({
          ...trip,
          displayDepartureLocation: this.locationDisplayService.formatLocation(trip.departureLocation),
          displayDestinationLocation: this.locationDisplayService.formatLocation(trip.destination)
        }));

        this.tripsByVehicle[vehicleId] = displayTrips;
        this.resolveTripDisplayLocations(vehicleId, displayTrips);
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

  goToRecommendations(): void {
    this.router.navigate(['/transport/recommendations']);
  }

  goToDemandAnalysis(): void {
    this.router.navigate(['/transport/demand-analysis']);
  }

  openReservation(ad: TransportAdResponse): void {
    this.clearMessages();
    this.selectedAd = ad;
    this.selectedAdDisplayDepartureLocation = this.locationDisplayService.formatLocation(ad.departureLocation);
    this.selectedAdDisplayDestinationLocation = this.locationDisplayService.formatLocation(ad.destination);
    this.showReservationForm = true;
    this.selectedOptions = [];
    this.availableOptions = [];
    this.loadBookingOptions(ad);
    this.resolveSelectedAdDisplayLocations(ad);
  }

 loadBookingOptions(ad: any): void {
    console.log('Loading booking options for ad:', ad);

    // First, get the trip details to extract vehicleId
    if (!ad.tripId) {
      this.errorMessage = 'Trip ID not found for this ad.';
      this.availableOptions = [];
      return;
    }

    this.isLoadingOptions = true;
    this.errorMessage = '';

    // Get trip details to find vehicleId
    this.tripService.getTripById(ad.tripId).subscribe({
      next: (trip) => {
        console.log('Trip details:', trip);

        const vehicleId = trip.vehicleId;
        if (!vehicleId) {
          this.errorMessage = 'Vehicle ID not found for this trip.';
          this.availableOptions = [];
          this.isLoadingOptions = false;
          return;
        }

        console.log('Using vehicleId:', vehicleId);

        // Now fetch options for this vehicle
        const optionUrl = `http://localhost:8088/campConnect/options/vehicle/${vehicleId}`;

        this.http.get<any[]>(optionUrl).subscribe({
          next: (options: any[]) => {
            console.log('Loaded options:', options);
            this.availableOptions = options || [];
            this.isLoadingOptions = false;
          },
          error: (err: any) => {
            console.error('Error loading options:', err);
            this.availableOptions = [];
            this.isLoadingOptions = false;
            this.errorMessage = 'Failed to load booking options.';
          }
        });
      },
      error: (err: any) => {
        console.error('Error loading trip details:', err);
        this.errorMessage = 'Failed to load trip information.';
        this.availableOptions = [];
        this.isLoadingOptions = false;
      }
    });
  }

  toggleOption(option: any): void {
    const index = this.selectedOptions.findIndex(o => o.optionId === option.optionId);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }
  }

  isOptionSelected(option: any): boolean {
    return this.selectedOptions.some(o => o.optionId === option.optionId);
  }

  getTotalPrice(): number {
    if (!this.selectedAd) return 0;
    
    const seatCount = Number(this.reservationForm.get('seatCount')?.value) || 0;
    const basePrice = this.selectedAd.price * seatCount;
    const optionsPrice = this.selectedOptions.reduce((total, option) => total + (option.price || 0), 0);
    
    return basePrice + optionsPrice;
  }

  cancelReservation(): void {
    this.showReservationForm = false;
    this.selectedAd = null;
    this.selectedAdDisplayDepartureLocation = '';
    this.selectedAdDisplayDestinationLocation = '';
    this.availableOptions = [];
    this.selectedOptions = [];
    this.isLoadingOptions = false;
    this.reservationForm.reset({
      seatCount: 1,
      reservationDate: new Date().toISOString().split('T')[0]
    });
  }

  submitReservation(): void {
    if (this.reservationForm.invalid || !this.selectedAd) {
      return;
    }

    const req: any = {
      reservationDate: this.reservationForm.value.reservationDate as string,
      seatCount: Number(this.reservationForm.value.seatCount),
      status: 'CONFIRMED',
      transportAdId: this.selectedAd.adId,
      optionIds: this.selectedOptions.map(o => o.optionId)
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

  private async resolveTripDisplayLocations(
    vehicleId: number,
    trips: TripDisplayResponse[]
  ): Promise<void> {
    await Promise.all(
      trips.map(async (trip: TripDisplayResponse) => {
        const [departureLocation, destinationLocation] = await Promise.all([
          this.locationDisplayService.getDisplayLocation(
            trip.departureLocation,
            trip.departureLat ?? null,
            trip.departureLng ?? null
          ),
          this.locationDisplayService.getDisplayLocation(
            trip.destination,
            trip.destinationLat ?? null,
            trip.destinationLng ?? null
          )
        ]);

        trip.displayDepartureLocation = departureLocation;
        trip.displayDestinationLocation = destinationLocation;
      })
    );

    this.tripsByVehicle = {
      ...this.tripsByVehicle,
      [vehicleId]: [...trips]
    };
  }

  private async resolveSelectedAdDisplayLocations(ad: TransportAdResponse): Promise<void> {
    const [departureLocation, destinationLocation] = await Promise.all([
      this.locationDisplayService.getDisplayLocation(
        ad.departureLocation,
        ad.departureLat ?? null,
        ad.departureLng ?? null
      ),
      this.locationDisplayService.getDisplayLocation(
        ad.destination,
        ad.destinationLat ?? null,
        ad.destinationLng ?? null
      )
    ]);

    if (this.selectedAd?.adId !== ad.adId) {
      return;
    }

    this.selectedAdDisplayDepartureLocation = departureLocation;
    this.selectedAdDisplayDestinationLocation = destinationLocation;
  }
  getOptionsTotal(): number {
  return this.selectedOptions.reduce(
    (sum: number, option: any) => sum + Number(option.price || 0),
    0
  );
}
}
