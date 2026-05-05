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
import { ProductReviewService } from '../../../../shared/services/product-review.service';
import { ProductReviewResponse } from '../../../../shared/models/product-review.model';
import { CouponResponse } from '../../../../shared/models/coupon.model';
import * as L from 'leaflet';
import { AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-marketplace-page',
  templateUrl: './marketplace-page.component.html',
  styleUrl: './marketplace-page.component.css'
})
export class MarketplacePageComponent implements OnInit, AfterViewInit  {

  orderDeliveries: { [key: number]: any } = {};
  ProductStatus = ProductStatus;
  categories = Object.values(ProductCategory);
  states = Object.values(ProductState);
selectedImageName = '';
imagePreview = '';
  
  activeTab: 'browse' | 'my-products' | 'add' | 'cart' | 'my-orders' = 'browse';

  
  approvedProducts: ProductResponse[] = [];
  filteredProducts: ProductResponse[] = [];
  inStockProducts: ProductResponse[] = [];
  outOfStockProducts: ProductResponse[] = [];
  myProducts: ProductResponse[] = [];
  activeDeliveries: any[] = [];
activeDeliveriesLoading = false;
// Ajouter ces champs
deliveryLat: number | null = null;
deliveryLng: number | null = null;

  searchTerm = '';
  selectedCategory = '';
  myFilter: string = 'all';

  // ── Pagination: Browse ────────────────────────────────────
  currentPage = 1;
  readonly pageSize = 12;

  get totalPages(): number {
    return Math.ceil(this.inStockProducts.length / this.pageSize);
  }

  get paginatedInStock(): ProductResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.inStockProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Pagination: My Products ───────────────────────────────
  myProductsPage = 1;
  readonly myProductsPageSize = 8;

  get myProductsTotalPages(): number {
    return Math.ceil(this.getFilteredMyProducts().length / this.myProductsPageSize);
  }

  get paginatedMyProducts(): ProductResponse[] {
    const all = this.getFilteredMyProducts();
    const start = (this.myProductsPage - 1) * this.myProductsPageSize;
    return all.slice(start, start + this.myProductsPageSize);
  }

  get myProductsPageNumbers(): number[] {
    return Array.from({ length: this.myProductsTotalPages }, (_, i) => i + 1);
  }

  goToMyProductsPage(page: number): void {
    if (page < 1 || page > this.myProductsTotalPages) return;
    this.myProductsPage = page;
  }

  // ── Pagination: My Orders ─────────────────────────────────
  ordersPage = 1;
  readonly ordersPageSize = 5;

  get ordersTotalPages(): number {
    return Math.ceil(this.orders.length / this.ordersPageSize);
  }

  get paginatedOrders(): any[] {
    const start = (this.ordersPage - 1) * this.ordersPageSize;
    return this.orders.slice(start, start + this.ordersPageSize);
  }

  get ordersPageNumbers(): number[] {
    return Array.from({ length: this.ordersTotalPages }, (_, i) => i + 1);
  }

  goToOrdersPage(page: number): void {
    if (page < 1 || page > this.ordersTotalPages) return;
    this.ordersPage = page;
  }

cartItems: any[] = [];
cartCount = 0;
deliveryAddress = '';
paymentMethod = 'CASH';
paymentMethods = ['CASH', 'CREDIT_CARD'];
orderLoading = false;
orderSuccess = '';
orderError = '';

// ── Coupon ────────────────────────────────────────────────
couponCode = '';
appliedCoupon: CouponResponse | null = null;
couponLoading = false;
couponError = '';
couponSuccess = '';


orders: any[] = [];
ordersLoading = false;
expandedOrderId: number | null = null;
 
  isEditing = false;
  editingId?: number;
  submitting = false;
  toastMessage = '';
  productForm!: FormGroup;
  map: any = null;
mapMarker: any = null;
showMap = false;
mapSearchQuery = '';
mapSearchResults: any[] = [];
mapSearchLoading = false;
// ── Delivery Map ──────────────────────────────────────────
showDeliveryMap = false;
deliveryMap: any = null;
deliveryMapMarker: any = null;
deliveryMapSearchQuery = '';
deliveryMapSearchResults: any[] = [];
deliveryMapSearchLoading = false;
deliveryGpsLoading = false;

