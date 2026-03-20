import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-botao-acao-rapida',
  imports: [],
  templateUrl: './botao-acao-rapida.html',
  styleUrl: './botao-acao-rapida.scss',
})
export class BotaoAcaoRapida {
  @Input({ required: true }) titulo: string = 'titulo';
}
