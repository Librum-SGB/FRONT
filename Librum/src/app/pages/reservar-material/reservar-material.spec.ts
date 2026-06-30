import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarMaterial } from './reservar-material';

describe('ReservarMaterial', () => {
  let component: ReservarMaterial;
  let fixture: ComponentFixture<ReservarMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarMaterial],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarMaterial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