  // ── Reviews ───────────────────────────────────────────────
  reviewModalProduct: ProductResponse | null = null;
  productReviews: ProductReviewResponse[] = [];
  reviewsLoading = false;
  reviewRating = 0;
  reviewComment = '';
  reviewHoverRating = 0;
  reviewSubmitting = false;
  reviewError = '';
  hasReviewed = false;

  // ── Geo Filter ────────────────────────────────────────────
  geoFilterActive = false;
  geoRadius = 50;
  userLat: number | null = null;
  userLng: number | null = null;
  geoLoading = false;

  // ── Recommendations ───────────────────────────────────────
  recommendations: ProductResponse[] = [];
  recommendationsLoading = false;
  recommendationsForProduct: ProductResponse | null = null;

  // ── Product Detail Modal ──────────────────────────────────
  selectedProduct: ProductResponse | null = null;

  openProductModal(product: ProductResponse): void {
    this.selectedProduct = product;
    this.loadRecommendations(product);
  }

  closeProductModal(): void {
    this.selectedProduct = null;
    this.recommendations = [];
    this.recommendationsForProduct = null;
    this.recommendationsLoading = false;
  }

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private deliveryService: DeliveryService,
    private reviewService: ProductReviewService
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
      latitude: [null],
      longitude: [null],
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
        this.inStockProducts    = data.filter(p => p.quantityProduct > 0);
        this.outOfStockProducts = data.filter(p => p.quantityProduct === 0);
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
    const matched = this.approvedProducts.filter(p => {
      const matchSearch = !this.searchTerm ||
        p.nameProduct?.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = !this.selectedCategory || p.category === this.selectedCategory;
      const matchGeo = !this.geoFilterActive || this.isWithinRadius(p);
      return matchSearch && matchCat && matchGeo;
    });
    this.inStockProducts  = matched.filter(p => p.quantityProduct > 0);
    this.outOfStockProducts = matched.filter(p => p.quantityProduct === 0);
    this.filteredProducts = matched;
    this.currentPage = 1;
  }

  private isWithinRadius(p: ProductResponse): boolean {
    if (this.userLat === null || this.userLng === null || !p.latitude || !p.longitude) return false;
    const R = 6371;
    const dLat = (p.latitude - this.userLat) * Math.PI / 180;
    const dLng = (p.longitude - this.userLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2
      + Math.cos(this.userLat * Math.PI / 180) * Math.cos(p.latitude * Math.PI / 180)
      * Math.sin(dLng / 2) ** 2;
    const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return dist <= this.geoRadius;
  }

  getMyProductsByStatus(status: string): ProductResponse[] {
    return this.myProducts.filter(p => p.productStatus === status);
  }

  getFilteredMyProducts(): ProductResponse[] {
    if (this.myFilter === 'all') return this.myProducts;
    return this.myProducts.filter(p => p.productStatus === this.myFilter);
  }

  setMyFilter(filter: string): void {
    this.myFilter = filter;
    this.myProductsPage = 1;
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
    this.showToast(`${product.nameProduct} added to cart!`);
  }

  loadRecommendations(product: ProductResponse): void {
    this.recommendationsForProduct = product;
    this.recommendations = [];
    this.recommendationsLoading = true;
    console.log('[REC] Loading recommendations for product ID:', product.idProduct);
    this.productService.getRecommendations(product.idProduct!).subscribe({
      next: (data) => {
        console.log('[REC] Received:', data);
        this.recommendations = data;
        this.recommendationsLoading = false;
      },
      error: (err) => {
        console.error('[REC] Error:', err);
        this.recommendationsLoading = false;
      }
    });
  }
// ── Cart Methods ──────────────────────────────────────────
getCartTotal(): number { return this.orderService.getCartTotal(); }
removeFromCart(productId: number): void { this.orderService.removeFromCart(productId); }
updateQty(productId: number, qty: number): void { this.orderService.updateQuantity(productId, qty); }

getCartTotalAfterDiscount(): number {
  const total = this.getCartTotal();
  if (this.appliedCoupon) {
    return Math.round(total * (1 - this.appliedCoupon.discountPercentage / 100) * 100) / 100;
  }
  return total;
}

getDiscountAmount(): number {
  if (!this.appliedCoupon) return 0;
  return Math.round(this.getCartTotal() * this.appliedCoupon.discountPercentage / 100 * 100) / 100;
}

applyCoupon(): void {
  if (!this.couponCode.trim()) return;
  this.couponLoading = true;
  this.couponError = '';
  this.couponSuccess = '';
  this.appliedCoupon = null;

  this.orderService.validateCoupon(this.couponCode.trim()).subscribe({
    next: (res) => {
      this.couponLoading = false;
      if (res.valid) {
        this.appliedCoupon = res;
        this.couponSuccess = res.message;
      } else {
        this.couponError = res.message;
      }
    },
    error: () => {
      this.couponLoading = false;
      this.couponError = 'Erreur lors de la validation du code.';
    }
  });
}

removeCoupon(): void {
  this.appliedCoupon = null;
  this.couponCode = '';
  this.couponSuccess = '';
  this.couponError = '';
}

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
    userId: userId,
    deliveryAddress: this.deliveryAddress,
    deliveryLat: this.deliveryLat,   // ← NOUVEAU
  deliveryLng: this.deliveryLng,
    paymentMethod: this.paymentMethod,
    items: this.cartItems.map(i => ({
      productId: i.product.idProduct,
      quantity: i.quantity
    })),
    couponCode: this.appliedCoupon?.code || undefined
  };

  this.orderService.createOrder(request).subscribe({
    next: () => {
      this.orderService.clearCart();
      this.orderSuccess = '✅ Order placed successfully!';
      this.orderLoading = false;
      this.deliveryAddress = '';
      this.removeCoupon();
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
    next: data => {
      this.orders = data.sort((a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
      );
      this.ordersLoading = false;
      this.ordersPage = 1;
    },
    error: () => this.ordersLoading = false
  });
  this.loadActiveDeliveries();
}
loadDeliveryForOrder(orderId: number): void {
  if (this.orderDeliveries[orderId]) return; // déjà chargé
  this.deliveryService.getDeliveriesByOrder(orderId).subscribe({
    next: data => {
      this.orderDeliveries[orderId] = data.length > 0 ? data[0] : null;
    }
  });
}
trackByOrderId(_: number, order: any): number {
  return +order.idOrder;
}
toggleOrder(id: any): void {
  const numId = +id;
  this.expandedOrderId = this.expandedOrderId === numId ? null : numId;
  if (this.expandedOrderId !== null) {
    this.loadDeliveryForOrder(this.expandedOrderId);
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
loadActiveDeliveries(): void {
  const userId = this.authService.getIdUser();
  if (!userId) return;
  this.activeDeliveriesLoading = true;
  this.deliveryService.getActiveDeliveriesForCustomer(userId).subscribe({
    next: data => {
      this.activeDeliveries = data;
      this.activeDeliveriesLoading = false;
    },
    error: () => this.activeDeliveriesLoading = false
  });
}
// ── Map Methods ───────────────────────────────────────────
toggleMap(): void {
  this.showMap = !this.showMap;
  if (this.showMap) {
    setTimeout(() => this.initMap(), 100);
  }
}

initMap(): void {
  if (this.map) {
    this.map.remove();
    this.map = null;
  }

  // Default center: Tunisia
  this.map = L.map('product-location-map').setView([36.8065, 10.1815], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  // If already has a location, try to geocode and center
  const existingLocation = this.productForm.get('locationProduct')?.value;
  if (existingLocation) {
    this.geocodeAndCenter(existingLocation);
  }

  // Click on map → reverse geocode → fill input
  this.map.on('click', (e: any) => {
    const { lat, lng } = e.latlng;
    this.reverseGeocode(lat, lng);
  });
}

geocodeAndCenter(address: string): void {
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1&accept-language=fr`)
    .then(r => r.json())
    .then(data => {
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        this.map.setView([lat, lng], 13);
        if (this.mapMarker) this.map.removeLayer(this.mapMarker);
        this.mapMarker = L.marker([lat, lng]).addTo(this.map);
        this.productForm.patchValue({ latitude: lat, longitude: lng });
      }
    });
}

reverseGeocode(lat: number, lng: number): void {
  if (this.mapMarker) this.map.removeLayer(this.mapMarker);
  this.mapMarker = L.marker([lat, lng]).addTo(this.map);

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`)
    .then(r => r.json())
    .then(data => {
      const short = this.formatAddress(data);
      this.productForm.patchValue({ locationProduct: short, latitude: lat, longitude: lng });
      this.mapMarker.bindPopup(`📍 ${short}`).openPopup();
    })
    .catch(() => {
      const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      this.productForm.patchValue({ locationProduct: fallback, latitude: lat, longitude: lng });
    });
}

formatAddress(data: any): string {
  const a = data.address || {};
  const parts = [
    a.road || a.pedestrian || a.suburb,
    a.city || a.town || a.village || a.county,
    a.state,
    a.country
  ].filter(Boolean);
  return parts.join(', ') || data.display_name;
}

searchAddress(): void {
  if (!this.mapSearchQuery.trim()) return;
  this.mapSearchLoading = true;
  this.mapSearchResults = [];

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.mapSearchQuery)}&limit=5&addressdetails=1&accept-language=fr`)
    .then(r => r.json())
    .then(data => {
      this.mapSearchResults = data;
      this.mapSearchLoading = false;
    })
    .catch(() => this.mapSearchLoading = false);
}

selectSearchResult(result: any): void {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  this.map.setView([lat, lng], 14);

  if (this.mapMarker) this.map.removeLayer(this.mapMarker);
  this.mapMarker = L.marker([lat, lng]).addTo(this.map);

  const short = result.display_name.split(',').slice(0, 3).join(',').trim();
  this.productForm.patchValue({ locationProduct: short, latitude: lat, longitude: lng });
  this.mapMarker.bindPopup(`📍 ${short}`).openPopup();
  this.mapSearchResults = [];
  this.mapSearchQuery = '';
}

ngAfterViewInit(): void {}
toggleDeliveryMap(): void {
  this.showDeliveryMap = !this.showDeliveryMap;
  if (this.showDeliveryMap) {
    setTimeout(() => this.initDeliveryMap(), 100);
  }
}

initDeliveryMap(): void {
  if (this.deliveryMap) {
    this.deliveryMap.remove();
    this.deliveryMap = null;
  }

  this.deliveryMap = L.map('delivery-location-map').setView([36.8065, 10.1815], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.deliveryMap);

  // If already has address, center on it
  if (this.deliveryAddress) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.deliveryAddress)}&limit=1&addressdetails=1&accept-language=fr`)
      .then(r => r.json())
      .then(data => {
        if (data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          this.deliveryMap.setView([lat, lng], 13);
          this.deliveryMapMarker = L.marker([lat, lng]).addTo(this.deliveryMap);
        }
      });
  }

  // Click on map → reverse geocode
 this.deliveryMap.on('click', (e: any) => {
  const { lat, lng } = e.latlng;
  // ── SAUVEGARDER les coords ────────────────────────────
  this.deliveryLat = lat;
  this.deliveryLng = lng;
  // ─────────────────────────────────────────────────────
  if (this.deliveryMapMarker) this.deliveryMap.removeLayer(this.deliveryMapMarker);
  this.deliveryMapMarker = L.marker([lat, lng]).addTo(this.deliveryMap);

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`)
    .then(r => r.json())
    .then(data => {
      const short = this.formatAddress(data);
      this.deliveryAddress = short;
      this.deliveryMapMarker.bindPopup(`📍 ${short}`).openPopup();
    });
});
}

searchDeliveryAddress(): void {
  if (!this.deliveryMapSearchQuery.trim()) return;
  this.deliveryMapSearchLoading = true;
  this.deliveryMapSearchResults = [];

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.deliveryMapSearchQuery)}&limit=5`)
    .then(r => r.json())
    .then(data => {
      this.deliveryMapSearchResults = data;
      this.deliveryMapSearchLoading = false;
    })
    .catch(() => this.deliveryMapSearchLoading = false);
}

