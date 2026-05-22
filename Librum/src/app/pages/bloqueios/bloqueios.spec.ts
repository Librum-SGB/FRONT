import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bloqueios } from './bloqueios';

describe('Bloqueios', () => {
  let component: Bloqueios;
  let fixture: ComponentFixture<Bloqueios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bloqueios],
    }).compileComponents();

    fixture = TestBed.createComponent(Bloqueios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
