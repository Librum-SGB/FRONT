import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservarMaterial } from './reservar-material';
import { of } from 'rxjs';
import { AutorService } from '../../services/autor';
import { EmprestimoService } from '../../services/emprestimo.service';
import { ExemplarService } from '../../services/exemplar';
import { MaterialService } from '../../services/material';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';

describe('ReservarMaterial', () => {
  let component: ReservarMaterial;
  let fixture: ComponentFixture<ReservarMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservarMaterial],
      providers: [
        { provide: UsuarioService, useValue: { listarAlunos: () => of([]) } },
        { provide: MaterialService, useValue: { findAll: () => of([]) } },
        { provide: ExemplarService, useValue: { findAll: () => of([]) } },
        { provide: AutorService, useValue: { findAll: () => of([]) } },
        {
          provide: EmprestimoService,
          useValue: {
            listarPorUsuario: () => of([]),
            criarLote: () => of([]),
          },
        },
        { provide: ToastService, useValue: { erro: () => {}, aviso: () => {}, sucesso: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservarMaterial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks a material unavailable when its only available copy is selected', () => {
    const material = {
      material: {
        id: 1,
        titulo: 'Livro de teste',
        tipo: 'LIVRO',
        dataCriacao: '',
        dataUltimaAtualizacao: '',
      },
      autor: 'Autora de teste',
      exemplaresDisponiveis: [
        {
          id: 10,
          materialId: 1,
          filialId: 1,
          ativo: true,
          codigoBarras: 'EX-10',
          dataCriacao: '',
          dataUltimaAtualizacao: '',
        },
      ],
    };
    component.materiais = [material];

    expect(component.quantidadeDisponivel(material)).toBe(1);
    component.selecionarMaterial(material);
    expect(component.quantidadeDisponivel(material)).toBe(0);

    component.removerMaterial(component.materiaisSelecionados[0]);
    expect(component.quantidadeDisponivel(material)).toBe(1);
  });

  it('allows removing the selected user and resets the open-loan count', () => {
    component.selecionarUsuario({
      id: 1,
      nome: 'Usuária de teste',
      cpf: '00000000000',
      email: 'teste@example.com',
      filialId: 1,
    });
    component.emprestimosAbertos = 2;

    component.removerUsuario();

    expect(component.usuarioSelecionado).toBeNull();
    expect(component.emprestimosAbertos).toBe(0);
  });
});
