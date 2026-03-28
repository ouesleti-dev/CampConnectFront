import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RentalService } from '../../../../shared/services/rental.service';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { EquipmentResponse } from '../../../../shared/models/equipment.model';

@Component({
  selector: 'app-rent-equipment',
  templateUrl: './rent-equipment.component.html',
  styleUrl: './rent-equipment.component.css'
})
export class RentEquipmentComponent implements OnInit {
  equipments: EquipmentResponse[] = [];
  rentalForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private rentalService: RentalService,
    private equipmentService: EquipmentService,
    private router: Router
  ) {
    this.rentalForm = this.fb.group({
      equipmentId: ['', Validators.required],
      startDate:   ['', Validators.required],
      endDate:     ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.equipmentService.getVerifiedEquipments().subscribe({
      next: (data) => this.equipments = data,
      error: (err) => console.error(err)
    });
  }

  onSubmit(): void {
    if (this.rentalForm.invalid) return;
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.rentalService.requestRental(this.rentalForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Rental request sent successfully!';
        this.rentalForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Equipment not available for these dates';
      }
    });
  }
}