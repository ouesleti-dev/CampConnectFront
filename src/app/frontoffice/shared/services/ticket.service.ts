import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TicketDTO } from '../models/camping-forum.models';

@Injectable({ providedIn: 'root' })
export class TicketService {
  constructor(private api: ApiService) {}

  // Générer un ticket pour un event
  generateTicket(eventId: number): Observable<TicketDTO> {
    return this.api.post<TicketDTO>(`/tickets/generate/${eventId}`, {});
  }

  // Mes tickets
  getMyTickets(): Observable<TicketDTO[]> {
    return this.api.get<TicketDTO[]>('/tickets/my');
  }

  // Tickets d'un event (backoffice)
  getTicketsByEvent(eventId: number): Observable<TicketDTO[]> {
    return this.api.get<TicketDTO[]>(`/tickets/event/${eventId}`);
  }

  // Valider un ticket (backoffice)
  validateTicket(ticketCode: string): Observable<TicketDTO> {
    return this.api.put<TicketDTO>(`/tickets/validate/${ticketCode}`, {});
  }

  // Annuler un ticket
  cancelTicket(id: number): Observable<void> {
    return this.api.put<void>(`/tickets/cancel/${id}`, {});
  }
}