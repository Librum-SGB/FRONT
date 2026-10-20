import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, TimeoutError, timeout } from 'rxjs';
import { ModalLivro } from './modal-livro/modal-livro';
import {
  EstanteRequestDto,
  EstanteVirtualDto,
  ExemplarVirtualDto,
} from '../../dto/estantevirtual.dto';
import { EstanteService } from '../../shared/services/estante-virtual.service';
import { CorpoPadrao } from '../../shared/component/corpo-padrao/corpo-padrao';
import { ModalNovaEstante } from '../../shared/component/modal-nova-estante/modal-nova-estante';

@Component({
  selector: 'app-encontrar-material',
  imports: [CommonModule, FormsModule, ModalLivro, CorpoPadrao, ModalNovaEstante],
  templateUrl: './encontrar-material.html',
  styleUrl: './encontrar-material.scss',
})
export class EncontrarMaterial implements OnInit {
  busca: string = '';
  livroEscolhido?: ExemplarVirtualDto;
  modalAberta = false;
  modalEstanteAberta = false;
  carregandoEstantes = false;
  salvandoEstante = false;
  erroCarregamento?: string;
  erroEstante?: string;

  constructor(private estanteService: EstanteService) {}

  @ViewChild(ModalNovaEstante) modalNovaEstante?: ModalNovaEstante;

  ngOnInit(): void {
    this.carregarEstantes();
  }

  abrirModal(livro: ExemplarVirtualDto) {
    this.livroEscolhido = livro;
    this.modalAberta = true;
  }

  estantes: EstanteVirtualDto[] = [];

  estantesFiltradas: EstanteVirtualDto[] = [];

  abrirModalEstante(): void {
    this.erroEstante = undefined;
    this.modalEstanteAberta = true;
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
        }),
      )
      .subscribe({
        next: () => {
          this.modalNovaEstante?.fechar();
          this.carregarEstantes();
        },
        error: (err: unknown) => {
          console.error('Erro ao criar estante', err);
          this.erroEstante = this.mensagemErroEstante(err);
        },
      });
  }

  private mensagemErroEstante(err: unknown): string {
    if (err instanceof TimeoutError) {
      return 'A API demorou demais para responder. Verifique a conexão e tente novamente.';
    }

    if (err instanceof HttpErrorResponse) {
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
    this.estanteService.getEstantes().subscribe({
      next: (res) => {
        this.estantes = res;
        this.onBuscar();
        this.carregandoEstantes = false;
      },
      error: (err) => {
        console.error('Erro ao carregar estantes', err);
        this.erroCarregamento = 'Não foi possível carregar os materiais. Tente novamente.';
        this.carregandoEstantes = false;
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
