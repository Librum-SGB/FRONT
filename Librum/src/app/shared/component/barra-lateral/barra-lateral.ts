import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.scss',
})
export class BarraLateralComponent {
  private readonly authService = inject(AuthService);

  @Input() recolhida = false;
  @Input() mobileAberto = false;

  @Output() navegar = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

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