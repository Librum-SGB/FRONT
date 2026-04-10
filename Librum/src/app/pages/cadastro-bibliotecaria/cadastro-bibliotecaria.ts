import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-cadastro-bibliotecaria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cadastro-bibliotecaria.html',
  styleUrls: ['./cadastro-bibliotecaria.scss'] 
})


export class CadastroBibliotecariaComponent {
  nome: string = '';
  email: string = '';
  matricula: string = '';
  senha: string = '';
  confirmarSenha: string = '';

  constructor(private router: Router, private toastService: ToastService) {}

  cadastrar() {
    if (!this.nome || !this.email || !this.senha) {
      this.toastService.showWarning('Preencha os campos obrigatórios!');
      return;
    }
    if (this.senha !== this.confirmarSenha) {
      this.toastService.showError('As senhas não coincidem!');
      return;
    }
    this.toastService.showSuccess('Cadastro realizado com sucesso!');
    this.router.navigate(['/']); 
  }

  voltar() {
    this.router.navigate(['/']);
  }
}
