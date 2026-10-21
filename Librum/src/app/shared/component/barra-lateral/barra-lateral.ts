import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-barra-lateral',
  standalone: true,
  imports: [CommonModule, RouterModule],
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-barra-lateral',
  imports: [CommonModule, RouterModule], // <-- DEVE IMPORTAR O ROUTER AQUI
  templateUrl: './barra-lateral.html',
  styleUrl: './barra-lateral.scss',
})
export class BarraLateralComponent {
  @Input() recolhida = false;
  @Input() mobileAberto = false;

  @Output() navegar = new EventEmitter<void>();
  @Output() sair = new EventEmitter<void>();
  
  // NOVO: Evento para alternar a barra
  @Output() toggleSidebar = new EventEmitter<void>(); 

  constructor(private router: Router) {}

  aoNavegar(): void {
    this.navegar.emit();
  }

  logout(): void {
    this.sair.emit();
  }

  // NOVO: Dispara a ação de abrir/fechar
  alternarMenu(): void {
    this.toggleSidebar.emit();
  }

  @HostListener('document:keydown.escape')
  fecharComEsc(): void {
    if (this.mobileAberto) {
      this.navegar.emit();
    }

  constructor(private router: Router) {}

  logout(): void {
    // Aqui vai a sua lógica de logout chamando o backend Java
    console.log('Realizando logoff...');
    // this.router.navigate(['/login']); // Exemplo de redirecionamento após o logout
  }
}