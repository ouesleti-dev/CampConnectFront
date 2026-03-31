import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'; // ✅ Plus simple que RouterModule.forRoot
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core'; // ✅ Ajout indispensable

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule // ✅ Utilise celui-ci pour les tests
      ],
      declarations: [
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA] // ✅ Correction de l'erreur app-navbar
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Note : Vérifie bien que ta variable "title" dans app.component.ts 
  // est exactement 'camp-connect' (avec ou sans majuscules)
  it(`should have as title 'camp-connect'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('camp-connect');
  });
});