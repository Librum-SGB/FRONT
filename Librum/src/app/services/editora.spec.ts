import { TestBed } from '@angular/core/testing';

import { EditoraService } from './editora';

describe('EditoraService', () => {
  let service: EditoraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditoraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
