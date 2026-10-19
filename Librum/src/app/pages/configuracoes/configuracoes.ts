import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Bibliotecario } from '../../models/biblitecario.model';
import { ToastService } from '../../shared/services/toast.service';
import { ThemeService } from '../../shared/services/theme.service';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { FormUtils } from '../../utils/FormUtil';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';

@Component({
  selector: 'app-configuracoes',
  imports: [CommonModule, FormsModule, CorpoPadrao, AlertaErros, ReactiveFormsModule, LbrButtom],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit {
  formBibliotecario!: FormGroup;
  enviado = false;
  mensagensErro: string[] = [];
  editando: boolean = false;

  private readonly nomesCampos: Record<string, string> = {
    matricula: 'Matrícula',
    nome: 'Nome Completo',
    email: 'E-mail',
    senha: 'Nova Senha',
    confirmarSenha: 'Confirmar Senha',
  };

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
    private fb: FormBuilder,
    private toastService: ToastService,
    public themeService: ThemeService,
    private configService: ConfiguracaoService,
  ) {}

  ngOnInit(): void {
    this.formBibliotecario = this.fb.group({
      id: [{ value: this.bibliotecario.id, disabled: true }],
      matricula: [this.bibliotecario.matricula, [Validators.required, Validators.maxLength(20)]],
      nome: [this.bibliotecario.nome, [Validators.required, Validators.minLength(3)]],
      email: [this.bibliotecario.email, [Validators.required, Validators.email]],
      // opcionais: só validam se forem preenchidos
      senha: ['', [Validators.minLength(6)]],
      confirmarSenha: ['', [FormUtils.igualA('senha')]],
    });

    this.definirModoEdicao(false);

    this.formBibliotecario
      .get('senha')!
      .valueChanges.subscribe(() =>
        this.formBibliotecario.get('confirmarSenha')!.updateValueAndValidity(),
      );

    this.isExibirAcoesRapidas = this.configService.configuracaoAtivaByChave(
      ConfiguracaoService.CHAVE_ACAO_RAPIDA,
      1,
    );
  }

  toggleEditar(): void {
    if (this.editando) {
      this.cancelarEdicao();
    } else {
      this.definirModoEdicao(true);
    }
  }

  private definirModoEdicao(ativo: boolean): void {
    this.editando = ativo;

    // id nunca é editável
    ['matricula', 'nome', 'email', 'senha', 'confirmarSenha'].forEach((campo) => {
      const control = this.formBibliotecario.get(campo)!;
      ativo ? control.enable({ emitEvent: false }) : control.disable({ emitEvent: false });
    });
  }

  private cancelarEdicao(): void {
    this.formBibliotecario.reset({
      id: this.bibliotecario.id,
      matricula: this.bibliotecario.matricula,
      nome: this.bibliotecario.nome,
      email: this.bibliotecario.email,
      senha: '',
      confirmarSenha: '',
    });
    this.enviado = false;
    this.mensagensErro = [];
    this.definirModoEdicao(false);
  }

  alterarAcaoRapida() {
    this.configService.toggleConfiguracao(ConfiguracaoService.CHAVE_ACAO_RAPIDA, 1);
  }

  isInvalido(campo: string): boolean {
    return FormUtils.isInvalido(this.formBibliotecario, campo, this.enviado);
  }

  alterarTema(theme: 'light' | 'dark'): void {
    this.themeService.setTheme(theme);
  }
  salvarAlteracoes(): void {
    if (!this.editando) return;

    this.enviado = true;
    this.mensagensErro = FormUtils.gerarMensagensErro(this.formBibliotecario, this.nomesCampos);

    if (this.formBibliotecario.invalid) return;

    const { matricula, nome, email, senha } = this.formBibliotecario.getRawValue();

    this.bibliotecario = {
      ...this.bibliotecario,
      matricula,
      nome,
      email,
      ...(senha ? { senha } : {}),
    };

    this.formBibliotecario.patchValue({ senha: '', confirmarSenha: '' });
    this.enviado = false;
    this.mensagensErro = [];
    this.definirModoEdicao(false);
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
