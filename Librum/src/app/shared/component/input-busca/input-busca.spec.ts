import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputBusca } from './input-busca';

describe('InputBusca', () => {
  let component: InputBusca;
  let fixture: ComponentFixture<InputBusca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputBusca],
    }).compileComponents();

    fixture = TestBed.createComponent(InputBusca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected filter while typing search is enabled', () => {
    component.buscarAoDigitar = true;
    component.textoBusca = 'ISBN-123';
    component.filtroSelecionado = 'ISBN';
    const buscas: { texto: string; filtro: string }[] = [];
    component.buscar.subscribe((busca) => buscas.push(busca));

    component.filtroAlterado();

    expect(buscas).toEqual([{ texto: 'ISBN-123', filtro: 'ISBN' }]);
  });
});
