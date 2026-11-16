import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DetalheEmprestimo } from './detalhe-emprestimo';
import { StatusEmprestimo } from '../../enum/status.enum';
import { Emprestimo } from '../../models/emprestimo.model';
import { AuthService } from '../../services/auth.service';
import { EmprestimoService } from '../../services/emprestimo.service';

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
  renovacoesContagem: 1,
};

async function criar(permitido: boolean) {
  await TestBed.configureTestingModule({
    imports: [DetalheEmprestimo],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '5' }) } } },
      { provide: AuthService, useValue: { temPermissao: () => permitido } },
      {
        provide: EmprestimoService,
        useValue: {
          buscarPorId: () => of(EMPRESTIMO),
          previaRenovacao: () =>
            of({
              emprestimoId: 5,
              permitida: true,
              dataDevolucaoAtual: '2099-11-24',
              novaDataDevolucao: '2099-12-08',
              renovacoesRealizadas: 1,
              limiteRenovacoes: 2,
              renovacoesRestantes: 0,
            }),
        },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(DetalheEmprestimo);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('DetalheEmprestimo', () => {
  it('mostra o empréstimo com links para usuário e material e a prévia da renovação', async () => {
    const fixture = await criar(true);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Empréstimo #5');
    expect(el.textContent).toContain('Em andamento');
    expect(el.querySelector('a[href="/usuarios/1"]')?.textContent).toContain('Ana Souza');
    expect(el.querySelector('a[href="/materiais/7"]')?.textContent).toContain('Dom Casmurro');
    expect(el.textContent).toContain('08/12/2099');
    expect(el.textContent).toContain('1 de 2 renovações usadas');
    expect(el.textContent).toContain('Registrar devolução');
  });

  it('sem permissão não mostra renovar nem devolver', async () => {
    const fixture = await criar(false);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).not.toContain('Registrar devolução');
    expect(el.textContent).not.toContain('Renovação');
  });
});
