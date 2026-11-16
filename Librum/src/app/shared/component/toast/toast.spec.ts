import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Toast } from './toast';
import { ToastService } from '../../services/toast.service';

describe('Toast', () => {
  let fixture: ComponentFixture<Toast>;
  let toast: ToastService;

  const el = () => fixture.nativeElement as HTMLElement;

  async function renderizar() {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Toast] }).compileComponents();
    fixture = TestBed.createComponent(Toast);
    toast = TestBed.inject(ToastService);
    await renderizar();
  });

  afterEach(() => toast.fechar());

  it('mostra título e mensagem no canto, sem cobrir a tela', async () => {
    toast.sucesso('Devolução de "Dom Casmurro" registrada.');
    await renderizar();

    expect(el().querySelector('.toast-box')).not.toBeNull();
    expect(el().textContent).toContain('Tudo certo!');
    expect(el().textContent).toContain('Devolução de "Dom Casmurro" registrada.');
  });

  it('fecha pelo X', async () => {
    toast.erro('Falhou.');
    await renderizar();

    el().querySelector<HTMLButtonElement>('[aria-label="Fechar notificação"]')!.click();
    await renderizar();

    expect(toast.mensagemAtual()).toBeNull();
    expect(el().querySelector('.toast-box')).toBeNull();
  });
});
