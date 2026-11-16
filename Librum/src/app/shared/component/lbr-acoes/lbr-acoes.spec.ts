import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AcaoMenu, LbrAcoes } from './lbr-acoes';

@Component({
  imports: [LbrAcoes],
  template: `<lbr-acoes [acoes]="acoes()" descricao="Dom Casmurro" />`,
})
class HostTeste {
  excluir = vi.fn();
  acoes = signal<AcaoMenu[]>([
    { rotulo: 'Ver detalhes', icone: 'bi-eye', rota: ['/materiais', 7] },
    { rotulo: 'Editar', rota: ['/materiais', 7, 'editar'], visivel: false },
    { rotulo: 'Renovar', desabilitado: true, dica: 'Empréstimo atrasado.', executar: () => {} },
    { rotulo: 'Excluir', perigo: true, separadorAntes: true, executar: () => this.excluir() },
  ]);
}

async function criar() {
  await TestBed.configureTestingModule({
    imports: [HostTeste],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(HostTeste);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('LbrAcoes', () => {
  it('mostra o botão ⋮ com rótulo acessível e só as ações visíveis', async () => {
    const fixture = await criar();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[data-bs-toggle="dropdown"]')?.getAttribute('aria-label')).toBe('Ações de Dom Casmurro');
    const itens = Array.from(el.querySelectorAll('.dropdown-item')).map((i) => i.textContent ?? '');
    expect(itens).toHaveLength(3);
    expect(itens[0]).toContain('Ver detalhes');
    expect(itens[1]).toContain('Renovar');
    expect(itens[2]).toContain('Excluir');
    expect(el.textContent).not.toContain('Editar');
    expect(el.querySelectorAll('.dropdown-divider')).toHaveLength(1);
  });

  it('navega por link, explica a ação desabilitada e executa a ação ao clicar', async () => {
    const fixture = await criar();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('a.dropdown-item')?.getAttribute('href')).toBe('/materiais/7');

    const botoes = Array.from(el.querySelectorAll<HTMLButtonElement>('button.dropdown-item'));
    const renovar = botoes.find((b) => b.textContent?.includes('Renovar'))!;
    expect(renovar.disabled).toBe(true);
    expect(renovar.textContent).toContain('Empréstimo atrasado.');

    const excluir = botoes.find((b) => b.textContent?.includes('Excluir'))!;
    expect(excluir.classList).toContain('text-danger');
    excluir.click();
    expect(fixture.componentInstance.excluir).toHaveBeenCalledOnce();
  });

  it('não mostra o botão quando nenhuma ação é visível', async () => {
    const fixture = await criar();
    fixture.componentInstance.acoes.set([{ rotulo: 'Editar', visivel: false }]);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });
});
