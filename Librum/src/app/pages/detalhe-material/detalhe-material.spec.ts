import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DetalheMaterial } from './detalhe-material';
import { MaterialResponse } from '../../models/material.model';
import { AuthService } from '../../services/auth.service';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { ExemplarService } from '../../services/exemplar';
import { GeneroService } from '../../services/genero';
import { MaterialService } from '../../services/material';
import { ToastService } from '../../shared/services/toast.service';

const LIVRO: MaterialResponse = {
  id: 7,
  titulo: 'Dom Casmurro',
  tipo: 'LIVRO',
  autorId: 1,
  editoraId: 2,
  isbn: '9788535910663',
  anoPublicacao: 1899,
  sinopse: 'Bentinho e Capitu.',
  generoIds: [3],
  dataCriacao: '2026-01-10T10:00:00Z',
  dataUltimaAtualizacao: '2026-01-11T10:00:00Z',
};

async function criar(opcoes: {
  material?: () => ReturnType<MaterialService['findById']>;
  permitido?: boolean;
}): Promise<ComponentFixture<DetalheMaterial>> {
  await TestBed.configureTestingModule({
    imports: [DetalheMaterial],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap({ id: '7' }), queryParamMap: convertToParamMap({}) },
        },
      },
      { provide: ToastService, useValue: { erro: () => {}, sucesso: () => {} } },
      { provide: AuthService, useValue: { temPermissao: () => opcoes.permitido ?? true } },
      { provide: MaterialService, useValue: { findById: opcoes.material ?? (() => of(LIVRO)) } },
      { provide: AutorService, useValue: { findAll: () => of([{ id: 1, nome: 'Machado de Assis' }]) } },
      { provide: EditoraService, useValue: { findAll: () => of([{ id: 2, nome: 'Garnier' }]) } },
      { provide: GeneroService, useValue: { findAll: () => of([{ id: 3, nome: 'Romance' }]) } },
      {
        provide: ExemplarService,
        useValue: {
          findByMaterial: () =>
            of([
              { id: 1, materialId: 7, status: 'DISPONIVEL' },
              { id: 2, materialId: 7, status: 'EMPRESTADO' },
            ]),
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(DetalheMaterial);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('DetalheMaterial', () => {
  it('exibe os dados do material com os nomes resolvidos', async () => {
    const fixture = await criar({});
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('Dom Casmurro');
    expect(texto).toContain('L-00007');
    expect(texto).toContain('Machado de Assis');
    expect(texto).toContain('Garnier');
    expect(texto).toContain('Romance');
    expect(texto).toContain('Bentinho e Capitu.');
    expect(fixture.componentInstance.totalExemplares()).toBe(2);
    expect(fixture.componentInstance.exemplaresDisponiveis()).toBe(1);
  });

  it('mostra Editar e Excluir apenas com permissão', async () => {
    const fixture = await criar({ permitido: false });
    // os modais ficam fora do corpo da página; os botões de ação ficam dentro dele
    const texto =
      (fixture.nativeElement as HTMLElement).querySelector('app-corpo-padrao')?.textContent ?? '';

    expect(texto).toContain('Voltar');

    expect(texto).not.toContain('Editar');
    expect(texto).not.toContain('Excluir');
  });

  it('informa quando o material não existe', async () => {
    const fixture = await criar({
      material: () => throwError(() => new HttpErrorResponse({ status: 404 })),
    });

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Material não encontrado.');
  });
});
