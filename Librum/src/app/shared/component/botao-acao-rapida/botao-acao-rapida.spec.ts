import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotaoAcaoRapida } from './botao-acao-rapida';

describe('BotaoAcaoRapida', () => {
  let component: BotaoAcaoRapida;
  let fixture: ComponentFixture<BotaoAcaoRapida>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotaoAcaoRapida],
    }).compileComponents();

    fixture = TestBed.createComponent(BotaoAcaoRapida);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
