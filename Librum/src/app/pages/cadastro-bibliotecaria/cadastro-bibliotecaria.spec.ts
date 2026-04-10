import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroBibliotecaria } from './cadastro-bibliotecaria';

describe('CadastroBibliotecaria', () => {
  let component: CadastroBibliotecaria;
  let fixture: ComponentFixture<CadastroBibliotecaria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroBibliotecaria],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroBibliotecaria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
