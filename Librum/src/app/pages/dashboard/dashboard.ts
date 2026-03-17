import { Component } from '@angular/core';
import { ItemListaTarefa } from '../../componentes/item-lista-tarefa/item-lista-tarefa';
import { CardInformativo } from '../../componentes/card/card-informativo/card-informativo';
import { CardStatus } from '../../componentes/card/card-status/card-status';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [ItemListaTarefa, CardInformativo, CardStatus, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
