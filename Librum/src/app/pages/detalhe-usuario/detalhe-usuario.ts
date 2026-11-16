import { DatePipe } from '@angular/common';
import { LbrTrilha } from '../../shared/component/lbr-trilha/lbr-trilha';
import { NavegacaoService } from '../../shared/services/navegacao.service';
import { LbrVoltar } from '../../shared/directives/lbr-voltar';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Permissao } from '../../enum/permissoes.enum';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { Badge } from '../../shared/component/badge/badge';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmacaoService } from '../../shared/services/confirmacao.service';
import { corSituacaoUsuario, rotuloSituacaoUsuario } from '../../utils/usuario.util';
import { CampoDetalhe, camposPreenchidos } from '../../utils/campos.util';
import { formatarDataBR } from '../../utils/data.util';
import { ROTAS } from '../../utils/rotas';
import { SECAO_ENDERECO } from '../edicao-usuario/edicao-usuario';

export const ROTA_LISTA_USUARIOS = ROTAS.usuarios;

@Component({
  selector: 'app-detalhe-usuario',
  imports: [DatePipe, RouterLink, CorpoPadrao, LbrButtom, Badge, LbrVoltar, LbrTrilha],
  templateUrl: './detalhe-usuario.html',
  styleUrl: './detalhe-usuario.scss',
})
export class DetalheUsuario implements OnInit {
  readonly rotaLista = ROTA_LISTA_USUARIOS;
  protected readonly rotas = ROTAS;
  readonly secaoEndereco = SECAO_ENDERECO;
  protected readonly rotuloSituacao = rotuloSituacaoUsuario;
  protected readonly corSituacao = corSituacaoUsuario;

  readonly usuario = signal<Usuario | null>(null);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly excluindo = signal(false);

  readonly dadosPessoais = computed<CampoDetalhe[]>(() => {
    const u = this.usuario();
    if (!u) return [];
    return camposPreenchidos([
      ['CPF', u.cpf],
      ['E-mail', u.email],
      ['Telefone', u.telefone],
      ['Data de nascimento', u.dataNascimento ? formatarDataBR(u.dataNascimento) : undefined],
      ['Limite de livros', u.limiteLivros],
    ]);
  });

  readonly endereco = computed<CampoDetalhe[]>(() => {
    const u = this.usuario();
    if (!u) return [];
    const logradouro = [u.endereco, u.numero].filter(Boolean).join(', ');
    return camposPreenchidos([
      ['Endereço', logradouro],
      ['Bairro', u.bairro],
      ['Cidade', [u.cidade, u.estado].filter(Boolean).join(' / ')],
      ['CEP', u.cep],
    ]);
  });

  get podeEditar(): boolean {
    return this.authService.temPermissao(Permissao.EDITAR_USUARIO);
  }

  get podeExcluir(): boolean {
    return this.authService.temPermissao(Permissao.EXCLUIR_USUARIO);
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService,
    private confirmacao: ConfirmacaoService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private navegacao: NavegacaoService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.erroCarregamento.set('Usuário não encontrado.');
      this.carregando.set(false);
      return;
    }

    this.usuarioService.buscarPorId(id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.navegacao.definirTitulo(usuario.nome);
        this.carregando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.erroCarregamento.set(
          err.status === 404
            ? 'Usuário não encontrado.'
            : (err.error?.message ?? 'Não foi possível carregar o usuário.'),
        );
        this.carregando.set(false);
      },
    });
  }

  // ---------- Exclusão ----------

  async excluir(): Promise<void> {
    const usuario = this.usuario();
    if (!this.podeExcluir || usuario?.id == null || this.excluindo()) return;

    const confirmado = await this.confirmacao.confirmar({
      titulo: 'Excluir usuário',
      icone: 'bi-trash',
      tom: 'danger',
      mensagem: 'Você está excluindo este usuário.',
      detalhes: [
        { rotulo: 'Nome', valor: usuario.nome, destaque: true },
        { rotulo: 'E-mail', valor: usuario.email || '—' },
      ],
      aviso: 'Esta ação não pode ser desfeita. Para apenas impedir o acesso, prefira inativar.',
      textoConfirmar: 'Excluir usuário',
    });
    if (!confirmado) return;

    this.excluindo.set(true);
    this.usuarioService.excluir(usuario.id).subscribe({
      next: () => {
        this.toastService.sucesso('Usuário excluído com sucesso!');
        this.excluindo.set(false);
        void this.router.navigate([this.rotaLista]);
      },
      error: (error) => {
        this.excluindo.set(false);
        this.toastService.erro(error.error?.message ?? 'Não foi possível excluir o usuário.');
      },
    });
  }
}
