import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaSuporte } from './tela-suporte';

describe('TelaSuporte', () => {
  let component: TelaSuporte;
  let fixture: ComponentFixture<TelaSuporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaSuporte],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaSuporte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
