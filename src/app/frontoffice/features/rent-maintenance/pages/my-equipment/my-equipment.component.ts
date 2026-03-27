import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EquipmentService } from '../../../../shared/services/equipment.service';
import { EquipmentResponse, EquipmentState, EquipmentType } from '../../../../shared/models/equipment.model';

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
  selectedImageBase64: string = '';      // ← ajoute
  selectedImageName: string = '';        // ← ajoute
  imagePreview: string | null = null;    // ← ajoute


  types = Object.values(EquipmentType);
  states = Object.values(EquipmentState);

  constructor(
    private equipmentService: EquipmentService,
    private fb: FormBuilder
  ) {
    this.equipmentForm = this.fb.group({
      name:        ['', Validators.required],
      type:        ['', Validators.required],
      description: ['', Validators.required],
      aviability:  ['', Validators.required],
      state:       ['', Validators.required],
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
  // ← ajoute cette méthode
  onImageSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  this.selectedImageName = file.name;

  // Compression via canvas
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Limite à 800px max
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
      
      // Qualité 0.7 = bonne compression
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      
      this.imagePreview = compressed;
      this.selectedImageBase64 = compressed;
      this.equipmentForm.patchValue({ picture: compressed });
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}

  onSubmit(): void {
    if (this.equipmentForm.invalid) return;
    this.successMessage = '';
    this.errorMessage = '';

    this.equipmentService.createEquipment(this.equipmentForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Equipment added successfully!';
        this.showForm = false;
        this.equipmentForm.reset();
        this.loadMyEquipments();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error while adding equipment';
      }
    });
  }

  deleteEquipment(id: number): void {
    if (confirm('Delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe({
        next: () => this.loadMyEquipments()
      });
    }
  }

}