import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryBarComponent } from './story-bar.component';

describe('StoryBarComponent', () => {
  let component: StoryBarComponent;
  let fixture: ComponentFixture<StoryBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StoryBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoryBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
