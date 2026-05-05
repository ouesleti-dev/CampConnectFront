import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RegisterRequest, LoginRequest, AuthResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'https://campconnect-backend-gtcgcgcpefbqh4gb.austriaeast-01.azurewebsites.net/campConnect/auth';

  constructor(private http: HttpClient) {}


  register(data: RegisterRequest): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/register`, data, {
      responseType: 'text' as 'json'
    });
  }


  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('email', response.email);
        localStorage.setItem('role', response.role);
        localStorage.setItem('idUser', response.idUser.toString());
      })
    );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
  }
  getIdUser(): number | null {
  const id = localStorage.getItem('idUser');
  return id ? parseInt(id) : null;
}


  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  hasRole(role: string): boolean {
    return this.getRole() === role;
  }
}
