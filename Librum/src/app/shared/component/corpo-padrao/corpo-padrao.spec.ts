import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorpoPadrao } from './corpo-padrao';

describe('CorpoPadrao', () => {
  let component: CorpoPadrao;
  let fixture: ComponentFixture<CorpoPadrao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CorpoPadrao],
    }).compileComponents();

    fixture = TestBed.createComponent(CorpoPadrao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
