import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
