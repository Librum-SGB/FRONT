import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EdicaoMaterial } from './edicao-material';
import { MaterialResponse } from '../../models/material.model';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
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
  generoIds: [3],
  dataCriacao: '2026-01-10T10:00:00Z',
  dataUltimaAtualizacao: '2026-01-11T10:00:00Z',
};

describe('EdicaoMaterial', () => {
  let fixture: ComponentFixture<EdicaoMaterial>;
  let component: EdicaoMaterial;
  const update = vi.fn(() => of(LIVRO));

  beforeEach(async () => {
    update.mockClear();
    await TestBed.configureTestingModule({
      imports: [EdicaoMaterial],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
        { provide: ToastService, useValue: { erro: () => {}, sucesso: () => {} } },
        { provide: MaterialService, useValue: { findById: () => of(LIVRO), update } },
        { provide: AutorService, useValue: { findAll: () => of([{ id: 1, nome: 'Machado de Assis' }]) } },
        { provide: EditoraService, useValue: { findAll: () => of([{ id: 2, nome: 'Garnier' }]) } },
        { provide: GeneroService, useValue: { findAll: () => of([{ id: 3, nome: 'Romance' }]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EdicaoMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('preenche o formulário e mostra os campos do livro', () => {
    const texto = fixture.nativeElement.textContent;
    expect(component.form.get('titulo')?.value).toBe('Dom Casmurro');
    expect(component.form.get('generoIds')?.value).toEqual([3]);
    expect(texto).toContain('L-00007');
    expect(texto).toContain('ISBN');
    expect(texto).toContain('Sinopse');
    expect(texto).not.toContain('ISSN');
  });

  it('não salva com ISBN vazio', async () => {
    component.form.patchValue({ isbn: '' });
    component.salvar();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(update).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('ISBN é obrigatório.');
  });

  it('salva as alterações e volta para o detalhe', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.patchValue({ titulo: '  Dom Casmurro (ed. revisada) ' });

    component.salvar();

    expect(update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ tipo: 'LIVRO', titulo: 'Dom Casmurro (ed. revisada)', generoIds: [3] }),
    );
    expect(navegar).toHaveBeenCalledWith(['/materiais', 7]);
  });
});
