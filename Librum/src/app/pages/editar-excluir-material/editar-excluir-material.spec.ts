import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EditarExcluirMaterial } from './editar-excluir-material';
import { ToastService } from '../../shared/services/toast.service';
import { MaterialService } from '../../services/material';
import { AutorService } from '../../services/autor';
import { EditoraService } from '../../services/editora';
import { GeneroService } from '../../services/genero';
import { ExemplarService } from '../../services/exemplar';

describe('EditarExcluirMaterial', () => {
  let component: EditarExcluirMaterial;
  let fixture: ComponentFixture<EditarExcluirMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarExcluirMaterial],
      providers: [
        provideRouter([]),
        { provide: ToastService, useValue: { erro: () => {}, sucesso: () => {} } },
        { provide: MaterialService, useValue: { findAll: () => of([]) } },
        { provide: AutorService, useValue: { findAll: () => of([]) } },
        { provide: EditoraService, useValue: { findAll: () => of([]) } },
        { provide: GeneroService, useValue: { findAll: () => of([]) } },
        { provide: ExemplarService, useValue: { findAll: () => of([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarExcluirMaterial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
