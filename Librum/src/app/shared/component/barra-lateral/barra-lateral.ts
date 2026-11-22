
import {
  Component, EventEmitter, HostBinding, HostListener, inject, Input, Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Permissao } from '../../../enum/permissoes.enum';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.scss',
})
export class BarraLateralComponent {

  protected readonly authService = inject(AuthService);
  protected readonly Permissao = Permissao;

  @Input() recolhida = false;
  @Input() mobileAberto = false;

  @Output() navegar = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  // Aplica a classe diretamente no elemento app-barra-lateral
  @HostBinding('class.mobile-aberta')
  get hostMobileAberta(): boolean {
    return this.mobileAberto;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  aoNavegar(): void {
    this.navegar.emit();
  }

  logout(): void {
    this.sair.emit();
  }

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
