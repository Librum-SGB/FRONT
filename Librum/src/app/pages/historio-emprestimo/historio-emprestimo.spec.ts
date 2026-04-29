import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorioEmprestimo } from './historio-emprestimo';

describe('HistorioEmprestimo', () => {
  let component: HistorioEmprestimo;
  let fixture: ComponentFixture<HistorioEmprestimo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorioEmprestimo],
    }).compileComponents();

    fixture = TestBed.createComponent(HistorioEmprestimo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
