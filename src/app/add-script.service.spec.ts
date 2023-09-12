import { TestBed } from '@angular/core/testing';

import { AddScriptService } from './add-script.service';

describe('AddScriptService', () => {
  let service: AddScriptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddScriptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
