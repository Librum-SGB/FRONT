import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatSuporte } from './chat-suporte';

describe('ChatSuporte', () => {
  let component: ChatSuporte;
  let fixture: ComponentFixture<ChatSuporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatSuporte],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatSuporte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
