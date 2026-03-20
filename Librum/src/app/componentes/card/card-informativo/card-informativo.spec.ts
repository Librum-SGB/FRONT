import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardInformativo } from './card-informativo';

describe('CardInformativo', () => {
  let component: CardInformativo;
  let fixture: ComponentFixture<CardInformativo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardInformativo],
    }).compileComponents();

    fixture = TestBed.createComponent(CardInformativo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
