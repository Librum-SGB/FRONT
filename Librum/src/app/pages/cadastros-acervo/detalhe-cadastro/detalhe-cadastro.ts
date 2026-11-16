import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';

import { Permissao } from '../../../enum/permissoes.enum';
import { MaterialResponse } from '../../../models/material.model';
import { AuthService } from '../../../services/auth.service';
import { MaterialService } from '../../../services/material';
import { CorpoPadrao } from '../../../shared/component/corpo-padrao/corpo-padrao';
import { LbrAviso } from '../../../shared/component/lbr-aviso/lbr-aviso';
import { LbrButtom } from '../../../shared/component/lbr-buttom/lbr-buttom';
import { LbrCabecalhoDetalhe } from '../../../shared/component/lbr-cabecalho-detalhe/lbr-cabecalho-detalhe';
import { LbrCartaoRegistro } from '../../../shared/component/lbr-cartao-registro/lbr-cartao-registro';
import { LbrLinkEntidade } from '../../../shared/component/lbr-link-entidade/lbr-link-entidade';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../../shared/component/lbr-tabela/lbr-tabela';
import { LbrTrilha } from '../../../shared/component/lbr-trilha/lbr-trilha';
import { LbrVoltar } from '../../../shared/directives/lbr-voltar';
import { NavegacaoService } from '../../../shared/services/navegacao.service';
import { formatarDataBR } from '../../../utils/data.util';
import { mensagemDeCarregamento } from '../../../utils/http.util';
import { rotuloTipoMaterial } from '../../../utils/material.util';
import { idDaRota, ROTAS } from '../../../utils/rotas';
import { CadastrosAcervoService, RegistroAcervo } from '../cadastros-acervo';

/** Detalhe de um Autor, Editora ou Gênero, com os materiais vinculados. */
@Component({
  selector: 'app-detalhe-cadastro',
  imports: [
    RouterLink,
    CorpoPadrao,
    LbrAviso,
    LbrButtom,
    LbrCabecalhoDetalhe,
    LbrCartaoRegistro,
    LbrLinkEntidade,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
    LbrTrilha,
    LbrVoltar,
  ],
  templateUrl: './detalhe-cadastro.html',
})
export class DetalheCadastro implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cadastros = inject(CadastrosAcervoService);
  private readonly materialService = inject(MaterialService);
  private readonly authService = inject(AuthService);
  private readonly navegacao = inject(NavegacaoService);

  protected readonly config = this.cadastros.daRota(this.route.snapshot);
  protected readonly rotaMateriais = ROTAS.materiais;
  protected readonly rotuloTipo = rotuloTipoMaterial;

  readonly registro = signal<RegistroAcervo | null>(null);
  /** `null` se os materiais não carregaram. */
  readonly materiais = signal<MaterialResponse[] | null>(null);
  readonly carregando = signal(true);
  readonly erroCarregamento = signal('');
  readonly excluindo = signal(false);

  /** Campos preenchidos (o nome já aparece no título). */
  readonly campos = computed(() => {
    const registro = this.registro();
    if (!registro) return [];
    return this.config.campos
      .filter((campo) => campo.chave !== 'nome' && registro[campo.chave] != null && registro[campo.chave] !== '')
      .map((campo) => ({
        rotulo: campo.rotulo,
        valor: campo.tipo === 'data' ? formatarDataBR(registro[campo.chave] as string) : String(registro[campo.chave]),
        longo: campo.tipo === 'textoLongo',
      }));
  });

  readonly materiaisVinculados = computed(() => {
    const registro = this.registro();
    return (this.materiais() ?? [])
      .filter((m) => !!registro && this.config.pertenceAoMaterial(m, registro.id))
      .sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  });

  get podeEditar(): boolean {
    return this.authService.temPermissao(Permissao.EDITAR_MATERIAL);
  }

  get podeExcluir(): boolean {
    return this.authService.temPermissao(Permissao.EXCLUIR_MATERIAL);
  }

  /** "Detalhes do Autor" / "Detalhes da Editora". */
  get titulo(): string {
    return `Detalhes ${this.cadastros.concordar(this.config, 'do', 'da')} ${this.config.singular}`;
  }

  filtroMateriais(registro: RegistroAcervo): Record<string, number> {
    return this.cadastros.filtroDeMateriais(this.config, registro.id);
  }

  ngOnInit(): void {
    const naoEncontrado = `${this.config.singular} ${this.cadastros.concordar(this.config, 'não encontrado', 'não encontrada')}.`;
    const id = idDaRota(this.route);
    if (id === null) {
      this.erroCarregamento.set(naoEncontrado);
      this.carregando.set(false);
      return;
    }

    this.config.buscar(id).subscribe({
      next: (registro) => {
        this.registro.set(registro);
        this.navegacao.definirTitulo(registro.nome);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erroCarregamento.set(mensagemDeCarregamento(erro, naoEncontrado, 'Não foi possível carregar o registro.'));
        this.carregando.set(false);
      },
    });

    this.materialService
      .findAll()
      .pipe(catchError(() => of(null)))
      .subscribe((materiais) => this.materiais.set(materiais));
  }

  async excluir(): Promise<void> {
    const registro = this.registro();
    if (!registro || !this.podeExcluir || this.excluindo()) return;

    this.excluindo.set(true);
    const vinculados = this.materiais() ? this.materiaisVinculados().length : null;
    const excluido = await this.cadastros.excluir(this.config, registro, vinculados);
    this.excluindo.set(false);
    if (excluido) void this.router.navigate([this.config.rotaLista]);
  }
}
