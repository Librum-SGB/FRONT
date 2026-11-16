import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { LbrFiltros } from './lbr-filtros';
import { ConfigFiltro, ValoresFiltro } from './filtros';

interface Item {
  status: string;
}

@Component({
  imports: [LbrFiltros],
  template: `<lbr-filtros [config]="config" [(valores)]="valores" />`,
})
class HostTeste {
  valores = signal<ValoresFiltro>({});
  config: ConfigFiltro<Item> = {
    placeholderBusca: 'Buscar itens...',
    busca: (i) => [i.status],
    campos: [
      {
        tipo: 'opcoes',
        chave: 'status',
        rotulo: 'Status',
        valorDoItem: (i) => i.status,
        opcoes: [
          { valor: 'ATIVO', rotulo: 'Ativo' },
          { valor: 'BLOQUEADO', rotulo: 'Bloqueado' },
        ],
      },
      { tipo: 'periodo', chave: 'cadastro', rotulo: 'Cadastro', valorDoItem: () => undefined },
    ],
  };
}

async function criar(queryParams: Record<string, string | string[]> = {}) {
  await TestBed.configureTestingModule({
    imports: [HostTeste],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } } },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(HostTeste);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

const elemento = (fixture: ComponentFixture<HostTeste>) => fixture.nativeElement as HTMLElement;

const botao = (fixture: ComponentFixture<HostTeste>, texto: string) =>
  Array.from(elemento(fixture).querySelectorAll<HTMLButtonElement>('button')).find((b) =>
    b.textContent?.trim().startsWith(texto),
  )!;

async function renderizar(fixture: ComponentFixture<HostTeste>) {
  fixture.detectChanges();
  await fixture.whenStable();
}

describe('LbrFiltros', () => {
  it('atualiza a busca ao digitar', async () => {
    const fixture = await criar();
    const input = elemento(fixture).querySelector('input[type="search"]') as HTMLInputElement;
    expect(input.placeholder).toBe('Buscar itens...');

    input.value = 'joão';
    input.dispatchEvent(new Event('input'));
    await renderizar(fixture);

    expect(fixture.componentInstance.valores()).toEqual({ busca: 'joão' });
    expect(elemento(fixture).textContent).toContain('Busca: “joão”');
  });

  it('abre o painel, seleciona uma opção e mostra a contagem e o chip', async () => {
    const fixture = await criar();
    botao(fixture, 'Filtros').click();
    await renderizar(fixture);

    botao(fixture, 'Bloqueado').click();
    await renderizar(fixture);

    expect(fixture.componentInstance.valores()).toEqual({ status: ['BLOQUEADO'] });
    expect(botao(fixture, 'Filtros').textContent).toContain('1');
    expect(elemento(fixture).textContent).toContain('Status: Bloqueado');
  });

  it('remove um filtro pelo chip e limpa tudo', async () => {
    const fixture = await criar();
    fixture.componentInstance.valores.set({ status: ['ATIVO', 'BLOQUEADO'], busca: 'ana' });
    await renderizar(fixture);

    elemento(fixture).querySelector<HTMLButtonElement>('[aria-label="Remover Status: Ativo"]')!.click();
    await renderizar(fixture);
    expect(fixture.componentInstance.valores()).toEqual({ status: ['BLOQUEADO'], busca: 'ana' });

    botao(fixture, 'Limpar filtros').click();
    await renderizar(fixture);
    expect(fixture.componentInstance.valores()).toEqual({});
  });

  it('carrega os filtros que estão na URL', async () => {
    const fixture = await criar({ status: ['ATIVO'], cadastroDe: '2026-01-01', busca: 'ana' });

    expect(fixture.componentInstance.valores()).toEqual({
      status: ['ATIVO'],
      cadastroDe: '2026-01-01',
      busca: 'ana',
    });
    expect(elemento(fixture).textContent).toContain('Cadastro: de 01/01/2026');
  });
});
