import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPageComponent } from './settings-page.component';

import { waitForAsync } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing'; // Ajouté par sécurité


describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;



  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPageComponent]
    })
    .compileComponents();
  }));

  // CORRECTION : La syntaxe correcte est async () => { ... }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ], // Souvent nécessaire si ton composant utilise des services
      declarations: [ SettingsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SettingsPageComponent]
    }).compileComponents();



  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});