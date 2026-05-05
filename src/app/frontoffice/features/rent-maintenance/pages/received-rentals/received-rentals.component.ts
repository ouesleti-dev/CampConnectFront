import { Component, OnInit } from '@angular/core';
import { RentalService } from '../../../../shared/services/rental.service';
import { RentalResponse } from '../../../../shared/models/rental.model';

@Component({
  selector: 'app-received-rentals',
  templateUrl: './received-rentals.component.html',
  styleUrl: './received-rentals.component.css'
})
export class ReceivedRentalsComponent implements OnInit {
  rentals: RentalResponse[] = [];
  successMessage = '';
  errorMessage = '';

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.rentalService.getReceivedRentals().subscribe({
      next: (data) => this.rentals = data,
      error: (err) => console.error(err)
    });
  }

  accept(id: number): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.rentalService.acceptRental(id).subscribe({
      next: () => {
        this.successMessage = 'Rental accepted successfully!';
        this.load();
      },
      error: () => this.errorMessage = 'Error while accepting rental'
    });
  }
}