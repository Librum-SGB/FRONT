import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LbrTabela, LbrTabelaCabecalho, LbrTabelaLinha } from './lbr-tabela';

interface Registro {
  id: number;
  nome: string;
}

@Component({
  imports: [LbrTabela, LbrTabelaCabecalho, LbrTabelaLinha],
  template: `
    <lbr-tabela [dados]="dados()" [carregando]="carregando()" mensagemVazio="Nada por aqui.">
      <ng-template lbrTabelaCabecalho>
        <th scope="col">Nome</th>
      </ng-template>
      <ng-template [lbrTabelaLinha]="dados()" let-item let-indice="indice">
        <tr>
          <td>{{ indice }} - {{ item.nome }}</td>
        </tr>
      </ng-template>
    </lbr-tabela>
  `,
})
class HostTeste {
  dados = signal<Registro[]>(criarRegistros(60));
  carregando = signal(false);
}

function criarRegistros(quantidade: number): Registro[] {
  return Array.from({ length: quantidade }, (_, indice) => ({
    id: indice + 1,
    nome: `Registro ${indice + 1}`,
  }));
}

describe('LbrTabela', () => {
  let fixture: ComponentFixture<HostTeste>;
  let elemento: HTMLElement;

  const linhas = () => elemento.querySelectorAll('tbody tr');
  const textoResumo = () => elemento.querySelector('small')?.textContent?.trim() ?? '';
  const botaoPagina = (texto: string) =>
    Array.from(elemento.querySelectorAll<HTMLButtonElement>('.page-link')).find(
      (botao) => botao.textContent?.trim() === texto,
    )!;

  async function renderizar(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostTeste] }).compileComponents();
    fixture = TestBed.createComponent(HostTeste);
    elemento = fixture.nativeElement;
    await renderizar();
  });

  it('exibe 10 registros por padrão', () => {
    expect(linhas().length).toBe(10);
    expect(textoResumo()).toBe('Exibindo 1–10 de 60');
    expect(elemento.querySelector('thead th')?.textContent?.trim()).toBe('Nome');
  });

  it('permite escolher 25 ou 50 registros por página', async () => {
    const seletor = elemento.querySelector('select') as HTMLSelectElement;
    expect(Array.from(seletor.options).map((opcao) => opcao.value)).toEqual(['10', '25', '50']);

    seletor.value = '25';
    seletor.dispatchEvent(new Event('change'));
    await renderizar();
    expect(linhas().length).toBe(25);

    seletor.value = '50';
    seletor.dispatchEvent(new Event('change'));
    await renderizar();
    expect(linhas().length).toBe(50);
  });

  it('navega entre as páginas e informa o índice global da linha', async () => {
    botaoPagina('Próxima').click();
    await renderizar();
    expect(textoResumo()).toBe('Exibindo 11–20 de 60');
    expect(linhas()[0].textContent?.trim()).toBe('10 - Registro 11');

    botaoPagina('5').click();
    await renderizar();
    botaoPagina('6').click();
    await renderizar();
    expect(textoResumo()).toBe('Exibindo 51–60 de 60');
  });

  it('volta para a primeira página quando a quantidade de registros muda', async () => {
    botaoPagina('3').click();
    await renderizar();

    fixture.componentInstance.dados.set(criarRegistros(15));
    await renderizar();
    expect(textoResumo()).toBe('Exibindo 1–10 de 15');
  });

  it('exibe a mensagem de vazio sem tabela', async () => {
    fixture.componentInstance.dados.set([]);
    await renderizar();
    expect(elemento.querySelector('table')).toBeNull();
    expect(elemento.textContent).toContain('Nada por aqui.');
  });

  it('exibe a mensagem de carregamento', async () => {
    fixture.componentInstance.carregando.set(true);
    await renderizar();
    expect(elemento.querySelector('table')).toBeNull();
    expect(elemento.textContent).toContain('Carregando...');
  });
});
