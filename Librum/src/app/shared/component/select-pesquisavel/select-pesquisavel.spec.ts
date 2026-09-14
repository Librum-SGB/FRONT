import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPesquisavel } from './select-pesquisavel';

describe('SelectPesquisavel', () => {
  let component: SelectPesquisavel;
  let fixture: ComponentFixture<SelectPesquisavel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPesquisavel],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectPesquisavel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
