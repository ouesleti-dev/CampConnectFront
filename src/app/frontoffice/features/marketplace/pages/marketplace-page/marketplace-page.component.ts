import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../shared/services/product.service';
import { OrderService } from '../../../../shared/services/order.service';
import {
  ProductRequest,
  ProductResponse,
  ProductCategory,
  ProductState,
  ProductStatus
} from '../../../../shared/models/product.model';
import { AuthService } from '../../../../shared/services/auth.service';
import { DeliveryService } from '../../../../shared/services/delivery.service';

@Component({
  selector: 'app-marketplace-page',
  templateUrl: './marketplace-page.component.html',
  styleUrl: './marketplace-page.component.css'
})
export class MarketplacePageComponent implements OnInit {

  orderDeliveries: { [key: number]: any } = {};
  ProductStatus = ProductStatus;
  categories = Object.values(ProductCategory);
  states = Object.values(ProductState);
selectedImageName = '';
imagePreview = '';
  
  activeTab: 'browse' | 'my-products' | 'add' | 'cart' | 'my-orders' = 'browse';

  
  approvedProducts: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  myProducts: ProductResponse[] = [];

  searchTerm = '';
  selectedCategory = '';
  myFilter: string = 'all';

cartItems: any[] = [];
cartCount = 0;
deliveryAddress = '';
paymentMethod = 'CASH';
paymentMethods = ['CASH', 'CREDIT_CARD'];
orderLoading = false;
orderSuccess = '';
orderError = '';


orders: any[] = [];
ordersLoading = false;
expandedOrderId: number | null = null;
 
  isEditing = false;
  editingId?: number;
  submitting = false;
  toastMessage = '';
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private deliveryService: DeliveryService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadApproved();
    this.loadMyProducts();
   this.orderService.cart$.subscribe(items => {
    this.cartItems = items;
    this.cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  });
  }

  private initForm(): void {
    this.productForm = this.fb.group({
      nameProduct: ['', Validators.required],
      descriptionProduct: ['', Validators.required],
      priceProduct: [null, [Validators.required, Validators.min(0)]],
      quantityProduct: [1, [Validators.required, Validators.min(1)]],
      photoProduct: [''],
      locationProduct: ['', Validators.required],
      category: ['', Validators.required],
      productState: [ProductState.AVAILABLE, Validators.required]
    });
  }

  // ── Load ──────────────────────────────────────────────────
  loadApproved(): void {
    this.productService.getApproved().subscribe({
      next: (data) => {
        this.approvedProducts = data;
        this.filteredProducts = data;
      },
      error: (err) => console.error(err)
    });
  }

  loadMyProducts(): void {
    this.productService.getMyProducts().subscribe({
      next: (data) => this.myProducts = data,
      error: (err) => console.error(err)
    });
  }

  // ── Filter ────────────────────────────────────────────────
  filterProducts(): void {
    this.filteredProducts = this.approvedProducts.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nameProduct?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = !this.selectedCategory || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  getMyProductsByStatus(status: string): ProductResponse[] {
    return this.myProducts.filter(p => p.productStatus === status);
  }

  getFilteredMyProducts(): ProductResponse[] {
    if (this.myFilter === 'all') return this.myProducts;
    return this.myProducts.filter(p => p.productStatus === this.myFilter);
  }

  // ── Form Actions ──────────────────────────────────────────
  openAddForm(): void {
    this.isEditing = false;
    this.editingId = undefined;
    this.imagePreview = '';           
  this.selectedImageName = ''; 
    this.productForm.reset({
      productState: ProductState.AVAILABLE,
      quantityProduct: 1
    });
    this.activeTab = 'add';
  }

  editProduct(product: ProductResponse): void {
    this.isEditing = true;
    this.editingId = product.idProduct;
    this.imagePreview = product.photoProduct || '';
    this.productForm.patchValue(product);
    this.activeTab = 'add';
  }

  submitProduct(): void {
    if (this.productForm.invalid) return;
    this.submitting = true;
    const wasEditing = this.isEditing;
    const payload: ProductRequest = this.productForm.value;

    const request$ = wasEditing
      ? this.productService.update(this.editingId!, payload)
      : this.productService.add(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.isEditing = false;
        this.editingId = undefined;
        this.productForm.reset({ productState: ProductState.AVAILABLE, quantityProduct: 1 });
        this.loadMyProducts();
        this.loadApproved();
        this.activeTab = 'my-products';
        this.showToast(wasEditing ? 'Product updated! Pending approval.' : 'Product submitted for approval!');
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
      }
    });
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => {
        this.myProducts = this.myProducts.filter(p => p.idProduct !== id);
        this.showToast('Product deleted successfully!');
      },
      error: (err) => console.error(err)
    });
  }

  // ── Helpers ───────────────────────────────────────────────
  showToast(message: string): void {
    this.toastMessage = message;
    setTimeout(() => this.toastMessage = '', 3000);
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400';
  }

  getStateBadgeClass(state: string): string {
    const map: Record<string, string> = {
      'AVAILABLE': 'badge-available',
      'OUT_OF_STOCK': 'badge-outofstock',
      'UNAVAILABLE': 'badge-unavailable'
    };
    return map[state] || 'badge-available';
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'APPROVED': 'status-approved',
      'PENDING': 'status-pending',
      'REJECTED': 'status-rejected'
    };
    return map[status] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      'APPROVED': '✅',
      'PENDING': '⏳',
      'REJECTED': '❌'
    };
    return map[status] || '⏳';
  }
  addToCart(product: ProductResponse): void {
  this.orderService.addToCart(product, 1);
  this.showToast(`🛒 ${product.nameProduct} added to cart!`);
}
// ── Cart Methods ──────────────────────────────────────────
getCartTotal(): number { return this.orderService.getCartTotal(); }
removeFromCart(productId: number): void { this.orderService.removeFromCart(productId); }
updateQty(productId: number, qty: number): void { this.orderService.updateQuantity(productId, qty); }

