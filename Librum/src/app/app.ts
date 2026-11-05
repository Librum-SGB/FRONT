
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BarraLateralComponent } from './shared/component/barra-lateral/barra-lateral';
import { Footer } from './shared/component/footer/footer';
import { Navbar } from './shared/component/navbar/navbar';
import { Toast } from './shared/component/toast/toast';
import { ToastService } from './shared/services/toast.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Navbar, BarraLateralComponent, Footer, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('Librum');
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  currentRoute = '';
  sidebarRecolhida = false;
  menuMobileAberto = false;

  constructor() {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(event => {
      this.currentRoute = event.urlAfterRedirects;
    });
  }

  ngOnInit(): void {
    this.verificarTamanhoTela();
  }

  @HostListener('window:resize')
  verificarTamanhoTela(): void {
    this.sidebarRecolhida = window.innerWidth >= 768 && window.innerWidth < 992;
    if (window.innerWidth >= 992) this.menuMobileAberto = false;
  }

  isAuthRoute(): boolean {
    return ['', '/', '/esqueci-senha', '/cadastro-bibliotecaria'].includes(this.currentRoute);
  }
  
  alternarSidebar(): void {
    if (window.innerWidth < 992) {
      this.menuMobileAberto = !this.menuMobileAberto;
      return;
    }

    this.sidebarRecolhida = !this.sidebarRecolhida;
  }

  fecharMenuMobile(): void {
    this.menuMobileAberto = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.menuMobileAberto = false;

    this.router.navigate(['/']).then(navegou => {
      if (navegou) this.toastService.sucesso('Logout realizado com sucesso!');
      else this.toastService.erro('Não foi possível voltar para a tela de login.');
    });
  }
}
