import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarExcluirMaterial } from './editar-excluir-material';

describe('EditarExcluirMaterial', () => {
  let component: EditarExcluirMaterial;
  let fixture: ComponentFixture<EditarExcluirMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarExcluirMaterial],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarExcluirMaterial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
