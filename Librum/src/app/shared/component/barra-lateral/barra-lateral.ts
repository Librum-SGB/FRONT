import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.scss',
})
export class BarraLateralComponent {
  @Input() recolhida = false;
  @Input() mobileAberto = false;

  @Output() navegar = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();

  // Evento para alternar a barra
  @Output() toggleSidebar = new EventEmitter<void>();

  aoNavegar(): void {
    this.navegar.emit();
  }

  logout(): void {
    this.sair.emit();
  }

  // Dispara a ação de abrir/fechar
  alternarMenu(): void {
    this.toggleSidebar.emit();
  }

  @HostListener('document:keydown.escape')
  fecharComEsc(): void {
    if (this.mobileAberto) {
      this.navegar.emit();
    }
  }
}