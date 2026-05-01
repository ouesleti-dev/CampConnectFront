import { Injectable } from '@angular/core';

export interface Coordinates {
  lat: number;
  lng: number;
}

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
}

interface NominatimReverseResponse {
  display_name?: string;
  name?: string;
  address?: NominatimAddress;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationDisplayService {
  private readonly reverseGeocodeUrl = 'https://nominatim.openstreetmap.org/reverse';
  private readonly geocodeCache = new Map<string, string>();
  private readonly pendingGeocodeRequests = new Map<string, Promise<string>>();

  formatLocation(value: string): string {
    if (!value) {
      return 'Unknown location';
    }

    return this.parseCoordinates(value) ? 'Unknown location' : value;
  }

  getDisplayLocation(value: string, lat?: number | null, lng?: number | null): Promise<string> {
    const coordinates = this.getCoordinates(value, lat, lng);

    if (!coordinates) {
      return Promise.resolve(this.formatLocation(value));
    }

    return this.getCityName(coordinates.lat, coordinates.lng);
  }

  async getCityName(lat: number, lng: number): Promise<string> {
    const cacheKey = this.getGeocodeCacheKey(lat, lng);
    const cachedCityName = this.geocodeCache.get(cacheKey);

    if (cachedCityName) {
      return cachedCityName;
    }

    const pendingRequest = this.pendingGeocodeRequests.get(cacheKey);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = this.reverseGeocode(lat, lng)
      .then(cityName => {
        this.geocodeCache.set(cacheKey, cityName);
        this.pendingGeocodeRequests.delete(cacheKey);
        return cityName;
      })
      .catch(() => {
        this.geocodeCache.set(cacheKey, 'Unknown location');
        this.pendingGeocodeRequests.delete(cacheKey);
        return 'Unknown location';
      });

    this.pendingGeocodeRequests.set(cacheKey, request);
    return request;
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    const url = new URL(this.reverseGeocodeUrl);
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', lat.toString());
    url.searchParams.set('lon', lng.toString());
    url.searchParams.set('zoom', '10');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'en');

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return 'Unknown location';
    }

    const data = await response.json() as NominatimReverseResponse;

    return this.extractCityName(data);
  }

  parseCoordinates(value: string): Coordinates | null {
    if (!value.includes(',')) {
      return null;
    }

    const [latText, lngText] = value.split(',').map(part => part.trim());
    const lat = Number(latText);
    const lng = Number(lngText);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }

    return { lat, lng };
  }

  private getCoordinates(value: string, lat?: number | null, lng?: number | null): Coordinates | null {
    if (typeof lat === 'number' && typeof lng === 'number') {
      return { lat, lng };
    }

    return this.parseCoordinates(value);
  }

  private extractCityName(data: NominatimReverseResponse): string {
    const address = data.address;
    const cityName = address?.city
      || address?.town
      || address?.village
      || data.display_name;

    return cityName || 'Unknown location';
  }

  private getGeocodeCacheKey(lat: number, lng: number): string {
    return `${lat.toFixed(5)},${lng.toFixed(5)}`;
  }
}
