import { Component, computed, inject, input, model, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { OpcaoSelect, SelectPesquisavel } from '../select-pesquisavel/select-pesquisavel';
import {
  CampoFiltro,
  CHAVE_BUSCA,
  ConfigFiltro,
  listaDe,
  OpcaoFiltro,
  SUFIXO_ATE,
  SUFIXO_DE,
  ValoresFiltro,
} from './filtros';

let proximoId = 0;

interface Chip {
  id: string;
  texto: string;
  remover: () => void;
}

/**
 * Barra de filtros padrão do sistema: busca inteligente + painel de filtros + chips dos filtros ativos.
 * Os valores ficam na URL (opcional), então voltar de uma tela de detalhe mantém o filtro.
 *
 * ```html
 * <lbr-filtros [config]="configFiltro()" [(valores)]="filtros">
 *   <a lbrFiltrosAcoes ...>Cadastrar</a>
 * </lbr-filtros>
 * ```
 * Na página: `itensFiltrados = computed(() => filtrarItens(itens(), configFiltro(), filtros()))`.
 */
@Component({
  selector: 'lbr-filtros',
  imports: [FormsModule, SelectPesquisavel],
  templateUrl: './lbr-filtros.html',
  styleUrl: './lbr-filtros.scss',
})
export class LbrFiltros<T> implements OnInit, OnDestroy {
  readonly config = input.required<ConfigFiltro<T>>();
  readonly valores = model<ValoresFiltro>({});
  /** Guarda os filtros na URL. Desligue quando houver mais de uma barra de filtros na mesma tela. */
  readonly sincronizarUrl = input(true);
  readonly desabilitado = input(false);

  protected readonly idBase = `lbr-filtros-${proximoId++}`;
  protected readonly painelAberto = signal(false);
  protected readonly CHAVE_BUSCA = CHAVE_BUSCA;
  protected readonly DE = SUFIXO_DE;
  protected readonly ATE = SUFIXO_ATE;

  private readonly router = inject(Router, { optional: true });
  private readonly route = inject(ActivatedRoute, { optional: true });
  private temporizadorUrl?: ReturnType<typeof setTimeout>;

  protected readonly campos = computed(() => this.config().campos ?? []);

  /** A lista pesquisável trabalha com ids numéricos: cada opção recebe a sua posição + 1. */
  protected readonly opcoesSelect = computed(() => {
    const resultado: Record<string, OpcaoSelect[]> = {};
    for (const campo of this.campos()) {
      if (campo.tipo === 'lista') {
        resultado[campo.chave] = campo.opcoes.map((opcao, i) => ({ id: i + 1, nome: opcao.rotulo }));
      }
    }
    return resultado;
  });

  protected readonly idsSelecionados = computed(() => {
    const valores = this.valores();
    const resultado: Record<string, number[]> = {};
    for (const campo of this.campos()) {
      if (campo.tipo !== 'lista') continue;
      const selecionados = listaDe(valores[campo.chave]);
      resultado[campo.chave] = campo.opcoes
        .map((opcao, i) => (selecionados.includes(String(opcao.valor)) ? i + 1 : 0))
        .filter(Boolean);
    }
    return resultado;
  });

  /** Quantos filtros do painel estão em uso (a busca não conta). */
  protected readonly quantidadeAtivos = computed(() => {
    const valores = this.valores();
    return this.campos().filter((campo) =>
      campo.tipo === 'periodo'
        ? !!valores[campo.chave + SUFIXO_DE] || !!valores[campo.chave + SUFIXO_ATE]
        : listaDe(valores[campo.chave]).length > 0,
    ).length;
  });

  protected readonly chips = computed<Chip[]>(() => {
    const valores = this.valores();
    const chips: Chip[] = [];

    const busca = valores[CHAVE_BUSCA] as string | undefined;
    if (busca?.trim()) {
      chips.push({
        id: CHAVE_BUSCA,
        texto: `Busca: “${busca.trim()}”`,
        remover: () => this.atualizar({ [CHAVE_BUSCA]: undefined }),
      });
    }

    for (const campo of this.campos()) {
      if (campo.tipo === 'periodo') {
        const de = valores[campo.chave + SUFIXO_DE] as string | undefined;
        const ate = valores[campo.chave + SUFIXO_ATE] as string | undefined;
        if (!de && !ate) continue;
        const partes = [de ? `de ${this.dataBR(de)}` : '', ate ? `até ${this.dataBR(ate)}` : ''];
        chips.push({
          id: campo.chave,
          texto: `${campo.rotulo}: ${partes.filter(Boolean).join(' ')}`,
          remover: () =>
            this.atualizar({ [campo.chave + SUFIXO_DE]: undefined, [campo.chave + SUFIXO_ATE]: undefined }),
        });
        continue;
      }

      for (const valor of listaDe(valores[campo.chave])) {
        const opcao = campo.opcoes.find((o) => String(o.valor) === valor);
        // Sem opção correspondente (ex.: filtro vindo da URL para um usuário sem empréstimos): mostra o id.
        const rotulo = opcao?.rotulo ?? (/^\d+$/.test(valor) ? `#${valor}` : valor);
        chips.push({
          id: `${campo.chave}:${valor}`,
          texto: `${campo.rotulo}: ${rotulo}`,
          remover: () => this.removerValor(campo, valor),
        });
      }
    }
    return chips;
  });

  ngOnInit(): void {
    if (!this.sincronizarUrl() || !this.route) return;

    const params = this.route.snapshot.queryParamMap;
    const daUrl: ValoresFiltro = {};
    for (const chave of this.chavesUrl()) {
      const valores = params.getAll(chave).filter(Boolean);
      if (!valores.length) continue;
      const campo = this.campos().find((c) => c.chave === chave);
      daUrl[chave] = campo && campo.tipo !== 'periodo' ? valores : valores[0];
    }
    if (Object.keys(daUrl).length) {
      this.valores.set({ ...this.valores(), ...daUrl });
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.temporizadorUrl);
  }

  // ---------- Ações da interface ----------

  protected opcoesDo(campo: CampoFiltro<T>): OpcaoFiltro[] {
    return campo.tipo === 'periodo' ? [] : campo.opcoes;
  }

  protected placeholderDo(campo: CampoFiltro<T>): string {
    return campo.tipo === 'lista' && campo.placeholder
      ? campo.placeholder
      : `Digite para buscar ${campo.rotulo.toLocaleLowerCase('pt-BR')}...`;
  }

  protected estaSelecionado(campo: CampoFiltro<T>, opcao: OpcaoFiltro): boolean {
    return listaDe(this.valores()[campo.chave]).includes(String(opcao.valor));
  }

  protected valorTexto(chave: string): string {
    return (this.valores()[chave] as string | undefined) ?? '';
  }

  protected alterarBusca(texto: string): void {
    this.atualizar({ [CHAVE_BUSCA]: texto || undefined });
  }

  protected alternarOpcao(campo: CampoFiltro<T>, opcao: OpcaoFiltro): void {
    const atuais = listaDe(this.valores()[campo.chave]);
    const valor = String(opcao.valor);
    const novos = atuais.includes(valor) ? atuais.filter((v) => v !== valor) : [...atuais, valor];
    this.atualizar({ [campo.chave]: novos.length ? novos : undefined });
  }

  protected alterarLista(campo: CampoFiltro<T>, ids: number[] | null): void {
    const opcoes = this.opcoesDo(campo);
    const novos = (ids ?? []).map((id) => opcoes[id - 1]).filter(Boolean).map((o) => String(o.valor));
    this.atualizar({ [campo.chave]: novos.length ? novos : undefined });
  }

  protected alterarPeriodo(campo: CampoFiltro<T>, sufixo: string, data: string): void {
    this.atualizar({ [campo.chave + sufixo]: data || undefined });
  }

  protected limpar(): void {
    this.valores.set({});
    this.agendarUrl();
  }

  private removerValor(campo: CampoFiltro<T>, valor: string): void {
    const novos = listaDe(this.valores()[campo.chave]).filter((v) => v !== valor);
    this.atualizar({ [campo.chave]: novos.length ? novos : undefined });
  }

  private atualizar(parcial: ValoresFiltro): void {
    const novos: ValoresFiltro = { ...this.valores(), ...parcial };
    for (const chave of Object.keys(novos)) {
      if (novos[chave] === undefined) delete novos[chave];
    }
    this.valores.set(novos);
    this.agendarUrl();
  }

  // ---------- URL ----------

  private chavesUrl(): string[] {
    const chaves = [CHAVE_BUSCA];
    for (const campo of this.campos()) {
      if (campo.tipo === 'periodo') chaves.push(campo.chave + SUFIXO_DE, campo.chave + SUFIXO_ATE);
      else chaves.push(campo.chave);
    }
    return chaves;
  }

  /** Espera a pessoa parar de digitar antes de atualizar a URL. */
  private agendarUrl(): void {
    if (!this.sincronizarUrl() || !this.router || !this.route) return;
    clearTimeout(this.temporizadorUrl);
    this.temporizadorUrl = setTimeout(() => {
      const valores = this.valores();
      const queryParams: Params = {};
      for (const chave of this.chavesUrl()) {
        const lista = listaDe(valores[chave]);
        queryParams[chave] = lista.length ? lista : null;
      }
      void this.router!.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }, 300);
  }

  private dataBR(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}
