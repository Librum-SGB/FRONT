import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { CadastrarUsuario } from './cadastrar-usuario';
import { FilialService } from '../../services/filial.service';
import { UsuarioService } from '../../services/usuario.service';
import { ToastService } from '../../shared/services/toast.service';

describe('CadastrarUsuario', () => {
  let component: CadastrarUsuario;
  let fixture: ComponentFixture<CadastrarUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarUsuario],
      providers: [
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: UsuarioService, useValue: { cadastrar: () => of({}) } },
        {
          provide: FilialService,
          useValue: {
            listarAtivas: () => of([
              {
                id: 1,
                nomeFantasia: 'Unidade de teste',
                razaoSocial: 'Unidade de teste',
                cnpj: '00000000000000',
                endereco: 'Rua de teste',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '00000000',
                ativo: true,
              },
            ]),
          },
        },
        { provide: ToastService, useValue: { aviso: () => {}, sucesso: () => {}, erro: () => {} } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
