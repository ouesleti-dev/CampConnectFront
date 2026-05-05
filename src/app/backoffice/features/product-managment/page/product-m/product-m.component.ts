import { Component,OnInit } from '@angular/core';
import { ProductResponse } from '../../../../../frontoffice/shared/models/product.model';
import { ProductService } from '../../../../../frontoffice/shared/services/product.service';
import { ChartData, ChartOptions, registerables, Chart } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-product-m',
  templateUrl: './product-m.component.html',
  styleUrl: './product-m.component.css'
})
export class ProductMComponent implements OnInit {
 activeTab: 'pending' | 'approved' | 'rejected' | 'analytics' = 'pending';

  pendingProducts: ProductResponse[] = [];
  approvedProducts: ProductResponse[] = [];
  rejectedProducts: ProductResponse[] = [];
  salesStats: any[] = [];

  successMessage = '';
  errorMessage = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadSalesStats();
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
 loadSalesStats(): void {
  this.productService.getSalesStats().subscribe({
    next: (res) => {
      this.salesStats = res;

      this.totalRevenue   = res.reduce((sum, s) => sum + s.totalRevenue, 0);
      this.totalUnitsSold = res.reduce((sum, s) => sum + s.totalQuantitySold, 0);
      this.totalBuyers    = res.reduce((sum, s) => sum + s.distinctBuyers, 0);

      this.barChartData = {
        labels: res.map(s => s.nameProduct),
        datasets: [
          { label: 'Revenue (TND)',   data: res.map(s => s.totalRevenue),      backgroundColor: '#3266ad' },
          { label: 'Units Sold',      data: res.map(s => s.totalQuantitySold), backgroundColor: '#1d9e75' },
          { label: 'Distinct Buyers', data: res.map(s => s.distinctBuyers),    backgroundColor: '#d85a30' },
        ]
      };

      this.donutChartData = {
        labels: res.map(s => s.nameProduct),
        datasets: [{
          data: res.map(s => s.totalRevenue),
          backgroundColor: ['#3266ad','#1d9e75','#d85a30','#ba7517','#993556','#888780','#7f77dd']
        }]
      };
    },
    error: (err) => console.error(err)
  });
}
barChartOptions: ChartOptions = {
  responsive: true,
  plugins: { legend: { position: 'top' } },
  scales: { y: { beginAtZero: true } }
};

barChartData: ChartData<'bar'> = {
  labels: [],
  datasets: [
    { label: 'Revenue (TND)', data: [], backgroundColor: '#3266ad' },
    { label: 'Units Sold',    data: [], backgroundColor: '#1d9e75' },
    { label: 'Distinct Buyers', data: [], backgroundColor: '#d85a30' },
  ]
};
totalRevenue = 0;
totalUnitsSold = 0;
totalBuyers = 0;

donutChartOptions: ChartOptions = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } }
};

donutChartData: ChartData<'doughnut'> = {
  labels: [],
  datasets: [{ data: [], backgroundColor: ['#3266ad','#1d9e75','#d85a30','#ba7517','#993556','#888780'] }]
};
}