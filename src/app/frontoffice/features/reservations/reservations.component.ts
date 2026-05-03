import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReservationService } from '../../shared/services/reservation.service';
import {
  ReservationDetailsResponse,
  ReservationRequest,
  ReservationResponse
} from '../../shared/models/reservation.model';
import { LocationDisplayService } from '../../shared/services/location-display.service';

interface ReservationViewModel extends ReservationResponse {
  displayDepartureLocation: string;
  displayDestinationLocation: string;
}

interface ReservationDetailsViewModel extends ReservationDetailsResponse {
  displayDestination: string;
}

interface OptionResponse {
  optionId: number;
  name: string;
  price: number;
  optionType: string;
}

interface AdReservationUserDetail {
  reservationId: number;
  userEmail: string;
  userPhone: string;
  seatCount: number;
  totalPrice: number;
  status: string;
  reservationDate: string;
  selectedOptions: OptionResponse[];
}

interface MyTransportAdDetails {
  adId: number;
  price: number;
  availableSeats: number;
  transportType: string;
  departureLocation: string;
  destination: string;
  vehicleId: number;
  vehicleLicensePlate: string;
  vehicleType: string;
  reservations: AdReservationUserDetail[];
}

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css']
})
export class ReservationsComponent implements OnInit {
  reservations: ReservationViewModel[] = [];
  reservationDetails: ReservationDetailsViewModel[] = [];
  myAdsDetails: MyTransportAdDetails[] = [];
  reservationForm!: FormGroup;
  searchForm!: FormGroup;
  editReservationId: number | null = null;
  isLoadingDetails = false;
  isLoadingMyAds = false;
  showMyAdsDetails = false;
  successMessage = '';
  errorMessage = '';
  myAdsError = '';
  private reservationsResolveVersion = 0;
  private detailsResolveVersion = 0;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private locationDisplayService: LocationDisplayService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.reservationForm = this.fb.group({
      reservationDate: ['', Validators.required],
      seatCount: [1, [Validators.required, Validators.min(1)]]
    });

    this.searchForm = this.fb.group({
      destination: [''],
      transportType: ['']
    });

    this.loadReservations();
    this.loadReservationDetails();
  }

  loadMyAdsDetails(): void {
    this.myAdsError = '';
    this.isLoadingMyAds = true;
    const url = 'http://localhost:8088/campConnect/transport-ads/my-ads-details';

    this.http.get<MyTransportAdDetails[]>(url).subscribe({
      next: (ads: MyTransportAdDetails[]) => {
        this.myAdsDetails = ads;
        this.showMyAdsDetails = true;
        this.isLoadingMyAds = false;

        if (ads.length === 0) {
          this.myAdsError = 'No ads found.';
        }
      },
      error: (err: any) => {
        this.isLoadingMyAds = false;

        if (err.status === 403 || err.status === 401) {
          this.myAdsError = 'You are not authorized to view your ads. Please login.';
        } else {
          this.myAdsError = err?.error?.message || 'Error loading your ads. Please try again later.';
        }

        this.myAdsDetails = [];
        this.showMyAdsDetails = true;
      }
    });
  }

  toggleMyAdsDetails(): void {
    if (!this.showMyAdsDetails) {
      this.loadMyAdsDetails();
    } else {
      this.showMyAdsDetails = false;
      this.myAdsDetails = [];
      this.myAdsError = '';
    }
  }

  loadReservations(): void {
    this.reservationService.getMyReservations().subscribe({
      next: (reservations: ReservationResponse[]) => {
        this.setReservations(reservations);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des reservations.';
      }
    });
  }

  loadReservationDetails(): void {
    this.isLoadingDetails = true;

    this.reservationService.getReservationDetails().subscribe({
      next: (details: ReservationDetailsResponse[]) => {
        this.setReservationDetails(details);
        this.isLoadingDetails = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des details des reservations.';
        this.reservationDetails = [];
        this.isLoadingDetails = false;
      }
    });
  }

  searchReservationDetails(): void {
    this.clearMessages();
    this.isLoadingDetails = true;

    const destination = this.searchForm.get('destination')?.value as string;
    const transportType = this.searchForm.get('transportType')?.value as string;

    this.reservationService.searchReservations(destination, transportType).subscribe({
      next: (details: ReservationDetailsResponse[]) => {
        this.setReservationDetails(details);
        this.isLoadingDetails = false;
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la recherche des reservations.';
        this.reservationDetails = [];
        this.isLoadingDetails = false;
      }
    });
  }

  resetSearch(): void {
    this.searchForm.reset({
      destination: '',
      transportType: ''
    });
    this.loadReservationDetails();
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
        this.loadReservationDetails();
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
        this.loadReservationDetails();
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

  private setReservations(reservations: ReservationResponse[]): void {
    const resolveVersion = ++this.reservationsResolveVersion;
    const viewModels = reservations.map((reservation: ReservationResponse): ReservationViewModel => ({
      ...reservation,
      displayDepartureLocation: this.locationDisplayService.formatLocation(reservation.departureLocation),
      displayDestinationLocation: this.locationDisplayService.formatLocation(reservation.destination)
    }));

    this.reservations = viewModels;
    this.resolveReservationsDisplayLocations(viewModels, resolveVersion);
  }

  private async resolveReservationsDisplayLocations(
    reservations: ReservationViewModel[],
    resolveVersion: number
  ): Promise<void> {
    await Promise.all(
      reservations.map(async (reservation: ReservationViewModel) => {
        const [departureLocation, destinationLocation] = await Promise.all([
          this.locationDisplayService.getDisplayLocation(
            reservation.departureLocation,
            reservation.departureLat ?? null,
            reservation.departureLng ?? null
          ),
          this.locationDisplayService.getDisplayLocation(
            reservation.destination,
            reservation.destinationLat ?? null,
            reservation.destinationLng ?? null
          )
        ]);

        if (resolveVersion !== this.reservationsResolveVersion) {
          return;
        }

        reservation.displayDepartureLocation = departureLocation;
        reservation.displayDestinationLocation = destinationLocation;
      })
    );

    if (resolveVersion === this.reservationsResolveVersion) {
      this.reservations = [...reservations];
    }
  }

  private setReservationDetails(details: ReservationDetailsResponse[]): void {
    const resolveVersion = ++this.detailsResolveVersion;
    const viewModels = details.map((detail: ReservationDetailsResponse): ReservationDetailsViewModel => ({
      ...detail,
      displayDestination: this.locationDisplayService.formatLocation(detail.destination)
    }));

    this.reservationDetails = viewModels;
    this.resolveReservationDetailsDisplayLocations(viewModels, resolveVersion);
  }

  private async resolveReservationDetailsDisplayLocations(
    details: ReservationDetailsViewModel[],
    resolveVersion: number
  ): Promise<void> {
    await Promise.all(
      details.map(async (detail: ReservationDetailsViewModel) => {
        const destination = await this.locationDisplayService.getDisplayLocation(
          detail.destination,
          detail.destinationLat ?? null,
          detail.destinationLng ?? null
        );

        if (resolveVersion !== this.detailsResolveVersion) {
          return;
        }

        detail.displayDestination = destination;
      })
    );

    if (resolveVersion === this.detailsResolveVersion) {
      this.reservationDetails = [...details];
    }
  }
}