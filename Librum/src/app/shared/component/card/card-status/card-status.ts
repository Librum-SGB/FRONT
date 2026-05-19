import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card-status',
  imports: [NgClass],
  templateUrl: './card-status.html',
  styleUrl: './card-status.scss',
})
export class CardStatus {
  @Input({ required: true }) titulo: string = 'Titulo';
  @Input({ required: true }) conteudo: string = 'conteudo';
  @Input()
  cor: 'success' | 'warning' | 'danger' | 'primary' | 'secondary' = 'success';
}
