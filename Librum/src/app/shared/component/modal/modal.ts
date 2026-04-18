import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [NgClass],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})

/*
 Padão para abrir na modal pai

  abrirModal() {
    this.modalAberta = true;
  }

  */
export class Modal {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;

  @Output() isOpenChange = new EventEmitter<boolean>();

  close() {
    this.isOpenChange.emit(false);
  }
}
