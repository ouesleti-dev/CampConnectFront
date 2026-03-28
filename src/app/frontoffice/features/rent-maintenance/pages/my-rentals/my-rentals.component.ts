import { Component, OnInit } from '@angular/core';
import { RentalService } from '../../../../shared/services/rental.service';
import { RentalResponse } from '../../../../shared/models/rental.model';

@Component({
  selector: 'app-my-rentals',
  templateUrl: './my-rentals.component.html',
  styleUrl: './my-rentals.component.css'
})
export class MyRentalsComponent implements OnInit {
  rentals: RentalResponse[] = [];

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.rentalService.getMyRentals().subscribe({
      next: (data) => this.rentals = data,
      error: (err) => console.error(err)
    });
  }
}