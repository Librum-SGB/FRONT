import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bibliotecario } from '../../models/biblitecario.model';
import { ToastService } from '../../shared/services/toast.service';
import { ThemeService } from '../../shared/services/theme.service';


@Component({
  selector: 'app-configuracoes',
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
})
export class Configuracoes {

  bibliotecario: Bibliotecario = {
    id: 1,
    nome: 'Maria Silva',
    email: 'maria.silva@senai.br',
    matricula: 'BIB2025001',
    senha: '123456'
  };

  notificacoes = {
    gerais: true,
    email: true,
    alertas: true
  };

  versaoSistema = 'v2.5.1';
  ultimoBackup = '13/11/2025 às 03:00';

  constructor(
    private toastService: ToastService,
    public themeService: ThemeService
  ) { }

  alterarTema(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
  }

  salvarAlteracoes(): void {
    this.toastService.showToast(
      'success',
      'Alterações salvas com sucesso!'
    );
  }

  verificarAtualizacoes(): void {
    this.toastService.showToast(
      'info',
      'Sistema já está atualizado!'
    );
  }

  fazerBackup(): void {
    this.toastService.showToast(
      'success',
      'Backup realizado com sucesso!'
    );
  }

  alterarSenha(): void {
    this.toastService.showToast(
      'info',
      'Redirecionando para alteração de senha...'
    );
  }

  ativar2FA(): void {
    this.toastService.showToast(
      'success',
      'Autenticação em dois fatores ativada!'
    );
  }
}
