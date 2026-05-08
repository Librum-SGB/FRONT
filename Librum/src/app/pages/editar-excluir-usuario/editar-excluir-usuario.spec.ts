import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarExcluirUsuario } from './editar-excluir-usuario';

describe('EditarExcluirUsuario', () => {
  let component: EditarExcluirUsuario;
  let fixture: ComponentFixture<EditarExcluirUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarExcluirUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarExcluirUsuario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
