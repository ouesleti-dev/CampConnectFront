import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OptionServiceService } from '../../../../shared/services/option-service.service';
import {
  OptionServiceRequest,
  OptionServiceResponse
} from '../../../../shared/models/option-service.model';

@Component({
  selector: 'app-option-service',
  templateUrl: './option-service.component.html',
  styleUrls: ['./option-service.component.css']
})
export class OptionServiceComponent implements OnInit {
  optionForm!: FormGroup;
  myOptions: OptionServiceResponse[] = [];
  selectedVehicleId: number | null = null;
  isLoading = false;
  showForm = false;
  editMode = false;
  editOptionId: number | null = null;
  successMessage = '';
  errorMessage = '';

  readonly optionTypes: string[] = ['Confort', 'coffee_Break', 'WI_FI'];

  constructor(
    private fb: FormBuilder,
    private optionService: OptionServiceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams.subscribe(params => {
      if (params['vehicleId']) {
        this.selectedVehicleId = Number(params['vehicleId']);
        this.optionForm.patchValue({ vehicleId: this.selectedVehicleId });
        this.loadOptionsByVehicle(this.selectedVehicleId);
      } else {
        this.selectedVehicleId = null;
        this.loadAllOptions();
      }
    });
  }

  private initForm(): void {
    this.optionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      optionType: ['', Validators.required],
      vehicleId: [null, [Validators.required, Validators.min(1)]]
    });
  }

  loadAllOptions(): void {
    this.optionService.getAllOptions().subscribe({
      next: (data: OptionServiceResponse[]) => {
        this.myOptions = data;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des options.';
      }
    });
  }

  loadOptionsByVehicle(vehicleId: number): void {
    this.optionService.getByVehicleId(vehicleId).subscribe({
      next: (data: OptionServiceResponse[]) => {
        this.myOptions = data;
      },
      error: (err: any) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Erreur lors du chargement des options.';
      }
    });
  }

  onSubmit(): void {
    if (this.optionForm.invalid) {
      this.optionForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.isLoading = true;

    const optionPayload: OptionServiceRequest = {
      name: this.optionForm.get('name')?.value as string,
      price: Number(this.optionForm.get('price')?.value),
      optionType: this.optionForm.get('optionType')?.value as string,
      vehicleId: Number(this.optionForm.get('vehicleId')?.value)
    };

    if (this.editMode && this.editOptionId !== null) {
      this.optionService.updateOption(this.editOptionId, optionPayload).subscribe({
        next: (_updatedOption: OptionServiceResponse) => {
          this.successMessage = 'Option modifiee avec succes.';
          this.finishSubmit();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Erreur lors de la modification de l option.';
        }
      });
      return;
    }

    this.optionService.createOption(optionPayload).subscribe({
      next: (_createdOption: OptionServiceResponse) => {
        this.successMessage = 'Option ajoutee avec succes.';
        this.finishSubmit();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Erreur lors de l ajout de l option.';
      }
    });
  }

  editOption(option: OptionServiceResponse): void {
    this.clearMessages();
    this.editMode = true;
    this.showForm = true;
    this.editOptionId = option.optionId;
    this.optionForm.patchValue({
      name: option.name,
      price: option.price || 0,
      optionType: option.optionType,
      vehicleId: option.vehicleId
    });
  }

  deleteOption(optionId: number): void {
    this.clearMessages();

    this.optionService.deleteOption(optionId).subscribe({
      next: (_response: string) => {
        this.successMessage = 'Option supprimee avec succes.';
        this.refreshOptions();
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || 'Erreur lors de la suppression de l option.';
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

  resetForm(): void {
    this.optionForm.reset({
      price: 0,
      name: '',
      optionType: '',
      vehicleId: null
    });
    this.editMode = false;
    this.editOptionId = null;
    this.isLoading = false;
    this.showForm = false;
    this.clearMessages();
  }

  private finishSubmit(): void {
    this.isLoading = false;
    this.refreshOptions();
    this.resetForm();
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private refreshOptions(): void {
    if (this.selectedVehicleId !== null) {
      this.loadOptionsByVehicle(this.selectedVehicleId);
      return;
    }

    this.loadAllOptions();
  }
}
