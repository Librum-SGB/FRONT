import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-botao-acao-rapida',
  imports: [NgClass],
  templateUrl: './botao-acao-rapida.html',
  styleUrl: './botao-acao-rapida.scss',
})
export class BotaoAcaoRapida {
  @Input({ required: true }) titulo: string = 'titulo';
  @Input({ required: false }) classe: string = 'bg-primary';
}
