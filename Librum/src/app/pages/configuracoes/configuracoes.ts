import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bibliotecario } from '../../models/biblitecario.model';
import { ToastService } from '../../shared/services/toast.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';

@Component({
  selector: 'app-configuracoes',
  imports: [CommonModule, FormsModule, CorpoPadrao],
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
    gerais: false,
    email: false,
    alertas: false,
  };

  versaoSistema = 'v2.5.1';
  ultimoBackup = '13/11/2025 às 03:00';

  private readonly filialId = 1;

  constructor(
    private toastService: ToastService,
    public themeService: ThemeService,
    private configService: ConfiguracaoService,
  ) {}

  ngOnInit(): void {
    this.isExibirAcoesRapidas = this.configService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_ACAO_RAPIDA,
      this.filialId,
    );

    this.notificacoes.gerais = this.configService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_NOTIFICACOES_GERAIS,
      this.filialId,
    );

    this.notificacoes.email = this.configService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_NOTIFICACOES_EMAIL,
      this.filialId,
    );

    this.notificacoes.alertas = this.configService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_NOTIFICACOES_ALERTAS,
      this.filialId,
    );
  }

  alterarAcaoRapida() {
    this.configService.toggleConfiguracao(ConfiguracaoService.CHAVE_ACAO_RAPIDA, this.filialId);
  }

  toggleNotificacaoGerais(): void {
    this.configService.toggleConfiguracao(
      ConfiguracaoService.CHAVE_NOTIFICACOES_GERAIS,
      this.filialId,
    );
  }

  toggleNotificacaoEmail(): void {
    this.configService.toggleConfiguracao(
      ConfiguracaoService.CHAVE_NOTIFICACOES_EMAIL,
      this.filialId,
    );
  }

  toggleNotificacaoAlertas(): void {
    this.configService.toggleConfiguracao(
      ConfiguracaoService.CHAVE_NOTIFICACOES_ALERTAS,
      this.filialId,
    );
  }

  alterarTema(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
    this.configService.definirValor(ConfiguracaoService.CHAVE_TEMA, this.filialId, theme);
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
