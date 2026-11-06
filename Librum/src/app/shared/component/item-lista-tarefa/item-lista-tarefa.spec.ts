import { ComponentFixture, TestBed } from '@angular/core/testing';
import { prioridade } from '../../../enum/prioridade.enum';
import { StatusTarefa } from '../../../enum/status.enum';

import { ItemListaTarefa } from './item-lista-tarefa';

describe('ItemListaTarefa', () => {
  let component: ItemListaTarefa;
  let fixture: ComponentFixture<ItemListaTarefa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ItemListaTarefa],
    }).compileComponents();

    fixture = TestBed.createComponent(ItemListaTarefa);
    component = fixture.componentInstance;
    component.tarefa = {
      id: 1,
      usuarioId: 1,
      descricao: 'Conferir devoluções',
      prioridade: prioridade.MEDIA,
      status: StatusTarefa.PENDENTE,
    };
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
