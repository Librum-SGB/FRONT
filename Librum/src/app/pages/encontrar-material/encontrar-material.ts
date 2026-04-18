import { Component } from '@angular/core';
import { Estante } from '../../models/estante.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalLivro } from './modal-livro/modal-livro';
import { Exemplar } from '../../models/exemplar.model';

@Component({
  selector: 'app-encontrar-material',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalLivro],
  templateUrl: './encontrar-material.html',
  styleUrl: './encontrar-material.scss',
})
export class EncontrarMaterial {
  busca: string = '';
  livroEscolhido?: Exemplar;
  modalAberta = false;

  abrirModal(exemplar: Exemplar) {
    this.livroEscolhido = exemplar;
    this.modalAberta = true;
  }

  estantes: Estante[] = [
    {
      id: 1,
      nome: 'Estante A1',
      secao: 'Programação e Desenvolvimento',
      prateleiras: [
        {
          id: 1,
          listaLivro: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            titulo: `Angular ${i + 1}`,
            autor: ['João', 'Maria', 'Carlos'][i % 3],
            prateleiraId: 1,
          })),
        },
        {
          id: 2,
          listaLivro: Array.from({ length: 40 }, (_, i) => ({
            id: i + 21,
            titulo: `Java ${i + 21}`,
            autor: ['James', 'Oracle', 'Dev Java'][i % 3],
            prateleiraId: 2,
          })),
        },
        {
          id: 3,
          listaLivro: Array.from({ length: 5 }, (_, i) => ({
            id: i + 61,
            titulo: `Spring ${i + 61}`,
            autor: ['Pivotal', 'VMware'][i % 2],
            prateleiraId: 3,
          })),
        },
      ],
    },
  ];

  estantesFiltradas: Estante[] = [];

  ngOnInit() {
    this.estantesFiltradas = this.estantes;
  }

  onBuscar() {
    if (!this.busca.trim()) {
      this.estantesFiltradas = this.estantes;
      return;
    }

    const termo = this.busca.toLowerCase();

    this.estantesFiltradas = this.estantes.map((estante) => {
      const prateleirasFiltradas = estante.prateleiras.map((prateleira) => {
        const livrosFiltrados = prateleira.listaLivro.filter((livro) =>
          livro.titulo.toLowerCase().includes(termo),
        );

        return {
          ...prateleira,
          listaLivro: livrosFiltrados,
        };
      });

      return {
        ...estante,
        prateleiras: prateleirasFiltradas,
      };
    });
  }
}
