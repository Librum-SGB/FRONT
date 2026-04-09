import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/component/navbar/navbar';
import { ToastComponent } from './shared/component/toast/toast.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, ToastComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Librum'); 

  constructor(private router: Router) {}

  isLoginPage(): boolean {
    return this.router.url === '/' || this.router.url === '/esqueci-senha';
  }
}