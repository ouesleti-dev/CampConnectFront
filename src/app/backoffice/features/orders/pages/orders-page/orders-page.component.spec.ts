import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersPageComponent } from './orders-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
describe('OrdersPageComponent', () => {
  let component: OrdersPageComponent;
  let fixture: ComponentFixture<OrdersPageComponent>;

  beforeEach(async () => {   // ✅ correction ici
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ OrdersPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});