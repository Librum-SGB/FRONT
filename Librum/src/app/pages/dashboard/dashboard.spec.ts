import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { prioridade } from '../../enum/prioridade.enum';
import { StatusTarefa } from '../../enum/status.enum';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { TarefaService } from '../../shared/services/tarefas.service';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let tarefaService: {
    findByUserId: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    tarefaService = {
      findByUserId: vi.fn().mockReturnValue(
        of([{
          id: 1,
          usuarioId: 7,
          descricao: 'Conferir devoluções',
          prioridade: prioridade.MEDIA,
          status: StatusTarefa.PENDENTE,
        }]),
      ),
      create: vi.fn().mockReturnValue(
        of({
          id: 2,
          usuarioId: 7,
          descricao: 'Nova tarefa',
          prioridade: prioridade.MEDIA,
          status: StatusTarefa.PENDENTE,
        }),
      ),
      update: vi.fn().mockReturnValue(
        of({
          id: 1,
          usuarioId: 7,
          descricao: 'Conferir devoluções',
          prioridade: prioridade.MEDIA,
          status: StatusTarefa.CONCLUIDA,
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getUsuarioAtual: () => of({ id: 7, nome: 'Bibliotecária' }),
            getMetricas: () =>
              of({
                usuariosCadastrados: 12,
                exemplaresNoAcervo: 34,
                emprestimosAtivos: 5,
                emprestimosEmAndamento: 4,
                emprestimosAVencer: 2,
                emprestimosAtrasados: 1,
                atrasos: [],
              }),
          },
        },
        { provide: TarefaService, useValue: tarefaService },
        {
          provide: ConfiguracaoService,
          useValue: { configuracaoAtivaByChave: () => false },
        },
        { provide: AuthService, useValue: { isTeamMember: () => true } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should load real user tasks', () => {
    expect(component.listaTarefa).toHaveLength(1);
    expect(tarefaService.findByUserId).toHaveBeenCalledWith(7);
  });

  it('should create and persist a new task', () => {
    component.descNovaTarefa = '  Nova tarefa  ';
    component.adicionarTarefa();

    expect(tarefaService.create).toHaveBeenCalledWith({
      descricao: 'Nova tarefa',
      prioridade: prioridade.MEDIA,
      status: StatusTarefa.PENDENTE,
    });
    expect(component.listaTarefa[0].id).toBe(2);
    expect(component.descNovaTarefa).toBe('');
  });

  it('should persist task completion changes', () => {
    component.toggleTarefa(1);

    expect(tarefaService.update).toHaveBeenCalledWith(1, {
      usuarioId: 7,
      descricao: 'Conferir devoluções',
      prioridade: prioridade.MEDIA,
      status: StatusTarefa.CONCLUIDA,
      prazo: undefined,
    });
    expect(component.listaTarefa[0].status).toBe(StatusTarefa.CONCLUIDA);
  });
});
