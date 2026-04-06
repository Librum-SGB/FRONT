import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EncontrarMaterial } from './encontrar-material';

describe('EncontrarMaterial', () => {
  let component: EncontrarMaterial;
  let fixture: ComponentFixture<EncontrarMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EncontrarMaterial],
    }).compileComponents();

    fixture = TestBed.createComponent(EncontrarMaterial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
