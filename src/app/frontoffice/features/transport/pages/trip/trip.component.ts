import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';

import { TripService } from '../../../../shared/services/trip.service';
import { TripRequest, TripResponse } from '../../../../shared/models/trip.model';
import { Coordinates, LocationDisplayService } from '../../../../shared/services/location-display.service';

interface TripViewModel extends TripResponse {
  displayDepartureLocation: string;
  displayDestinationLocation: string;
}

@Component({
  selector: 'app-trip',
  templateUrl: './trip.component.html',
  styleUrls: ['./trip.component.css']
})
export class TripComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('tripMap') private mapContainer?: ElementRef<HTMLElement>;

  tripForm!: FormGroup;
  myTrips: TripViewModel[] = [];

  selectedVehicleId: number | null = null;
  isLoading = false;
  isRouteLoading = false;
  showForm = false;
  editMode = false;
  editTripId: number | null = null;

  successMessage = '';
  errorMessage = '';
  mapErrorMessage = '';

  private map?: L.Map;
  private departureMarker?: L.Marker;
  private destinationMarker?: L.Marker;
  private routeLine?: L.Polyline;

  private departurePoint: L.LatLng | null = null;
  private destinationPoint: L.LatLng | null = null;

  private readonly defaultMapCenter: L.LatLngExpression = [34.0, 9.0];
  private tripsResolveVersion = 0;

  constructor(
    private fb: FormBuilder,
    private tripService: TripService,
    private locationDisplayService: LocationDisplayService,
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

  ngAfterViewInit(): void {
    if (this.showForm) {
      setTimeout(() => this.initMap(), 200);
    }
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  get mapInstruction(): string {
    if (!this.departurePoint) {
      return 'Click on the map to set the departure point.';
    }

    if (!this.destinationPoint) {
      return 'Click on the map to set the destination.';
    }

    return 'Route selected. You can reset the map to choose another route.';
  }

  private initForm(): void {
    this.tripForm = this.fb.group({
      departureLocation: ['', [Validators.required, Validators.minLength(2)]],
      destination: ['', [Validators.required, Validators.minLength(2)]],
      departureDate: ['', Validators.required],
      distance: [0, [Validators.required, Validators.min(0.1)]],
      vehicleId: [null, [Validators.required, Validators.min(1)]],
      departureLat: [null],
      departureLng: [null],
      destinationLat: [null],
      destinationLng: [null]
    });
  }

  loadAllTrips(): void {
    this.tripService.getAllTrips().subscribe({
      next: (data: TripResponse[]) => this.setTrips(data),
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des trajets.';
      }
    });
  }

  loadTripsByVehicle(vehicleId: number): void {
    this.tripService.getTripsByVehicleId(vehicleId).subscribe({
      next: (data: TripResponse[]) => this.setTrips(data),
      error: (err: HttpErrorResponse) => {
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
      vehicleId: Number(this.tripForm.get('vehicleId')?.value),
      departureLat: this.getOptionalNumber('departureLat'),
      departureLng: this.getOptionalNumber('departureLng'),
      destinationLat: this.getOptionalNumber('destinationLat'),
      destinationLng: this.getOptionalNumber('destinationLng')
    };

    if (this.editMode && this.editTripId !== null) {
      this.tripService.updateTrip(this.editTripId, tripPayload).subscribe({
        next: () => {
          this.successMessage = 'Trajet modifie avec succes.';
          this.finishSubmit();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Erreur lors de la modification du trajet.';
        }
      });
      return;
    }

    this.tripService.createTrip(tripPayload).subscribe({
      next: () => {
        this.successMessage = 'Trajet ajoute avec succes.';
        this.finishSubmit();
      },
      error: (err: HttpErrorResponse) => {
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
      vehicleId: trip.vehicleId,
      departureLat: trip.departureLat ?? null,
      departureLng: trip.departureLng ?? null,
      destinationLat: trip.destinationLat ?? null,
      destinationLng: trip.destinationLng ?? null
    });

    this.clearMapSelection();

    setTimeout(() => {
      this.initMap();
      void this.restoreMapSelectionFromForm();
    }, 200);
  }

  deleteTrip(tripId: number): void {
    this.clearMessages();

    this.tripService.deleteTrip(tripId).subscribe({
      next: () => {
        this.successMessage = 'Trajet supprime avec succes.';
        this.refreshTrips();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression du trajet.';
      }
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.resetForm();
      return;
    }

    setTimeout(() => this.initMap(), 200);
  }

  resetForm(): void {
    this.tripForm.reset({
      departureLocation: '',
      destination: '',
      departureDate: '',
      distance: 0,
      vehicleId: this.selectedVehicleId,
      departureLat: null,
      departureLng: null,
      destinationLat: null,
      destinationLng: null
    });

    this.editMode = false;
    this.editTripId = null;
    this.isLoading = false;
    this.isRouteLoading = false;
    this.showForm = false;

    this.destroyMap();
    this.clearMessages();
  }

  resetMap(): void {
    this.clearMapSelection();
    this.clearRouteFormValues();

    this.map?.setView(this.defaultMapCenter, 6);
    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  goBack(): void {
    this.router.navigate(['/transport']);
  }

  goToAds(tripId: number): void {
    this.router.navigate(['/transport/transport-ads'], {
      queryParams: { tripId }
    });
  }

  private initMap(): void {
    if (!this.mapContainer) {
      return;
    }

    if (this.map) {
      setTimeout(() => this.map?.invalidateSize(), 200);
      return;
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.defaultMapCenter,
      zoom: 6,
      scrollWheelZoom: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      void this.handleMapClick(event.latlng);
    });

    setTimeout(() => this.map?.invalidateSize(), 300);
  }

  private async handleMapClick(latlng: L.LatLng): Promise<void> {
    if (!this.departurePoint || this.destinationPoint) {
      this.clearMapSelection();
      this.clearRouteFormValues();
      await this.setDeparturePoint(latlng);
      return;
    }

    await this.setDestinationPoint(latlng);
    this.calculateRoute();
  }

  private async setDeparturePoint(latlng: L.LatLng): Promise<void> {
    this.departurePoint = latlng;

    this.departureMarker?.remove();
    this.departureMarker = L.marker(latlng, {
      icon: this.createMarkerIcon('departure', 'D')
    })
      .addTo(this.requireMap())
      .bindPopup('Departure')
      .openPopup();

    const cityName = await this.getSafeCityName(latlng);

    this.tripForm.patchValue({
      departureLocation: cityName,
      departureLat: this.roundCoordinate(latlng.lat),
      departureLng: this.roundCoordinate(latlng.lng)
    });
  }

  private async setDestinationPoint(latlng: L.LatLng): Promise<void> {
    this.destinationPoint = latlng;

    this.destinationMarker?.remove();
    this.destinationMarker = L.marker(latlng, {
      icon: this.createMarkerIcon('destination', 'A')
    })
      .addTo(this.requireMap())
      .bindPopup('Destination')
      .openPopup();

    const cityName = await this.getSafeCityName(latlng);

    this.tripForm.patchValue({
      destination: cityName,
      destinationLat: this.roundCoordinate(latlng.lat),
      destinationLng: this.roundCoordinate(latlng.lng)
    });
  }

  private calculateRoute(): void {
    if (!this.departurePoint || !this.destinationPoint) {
      return;
    }

    this.mapErrorMessage = '';
    this.isRouteLoading = false;

    this.routeLine?.remove();

    this.routeLine = L.polyline(
      [this.departurePoint, this.destinationPoint],
      {
        color: '#16a34a',
        weight: 5,
        opacity: 0.9
      }
    ).addTo(this.requireMap());

    this.requireMap().fitBounds(this.routeLine.getBounds(), {
      padding: [28, 28]
    });

    const distanceMeters = this.departurePoint.distanceTo(this.destinationPoint);
    const distanceKm = Number((distanceMeters / 1000).toFixed(2));

    this.tripForm.patchValue({
      distance: distanceKm
    });

    setTimeout(() => this.map?.invalidateSize(), 100);
  }

  private async restoreMapSelectionFromForm(): Promise<void> {
    const departure = this.getLatLngFromForm('departureLat', 'departureLng');
    const destination = this.getLatLngFromForm('destinationLat', 'destinationLng');

    if (departure) {
      await this.setDeparturePoint(departure);
    }

    if (destination) {
      await this.setDestinationPoint(destination);
    }

    if (departure && destination) {
      this.calculateRoute();
    }
  }

  private getLatLngFromForm(latControlName: string, lngControlName: string): L.LatLng | null {
    const lat = this.getOptionalNumber(latControlName);
    const lng = this.getOptionalNumber(lngControlName);

    if (lat === null || lng === null) {
      return null;
    }

    return L.latLng(lat, lng);
  }

  private setTrips(data: TripResponse[]): void {
    const resolveVersion = ++this.tripsResolveVersion;

    const trips = data.map((trip: TripResponse): TripViewModel => ({
      ...trip,
      displayDepartureLocation: this.locationDisplayService.formatLocation(trip.departureLocation),
      displayDestinationLocation: this.locationDisplayService.formatLocation(trip.destination)
    }));

    this.myTrips = trips;
    this.resolveTripsDisplayLocations(trips, resolveVersion);
  }

  private async resolveTripsDisplayLocations(
    trips: TripViewModel[],
    resolveVersion: number
  ): Promise<void> {
    await Promise.all(
      trips.map(async (trip: TripViewModel) => {
        const [departureLocation, destinationLocation] = await Promise.all([
          this.resolveDisplayLocation(trip, 'departure'),
          this.resolveDisplayLocation(trip, 'destination')
        ]);

        if (resolveVersion !== this.tripsResolveVersion) {
          return;
        }

        trip.displayDepartureLocation = departureLocation;
        trip.displayDestinationLocation = destinationLocation;
        this.myTrips = [...this.myTrips];
      })
    );
  }

  private async resolveDisplayLocation(
    trip: TripResponse,
    type: 'departure' | 'destination'
  ): Promise<string> {
    const rawLocation = type === 'departure' ? trip.departureLocation : trip.destination;

    if (rawLocation && !this.locationDisplayService.parseCoordinates(rawLocation)) {
      return rawLocation;
    }

    const coordinates = this.getTripCoordinates(trip, type);

    if (!coordinates) {
      return rawLocation || 'Unknown location';
    }

    return this.locationDisplayService.getDisplayLocation(
      rawLocation,
      coordinates.lat,
      coordinates.lng
    );
  }

  private getTripCoordinates(trip: TripResponse, type: 'departure' | 'destination'): Coordinates | null {
    const lat = type === 'departure' ? trip.departureLat : trip.destinationLat;
    const lng = type === 'departure' ? trip.departureLng : trip.destinationLng;

    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }

    const rawLocation = type === 'departure' ? trip.departureLocation : trip.destination;
    return this.locationDisplayService.parseCoordinates(rawLocation);
  }

  private clearMapSelection(): void {
    this.departureMarker?.remove();
    this.destinationMarker?.remove();
    this.routeLine?.remove();

    this.departureMarker = undefined;
    this.destinationMarker = undefined;
    this.routeLine = undefined;

    this.departurePoint = null;
    this.destinationPoint = null;

    this.isRouteLoading = false;
    this.mapErrorMessage = '';
  }

  private clearRouteFormValues(): void {
    this.tripForm.patchValue({
      departureLocation: '',
      destination: '',
      distance: 0,
      departureLat: null,
      departureLng: null,
      destinationLat: null,
      destinationLng: null
    });
  }

  private destroyMap(): void {
    this.clearMapSelection();
    this.map?.remove();
    this.map = undefined;
  }

  private requireMap(): L.Map {
    if (!this.map) {
      throw new Error('Map is not initialized.');
    }

    return this.map;
  }

  private createMarkerIcon(type: 'departure' | 'destination', label: string): L.DivIcon {
    return L.divIcon({
      className: `trip-map-marker trip-map-marker-${type}`,
      html: `<span>${label}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30]
    });
  }

  private async getSafeCityName(latlng: L.LatLng): Promise<string> {
    const cityName = await this.locationDisplayService.getCityName(
      latlng.lat,
      latlng.lng
    );

    if (cityName && cityName !== 'Unknown location' && cityName !== 'Point GPS') {
      return cityName;
    }

    return this.formatLatLng(latlng);
  }

  private formatLatLng(latlng: L.LatLng): string {
    return `${this.roundCoordinate(latlng.lat)}, ${this.roundCoordinate(latlng.lng)}`;
  }

  private roundCoordinate(value: number): number {
    return Number(value.toFixed(6));
  }

  private getOptionalNumber(controlName: string): number | null {
    const value: unknown = this.tripForm.get(controlName)?.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
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