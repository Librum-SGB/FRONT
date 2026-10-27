import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, forkJoin, switchMap, TimeoutError, timeout } from 'rxjs';
import { ModalLivro } from './modal-livro/modal-livro';
import {
  EstanteRequestDto,
  EstantePrateleiraDto,
  EstanteVirtualDto,
  ExemplarVirtualDto,
} from '../../dto/estantevirtual.dto';
import { EstanteService } from '../../shared/services/estante-virtual.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { ModalNovaEstante } from '../../shared/component/modal-nova-estante/modal-nova-estante';
import { ExemplarRequest, ExemplarResponse } from '../../models/exemplar.model';
import { MaterialResponse } from '../../models/material.model';
import { ExemplarService } from '../../services/exemplar';
import { MaterialService } from '../../services/material';
import { CadastrarMaterial } from '../cadastrar-material/cadastrar-material';
import { OpcaoSelect, SelectPesquisavel } from '../../shared/component/select-pesquisavel/select-pesquisavel';
import { Router } from '@angular/router';
import { LbrButtom } from '../../shared/component/lbr-buttom/lbr-buttom';

@Component({
  selector: 'app-encontrar-material',
  imports: [
    CommonModule,
    FormsModule,
    ModalLivro,
    CorpoPadrao,
    ModalNovaEstante,
    CadastrarMaterial,
    SelectPesquisavel,
    LbrButtom,
  ],
  templateUrl: './encontrar-material.html',
  styleUrl: './encontrar-material.scss',
})
export class EncontrarMaterial implements OnInit {
  busca: string = '';
  livroEscolhido?: ExemplarVirtualDto;
  exemplarEmEdicao?: ExemplarVirtualDto;
  exemplarParaRemover?: ExemplarVirtualDto;
  exemplarArrastado?: { estanteId: number; exemplar: ExemplarVirtualDto };
  estanteEmEdicao?: EstanteVirtualDto;
  estanteParaConfirmacao?: EstanteVirtualDto;
  prateleirasEditando: EstantePrateleiraDto[] = [];
  acaoEstanteConfirmada?: 'limpar' | 'excluir';
  modalAberta = false;
  modalEstanteAberta = false;
  modalAdicionarLivroAberta = false;
  modalEditarExemplarAberta = false;
  modalConfirmarRemocaoAberta = false;
  modalCadastroLivroAberta = false;
  carregandoEstantes = false;
  carregandoMateriais = false;
  salvandoEstante = false;
  salvandoLivro = false;
  erroCarregamento?: string;
  erroEstante?: string;
  erroAdicionarLivro?: string;
  erroEdicaoEstante?: string;
  erroAcaoEstante?: string;
  materiaisDisponiveis: MaterialResponse[] = [];
  exemplaresDisponiveis: ExemplarResponse[] = [];
  todosExemplares: ExemplarResponse[] = [];
  livroSelecionadoId?: number;
  estanteSelecionadaId?: number;
  prateleiraSelecionada = '';
  posicaoLivro = '';

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private estanteService: EstanteService,
    private exemplarService: ExemplarService,
    private materialService: MaterialService,
    private router: Router,
  ) {}

  @ViewChild(ModalNovaEstante) modalNovaEstante?: ModalNovaEstante;

  ngOnInit(): void {
    this.carregarEstantes();
  }

  selecionarPrateleira(nome: string): void {
    this.prateleiraSelecionada = nome;
    this.posicaoLivro = '';
  }

  abrirModal(livro: ExemplarVirtualDto) {
    this.livroEscolhido = livro;
    this.modalAberta = true;
  }

  editarLocalizacao(exemplar: ExemplarVirtualDto): void {
    this.exemplarEmEdicao = exemplar;
    this.estanteSelecionadaId = this.estantes.find((estante) =>
      estante.prateleiras.some((prateleira) =>
        prateleira.exemplares.some((item) => item.id === exemplar.id),
      ),
    )?.id;
    this.prateleiraSelecionada = exemplar.prateleira?.trim() || 'Prateleira 1';
    this.posicaoLivro = exemplar.posicao ?? '';
    this.modalAberta = false;
    this.modalEditarExemplarAberta = true;
  }

  salvarLocalizacaoExemplar(): void {
    const exemplar = this.exemplarEmEdicao;
    const estante = this.estanteSelecionada;
    if (!exemplar || !estante || !this.prateleiraSelecionada || !this.posicaoLivro) {
      this.erroAdicionarLivro = 'Selecione a prateleira e a posição do exemplar.';
      return;
    }

    const prateleiraDestino = estante.prateleiras.find(
      (item) => item.nome === this.prateleiraSelecionada,
    );
    const posicao = Number(this.posicaoLivro);
    if (
      !prateleiraDestino ||
      !Number.isInteger(posicao) ||
      posicao < prateleiraDestino.posicaoInicial ||
      posicao > prateleiraDestino.posicaoFinal ||
      !this.posicoesDisponiveis(estante.id, this.prateleiraSelecionada, exemplar.id)
        .includes(posicao)
    ) {
      this.erroAdicionarLivro = 'A posição selecionada já está ocupada.';
      return;
    }

    this.salvandoLivro = true;
    this.erroAdicionarLivro = undefined;
    this.exemplarService
      .update(exemplar.id, {
        materialId: exemplar.material.id,
        filialId: estante.filialId,
        estanteId: estante.id,
        codigoBarras: exemplar.codigoBarras,
        prateleira: this.prateleiraSelecionada,
        posicao: this.posicaoLivro,
        status: exemplar.status ?? 'DISPONIVEL',
      })
      .pipe(finalize(() => (this.salvandoLivro = false)))
      .subscribe({
        next: () => {
          this.modalEditarExemplarAberta = false;
          this.carregarEstantes();
        },
        error: (err: unknown) => {
          console.error('Erro ao alterar localização do exemplar', err);
          this.erroAdicionarLivro = this.mensagemErroOperacaoExemplar(err);
        },
      });
  }

  solicitarRemocaoDaEstante(exemplar: ExemplarVirtualDto): void {
    this.exemplarParaRemover = exemplar;
    this.modalAberta = false;
    this.modalConfirmarRemocaoAberta = true;
  }

  cancelarRemocaoDaEstante(): void {
    if (this.salvandoLivro) {
      return;
    }
    this.modalConfirmarRemocaoAberta = false;
    this.exemplarParaRemover = undefined;
  }

  confirmarRemocaoDaEstante(): void {
    const exemplar = this.exemplarParaRemover;
    if (!exemplar || this.salvandoLivro) {
      return;
    }

    this.salvandoLivro = true;
    this.erroAdicionarLivro = undefined;
    this.exemplarService
      .detachFromEstante(exemplar.id)
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.salvandoLivro = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.modalConfirmarRemocaoAberta = false;
          this.exemplarParaRemover = undefined;
          this.carregarEstantes();
        },
        error: (err: unknown) => {
          console.error('Erro ao remover exemplar da estante', err);
          this.erroAdicionarLivro = this.mensagemErroOperacaoExemplar(err);
        },
      });
  }

  editarMaterial(materialId: number): void {
    void this.router.navigate(['/editarExcluirMaterial'], {
      queryParams: { materialId, editar: true },
    });
  }

  private mensagemErroOperacaoExemplar(err: unknown): string {
    if (err instanceof TimeoutError) {
      return 'A API demorou demais para responder. Tente novamente.';
    }
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) {
        return 'Sua sessão expirou. Entre novamente e tente de novo.';
      }
      if (typeof err.error === 'object' && err.error !== null) {
        const mensagens = Object.values(err.error as Record<string, unknown>)
          .filter((value): value is string => typeof value === 'string');
        if (mensagens.length) {
          return mensagens.join(' ');
        }
      }
      return `Não foi possível salvar (HTTP ${err.status}). Verifique os dados e tente novamente.`;
    }
    return 'Não foi possível salvar. Tente novamente.';
  }

  private gerarCodigoBarras(): string {
    const uuid = globalThis.crypto?.randomUUID?.();
    const identificador = uuid ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `LIBRUM-${identificador}`;
  }

  estantes: EstanteVirtualDto[] = [];

  estantesFiltradas: EstanteVirtualDto[] = [];

  abrirModalEstante(): void {
    this.erroEstante = undefined;
    this.modalEstanteAberta = true;
  }

  abrirModalAdicionarLivro(estanteId: number): void {
    this.erroAdicionarLivro = undefined;
    this.modalAdicionarLivroAberta = true;
    this.exemplarEmEdicao = undefined;
    this.estanteSelecionadaId = estanteId;
    this.prateleiraSelecionada = this.prateleirasDaEstante(this.estanteSelecionadaId)[0] ?? '';
    this.posicaoLivro = '';
    this.livroSelecionadoId = undefined;
    this.carregandoMateriais = true;
    forkJoin({
      materiais: this.materialService.findAll(true),
      exemplares: this.exemplarService.findAll(true),
    }).subscribe({
      next: ({ materiais, exemplares }) => {
        this.materiaisDisponiveis = materiais ?? [];
        this.todosExemplares = exemplares ?? [];
        this.exemplaresDisponiveis = (exemplares ?? []).filter(
          (exemplar) => exemplar.estanteId == null,
        );
        this.carregandoMateriais = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Erro ao carregar materiais para a estante', err);
        this.erroAdicionarLivro = 'Não foi possível carregar os livros. Tente novamente.';
        this.carregandoMateriais = false;
        this.changeDetectorRef.markForCheck();
      },
    });
  }

  get opcoesLivros(): OpcaoSelect[] {
    const exemplaresDisponiveis = this.exemplaresDisponiveis.flatMap((exemplar) => {
      const material = this.materiaisDisponiveis.find((item) => item.id === exemplar.materialId);
      return material?.tipo === 'LIVRO'
        ? [{ id: exemplar.id, nome: material.titulo }]
        : [];
    });
    const idsMateriaisComExemplar = new Set(this.todosExemplares.map((exemplar) => exemplar.materialId));
    const materiaisSemExemplares = this.materiaisDisponiveis
      .filter((material) => material.tipo === 'LIVRO' && !idsMateriaisComExemplar.has(material.id))
      .map((material) => ({ id: -material.id, nome: material.titulo }));
    return [...exemplaresDisponiveis, ...materiaisSemExemplares];
  }

  prateleirasDaEstante(estanteId: number | undefined): string[] {
    return (
      this.estantes
        .find((estante) => estante.id === estanteId)
        ?.prateleiras.filter((prateleira) =>
          this.posicoesDisponiveis(estanteId, prateleira.nome, this.exemplarEmEdicao?.id).length > 0,
        )
        .map((prateleira) => prateleira.nome) ?? []
    );
  }

  get estanteSelecionada(): EstanteVirtualDto | undefined {
    return this.estantes.find((estante) => estante.id === this.estanteSelecionadaId);
  }

  posicoesDisponiveis(
    estanteId: number | undefined,
    prateleiraNome: string,
    ignorarExemplarId?: number,
  ): number[] {
    const estante = this.estantes.find((item) => item.id === estanteId);
    if (!estante) {
      return [];
    }

    const prateleira = estante.prateleiras.find((item) => item.nome === prateleiraNome);
    if (!prateleira) {
      return [];
    }

    const ocupadas = new Set(
      prateleira.exemplares
        .filter((exemplar) => exemplar.id !== ignorarExemplarId)
        .map((exemplar) => Number(exemplar.posicao))
        .filter((posicao) => Number.isInteger(posicao) && posicao > 0) ?? [],
    );
    return Array.from(
      { length: Math.min(prateleira.posicaoFinal - prateleira.posicaoInicial + 1, 1000) },
      (_, index) => prateleira.posicaoInicial + index,
    )
      .filter((posicao) => !ocupadas.has(posicao));
  }

  abrirCadastroLivro(): void {
    this.modalAdicionarLivroAberta = false;
    this.modalCadastroLivroAberta = true;
  }

  aoCadastrarLivro(material: MaterialResponse): void {
    this.modalCadastroLivroAberta = false;
    this.materiaisDisponiveis = [
      ...this.materiaisDisponiveis.filter((item) => item.id !== material.id),
      material,
    ];
    this.livroSelecionadoId = -material.id;
    this.modalAdicionarLivroAberta = true;
  }

  fecharModalAdicionarLivro(): void {
    if (this.salvandoLivro) {
      return;
    }

    this.modalAdicionarLivroAberta = false;
    this.erroAdicionarLivro = undefined;
  }

  adicionarLivro(): void {
    const estante = this.estantes.find((item) => item.id === this.estanteSelecionadaId);
    if (
      !estante ||
      this.livroSelecionadoId === undefined ||
      !this.prateleiraSelecionada.trim() ||
      !this.posicaoLivro
    ) {
      this.erroAdicionarLivro = 'Selecione um livro, uma estante, uma prateleira e informe a posição.';
      return;
    }
    if (
      !this.posicoesDisponiveis(estante.id, this.prateleiraSelecionada)
        .includes(Number(this.posicaoLivro))
    ) {
      this.erroAdicionarLivro = 'A posição selecionada já está ocupada. Escolha outra posição.';
      return;
    }

    this.salvandoLivro = true;
    this.erroAdicionarLivro = undefined;
    const escolhido = this.livroSelecionadoId;
    const existente = escolhido > 0
      ? this.exemplaresDisponiveis.find((exemplar) => exemplar.id === escolhido)
      : undefined;
    if (
      (escolhido > 0 && !existente) ||
      (escolhido < 0 && !this.materiaisDisponiveis.some((material) =>
        material.id === -escolhido && material.tipo === 'LIVRO' &&
        !this.todosExemplares.some((exemplar) => exemplar.materialId === material.id),
      ))
    ) {
      this.erroAdicionarLivro = 'O exemplar selecionado não está mais disponível. Atualize a lista e tente novamente.';
      this.salvandoLivro = false;
      return;
    }
    const payload: ExemplarRequest = {
      materialId: existente?.materialId ?? -escolhido,
      filialId: estante.filialId,
      estanteId: estante.id,
      codigoBarras: existente?.codigoBarras ?? this.gerarCodigoBarras(),
      prateleira: this.prateleiraSelecionada,
      posicao: this.posicaoLivro,
      status: existente?.status ?? 'DISPONIVEL',
    };
    const request = existente
      ? this.exemplarService.update(existente.id, payload)
      : this.exemplarService.create(payload);

    request
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.salvandoLivro = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.modalAdicionarLivroAberta = false;
          this.carregarEstantes();
          this.changeDetectorRef.markForCheck();
        },
        error: (err: unknown) => {
          console.error('Erro ao adicionar livro à estante', err);
          this.erroAdicionarLivro = this.mensagemErroOperacaoExemplar(err);
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  slotsDaPrateleira(
    prateleira: EstanteVirtualDto['prateleiras'][number],
  ): Array<{ posicao: number; exemplar?: ExemplarVirtualDto; permiteDrop: boolean }> {
    const quantidade = Math.max(0, prateleira.posicaoFinal - prateleira.posicaoInicial + 1);
    const exibidos = new Set<number>();
    const slots = Array.from({ length: Math.min(quantidade, 1000) }, (_, index) => {
      const posicao = prateleira.posicaoInicial + index;
      const exemplar = prateleira.exemplares.find((item) =>
        Number(item.posicao) === posicao && !exibidos.has(item.id),
      );
      if (exemplar) {
        exibidos.add(exemplar.id);
      }
      return { posicao, exemplar, permiteDrop: true };
    });

    for (const exemplar of prateleira.exemplares) {
      if (!exibidos.has(exemplar.id)) {
        slots.push({
          posicao: Number(exemplar.posicao) || 0,
          exemplar,
          permiteDrop: false,
        });
      }
    }

    return slots;
  }

  private exemplarNaPosicao(
    prateleira: EstanteVirtualDto['prateleiras'][number],
    posicao: number,
  ): ExemplarVirtualDto | undefined {
    return prateleira.exemplares.find((exemplar) =>
      Number(exemplar.posicao) === posicao,
    );
  }

  iniciarArraste(estanteId: number, exemplar: ExemplarVirtualDto): void {
    this.exemplarArrastado = { estanteId, exemplar };
  }

  permitirSoltar(event: DragEvent): void {
    event.preventDefault();
  }

  soltarExemplar(
    event: DragEvent,
    estante: EstanteVirtualDto,
    prateleiraDestino: EstanteVirtualDto['prateleiras'][number],
    posicaoDestino: number,
  ): void {
    event.preventDefault();
    const arrastado = this.exemplarArrastado;
    this.exemplarArrastado = undefined;
    if (!arrastado || arrastado.estanteId !== estante.id || this.busca.trim()) {
      return;
    }

    const exemplar = arrastado.exemplar;
    const prateleiraOrigem = estante.prateleiras.find((item) =>
      item.exemplares.some((livro) => livro.id === exemplar.id),
    );
    if (!prateleiraOrigem) {
      return;
    }
    const posicaoOrigem = Number(exemplar.posicao);
    const ocupante = this.exemplarNaPosicao(prateleiraDestino, posicaoDestino);
    if (
      prateleiraOrigem.nome === prateleiraDestino.nome &&
      posicaoOrigem === posicaoDestino
    ) {
      return;
    }

    const origemRequest = this.payloadLocalizacao(exemplar, estante, prateleiraDestino.nome, posicaoDestino);
    const requests = [this.exemplarService.update(exemplar.id, origemRequest)];
    if (ocupante) {
      requests.push(this.exemplarService.update(
        ocupante.id,
        this.payloadLocalizacao(ocupante, estante, prateleiraOrigem.nome, posicaoOrigem),
      ));
    }

    this.atualizarLocalizacaoNaTela(
      estante.id,
      exemplar.id,
      prateleiraDestino.nome,
      posicaoDestino,
      ocupante,
      prateleiraOrigem.nome,
      posicaoOrigem,
    );
    this.salvandoLivro = true;
    forkJoin(requests)
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.salvandoLivro = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => this.carregarEstantes(),
        error: (err: unknown) => {
          console.error('Erro ao mover exemplar na estante', err);
          this.carregarEstantes();
        },
      });
  }

  private payloadLocalizacao(
    exemplar: ExemplarVirtualDto,
    estante: EstanteVirtualDto,
    prateleira: string,
    posicao: number,
  ): ExemplarRequest {
    return {
      materialId: exemplar.material.id,
      filialId: estante.filialId,
      estanteId: estante.id,
      codigoBarras: exemplar.codigoBarras,
      prateleira,
      posicao: String(posicao),
      status: exemplar.status ?? 'DISPONIVEL',
    };
  }

  private atualizarLocalizacaoNaTela(
    estanteId: number,
    exemplarId: number,
    prateleiraDestino: string,
    posicaoDestino: number,
    ocupante: ExemplarVirtualDto | undefined,
    prateleiraOrigem: string,
    posicaoOrigem: number,
  ): void {
    this.estantes = this.estantes.map((estante) => {
      if (estante.id !== estanteId) {
        return estante;
      }
      const prateleiras = estante.prateleiras.map((prateleira) => ({
        ...prateleira,
        exemplares: prateleira.exemplares.map((exemplar) => {
          if (exemplar.id === exemplarId) {
            return { ...exemplar, prateleira: prateleiraDestino, posicao: String(posicaoDestino) };
          }
          if (ocupante && exemplar.id === ocupante.id) {
            return { ...exemplar, prateleira: prateleiraOrigem, posicao: String(posicaoOrigem) };
          }
          return exemplar;
        }),
      }));
      return {
        ...estante,
        prateleiras: prateleiras.map((prateleira) => ({
          ...prateleira,
          exemplares: prateleira.exemplares.filter((exemplar) =>
            exemplar.prateleira === prateleira.nome,
          ),
        })),
      };
    });
    this.onBuscar();
    this.changeDetectorRef.markForCheck();
  }

  onEstanteCriada(novaEstante: EstanteRequestDto): void {
    this.salvandoEstante = true;
    this.erroEstante = undefined;
    this.estanteService
      .criarEstante(novaEstante)
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.salvandoEstante = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (criada) => {
          const novaEstante: EstanteVirtualDto = {
            id: criada.id,
            nome: criada.nome,
            filialId: criada.filialId,
            localizacao: criada.localizacao,
            capacidade: criada.capacidade,
            prateleiras: (criada.prateleiras ?? Array.from(
              { length: criada.qtdPrateleiras ?? 0 },
              (_, index) => ({
                nome: `Prateleira ${index + 1}`,
                posicaoInicial: 1,
                posicaoFinal: criada.capacidade ?? 100,
                ordem: index + 1,
              }),
            )).map((prateleira) => ({
              ...prateleira,
              exemplares: [],
            })),
          };
          this.estantes = [
            ...this.estantes.filter((estante) => estante.id !== novaEstante.id),
            novaEstante,
          ];
          this.onBuscar();
          this.modalNovaEstante?.fechar();
          this.carregarEstantes();
          this.changeDetectorRef.markForCheck();
        },
        error: (err: unknown) => {
          console.error('Erro ao criar estante', err);
          this.erroEstante = this.mensagemErroEstante(err);
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  abrirEdicaoEstante(estante: EstanteVirtualDto): void {
    this.estanteEmEdicao = estante;
    this.prateleirasEditando = estante.prateleiras.map(({ id, nome, ordem, posicaoInicial, posicaoFinal }) => ({
      id,
      nome,
      ordem,
      posicaoInicial,
      posicaoFinal,
    }));
    this.erroEdicaoEstante = undefined;
  }

  adicionarPrateleiraEditando(): void {
    const capacidade = this.estanteEmEdicao?.capacidade ?? 100;
    const numero = this.prateleirasEditando.length + 1;
    this.prateleirasEditando = [
      ...this.prateleirasEditando,
      {
        nome: `Prateleira ${numero}`,
        ordem: numero,
        posicaoInicial: 1,
        posicaoFinal: capacidade,
      },
    ];
  }

  removerPrateleiraEditando(indice: number): void {
    const editada = this.prateleirasEditando[indice];
    const prateleira = this.estanteEmEdicao?.prateleiras.find((item) =>
      editada?.id !== undefined ? item.id === editada.id : item.ordem === editada?.ordem,
    );
    if (prateleira?.exemplares.length) {
      this.erroEdicaoEstante = 'Esvazie a prateleira antes de removê-la.';
      return;
    }
    this.prateleirasEditando = this.prateleirasEditando
      .filter((_, itemIndice) => itemIndice !== indice)
      .map((item, itemIndice) => ({ ...item, ordem: itemIndice + 1 }));
    this.erroEdicaoEstante = undefined;
  }

  salvarEdicaoEstante(): void {
    const estante = this.estanteEmEdicao;
    if (!estante) {
      return;
    }
    const nomes = this.prateleirasEditando.map((item) => item.nome.trim().toLocaleLowerCase());
    const faixaMantemExemplares = estante.prateleiras.every((prateleira, indice) =>
      prateleira.exemplares.every((exemplar) => {
        const posicao = Number(exemplar.posicao);
        const faixa = this.prateleirasEditando.find((item) =>
          prateleira.id !== undefined ? item.id === prateleira.id : item.ordem === indice + 1,
        );
        return faixa !== undefined &&
          posicao >= Number(faixa.posicaoInicial) &&
          posicao <= Number(faixa.posicaoFinal);
      }),
    );
    const configuracaoValida = this.prateleirasEditando.length > 0 &&
      faixaMantemExemplares &&
      this.prateleirasEditando.every((item) =>
        item.nome.trim().length > 0 &&
        Number.isInteger(Number(item.posicaoInicial)) &&
        Number.isInteger(Number(item.posicaoFinal)) &&
        Number(item.posicaoInicial) > 0 &&
        Number(item.posicaoFinal) >= Number(item.posicaoInicial),
      ) &&
      new Set(nomes).size === nomes.length;
    if (!configuracaoValida) {
      this.erroEdicaoEstante = faixaMantemExemplares
        ? 'Informe nomes únicos e faixas de posições válidas para todas as prateleiras.'
        : 'A faixa de posições não pode excluir livros que já estão na prateleira.';
      return;
    }

    const payload: EstanteRequestDto = {
      nome: estante.nome.trim(),
      localizacao: estante.localizacao.trim(),
      capacidade: estante.capacidade,
      qtdPrateleiras: this.prateleirasEditando.length,
      prateleiras: this.prateleirasEditando.map((item, index) => ({
        ...item,
        nome: item.nome.trim(),
        ordem: index + 1,
        posicaoInicial: Number(item.posicaoInicial),
        posicaoFinal: Number(item.posicaoFinal),
      })),
    };
    this.salvandoEstante = true;
    this.erroEdicaoEstante = undefined;
    this.estanteService.atualizarEstante(estante.id, payload)
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.salvandoEstante = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.estanteEmEdicao = undefined;
          this.carregarEstantes();
        },
        error: (err: unknown) => {
          console.error('Erro ao editar estante', err);
          this.erroEdicaoEstante = this.mensagemErroEstante(err);
        },
      });
  }

  solicitarAcaoEstante(estante: EstanteVirtualDto, acao: 'limpar' | 'excluir'): void {
    this.estanteParaConfirmacao = estante;
    this.acaoEstanteConfirmada = acao;
    this.erroAcaoEstante = undefined;
  }

  executarAcaoEstante(): void {
    const estante = this.estanteParaConfirmacao;
    const acao = this.acaoEstanteConfirmada;
    if (!estante || !acao || this.salvandoEstante) {
      return;
    }
    this.salvandoEstante = true;
    this.erroAcaoEstante = undefined;
    const request = acao === 'limpar'
      ? this.estanteService.limparEstante(estante.id)
      : this.estanteService.limparEstante(estante.id).pipe(
        switchMap(() => this.estanteService.excluirEstante(estante.id)),
      );
    request
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.salvandoEstante = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.estanteParaConfirmacao = undefined;
          this.acaoEstanteConfirmada = undefined;
          this.carregarEstantes();
        },
        error: (err: unknown) => {
          console.error(`Erro ao ${acao} estante`, err);
          this.erroAcaoEstante = this.mensagemErroEstante(err);
        },
      });
  }

  cancelarAcaoEstante(): void {
    if (this.salvandoEstante) {
      return;
    }
    this.estanteParaConfirmacao = undefined;
    this.acaoEstanteConfirmada = undefined;
  }

  private mensagemErroEstante(err: unknown): string {
    if (err instanceof TimeoutError) {
      return 'A API demorou demais para responder. Verifique a conexão e tente novamente.';
    }

    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) {
        return 'Sua sessão expirou ou não está autenticada. Entre novamente e tente salvar a estante.';
      }

      const body: unknown = err.error;
      if (typeof body === 'object' && body !== null) {
        const resposta = body as Record<string, unknown>;
        if (typeof resposta['message'] === 'string') {
          return resposta['message'];
        }

        const mensagens = Object.values(resposta).filter(
          (valor): valor is string => typeof valor === 'string',
        );
        if (mensagens.length > 0) {
          return mensagens.join(' ');
        }
      }

      return `Não foi possível salvar a estante (HTTP ${err.status}). Verifique os dados e tente novamente.`;
    }

    return 'Não foi possível salvar a estante. Verifique os dados e tente novamente.';
  }

  carregarEstantes() {
    this.carregandoEstantes = true;
    this.erroCarregamento = undefined;
    this.changeDetectorRef.markForCheck();
    this.estanteService
      .getEstantes()
      .pipe(
        timeout({ first: 15000 }),
        finalize(() => {
          this.carregandoEstantes = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (res) => {
          this.estantes = res;
          this.onBuscar();
          this.changeDetectorRef.markForCheck();
        },
        error: (err) => {
          console.error('Erro ao carregar estantes', err);
          if (err instanceof TimeoutError) {
            this.erroCarregamento =
              'A conexão demorou demais para responder. Verifique a conexão e tente novamente.';
          } else if (
            err instanceof HttpErrorResponse &&
            (err.status === 401 || err.status === 403)
          ) {
            this.erroCarregamento = 'Entre novamente para acessar a Estante Virtual.';
          } else {
            this.erroCarregamento = 'Não foi possível carregar os materiais. Tente novamente.';
          }
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  onBuscar() {
    if (!this.busca.trim()) {
      this.estantesFiltradas = this.estantes;
      return;
    }

    const termo = this.busca.toLowerCase().trim();

    this.estantesFiltradas = this.estantes
      .map((estante) => {
        const prateleirasFiltradas = estante.prateleiras
          .map((prateleira) => {
            const exemplaresFiltrados = prateleira.exemplares.filter((exemplar) =>
              exemplar.material.titulo.toLowerCase().includes(termo) ||
              exemplar.material.autores.some((autor) => autor.toLowerCase().includes(termo)),
            );

            return {
              ...prateleira,
              exemplares: exemplaresFiltrados,
            };
          })
          .filter((p) => p.exemplares.length > 0); // remove prateleiras vazias

        return {
          ...estante,
          prateleiras: prateleirasFiltradas,
        };
      })
      .filter((e) => e.prateleiras.length > 0); // remove estantes vazias
  }
}
