import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { OperacoesEmprestimoService } from './operacoes-emprestimo.service';
import { EmprestimoService } from './emprestimo.service';
import { Emprestimo, RenovacaoPrevia } from '../models/emprestimo.model';
import { StatusEmprestimo } from '../enum/status.enum';
import { ConfirmacaoService } from '../shared/services/confirmacao.service';
import { ToastService } from '../shared/services/toast.service';

const EMPRESTIMO: Emprestimo = {
  id: 5,
  usuarioId: 1,
  usuarioNome: 'Ana Souza',
  exemplarId: 3,
  materialId: 7,
  materialTitulo: 'Dom Casmurro',
  status: StatusEmprestimo.ATIVO,
  dataSaida: '2026-11-10T10:00:00Z',
  dataDevolucaoPrevista: '2099-11-24',
};

const PREVIA_OK: RenovacaoPrevia = {
  emprestimoId: 5,
  permitida: true,
  dataDevolucaoAtual: '2099-11-24',
  novaDataDevolucao: '2099-12-08',
  renovacoesRealizadas: 1,
  limiteRenovacoes: 2,
  renovacoesRestantes: 0,
};

describe('OperacoesEmprestimoService', () => {
  let operacoes: OperacoesEmprestimoService;
  const emprestimoService = {
    previaRenovacao: vi.fn(),
    renovar: vi.fn(() => of({ ...EMPRESTIMO, dataDevolucaoPrevista: '2099-12-08' })),
    devolver: vi.fn(() => of({ ...EMPRESTIMO, status: StatusEmprestimo.DEVOLVIDO })),
  };
  const confirmacao = { confirmar: vi.fn() };
  const toast = { sucesso: vi.fn(), erro: vi.fn(), aviso: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: EmprestimoService, useValue: emprestimoService },
        { provide: ConfirmacaoService, useValue: confirmacao },
        { provide: ToastService, useValue: toast },
      ],
    });
    operacoes = TestBed.inject(OperacoesEmprestimoService);
  });

  it('renovação mostra a nova data e as renovações restantes, e renova ao confirmar', async () => {
    emprestimoService.previaRenovacao.mockReturnValue(of(PREVIA_OK));
    confirmacao.confirmar.mockResolvedValue(true);

    const resultado = await operacoes.renovar(EMPRESTIMO);

    const pedido = confirmacao.confirmar.mock.calls[0][0];
    expect(pedido.detalhes).toEqual(
      expect.arrayContaining([
        { rotulo: 'Nova devolução', valor: '08/12/2099', destaque: true },
        { rotulo: 'Renovação', valor: '2ª de 2' },
        { rotulo: 'Restam depois', valor: '0 renovações', destaque: true },
      ]),
    );
    expect(pedido.aviso).toBe('Esta é a última renovação permitida.');
    expect(emprestimoService.renovar).toHaveBeenCalledWith(5);
    expect(toast.sucesso).toHaveBeenCalledWith('Empréstimo renovado! Nova devolução: 08/12/2099.');
    expect(resultado?.dataDevolucaoPrevista).toBe('2099-12-08');
  });

  it('não renova quando a pessoa cancela', async () => {
    emprestimoService.previaRenovacao.mockReturnValue(of(PREVIA_OK));
    confirmacao.confirmar.mockResolvedValue(false);

    expect(await operacoes.renovar(EMPRESTIMO)).toBeNull();
    expect(emprestimoService.renovar).not.toHaveBeenCalled();
  });

  it('avisa o motivo e nem pede confirmação quando a renovação não é permitida', async () => {
    emprestimoService.previaRenovacao.mockReturnValue(
      of({ ...PREVIA_OK, permitida: false, motivo: 'O limite de renovações deste empréstimo foi atingido' }),
    );

    expect(await operacoes.renovar(EMPRESTIMO)).toBeNull();
    expect(confirmacao.confirmar).not.toHaveBeenCalled();
    expect(toast.aviso).toHaveBeenCalledWith(
      'Não é possível renovar: O limite de renovações deste empréstimo foi atingido',
    );
  });

  it('devolução de empréstimo atrasado mostra os dias de atraso', async () => {
    confirmacao.confirmar.mockResolvedValue(true);
    const atrasado = { ...EMPRESTIMO, dataDevolucaoPrevista: '2000-01-01' };

    const resultado = await operacoes.devolver(atrasado);

    const pedido = confirmacao.confirmar.mock.calls[0][0];
    const situacao = pedido.detalhes.find((d: { rotulo: string }) => d.rotulo === 'Situação');
    expect(situacao.valor).toMatch(/^\d+ dias de atraso$/);
    expect(pedido.aviso).toContain('atrasada');
    expect(emprestimoService.devolver).toHaveBeenCalledWith(5);
    expect(resultado?.status).toBe(StatusEmprestimo.DEVOLVIDO);
  });
});
