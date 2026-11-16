import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of } from 'rxjs';

import { AutorResponse } from '../models/autor.model';
import { EditoraResponse } from '../models/editora.model';
import { GeneroResponse } from '../models/genero.model';
import { AutorService } from './autor';
import { EditoraService } from './editora';
import { GeneroService } from './genero';

export interface ReferenciasAcervo {
  autores: AutorResponse[];
  editoras: EditoraResponse[];
  generos: GeneroResponse[];
}

/**
 * Autores, editoras e gêneros, usados para mostrar os nomes nas telas de material.
 * Se algum falhar, vem vazio: a tela abre mesmo assim (só sem aquele nome).
 */
@Injectable({ providedIn: 'root' })
export class ReferenciasAcervoService {
  private readonly autorService = inject(AutorService);
  private readonly editoraService = inject(EditoraService);
  private readonly generoService = inject(GeneroService);

  carregar(): Observable<ReferenciasAcervo> {
    return forkJoin({
      autores: this.ouVazio('autores', this.autorService.findAll()),
      editoras: this.ouVazio('editoras', this.editoraService.findAll()),
      generos: this.ouVazio('gêneros', this.generoService.findAll()),
    });
  }

  private ouVazio<T>(origem: string, fonte: Observable<T[]>): Observable<T[]> {
    return fonte.pipe(
      catchError((erro) => {
        console.error(`Erro ao carregar ${origem}:`, erro);
        return of([] as T[]);
      }),
    );
  }
}