selectDeliverySearchResult(result: any): void {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
    this.deliveryLat = lat;
  this.deliveryLng = lng;
  this.deliveryMap.setView([lat, lng], 14);

  if (this.deliveryMapMarker) this.deliveryMap.removeLayer(this.deliveryMapMarker);
  this.deliveryMapMarker = L.marker([lat, lng]).addTo(this.deliveryMap);

  const short = result.display_name.split(',').slice(0, 3).join(',').trim();
  this.deliveryAddress = short;
  this.deliveryMapMarker.bindPopup(`📍 ${short}`).openPopup();
  this.deliveryMapSearchResults = [];
  this.deliveryMapSearchQuery = '';
}

useMyLocationForDelivery(): void {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  this.deliveryGpsLoading = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
         this.deliveryLat = lat;
      this.deliveryLng = lng;

      this.deliveryMap.setView([lat, lng], 15);

      if (this.deliveryMapMarker) this.deliveryMap.removeLayer(this.deliveryMapMarker);
      this.deliveryMapMarker = L.marker([lat, lng]).addTo(this.deliveryMap);

      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`)
        .then(r => r.json())
        .then(data => {
          const short = this.formatAddress(data);
          this.deliveryAddress = short;
          this.deliveryMapMarker.bindPopup(`📍 ${short}`).openPopup();
          this.deliveryGpsLoading = false;
        })
        .catch(() => {
          this.deliveryAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          this.deliveryGpsLoading = false;
        });
    },
    (error) => {
      this.deliveryGpsLoading = false;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert('❌ Location access denied.');
          break;
        default:
          alert('❌ Could not get your location.');
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
gpsLoading = false;
gpsWarning = false;

  // ── Review Methods ────────────────────────────────────────
  openReviewModal(product: ProductResponse): void {
    this.reviewModalProduct = product;
    this.reviewRating = 0;
    this.reviewComment = '';
    this.reviewError = '';
    this.reviewsLoading = true;
    this.hasReviewed = false;

    const userId = this.authService.getIdUser();

    this.reviewService.getReviewsByProduct(product.idProduct).subscribe({
      next: data => {
        this.productReviews = data;
        this.reviewsLoading = false;
        if (userId) {
          this.hasReviewed = data.some(r => r.reviewerId === userId);
        }
      },
      error: () => this.reviewsLoading = false
    });
  }

  closeReviewModal(): void {
    this.reviewModalProduct = null;
    this.productReviews = [];
  }

  setReviewRating(star: number): void {
    this.reviewRating = star;
  }

  submitReview(): void {
    if (this.reviewRating === 0) {
      this.reviewError = 'Please select a rating.';
      return;
    }
    if (!this.reviewModalProduct) return;

    this.reviewSubmitting = true;
    this.reviewError = '';

    this.reviewService.addReview({
      productId: this.reviewModalProduct.idProduct,
      rating: this.reviewRating,
      comment: this.reviewComment
    }).subscribe({
      next: (newReview) => {
        this.productReviews.unshift(newReview);
        this.hasReviewed = true;
        this.reviewRating = 0;
        this.reviewComment = '';
        this.reviewSubmitting = false;
        this.loadApproved();
      },
      error: (err) => {
        this.reviewError = err.error?.message || 'Failed to submit review.';
        this.reviewSubmitting = false;
      }
    });
  }

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // ── Geo Filter Methods ────────────────────────────────────
  toggleGeoFilter(): void {
    if (this.geoFilterActive) {
      this.geoFilterActive = false;
      this.userLat = null;
      this.userLng = null;
      this.filterProducts();
      return;
    }
    this.geoLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.userLat = pos.coords.latitude;
        this.userLng = pos.coords.longitude;
        this.geoFilterActive = true;
        this.geoLoading = false;
        this.filterProducts();
      },
      () => {
        this.geoLoading = false;
        alert('Impossible de récupérer votre position.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  useMyLocation(): void {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser.');
    return;
  }

  this.gpsLoading = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Center map on user position
      this.map.setView([lat, lng], 15);

      // Place marker
      if (this.mapMarker) this.map.removeLayer(this.mapMarker);
      this.mapMarker = L.marker([lat, lng]).addTo(this.map);

      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=fr`)
        .then(r => r.json())
        .then(data => {
          const short = this.formatAddress(data);
          this.productForm.patchValue({ locationProduct: short, latitude: lat, longitude: lng });
          this.mapMarker.bindPopup(`📍 ${short}`).openPopup();
          this.gpsLoading = false;
          this.gpsWarning = true;
        })
        .catch(() => {
          this.productForm.patchValue({
            locationProduct: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            latitude: lat, longitude: lng
          });
          this.gpsLoading = false;
          this.gpsWarning = true;
        });
    },
    (error) => {
      this.gpsLoading = false;
      switch(error.code) {
        case error.PERMISSION_DENIED:
          alert('❌ Location access denied. Please allow location in your browser.');
          break;
        case error.POSITION_UNAVAILABLE:
          alert('❌ Location unavailable.');
          break;
        default:
          alert('❌ Could not get your location.');
      }
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}
openReviewFromModal(product: ProductResponse): void {
  const p = product; // capture avant de fermer
  this.closeProductModal();
  this.openReviewModal(p);
}
}