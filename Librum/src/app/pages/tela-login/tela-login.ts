import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-login.html',
  styleUrls: ['./tela-login.scss'],
})
export class TelaLoginComponent {
  email: string = 'teste@teste.com';
  senha: string = '123456';
  mostrarSenha: boolean = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
  ) {}

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar() {
    if (this.email === 'teste@teste.com' && this.senha === '123456') {
      this.toastService.sucesso('Login bem-sucedido!');
      this.router.navigate(['/dashboard']);
    } else {
      this.toastService.erro('Email ou senha incorretos!');
    }
  }

  esqueciSenha() {
    this.router.navigate(['/esqueci-senha']);
  }
  irParaCadastro() {
    this.router.navigate(['/cadastro-bibliotecaria']);
  }
}
