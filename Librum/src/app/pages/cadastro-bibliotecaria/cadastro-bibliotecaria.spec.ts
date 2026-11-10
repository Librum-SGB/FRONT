import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CadastroBibliotecariaComponent } from './cadastro-bibliotecaria';

describe('CadastroBibliotecariaComponent', () => {
  let component: CadastroBibliotecariaComponent;
  let fixture: ComponentFixture<CadastroBibliotecariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroBibliotecariaComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroBibliotecariaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
