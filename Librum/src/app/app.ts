import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BarraLateralComponent } from './shared/component/barra-lateral/barra-lateral';
import { Footer } from './shared/component/footer/footer';
import { Navbar } from './shared/component/navbar/navbar';
import { Toast } from './shared/component/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Toast, CommonModule, Footer, BarraLateralComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('Librum');
  currentRoute: string = '';
  
  sidebarRecolhida = false;
  menuMobileAberto = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.verificarTamanhoTela();
  }

  
  @HostListener('window:resize')
  verificarTamanhoTela(): void {
    // Se a tela for média (tablet ou janela encolhida: 768px a 1024px), recolhe a barra para mostrar apenas ícones
    if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.sidebarRecolhida = true;
    }
  }

  isAuthRoute(): boolean {
    return (
      this.currentRoute === '/' ||
      this.currentRoute === '/esqueci-senha' ||
      this.currentRoute === '/cadastro-bibliotecaria' ||
      this.currentRoute === ''
    );
  }

 
  alternarSidebar(): void {
    if (window.innerWidth < 768) {
      this.menuMobileAberto = !this.menuMobileAberto; 
      this.sidebarRecolhida = !this.sidebarRecolhida; 
    }
  }

  fecharMenuMobile(): void {
    this.menuMobileAberto = false;
  }

  logout(): void {
  
    console.log('Realizando logoff...');
  }
}