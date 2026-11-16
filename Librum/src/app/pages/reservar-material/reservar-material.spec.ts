import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { ReservarMaterial } from './reservar-material';
import { EmprestimoEmAndamentoService, MaterialParaEmprestimo } from './emprestimo-em-andamento.service';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { AutorService } from '../../services/autor';
import { EmprestimoService } from '../../services/emprestimo.service';
import { ExemplarService } from '../../services/exemplar';
import { MaterialService } from '../../services/material';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';

const LEITORA: Usuario = {
  id: 1,
  nome: 'Usuária de teste',
  cpf: '00000000000',
  email: 'teste@example.com',
  filialId: 1,
  limiteLivros: 2,
};

function material(id: number, exemplares: number[]): MaterialParaEmprestimo {
  return {
    material: { id, titulo: `Livro ${id}`, tipo: 'LIVRO', dataCriacao: '', dataUltimaAtualizacao: '' },
    autor: 'Autora de teste',
    exemplaresDisponiveis: exemplares.map((exemplarId) => ({
      id: exemplarId,
      materialId: id,
      filialId: 1,
      ativo: true,
      codigoBarras: `EX-${exemplarId}`,
      dataCriacao: '',
      dataUltimaAtualizacao: '',
    })),
  };
}

describe('ReservarMaterial', () => {
  let component: ReservarMaterial;
  let fixture: ComponentFixture<ReservarMaterial>;
  let estado: EmprestimoEmAndamentoService;
  const criarLote = vi.fn(() => of([{}, {}]));
  const listarPorUsuario = vi.fn(() => of([{ status: 'ATIVO' }]));

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ReservarMaterial],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { temPermissao: () => true } },
        { provide: UsuarioService, useValue: { listarAlunos: () => of([LEITORA]) } },
        { provide: MaterialService, useValue: { findAll: () => of([]) } },
        { provide: ExemplarService, useValue: { findAll: () => of([]) } },
        { provide: AutorService, useValue: { findAll: () => of([]) } },
        { provide: EmprestimoService, useValue: { listarPorUsuario, criarLote } },
        { provide: ToastService, useValue: { erro: () => {}, aviso: () => {}, sucesso: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarMaterial);
    component = fixture.componentInstance;
    estado = TestBed.inject(EmprestimoEmAndamentoService);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('começa na etapa do leitor e só libera as próximas na ordem', () => {
    expect(estado.etapa()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Quem vai levar?');
    expect(component.podeIrPara(2)).toBe(false);
    expect(component.podeIrPara(3)).toBe(false);
  });

  it('ao escolher o leitor vai para os materiais e calcula quantos ele ainda pode levar', () => {
    component.selecionarUsuario(LEITORA);

    expect(estado.etapa()).toBe(2);
    expect(estado.emprestimosAbertos()).toBe(1);
    expect(estado.vagasRestantes()).toBe(1);
  });

  it('não aceita leitor bloqueado', () => {
    component.selecionarUsuario({ ...LEITORA, estaBloqueado: true });

    expect(estado.usuario()).toBeNull();
    expect(estado.etapa()).toBe(1);
  });

  it('marca o material indisponível quando o único exemplar é escolhido', () => {
    const item = material(1, [10]);

    expect(component.quantidadeDisponivel(item)).toBe(1);
    component.selecionarMaterial(item);
    expect(component.quantidadeDisponivel(item)).toBe(0);
    expect(component.quantidadeEscolhida(item)).toBe(1);

    component.removerMaterial(estado.itens()[0]);
    expect(component.quantidadeDisponivel(item)).toBe(1);
  });

  it('respeita o limite de livros do leitor', () => {
    component.selecionarUsuario(LEITORA); // 1 em aberto, limite 2
    const item = material(1, [10, 11]);

    component.selecionarMaterial(item);
    component.selecionarMaterial(item);

    expect(estado.itens()).toHaveLength(1);
    expect(estado.vagasRestantes()).toBe(0);
  });

  it('remover o leitor volta para a primeira etapa', () => {
    component.selecionarUsuario(LEITORA);

    component.removerUsuario();

    expect(estado.usuario()).toBeNull();
    expect(estado.emprestimosAbertos()).toBe(0);
    expect(estado.etapa()).toBe(1);
  });

  it('o empréstimo em andamento continua ao sair e voltar para a tela', async () => {
    component.selecionarUsuario(LEITORA);
    component.selecionarMaterial(material(1, [10]));
    fixture.destroy();

    const novaTela = TestBed.createComponent(ReservarMaterial);
    novaTela.detectChanges();
    await novaTela.whenStable();

    expect(estado.usuario()?.nome).toBe('Usuária de teste');
    expect(estado.itens()).toHaveLength(1);
    expect(novaTela.nativeElement.textContent).toContain('O que vai levar?');
  });

  it('confirma o empréstimo com os exemplares e o prazo escolhidos e recomeça', () => {
    component.selecionarUsuario(LEITORA);
    component.selecionarMaterial(material(1, [10]));
    component.irPara(3);
    estado.dataDevolucao.set('2099-01-20');

    component.concluirReserva();

    expect(criarLote).toHaveBeenCalledWith({
      usuarioId: 1,
      exemplarIds: [10],
      dataDevolucaoPrevista: '2099-01-20',
    });
    expect(estado.etapa()).toBe(1);
    expect(estado.itens()).toHaveLength(0);
    expect(estado.usuario()).toBeNull();
  });
});
