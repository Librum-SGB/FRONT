import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaErros } from './alerta-erros';

describe('AlertaErros', () => {
  let component: AlertaErros;
  let fixture: ComponentFixture<AlertaErros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertaErros],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertaErros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
