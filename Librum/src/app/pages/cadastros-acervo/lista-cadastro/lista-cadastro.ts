import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { Permissao } from '../../../enum/permissoes.enum';
import { MaterialResponse } from '../../../models/material.model';
import { AuthService } from '../../../services/auth.service';
import { MaterialService } from '../../../services/material';
import { CorpoPadrao } from '../../../shared/component/corpo-padrao/corpo-padrao';
import { AcaoMenu, LbrAcoes } from '../../../shared/component/lbr-acoes/lbr-acoes';
import { LbrButtom } from '../../../shared/component/lbr-buttom/lbr-buttom';
import { LbrFiltros } from '../../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../../shared/component/lbr-filtros/filtros';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../../shared/component/lbr-tabela/lbr-tabela';
import { ToastService } from '../../../shared/services/toast.service';
import { mensagemDeErro } from '../../../utils/http.util';
import { ROTAS } from '../../../utils/rotas';
import { CadastrosAcervoService, RegistroAcervo } from '../cadastros-acervo';

/** Listagem de Autores, Editoras ou Gêneros (o cadastro vem da rota). */
@Component({
  selector: 'app-lista-cadastro',
  imports: [
    RouterLink,
    CorpoPadrao,
    LbrButtom,
    LbrAcoes,
    LbrFiltros,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './lista-cadastro.html',
  // textos longos (ex.: descrição do gênero) cortam com "…" para não esticar a linha
  styles: '.coluna-texto { max-width: 24rem; }',
})
export class ListaCadastro implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cadastros = inject(CadastrosAcervoService);
  private readonly materialService = inject(MaterialService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly config = this.cadastros.daRota(this.route.snapshot);
  protected readonly temFiltroAtivo = temFiltroAtivo;

  readonly registros = signal<RegistroAcervo[]>([]);
  /** `null` se os materiais não carregaram (a coluna mostra "—"). */
  private readonly materiais = signal<MaterialResponse[] | null>(null);
  readonly carregando = signal(true);
  readonly filtros = signal<ValoresFiltro>({});

  /** Quantos materiais estão vinculados a cada registro. */
  private readonly materiaisPorRegistro = computed(() => {
    const materiais = this.materiais();
    const contagem = new Map<number, number>();
    if (!materiais) return null;
    for (const registro of this.registros()) {
      contagem.set(registro.id, materiais.filter((m) => this.config.pertenceAoMaterial(m, registro.id)).length);
    }
    return contagem;
  });

  readonly configFiltro = computed<ConfigFiltro<RegistroAcervo>>(() => ({
    placeholderBusca: `Buscar ${this.config.plural.toLocaleLowerCase('pt-BR')} por nome${
      this.config.campos.length > 1 ? ' ou outros dados' : ''
    }...`,
    busca: (r) => [r.id, ...this.config.campos.filter((c) => c.tipo !== 'data').map((c) => r[c.chave])],
    campos: this.config.filtros(this.registros()),
  }));

  readonly registrosFiltrados = computed(() =>
    filtrarItens(this.registros(), this.configFiltro(), this.filtros()),
  );

  get podeEditar(): boolean {
    return this.authService.temPermissao(Permissao.EDITAR_MATERIAL);
  }

  ngOnInit(): void {
    forkJoin({
      registros: this.config.listar(),
      // os materiais só servem para a contagem; se falharem, a lista abre mesmo assim
      materiais: this.materialService.findAll().pipe(catchError(() => of(null))),
    }).subscribe({
      next: ({ registros, materiais }) => {
        this.registros.set([...registros].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
        this.materiais.set(materiais);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.carregando.set(false);
        this.toast.erro(mensagemDeErro(erro, `Não foi possível carregar ${this.config.plural.toLocaleLowerCase('pt-BR')}.`));
      },
    });
  }

  quantidadeMateriais(registro: RegistroAcervo): number | null {
    return this.materiaisPorRegistro()?.get(registro.id) ?? null;
  }

  /** Ordena a coluna Materiais pela quantidade. */
  protected readonly porQuantidade = (registro: RegistroAcervo) => this.quantidadeMateriais(registro);

  acoesDoRegistro(registro: RegistroAcervo): AcaoMenu[] {
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: [this.config.rotaLista, registro.id] },
      {
        rotulo: 'Ver materiais',
        icone: 'bi-book',
        rota: ROTAS.materiais,
        queryParams: this.cadastros.filtroDeMateriais(this.config, registro.id),
      },
      {
        rotulo: 'Editar',
        icone: 'bi-pencil',
        rota: [this.config.rotaLista, registro.id, 'editar'],
        visivel: this.podeEditar,
      },
      {
        rotulo: 'Excluir',
        icone: 'bi-trash',
        perigo: true,
        separadorAntes: true,
        visivel: this.authService.temPermissao(Permissao.EXCLUIR_MATERIAL),
        executar: () => void this.excluir(registro),
      },
    ];
  }

  async excluir(registro: RegistroAcervo): Promise<void> {
    if (await this.cadastros.excluir(this.config, registro, this.quantidadeMateriais(registro))) {
      this.registros.update((lista) => lista.filter((r) => r.id !== registro.id));
    }
  }
}
