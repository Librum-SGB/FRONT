import { Component, Input, NgModule } from '@angular/core';
import { StatusEmprestimo } from '../../../enum/status.enum';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-badge',
  imports: [NgClass],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  statusEmprestimo = StatusEmprestimo;
  @Input() status: 'success' | 'warning' | 'danger' | 'primary' | 'secondary' = 'success';
}
