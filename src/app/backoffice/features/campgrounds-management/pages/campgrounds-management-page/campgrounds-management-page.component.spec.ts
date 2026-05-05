import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CampgroundsManagementPageComponent } from './campgrounds-management-page.component';

describe('CampgroundsManagementPageComponent', () => {
  let component: CampgroundsManagementPageComponent;
  let fixture: ComponentFixture<CampgroundsManagementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampgroundsManagementPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampgroundsManagementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
