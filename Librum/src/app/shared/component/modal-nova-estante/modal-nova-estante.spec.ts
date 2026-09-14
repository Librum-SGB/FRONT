import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNovaEstante } from './modal-nova-estante';

describe('ModalNovaEstante', () => {
  let component: ModalNovaEstante;
  let fixture: ComponentFixture<ModalNovaEstante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNovaEstante],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalNovaEstante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
