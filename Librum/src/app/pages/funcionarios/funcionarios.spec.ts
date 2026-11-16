import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Funcionarios } from './funcionarios';
import { CadastroFuncionario } from '../cadastro-funcionario/cadastro-funcionario';
import { FuncaoUsuario } from '../../enum/funcaoUsuario.enum';
import { Usuario } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { FilialService } from '../../services/filial.service';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';

const FUNCIONARIOS: Usuario[] = [
  { id: 1, nome: 'Bia Bibliotecária', email: 'bia@x.com', cpf: '', filialId: 1, funcao: FuncaoUsuario.BIBLIOTECARIA, matriculaFuncionario: 'M-2' },
  { id: 2, nome: 'Ana Assistente', email: 'ana@x.com', cpf: '', filialId: 1, funcao: FuncaoUsuario.ASSISTENTE, ativo: false },
];

const usuarioService = {
  listarFuncionarios: vi.fn(() => of(FUNCIONARIOS)),
  cadastrar: vi.fn((dados: Usuario) => of({ id: 3, ...dados })),
};

/** Simula uma bibliotecária logada: só gerencia assistentes. */
async function configurar() {
  vi.clearAllMocks();
  await TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthService,
        useValue: {
          temPermissao: () => true,
          podeGerenciarFuncao: (funcao: FuncaoUsuario) => funcao === FuncaoUsuario.ASSISTENTE,
        },
      },
      { provide: UsuarioService, useValue: usuarioService },
      { provide: FilialService, useValue: { listarAtivas: () => of([{ id: 7, nomeFantasia: 'Centro', ativo: true }]) } },
      { provide: ToastService, useValue: { sucesso: vi.fn(), erro: vi.fn() } },
    ],
  }).compileComponents();
}

describe('Funcionários', () => {
  it('lista com função, matrícula e situação', async () => {
    await configurar();
    const fixture = TestBed.createComponent(Funcionarios);
    fixture.detectChanges();
    await fixture.whenStable();
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texto).toContain('Ana Assistente');
    expect(texto).toContain('Assistente');
    expect(texto).toContain('Bibliotecária');
    expect(texto).toContain('M-2');
    expect(texto).toContain('Inativo');
  });

  it('bibliotecária só vê as ações de gerenciar para assistentes', async () => {
    await configurar();
    const fixture = TestBed.createComponent(Funcionarios);
    const componente = fixture.componentInstance;

    const visiveis = (u: Usuario) =>
      componente.acoesDoFuncionario(u).filter((a) => a.visivel !== false).map((a) => a.rotulo);

    expect(visiveis(FUNCIONARIOS[0])).toEqual(['Ver detalhes']);
    expect(visiveis(FUNCIONARIOS[1])).toEqual(['Ver detalhes', 'Editar', 'Bloquear', 'Reativar', 'Excluir']);
  });

  it('o cadastro só oferece as funções permitidas e grava função e matrícula', async () => {
    await configurar();
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CadastroFuncionario);
    fixture.detectChanges();
    await fixture.whenStable();
    const componente = fixture.componentInstance;

    // bibliotecária: só "Assistente", já selecionada; a única unidade também
    expect(componente.form.controls.funcao.value).toBe(FuncaoUsuario.ASSISTENTE);
    expect(componente.form.controls.filialId.value).toBe('7');

    componente.form.patchValue({
      nome: 'Novo Assistente',
      email: 'NOVO@x.com',
      matriculaFuncionario: 'M-9',
      senha: '123456',
      confirmarSenha: '123456',
    });
    componente.salvar();

    expect(usuarioService.cadastrar).toHaveBeenCalledWith(
      expect.objectContaining({
        funcao: FuncaoUsuario.ASSISTENTE,
        email: 'novo@x.com',
        matriculaFuncionario: 'M-9',
        filialId: 7,
      }),
    );
  });
});
