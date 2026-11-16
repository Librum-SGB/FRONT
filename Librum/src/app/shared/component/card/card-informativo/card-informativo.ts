import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

/**
 * Card colorido com um número em destaque (ex.: "Livros no acervo: 120").
 * Com `link`, vira um botão grande que leva para a tela correspondente.
 */
@Component({
  selector: 'app-card-informativo',
  imports: [NgClass, NgTemplateOutlet, RouterLink],
  templateUrl: './card-informativo.html',
  styleUrl: './card-informativo.scss',
})
export class CardInformativo {
  @Input({ required: false }) classe: string = 'bg-success';
  @Input({ required: true }) titulo: string = '';
  @Input({ required: true }) valor: string = '';
  /** Tela aberta ao clicar no card. Sem link, o card é só informativo. */
  @Input() link?: string | readonly unknown[] | null;
  @Input() queryParams?: Params;
}
