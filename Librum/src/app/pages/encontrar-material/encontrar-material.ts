import { Component } from '@angular/core';
import { Estante } from '../../models/estante.model';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-encontrar-material',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './encontrar-material.html',
  styleUrl: './encontrar-material.scss',
})
export class EncontrarMaterial {
  estantes: Estante[] = [
    {
      id: 1,
      nome: 'Estante A1',
      prateleiras: [
        {
          id: 1,
          listaLivro: Array.from({ length: 20 }, (_, i) => ({
            id: i + 1,
            prateleiraId: 1,
          })),
        },
        {
          id: 2,
          listaLivro: Array.from({ length: 40 }, (_, i) => ({
            id: i + 21,
            prateleiraId: 2,
          })),
        },
        {
          id: 3,
          listaLivro: Array.from({ length: 5 }, (_, i) => ({
            id: i + 31,
            prateleiraId: 3,
          })),
        },
      ],
    },
  ];
}
