import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LbrConfirmacao } from './lbr-confirmacao';
import { ConfirmacaoService } from '../../services/confirmacao.service';

describe('LbrConfirmacao', () => {
  let fixture: ComponentFixture<LbrConfirmacao>;
  let servico: ConfirmacaoService;

  const el = () => fixture.nativeElement as HTMLElement;
  const botao = (texto: string) =>
    Array.from(el().querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent?.trim() === texto)!;

  async function renderizar() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LbrConfirmacao] }).compileComponents();
    fixture = TestBed.createComponent(LbrConfirmacao);
    servico = TestBed.inject(ConfirmacaoService);
    await renderizar();
  });

  it('abre no modal padrão (centralizado, fundo desfocado) e resolve true ao confirmar', async () => {
    const resposta = servico.confirmar({
      titulo: 'Registrar devolução',
      tom: 'success',
      detalhes: [{ rotulo: 'Situação', valor: 'No prazo', destaque: true }],
      aviso: 'Verifique o estado do material.',
      textoConfirmar: 'Confirmar devolução',
    });
    await renderizar();

    expect(el().querySelector('.modal-dialog-centered')).not.toBeNull();
    expect(el().querySelector('.lbr-modal-fundo')).not.toBeNull();
    expect(el().textContent).toContain('Registrar devolução');
    expect(el().textContent).toContain('No prazo');
    expect(el().textContent).toContain('Verifique o estado do material.');

    botao('Confirmar devolução').click();
    await renderizar();

    expect(await resposta).toBe(true);
    expect(el().querySelector('[role="dialog"]')).toBeNull();
  });

  it('cancela pelo botão, pelo X ou com Esc', async () => {
    const pelosBotoes = servico.confirmar({ titulo: 'Excluir' });
    await renderizar();
    botao('Cancelar').click();
    expect(await pelosBotoes).toBe(false);

    const peloX = servico.confirmar({ titulo: 'Excluir' });
    await renderizar();
    el().querySelector<HTMLButtonElement>('.btn-close')!.click();
    expect(await peloX).toBe(false);

    const comEsc = servico.confirmar({ titulo: 'Excluir' });
    await renderizar();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(await comEsc).toBe(false);
  });

  it('um novo pedido cancela o anterior', async () => {
    const primeiro = servico.confirmar({ titulo: 'Primeiro' });
    const segundo = servico.confirmar({ titulo: 'Segundo' });
    await renderizar();

    expect(await primeiro).toBe(false);
    expect(el().textContent).toContain('Segundo');
    servico.responder(true);
    expect(await segundo).toBe(true);
  });
});
