import { Component,OnInit } from '@angular/core';
import { ProductResponse } from '../../../../../frontoffice/shared/models/product.model';
import { ProductService } from '../../../../../frontoffice/shared/services/product.service';

@Component({
  selector: 'app-product-m',
  templateUrl: './product-m.component.html',
  styleUrl: './product-m.component.css'
})
export class ProductMComponent implements OnInit {
 activeTab: 'pending' | 'approved' | 'rejected' = 'pending';

  pendingProducts: ProductResponse[] = [];
  approvedProducts: ProductResponse[] = [];
  rejectedProducts: ProductResponse[] = [];

  successMessage = '';
  errorMessage = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    // Produits en attente
    this.productService.getPending().subscribe({
      next: (res) => this.pendingProducts = res,
      error: (err) => console.error(err)
    });

    // Tous les produits pour approved et rejected
    this.productService.getAll().subscribe({
      next: (res) => {
        this.approvedProducts = res.filter(p => p.productStatus === 'APPROVED');
        this.rejectedProducts = res.filter(p => p.productStatus === 'REJECTED');
      },
      error: (err) => console.error(err)
    });
  }

  approveProduct(id: number): void {
    this.productService.approve(id).subscribe({
      next: () => {
        this.successMessage = 'Product approved!';
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Error approving product';
        setTimeout(() => this.errorMessage = '', 3000);
        console.error(err);
      }
    });
  }

  rejectProduct(id: number): void {
    this.productService.reject(id).subscribe({
      next: () => {
        this.successMessage = 'Product rejected!';
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Error rejecting product';
        setTimeout(() => this.errorMessage = '', 3000);
        console.error(err);
      }
    });
  }

  getCategoryName(category: any): string {
    return category?.name || category || '—';
  }
}
