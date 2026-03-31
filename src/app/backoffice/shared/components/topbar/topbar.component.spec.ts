import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../../../frontoffice/shared/services/auth.service';
import { TopbarComponent } from './topbar.component';

class MockAuthService {
  getEmail(): string | null { return 'admin@test.com'; }
  logout(): void {}
}

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ TopbarComponent ],
      providers: [{ provide: AuthService, useClass: MockAuthService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});