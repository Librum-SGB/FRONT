import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EditarExcluirUsuario } from './editar-excluir-usuario';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';
import { AuthService } from '../../services/auth.service';

describe('EditarExcluirUsuario', () => {
  let component: EditarExcluirUsuario;
  let fixture: ComponentFixture<EditarExcluirUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarExcluirUsuario],
      providers: [
        provideRouter([]),
        { provide: UsuarioService, useValue: { listarAlunos: () => of([]) } },
        { provide: ToastService, useValue: { erro: () => {}, sucesso: () => {} } },
        { provide: AuthService, useValue: { temPermissao: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarExcluirUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
