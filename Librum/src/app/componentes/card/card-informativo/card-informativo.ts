import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-informativo',
  imports: [NgClass],
  templateUrl: './card-informativo.html',
  styleUrl: './card-informativo.scss',
})
export class CardInformativo {
  @Input({ required: false }) classe: string = 'bg-success';
  @Input({ required: true }) titulo: string = '';
  @Input({ required: true }) valor: string = '';
}
