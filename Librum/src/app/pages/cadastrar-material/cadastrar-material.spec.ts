import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastrarMaterial } from './cadastrar-material';

describe('CadastrarMaterial', () => {
  let component: CadastrarMaterial;
  let fixture: ComponentFixture<CadastrarMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrarMaterial],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrarMaterial);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
