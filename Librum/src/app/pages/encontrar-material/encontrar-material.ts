import { Component } from '@angular/core';
import { Estante } from '../../models/estante.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-encontrar-material',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encontrar-material.html',
  styleUrl: './encontrar-material.scss',
})
export class EncontrarMaterial {
  // 🔍 busca
  busca: string = '';

  // 📦 lista original
  estantes: Estante[] = [
    {
      id: 1,
      nome: 'Estante A1',
      secao: 'Programação e Desenvolvimento', // 👈 NOVO
      prateleiras: [
        {
          id: 1,
          listaLivro: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            titulo: `Angular ${i + 1}`,
            prateleiraId: 1,
          })),
        },
        {
          id: 2,
          listaLivro: Array.from({ length: 40 }, (_, i) => ({
            id: i + 21,
            titulo: `Java ${i + 21}`,
            prateleiraId: 2,
          })),
        },
        {
          id: 3,
          listaLivro: Array.from({ length: 5 }, (_, i) => ({
            id: i + 61,
            titulo: `Spring ${i + 61}`,
            prateleiraId: 3,
          })),
        },
      ],
    },

    // 👇 EXEMPLO EXTRA (pra ficar mais real)
    {
      id: 2,
      nome: 'Estante B1',
      secao: 'Banco de Dados',
      prateleiras: [
        {
          id: 4,
          listaLivro: Array.from({ length: 10 }, (_, i) => ({
            id: i + 100,
            titulo: `SQL ${i + 1}`,
            prateleiraId: 4,
          })),
        },
      ],
    },
  ];

  // 🎯 lista filtrada
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
