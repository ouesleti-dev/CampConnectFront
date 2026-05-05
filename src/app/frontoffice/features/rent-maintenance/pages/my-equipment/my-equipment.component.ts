import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { EquipmentResponse, EquipmentType } from '../../../../shared/models/equipment.model';

@Component({
  selector: 'app-my-equipment',
  templateUrl: './my-equipment.component.html',
  styleUrl: './my-equipment.component.css'
})
export class MyEquipmentComponent implements OnInit {

  equipments: EquipmentResponse[] = [];
  equipmentForm: FormGroup;
  showForm = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  selectedImageName = '';
  imagePreview: string | null = null;
  types = Object.values(EquipmentType);

  // mode édition
  isEditMode = false;
  editingId: number | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private fb: FormBuilder
  ) {
    this.equipmentForm = this.fb.group({
      name:        ['', Validators.required],
      type:        ['', Validators.required],
      description: ['', Validators.required],
      price:       ['', [Validators.required, Validators.min(0)]],
      picture:     ['']
    });
  }

  ngOnInit(): void {
    this.loadMyEquipments();
  }

  loadMyEquipments(): void {
    this.equipmentService.getMyEquipments().subscribe({
      next: (data) => this.equipments = data,
      error: (err) => console.error(err)
    });
  }

  toggleAddForm(): void {
    if (this.showForm && !this.isEditMode) {
      this.resetForm();
    } else {
      this.resetForm();
      this.showForm = true;
    }
  }

  editEquipment(eq: EquipmentResponse): void {
    this.isEditMode = true;
    this.editingId = eq.idEquipement;
    this.showForm = true;
    this.imagePreview = eq.picture || null;
    this.successMessage = '';
    this.errorMessage = '';

    this.equipmentForm.patchValue({
      name:        eq.name,
      type:        eq.type,
      description: eq.description,
      price:       eq.price,
      picture:     eq.picture
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetForm(): void {
    this.isEditMode = false;
    this.editingId = null;
    this.showForm = false;
    this.imagePreview = null;
    this.selectedImageName = '';
    this.successMessage = '';
    this.errorMessage = '';
    this.equipmentForm.reset();
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.selectedImageName = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        this.imagePreview = compressed;
        this.equipmentForm.patchValue({ picture: compressed });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.equipmentForm.invalid) return;

    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const dto = this.equipmentForm.value;

    if (this.isEditMode && this.editingId !== null) {
      // ✅ UPDATE
      this.equipmentService.updateEquipment(this.editingId, dto).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Equipment updated successfully!';
          this.loadMyEquipments();
          setTimeout(() => this.resetForm(), 1500);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Error while updating equipment.';
        }
      });
    } else {
      // ✅ CREATE
      this.equipmentService.createEquipment(dto).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Equipment added successfully!';
          this.loadMyEquipments();
          setTimeout(() => this.resetForm(), 1500);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Error while adding equipment.';
        }
      });
    }
  }

  deleteEquipment(id: number): void {
    if (confirm('Delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe({
        next: () => this.loadMyEquipments(),
        error: () => this.errorMessage = 'Failed to delete equipment.'
      });
    }
  }
}