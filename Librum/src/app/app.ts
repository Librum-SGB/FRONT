import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
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
export class App {
  protected readonly title = signal('Librum');
  currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
      });
  }

  isAuthRoute(): boolean {
    return (
      this.currentRoute === '/' ||
      this.currentRoute === '/esqueci-senha' ||
      this.currentRoute === '/cadastro-bibliotecaria' ||
      this.currentRoute === ''
    );
  }
}
