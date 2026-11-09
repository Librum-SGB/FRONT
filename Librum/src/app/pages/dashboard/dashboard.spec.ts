import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Dashboard } from './dashboard';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { TarefaService } from '../../shared/services/tarefas.service';
import { DashboardService } from '../../services/dashboard.service';
import { ToastService } from '../../shared/services/toast.service';
import { Router } from '@angular/router';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        {
          provide: ConfiguracaoService,
          useValue: { configuracaoAtivaByChave: () => false },
        },
        {
          provide: TarefaService,
          useValue: {
            getMinhasTarefas: () => of([]),
            adicionarTarefa: () => of({}),
            alternarConclusao: () => of({}),
            removerTarefa: () => of(undefined),
          },
        },
        {
          provide: DashboardService,
          useValue: {
            obterResumo: () =>
              of({
                alunosCadastrados: 0,
                livrosNoAcervo: 0,
                emprestimosAtivos: 0,
                emprestimosAVencer: 0,
                emAndamento: 0,
                vencidos: 0,
                emprestimos: [],
              }),
          },
        },
        { provide: ToastService, useValue: { erro: () => {} } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
