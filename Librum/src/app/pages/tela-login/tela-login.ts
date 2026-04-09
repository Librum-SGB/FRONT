import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-login.html',
  styleUrls: ['./tela-login.scss']
})
export class TelaLoginComponent {

  email: string = '';
  senha: string = '';
  mostrarSenha: boolean = false;

  constructor(private router: Router) {}

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar() {
    if (this.email === 'teste@teste.com' && this.senha === '123456') {
      alert('Login bem-sucedido!');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Email ou senha incorretos!');
    }
  }

  esqueciSenha() {
    this.router.navigate(['/esqueci-senha']);
  }
}