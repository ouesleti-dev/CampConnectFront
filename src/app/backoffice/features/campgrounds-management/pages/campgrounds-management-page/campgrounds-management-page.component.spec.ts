import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampgroundsManagementPageComponent } from './campgrounds-management-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Import indispensable

describe('CampgroundsManagementPageComponent', () => {
  let component: CampgroundsManagementPageComponent;
  let fixture: ComponentFixture<CampgroundsManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ], // ✅ Ajouté ici
      declarations: [ CampgroundsManagementPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampgroundsManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});