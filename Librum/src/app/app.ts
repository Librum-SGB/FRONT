import { Component, signal } from '@angular/core';
<<<<<<< HEAD
import { Router, RouterOutlet } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Navbar } from './shared/component/navbar/navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [Dashboard, RouterOutlet, Navbar,CommonModule],
=======
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/component/navbar/navbar';
import { ToastComponent } from './shared/component/toast/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastComponent],
>>>>>>> afed2f9e55770aea33cf6d9ac57256c35f06f983
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
