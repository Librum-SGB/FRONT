import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AlertaErros } from '../../../shared/component/alerta-erros/alerta-erros';
import { CorpoPadrao } from '../../../shared/component/corpo-padrao/corpo-padrao';
import { LbrAviso } from '../../../shared/component/lbr-aviso/lbr-aviso';
import { LbrButtom } from '../../../shared/component/lbr-buttom/lbr-buttom';
import { LbrTrilha } from '../../../shared/component/lbr-trilha/lbr-trilha';
import { LbrVoltar } from '../../../shared/directives/lbr-voltar';
import { NavegacaoService } from '../../../shared/services/navegacao.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Formulario } from '../../../utils/formulario';
import { mensagemDeCarregamento, mensagemDeErro } from '../../../utils/http.util';
import { idDaRota } from '../../../utils/rotas';
import { CadastrosAcervoService, CampoCadastro } from '../cadastros-acervo';

/** Cadastro e edição de Autor, Editora ou Gênero (o cadastro vem da rota; com :id é edição). */
@Component({
  selector: 'app-formulario-cadastro',
  imports: [ReactiveFormsModule, RouterLink, CorpoPadrao, LbrAviso, LbrButtom, AlertaErros, LbrTrilha, LbrVoltar],
  templateUrl: './formulario-cadastro.html',
})
export class FormularioCadastro extends Formulario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cadastros = inject(CadastrosAcervoService);
  private readonly navegacao = inject(NavegacaoService);
  private readonly toast = inject(ToastService);

  protected readonly config = this.cadastros.daRota(this.route.snapshot);
  protected readonly edicao = this.route.snapshot.paramMap.has('id');
  protected readonly id = idDaRota(this.route);

  readonly nomeAtual = signal('');
  readonly carregando = signal(this.edicao);
  readonly erroCarregamento = signal('');
  readonly salvando = signal(false);

  readonly form = new FormGroup(
    Object.fromEntries(
      this.config.campos.map((campo) => [campo.chave, new FormControl<string>('', this.validadores(campo))]),
    ),
  );
  protected readonly nomesCampos = Object.fromEntries(this.config.campos.map((c) => [c.chave, c.rotulo]));

  /** Destino de "Voltar"/"Cancelar" quando não há tela anterior. */
  get destinoPadrao(): readonly unknown[] {
    return this.edicao ? [this.config.rotaLista, this.id] : [this.config.rotaLista];
  }

  get titulo(): string {
    return `${this.edicao ? 'Editar' : 'Cadastrar'} ${this.config.singular}`;
  }

  ngOnInit(): void {
    if (!this.edicao) return;
    if (this.id === null) {
      this.erroCarregamento.set('Registro não encontrado.');
      this.carregando.set(false);
      return;
    }
    this.config.buscar(this.id).subscribe({
      next: (registro) => {
        this.nomeAtual.set(registro.nome);
        this.form.reset(
          Object.fromEntries(this.config.campos.map((c) => [c.chave, (registro[c.chave] as string) ?? ''])),
        );
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erroCarregamento.set(mensagemDeCarregamento(erro, 'Registro não encontrado.', 'Não foi possível carregar.'));
        this.carregando.set(false);
      },
    });
  }

  colunaDo(campo: CampoCadastro): string {
    return campo.larguraInteira || campo.tipo === 'textoLongo' ? 'col-12' : 'col-md-6';
  }

  salvar(): void {
    if (this.salvando() || !this.validar()) return;

    // Campos vazios vão como "ausentes" (e não como texto vazio).
    const dados = Object.fromEntries(
      Object.entries(this.form.getRawValue()).map(([chave, valor]) => [chave, String(valor ?? '').trim() || undefined]),
    );

    this.salvando.set(true);
    const requisicao = this.id !== null ? this.config.atualizar(this.id, dados) : this.config.criar(dados);
    requisicao.subscribe({
      next: (registro) => {
        this.salvando.set(false);
        const acao = this.edicao
          ? this.cadastros.concordar(this.config, 'atualizado', 'atualizada')
          : this.cadastros.concordar(this.config, 'cadastrado', 'cadastrada');
        this.toast.sucesso(`${this.config.singular} "${registro.nome}" ${acao} com sucesso!`);
        // volta para onde a pessoa estava (listagem ou detalhe)
        this.navegacao.voltar(this.destinoPadrao);
      },
      error: (erro) => {
        this.salvando.set(false);
        this.toast.erro(mensagemDeErro(erro, 'Não foi possível salvar.'));
      },
    });
  }

  private validadores(campo: CampoCadastro): ValidatorFn[] {
    return [
      ...(campo.obrigatorio ? [Validators.required] : []),
      ...(campo.maxLength ? [Validators.maxLength(campo.maxLength)] : []),
    ];
  }
}
