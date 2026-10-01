import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-tela-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tela-login.html',
  styleUrls: ['./tela-login.scss'],
})
export class TelaLoginComponent {
  email = '';
  senha = '';
  mostrarSenha: boolean = false;
  entrando = false;

  constructor(
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService,
  ) {}

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  entrar(): void {
    if (!this.email.trim() || !this.senha || this.entrando) {
      return;
    }

    this.entrando = true;
    this.authService.login({ email: this.email.trim(), senha: this.senha }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.toastService.sucesso('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: (error: HttpErrorResponse) => {
        this.entrando = false;
        this.toastService.erro(error.error?.message ?? 'Não foi possível realizar o login.');
      },
    });
  }

  esqueciSenha() {
    this.router.navigate(['/esqueci-senha']);
  }
  irParaCadastro() {
    this.router.navigate(['/cadastro-bibliotecaria']);
  }
}
