import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroEditoraModal } from './cadastro-editora-modal';

describe('CadastroEditoraModal', () => {
  let component: CadastroEditoraModal;
  let fixture: ComponentFixture<CadastroEditoraModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroEditoraModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroEditoraModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
