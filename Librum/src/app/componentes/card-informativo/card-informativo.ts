import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ɵEmptyOutletComponent } from '@angular/router';

@Component({
  selector: 'app-card-informativo',
  imports: [NgClass, ɵEmptyOutletComponent],
  templateUrl: './card-informativo.html',
  styleUrl: './card-informativo.scss',
})
export class CardInformativo {
  @Input({ required: false }) bg: string = 'bg-success';
  @Input({ required: true }) titulo: string = '';
  @Input({ required: true }) valor: string = '';
}