placeOrder(): void {
  if (!this.deliveryAddress.trim()) {
    this.orderError = 'Please enter a delivery address.';
    return;
  }

  const userId = this.authService.getIdUser();
  if (!userId) {
    this.orderError = 'You must be logged in.';
    return;
  }

  this.orderLoading = true;
  this.orderError = '';
  this.orderSuccess = '';

  const request = {
    userId: userId,  // ✅ maintenant garanti non-null
    deliveryAddress: this.deliveryAddress,
    paymentMethod: this.paymentMethod,
    items: this.cartItems.map(i => ({
      productId: i.product.idProduct,
      quantity: i.quantity
    }))
  };

  this.orderService.createOrder(request).subscribe({
    next: () => {
      this.orderService.clearCart();
      this.orderSuccess = '✅ Order placed successfully!';
      this.orderLoading = false;
      this.deliveryAddress = '';
      setTimeout(() => {
        this.orderSuccess = '';
        this.loadMyOrders();
        this.activeTab = 'my-orders';
      }, 1500);
    },
    error: (err) => {
      this.orderError = err.error?.message || 'Failed to place order.';
      this.orderLoading = false;
    }
  });
}

// ── Orders Methods ────────────────────────────────────────
loadMyOrders(): void {
  const userId = this.authService.getIdUser();
  if (!userId) return;
  this.ordersLoading = true;
  this.orderService.getMyOrders(userId).subscribe({
    next: data => { this.orders = data; this.ordersLoading = false; },
    error: () => this.ordersLoading = false
  });
}
loadDeliveryForOrder(orderId: number): void {
  if (this.orderDeliveries[orderId]) return; // déjà chargé
  this.deliveryService.getDeliveriesByOrder(orderId).subscribe({
    next: data => {
      this.orderDeliveries[orderId] = data.length > 0 ? data[0] : null;
    }
  });
}
toggleOrder(id: number): void {
  this.expandedOrderId = this.expandedOrderId === id ? null : id;
  if (this.expandedOrderId) {
    this.loadDeliveryForOrder(id); 
  }
}
confirmOrder(orderId: number): void {
  if (!confirm('Confirm this order?')) return;
  this.orderService.confirmOrder(orderId).subscribe({
    next: () => {
      this.showToast('✅ Order confirmed! Waiting for admin approval.');
      this.loadMyOrders();
    },
    error: () => this.showToast('❌ Failed to confirm order.')
  });
}
cancelOrder(orderId: number): void {
  if (!confirm('Cancel and delete this order?')) return;
  this.orderService.deleteOrder(orderId).subscribe({
    next: () => {
      this.orders = this.orders.filter(o => o.idOrder !== orderId);
      this.showToast('🚫 Order cancelled and deleted.');
    },
    error: () => this.showToast('❌ Failed to delete order.')
  });
}

getStatusBadge(status: string): string {
  const map: any = {
    'PENDING': 'bg-warning text-dark',
    'CONFIRMED': 'bg-primary',
    'APPROVED': 'bg-success',
    'CANCELLED': 'bg-danger',
    'REJECTED': 'bg-danger'
  };
  return map[status] || 'bg-secondary';
}
getEffectiveState(product: ProductResponse): string {
  return product.quantityProduct === 0 ? 'OUT_OF_STOCK' : product.productState!;
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
      this.productForm.patchValue({ photoProduct: compressed }); // ✅ stocke en Base64
    };
    img.src = e.target?.result as string;
  };
  reader.readAsDataURL(file);
}
}
