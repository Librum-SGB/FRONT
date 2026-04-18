import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLivro } from './modal-livro';

describe('ModalLivro', () => {
  let component: ModalLivro;
  let fixture: ComponentFixture<ModalLivro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalLivro],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalLivro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
