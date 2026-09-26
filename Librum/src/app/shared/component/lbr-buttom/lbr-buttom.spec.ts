import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LbrButtom } from './lbr-buttom';

describe('LbrButtom', () => {
  let component: LbrButtom;
  let fixture: ComponentFixture<LbrButtom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LbrButtom],
    }).compileComponents();

    fixture = TestBed.createComponent(LbrButtom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
