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
  
  // Controle de estado do menu
  sidebarRecolhida = false;
  menuMobileAberto = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  // Executa assim que o componente carrega na tela
  ngOnInit(): void {
    this.verificarTamanhoTela();
  }

  // Escuta as mudanças de tamanho da janela do navegador
  @HostListener('window:resize')
  verificarTamanhoTela(): void {
    // Se a tela for média (tablet ou janela encolhida: 768px a 1024px), recolhe a barra para mostrar apenas ícones
    if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.sidebarRecolhida = true;
    }
  }

  // Verifica se é uma tela de login/cadastro (onde o menu e navbar não aparecem)
  isAuthRoute(): boolean {
    return (
      this.currentRoute === '/' ||
      this.currentRoute === '/esqueci-senha' ||
      this.currentRoute === '/cadastro-bibliotecaria' ||
      this.currentRoute === ''
    );
  }

  // Alterna o menu dependendo do tamanho da tela atual
  alternarSidebar(): void {
    if (window.innerWidth < 768) {
      this.menuMobileAberto = !this.menuMobileAberto; // Abre/fecha como overlay no celular
    } else {
      this.sidebarRecolhida = !this.sidebarRecolhida; // Expande/recolhe no desktop e tablet
    }
  }

  fecharMenuMobile(): void {
    this.menuMobileAberto = false;
  }

  logout(): void {
    // Substitua pela lógica de logout que seu projeto utiliza.
    console.log('Realizando logoff...');
  }
}