import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardInformativo } from './componentes/card-informativo/card-informativo';
import { ItemListaTarefa } from './componentes/item-lista-tarefa/item-lista-tarefa';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CardInformativo, ItemListaTarefa],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Librum');
}
