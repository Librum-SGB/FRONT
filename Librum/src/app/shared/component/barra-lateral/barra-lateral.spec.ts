import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraLateralComponent } from './barra-lateral';

describe('BarraLateral', () => {
  let component: BarraLateralComponent;
  let fixture: ComponentFixture<BarraLateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLateralComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraLateralComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
