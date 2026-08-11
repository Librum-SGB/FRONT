import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputBusca } from './input-busca';

describe('InputBusca', () => {
  let component: InputBusca;
  let fixture: ComponentFixture<InputBusca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputBusca],
    }).compileComponents();

    fixture = TestBed.createComponent(InputBusca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
