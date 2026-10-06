import { Component, Input } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
@Component({
  selector: 'app-alerta-erros',
  imports: [],
  templateUrl: './alerta-erros.html',
  styleUrl: './alerta-erros.scss',
})
export class AlertaErros {
  @Input() mensagens: string[] = [];
  @Input() titulo = 'Dados inválidos:';
}
