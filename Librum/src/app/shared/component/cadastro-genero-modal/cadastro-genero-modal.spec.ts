import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroGeneroModal } from './cadastro-genero-modal';

describe('CadastroGeneroModal', () => {
  let component: CadastroGeneroModal;
  let fixture: ComponentFixture<CadastroGeneroModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroGeneroModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroGeneroModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
