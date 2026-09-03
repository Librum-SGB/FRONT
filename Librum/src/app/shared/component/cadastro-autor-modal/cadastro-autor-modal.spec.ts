import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroAutorModal } from './cadastro-autor-modal';

describe('CadastroAutorModal', () => {
  let component: CadastroAutorModal;
  let fixture: ComponentFixture<CadastroAutorModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroAutorModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroAutorModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
