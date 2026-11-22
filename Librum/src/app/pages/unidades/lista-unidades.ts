import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { FilialResponse } from '../../models/filial.model';
import { FilialService } from '../../services/filial.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';
import { LbrFiltros } from '../../shared/component/lbr-filtros/lbr-filtros';
import {
  ConfigFiltro,
  filtrarItens,
  temFiltroAtivo,
  ValoresFiltro,
} from '../../shared/component/lbr-filtros/filtros';
import { AcaoMenu, LbrAcoes } from '../../shared/component/lbr-acoes/lbr-acoes';
import { Modal } from '../../shared/component/modal/modal';
import {
  LbrTabela,
  LbrTabelaCabecalho,
  LbrTabelaLinha,
  LbrTabelaOrdenar,
} from '../../shared/component/lbr-tabela/lbr-tabela';

@Component({
  selector: 'app-lista-unidades',
  imports: [
    RouterLink,
    CorpoPadrao,
    LbrButtom,
    LbrFiltros,
    LbrAcoes,
    Modal,
    LbrTabela,
    LbrTabelaCabecalho,
    LbrTabelaLinha,
    LbrTabelaOrdenar,
  ],
  templateUrl: './lista-unidades.html',
})
export class ListaUnidades implements OnInit {
  private readonly filialService = inject(FilialService);
  private readonly destroyRef = inject(DestroyRef);

  readonly unidades = signal<FilialResponse[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal('');
  readonly filtros = signal<ValoresFiltro>({});
  protected readonly temFiltroAtivo = temFiltroAtivo;
  readonly selecionada = signal<FilialResponse | null>(null);
  readonly configFiltro: ConfigFiltro<FilialResponse> = {
    placeholderBusca: 'Buscar unidades por nome, CNPJ, cidade ou outros dados...',
    busca: (unidade) => [
      unidade.id,
      unidade.nomeFantasia,
      unidade.razaoSocial,
      unidade.cnpj,
      unidade.cidade,
      unidade.estado,
      unidade.email,
    ],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'status',
        rotulo: 'Status',
        valorDoItem: (unidade) => String(unidade.ativo),
        opcoes: [
          { valor: 'true', rotulo: 'Ativa' },
          { valor: 'false', rotulo: 'Inativa' },
        ],
      },
    ],
  };
  readonly unidadesFiltradas = computed(() =>
    filtrarItens(this.unidades(), this.configFiltro, this.filtros()),
  );

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    if (this.carregando()) return;
    this.erro.set('');
    this.carregando.set(true);
    this.filialService
      .listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregando.set(false)),
      )
      .subscribe({
        next: (unidades) =>
          this.unidades.set(
            [...unidades].sort((a, b) => a.nomeFantasia.localeCompare(b.nomeFantasia, 'pt-BR')),
          ),
        error: () => this.erro.set('Não foi possível carregar as unidades. Tente novamente.'),
      });
  }

  formatarCnpj(cnpj: string): string {
    return cnpj
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  acoesDaUnidade(unidade: FilialResponse): AcaoMenu[] {
    return [
      { rotulo: 'Ver detalhes', icone: 'bi-eye', executar: () => this.selecionada.set(unidade) },
    ];
  }
}
