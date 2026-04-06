import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardStatus } from './card-status';

describe('CardStatus', () => {
  let component: CardStatus;
  let fixture: ComponentFixture<CardStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(CardStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
