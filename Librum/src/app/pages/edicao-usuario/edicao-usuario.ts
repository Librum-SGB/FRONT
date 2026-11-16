import { Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IMaskDirective } from 'angular-imask';

import { MaskConstants } from '../../enum/const';
import { Usuario } from '../../models/usuario.model';
import { UsuarioAtualizacao, UsuarioService } from '../../services/usuario.service';
import { AlertaErros } from '../../shared/component/alerta-erros/alerta-erros';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrAviso } from '../../shared/component/lbr-aviso/lbr-aviso';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { LbrVoltar } from '../../shared/directives/lbr-voltar';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { ToastService } from '../../shared/services/toast.service';
import { dataDaquiA, dataISO } from '../../utils/data.util';
import { FormUtils } from '../../utils/FormUtil';
import { digitosOuNada, Formulario, textoOuNada } from '../../utils/formulario';
import { mensagemDeCarregamento, mensagemDeErro } from '../../utils/http.util';
import { idDaRota, ROTAS } from '../../utils/rotas';

/** Seção da tela que pode ser aberta diretamente pela URL (`#endereco`). */
export const SECAO_ENDERECO = 'endereco';

@Component({
  selector: 'app-edicao-usuario',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IMaskDirective,
    CorpoPadrao,
    LbrAviso,
    LbrButtom,
    AlertaErros,
    LbrVoltar,
    LbrTrilha,
  ],
  templateUrl: './edicao-usuario.html',
})
export class EdicaoUsuario extends Formulario implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly navegacao = inject(NavegacaoService);

  protected readonly Mask = MaskConstants;
  protected readonly rotaUsuarios = ROTAS.usuarios;
  readonly hoje = dataDaquiA(0);
  readonly id = idDaRota(this.route);

  readonly usuario = signal<Usuario | null>(null);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly salvando = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', FormUtils.cpf],
    dataNascimento: ['', FormUtils.dataPassada],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    cep: ['', Validators.pattern(/^\d{5}-?\d{3}$/)],
    endereco: [''],
    numero: [''],
    bairro: [''],
    cidade: [''],
    estado: ['', [Validators.minLength(2), Validators.maxLength(2)]],
    limiteLivros: [3, [Validators.required, Validators.min(1)]],
  });

  protected readonly nomesCampos: Record<string, string> = {
    nome: 'Nome',
    cpf: 'CPF',
    dataNascimento: 'Data de nascimento',
    email: 'E-mail',
    telefone: 'Telefone',
    cep: 'CEP',
    endereco: 'Endereço',
    numero: 'Número',
    bairro: 'Bairro',
    cidade: 'Cidade',
    estado: 'Estado',
    limiteLivros: 'Limite de livros',
  };

  ngOnInit(): void {
    if (this.id === null) {
      this.erroCarregamento.set('Usuário não encontrado.');
      this.carregando.set(false);
      return;
    }

    this.usuarioService.buscarPorId(this.id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.preencherFormulario(usuario);
        this.carregando.set(false);
        if (this.route.snapshot.fragment === SECAO_ENDERECO) {
          setTimeout(() => this.irParaSecaoEndereco());
        }
      },
      error: (erro) => {
        this.erroCarregamento.set(
          mensagemDeCarregamento(erro, 'Usuário não encontrado.', 'Não foi possível carregar o usuário.'),
        );
        this.carregando.set(false);
      },
    });
  }

  private preencherFormulario(usuario: Usuario): void {
    this.form.reset({
      nome: usuario.nome ?? '',
      cpf: usuario.cpf ?? '',
      dataNascimento: dataISO(usuario.dataNascimento),
      email: usuario.email ?? '',
      telefone: usuario.telefone ?? '',
      cep: usuario.cep ?? '',
      endereco: usuario.endereco ?? '',
      numero: usuario.numero ?? '',
      bairro: usuario.bairro ?? '',
      cidade: usuario.cidade ?? '',
      estado: usuario.estado ?? '',
      limiteLivros: usuario.limiteLivros ?? 3,
    });
  }

  private irParaSecaoEndereco(): void {
    const raiz = this.elemento.nativeElement;
    raiz.querySelector<HTMLElement>(`#secao-${SECAO_ENDERECO}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    raiz.querySelector<HTMLInputElement>('#endereco')?.focus({ preventScroll: true });
  }

  salvar(): void {
    const usuario = this.usuario();
    if (this.id === null || !usuario || this.salvando()) return;
    if (!this.validar()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const dados = this.form.getRawValue();
    const atualizacao: UsuarioAtualizacao = {
      nome: dados.nome.trim(),
      email: dados.email.trim().toLocaleLowerCase('pt-BR'),
      filialId: usuario.filialId,
      cpf: digitosOuNada(dados.cpf),
      telefone: digitosOuNada(dados.telefone),
      dataNascimento: textoOuNada(dados.dataNascimento),
      cep: digitosOuNada(dados.cep),
      endereco: textoOuNada(dados.endereco),
      numero: textoOuNada(dados.numero),
      bairro: textoOuNada(dados.bairro),
      cidade: textoOuNada(dados.cidade),
      estado: textoOuNada(dados.estado)?.toUpperCase(),
      limiteLivros: Number(dados.limiteLivros),
      // a matrícula não é editada aqui, mas precisa ir junto para não ser apagada
      matriculaFuncionario: usuario.matriculaFuncionario || undefined,
    };

    const id = this.id;
    this.salvando.set(true);
    this.usuarioService.atualizar(id, atualizacao).subscribe({
      next: () => {
        this.salvando.set(false);
        this.toast.sucesso('Dados do usuário atualizados com sucesso!');
        // volta para onde a pessoa estava (detalhe, listagem...)
        this.navegacao.voltar(['/usuarios', id]);
      },
      error: (erro) => {
        this.salvando.set(false);
        this.toast.erro(mensagemDeErro(erro, 'Não foi possível salvar as alterações.'));
      },
    });
  }
}
