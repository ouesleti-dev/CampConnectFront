import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsPageComponent } from './settings-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // Ajouté par sécurité

describe('SettingsPageComponent', () => {
  let component: SettingsPageComponent;
  let fixture: ComponentFixture<SettingsPageComponent>;

  // CORRECTION : La syntaxe correcte est async () => { ... }
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ], // Souvent nécessaire si ton composant utilise des services
      declarations: [ SettingsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});