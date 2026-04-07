import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Navbar } from './shared/component/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Dashboard, RouterOutlet, Navbar,CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Librum'); 
   constructor(private router: Router) {}
 isLoginPage(): boolean {
    return this.router.url === '/';
  }
}
