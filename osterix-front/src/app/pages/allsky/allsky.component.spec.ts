import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllskyComponent } from './allsky.component';

describe('AllskyComponent', () => {
  let component: AllskyComponent;
  let fixture: ComponentFixture<AllskyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllskyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllskyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
