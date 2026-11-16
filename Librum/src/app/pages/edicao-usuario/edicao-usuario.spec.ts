import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { EdicaoUsuario } from './edicao-usuario';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';

const USUARIO: Usuario = {
  id: 12,
  nome: 'Ana Souza',
  cpf: '52998224725',
  email: 'ana@exemplo.com',
  telefone: '11987654321',
  filialId: 1,
  limiteLivros: 3,
};

describe('EdicaoUsuario', () => {
  let fixture: ComponentFixture<EdicaoUsuario>;
  let component: EdicaoUsuario;
  const atualizar = vi.fn(() => of(USUARIO));

  beforeEach(async () => {
    atualizar.mockClear();
    await TestBed.configureTestingModule({
      imports: [EdicaoUsuario],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '12' }), fragment: null } },
        },
        { provide: ToastService, useValue: { erro: () => {}, sucesso: () => {} } },
        { provide: UsuarioService, useValue: { buscarPorId: () => of(USUARIO), atualizar } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EdicaoUsuario);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('preenche o formulário com os dados atuais', () => {
    expect(component.form.get('nome')?.value).toBe('Ana Souza');
    expect(component.form.get('email')?.value).toBe('ana@exemplo.com');
    expect(fixture.nativeElement.textContent).toContain('Dados pessoais');
    expect(fixture.nativeElement.textContent).toContain('Endereço');
  });

  it('não salva com campo obrigatório vazio e mostra a mensagem no campo', async () => {
    component.form.patchValue({ nome: '' });
    component.salvar();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(atualizar).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Nome é obrigatório.');
  });

  it('salva só com dígitos nos campos com máscara e volta para o detalhe', () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.patchValue({ cep: '01310-100', cidade: 'São Paulo', estado: 'sp' });

    component.salvar();

    expect(atualizar).toHaveBeenCalledWith(
      12,
      expect.objectContaining({ cep: '01310100', cidade: 'São Paulo', estado: 'SP', filialId: 1 }),
    );
    expect(navegar).toHaveBeenCalledWith(['/usuarios', 12]);
  });
});
