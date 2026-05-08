import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalLivro } from './modal-livro/modal-livro';
import { EstanteVirtualDto, ExemplarVirtualDto } from '../../dto/estantevirtual.dto';
import { EstanteService } from '../../shared/services/estante-virtual.service';

@Component({
  selector: 'app-encontrar-material',
  imports: [CommonModule, FormsModule, ModalLivro],
  templateUrl: './encontrar-material.html',
  styleUrl: './encontrar-material.scss',
})
export class EncontrarMaterial implements OnInit {
  busca: string = '';
  livroEscolhido?: ExemplarVirtualDto;
  modalAberta = false;
  constructor(private estanteService: EstanteService) {}

  ngOnInit(): void {
    this.carregarEstantes();
  }
  abrirModal(livro: ExemplarVirtualDto) {
    this.livroEscolhido = livro;
    this.modalAberta = true;
  }

  estantes: EstanteVirtualDto[] = [];

  estantesFiltradas: EstanteVirtualDto[] = [];

  carregarEstantes() {
    this.estanteService.getEstantes().subscribe({
      next: (res) => {
        this.estantes = res;
        this.estantesFiltradas = res;
      },
      error: (err) => {
        console.error('Erro ao carregar estantes', err);
      },
    });
  }

  onBuscar() {
    if (!this.busca.trim()) {
      this.estantesFiltradas = this.estantes;
      return;
    }

    const termo = this.busca.toLowerCase();

    this.estantesFiltradas = this.estantes
      .map((estante) => {
        const prateleirasFiltradas = estante.prateleiras
          .map((prateleira) => {
            const exemplaresFiltrados = prateleira.exemplares.filter((exemplar) =>
              exemplar.livro.titulo.toLowerCase().includes(termo),
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
