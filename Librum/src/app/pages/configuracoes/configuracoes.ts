import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bibliotecario } from '../../models/biblitecario.model';
import { ToastService } from '../../shared/services/toast.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';

@Component({
  selector: 'app-configuracoes',
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit {
  bibliotecario: Bibliotecario = {
    id: 1,
    nome: 'Maria Silva',
    email: 'maria.silva@senai.br',
    matricula: 'BIB2025001',
    senha: '123456',
  };

  isExibirAcoesRapidas = false;

  notificacoes = {
    gerais: true,
    email: true,
    alertas: true,
  };

  versaoSistema = 'v2.5.1';
  ultimoBackup = '13/11/2025 às 03:00';

  constructor(
    private toastService: ToastService,
    public themeService: ThemeService,
    private configService: ConfiguracaoService,
  ) {}

  ngOnInit(): void {
    this.isExibirAcoesRapidas = this.configService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_ACAO_RAPIDA,
      1,
    );
  }

  alterarAcaoRapida() {
    this.configService.toggleConfiguracao(ConfiguracaoService.CHAVE_ACAO_RAPIDA, 1);
  }

  alterarTema(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
  }

  salvarAlteracoes(): void {
    this.toastService.sucesso('Alterações salvas com sucesso!');
  }

  verificarAtualizacoes(): void {
    this.toastService.aviso('Sistema já está atualizado!');
  }

  fazerBackup(): void {
    this.toastService.sucesso('Backup realizado com sucesso!');
  }

  alterarSenha(): void {
    this.toastService.aviso('Redirecionando para alteração de senha...');
  }

  ativar2FA(): void {
    this.toastService.sucesso('Autenticação em dois fatores ativada!');
  }
}
