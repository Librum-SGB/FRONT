import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LbrTabela, LbrTabelaCabecalho, LbrTabelaLinha, LbrTabelaOrdenar } from './lbr-tabela';

interface Registro {
  id: number;
  nome: string;
}

@Component({
  imports: [LbrTabela, LbrTabelaCabecalho, LbrTabelaLinha, LbrTabelaOrdenar],
  template: `
    <lbr-tabela [dados]="dados()" [carregando]="carregando()" mensagemVazio="Nada por aqui.">
      <ng-template lbrTabelaCabecalho>
        <th scope="col" lbrOrdenar="nome">Nome</th>
        <th scope="col" [lbrOrdenar]="porId">ID</th>
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
  porId = (r: Registro) => r.id;
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
    expect(elemento.querySelector('thead th')?.textContent).toContain('Nome');
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

  describe('ordenação pelo cabeçalho', () => {
    const botaoColuna = (texto: string) =>
      Array.from(elemento.querySelectorAll<HTMLButtonElement>('th button')).find((b) =>
        b.textContent?.includes(texto),
      )!;
    const primeiraLinha = () => linhas()[0].textContent?.trim();

    beforeEach(async () => {
      fixture.componentInstance.dados.set([
        { id: 3, nome: 'Érica' },
        { id: 1, nome: 'ana' },
        { id: 10, nome: '' },
        { id: 2, nome: 'Bruno' },
      ]);
      await renderizar();
    });

    it('mostra a setinha neutra e ordena crescente no primeiro clique, decrescente no segundo', async () => {
      expect(botaoColuna('Nome').querySelectorAll('.ativa')).toHaveLength(0);

      botaoColuna('Nome').click();
      await renderizar();
      expect(primeiraLinha()).toBe('0 - ana');
      expect(botaoColuna('Nome').querySelector('.ativa')?.classList).toContain('bi-arrow-up');
      expect(elemento.querySelector('th[lbrOrdenar]')?.getAttribute('aria-sort')).toBe('ascending');

      botaoColuna('Nome').click();
      await renderizar();
      expect(primeiraLinha()).toBe('0 - Érica');
      expect(botaoColuna('Nome').querySelector('.ativa')?.classList).toContain('bi-arrow-down');
    });

    it('ignora acentos e maiúsculas e deixa vazios no fim', async () => {
      botaoColuna('Nome').click();
      await renderizar();
      expect(Array.from(linhas()).map((l) => l.textContent?.trim())).toEqual([
        '0 - ana',
        '1 - Bruno',
        '2 - Érica',
        '3 -',
      ]);
    });

    it('ordena números como números (2 antes de 10) usando função', async () => {
      botaoColuna('ID').click();
      await renderizar();
      botaoColuna('ID').click();
      await renderizar();
      expect(primeiraLinha()).toBe('0 -');
      expect(botaoColuna('Nome').querySelectorAll('.ativa')).toHaveLength(0);
    });
  });
});
