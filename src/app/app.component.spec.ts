import { TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RouterTestingModule } from '@angular/router/testing'; // ✅ Plus simple que RouterModule.forRoot

import { AppComponent } from './app.component';
// ✅ Ajout indispensable

import { NO_ERRORS_SCHEMA } from '@angular/core';


describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [
        RouterTestingModule // ✅ Utilise celui-ci pour les tests
      ],
      declarations: [
        AppComponent
      ],

      schemas: [CUSTOM_ELEMENTS_SCHEMA]

      schemas: [NO_ERRORS_SCHEMA] // ✅ Correction de l'erreur app-navbar


      imports: [RouterModule.forRoot([])],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA]

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



  it('should render app component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled).toBeTruthy();
  });


  it('should render title in an h1', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // ⚠️ Assure-toi que ton HTML contient :
    // <h1>Hello, {{ title }}</h1>
    expect(compiled.querySelector('h1')?.textContent).toContain('camp-connect');
  });

});