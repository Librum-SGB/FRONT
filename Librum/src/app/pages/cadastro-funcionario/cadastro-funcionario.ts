import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { FuncaoUsuario } from '../../enum/funcaoUsuario.enum';
import { Filial } from '../../models/filial.model';
import { AuthService } from '../../services/auth.service';
import { FilialService } from '../../services/filial.service';
import { UsuarioService } from '../../services/usuario.service';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { LbrVoltar } from '../../shared/directives/lbr-voltar';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormUtils } from '../../utils/FormUtil';
import { Formulario } from '../../utils/formulario';
import { mensagemDeErro } from '../../utils/http.util';
import { ROTAS } from '../../utils/rotas';
import { ROTULOS_FUNCAO } from '../funcionarios/funcionarios';

/** Cadastro de funcionário (administrador, bibliotecária ou assistente), no padrão do cadastro de usuário. */
@Component({
  selector: 'app-cadastro-funcionario',
  imports: [ReactiveFormsModule, CorpoPadrao, LbrButtom, AlertaErros, LbrTrilha, LbrVoltar],
  templateUrl: './cadastro-funcionario.html',
})
export class CadastroFuncionario extends Formulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly filialService = inject(FilialService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly navegacao = inject(NavegacaoService);
  private readonly toast = inject(ToastService);

  /** Só as funções que a pessoa logada pode atribuir (bibliotecária: só assistente). */
  protected readonly funcoes = [FuncaoUsuario.ADMIN, FuncaoUsuario.BIBLIOTECARIA, FuncaoUsuario.ASSISTENTE]
    .filter((funcao) => this.authService.podeGerenciarFuncao(funcao))
    .map((valor) => ({ valor, rotulo: ROTULOS_FUNCAO[valor] }));

  readonly filiais = signal<Filial[]>([]);
  readonly carregandoFiliais = signal(true);
  readonly erroFiliais = signal('');
  readonly salvando = signal(false);

  readonly form = this.fb.nonNullable.group({
    funcao: ['', Validators.required],
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    matriculaFuncionario: ['', Validators.required],
    filialId: ['', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarSenha: ['', [Validators.required, FormUtils.igualA('senha')]],
  });

  protected readonly nomesCampos: Record<string, string> = {
    funcao: 'Função',
    nome: 'Nome completo',
    email: 'E-mail',
    matriculaFuncionario: 'Matrícula',
    filialId: 'Unidade',
    senha: 'Senha',
    confirmarSenha: 'Confirmar senha',
  };

  ngOnInit(): void {
    if (this.funcoes.length === 1) this.form.patchValue({ funcao: this.funcoes[0].valor });
    this.form.controls.senha.valueChanges.subscribe(() =>
      this.form.controls.confirmarSenha.updateValueAndValidity(),
    );
    this.carregarFiliais();
  }

  carregarFiliais(): void {
    this.carregandoFiliais.set(true);
    this.erroFiliais.set('');
    this.filialService.listarAtivas().subscribe({
      next: (filiais) => {
        const ativas = filiais.filter((f) => f.ativo && f.id != null);
        this.filiais.set(ativas);
        if (ativas.length === 1) this.form.patchValue({ filialId: String(ativas[0].id) });
        this.carregandoFiliais.set(false);
      },
      error: (erro) => {
        this.erroFiliais.set(mensagemDeErro(erro, 'Não foi possível carregar as unidades.'));
        this.carregandoFiliais.set(false);
      },
    });
  }

  salvar(): void {
    if (this.salvando() || !this.validar()) return;

    const dados = this.form.getRawValue();
    this.salvando.set(true);
    this.usuarioService
      .cadastrar({
        funcao: dados.funcao,
        nome: dados.nome.trim(),
        email: dados.email.trim().toLocaleLowerCase('pt-BR'),
        matriculaFuncionario: dados.matriculaFuncionario.trim(),
        filialId: Number(dados.filialId),
        senha: dados.senha,
      })
      .subscribe({
        next: (funcionario) => {
          this.salvando.set(false);
          this.toast.sucesso(`${funcionario.nome} cadastrado como ${ROTULOS_FUNCAO[dados.funcao]}.`);
          this.navegacao.voltar(ROTAS.funcionarios);
        },
        error: (erro) => {
          this.salvando.set(false);
          const mensagem = mensagemDeErro(erro, 'Não foi possível cadastrar o funcionário.');
          this.mensagensErro = [mensagem];
          this.toast.erro(mensagem);
        },
      });
  }
}
