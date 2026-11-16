import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { DetalheCadastro } from './detalhe-cadastro/detalhe-cadastro';
import { FormularioCadastro } from './formulario-cadastro/formulario-cadastro';
import { ListaCadastro } from './lista-cadastro/lista-cadastro';
import { MaterialResponse } from '../../models/material.model';
import { AuthService } from '../../services/auth.service';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { MaterialService } from '../../services/material';
import { ConfirmacaoService } from '../../shared/services/confirmacao.service';
import { ToastService } from '../../shared/services/toast.service';

const AUTORES = [
  { id: 1, nome: 'Machado de Assis', nacionalidade: 'Brasileira', dataNascimento: '1839-06-21', biografia: 'Fundador da ABL.' },
  { id: 2, nome: 'Clarice Lispector', nacionalidade: 'Brasileira' },
];

const MATERIAIS: Partial<MaterialResponse>[] = [
  { id: 10, titulo: 'Dom Casmurro', tipo: 'LIVRO', autorId: 1 },
  { id: 11, titulo: 'Memórias Póstumas', tipo: 'LIVRO', autorIds: [1] },
  { id: 12, titulo: 'A Hora da Estrela', tipo: 'LIVRO', autorId: 2 },
];

const autorService = {
  findAll: vi.fn(() => of(AUTORES)),
  findById: vi.fn((id: number) => of(AUTORES.find((a) => a.id === id))),
  create: vi.fn((dados: object) => of({ id: 3, ...dados })),
  update: vi.fn((id: number, dados: object) => of({ id, ...dados })),
  delete: vi.fn(() => of(undefined)),
};

async function configurar(params: Record<string, string> = {}) {
  vi.clearAllMocks();
  await TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { data: { cadastro: 'autor' }, paramMap: convertToParamMap(params), queryParamMap: convertToParamMap({}) } },
      },
      { provide: AuthService, useValue: { temPermissao: () => true } },
      { provide: AutorService, useValue: autorService },
      { provide: EditoraService, useValue: {} },
      { provide: GeneroService, useValue: {} },
      { provide: MaterialService, useValue: { findAll: () => of(MATERIAIS) } },
      { provide: ToastService, useValue: { sucesso: vi.fn(), erro: vi.fn() } },
    ],
  }).compileComponents();
}

async function renderizar<T>(componente: Type<T>) {
  const fixture = TestBed.createComponent(componente);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('Cadastros do acervo (autor como exemplo)', () => {
  it('a listagem mostra os registros, a contagem de materiais e o menu de ações', async () => {
    await configurar();
    const fixture = await renderizar(ListaCadastro);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Autores');
    expect(el.textContent).toContain('Cadastrar Autor');
    const linhas = Array.from(el.querySelectorAll('tbody tr')).map((tr) => tr.textContent ?? '');
    expect(linhas[0]).toContain('Clarice Lispector'); // ordem alfabética
    expect(linhas[1]).toContain('Machado de Assis');
    expect(fixture.componentInstance.quantidadeMateriais(AUTORES[0] as never)).toBe(2);
    expect(el.querySelector('a[href="/autores/1"]')?.textContent).toContain('Machado de Assis');

    const rotulos = fixture.componentInstance.acoesDoRegistro(AUTORES[0] as never).map((a) => a.rotulo);
    expect(rotulos).toEqual(['Ver detalhes', 'Ver materiais', 'Editar', 'Excluir']);
  });

  it('excluir pede confirmação avisando os materiais vinculados', async () => {
    await configurar();
    const confirmar = vi.spyOn(TestBed.inject(ConfirmacaoService), 'confirmar').mockResolvedValue(true);
    const fixture = await renderizar(ListaCadastro);

    await fixture.componentInstance.excluir(AUTORES[0] as never);

    expect(confirmar.mock.calls[0][0].aviso).toContain('2 materiais');
    expect(autorService.delete).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.registros().map((r) => r.id)).toEqual([2]);
  });

  it('o detalhe mostra os campos preenchidos e só os materiais do autor', async () => {
    await configurar({ id: '1' });
    const fixture = await renderizar(DetalheCadastro);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Machado de Assis');
    expect(el.textContent).toContain('21/06/1839');
    expect(el.textContent).toContain('Fundador da ABL.');
    expect(fixture.componentInstance.materiaisVinculados().map((m) => m.titulo)).toEqual([
      'Dom Casmurro',
      'Memórias Póstumas',
    ]);
  });

  it('o formulário cadastra com os campos da configuração e exige o nome', async () => {
    await configurar();
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = await renderizar(FormularioCadastro);
    const componente = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).toContain('Cadastrar Autor');
    componente.salvar();
    expect(autorService.create).not.toHaveBeenCalled();

    componente.form.patchValue({ nome: '  Cecília Meireles ', nacionalidade: 'Brasileira' });
    componente.salvar();

    expect(autorService.create).toHaveBeenCalledWith(
      expect.objectContaining({ nome: 'Cecília Meireles', nacionalidade: 'Brasileira', biografia: undefined }),
    );
    expect(navegar).toHaveBeenCalledWith(['/autores']);
  });

  it('o formulário de edição carrega os dados e atualiza', async () => {
    await configurar({ id: '1' });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = await renderizar(FormularioCadastro);
    const componente = fixture.componentInstance;

    expect(fixture.nativeElement.textContent).toContain('Editar Autor');
    expect(componente.form.value['nome']).toBe('Machado de Assis');

    componente.form.patchValue({ nacionalidade: 'Brasileiro' });
    componente.salvar();

    expect(autorService.update).toHaveBeenCalledWith(1, expect.objectContaining({ nacionalidade: 'Brasileiro' }));
  });
});
