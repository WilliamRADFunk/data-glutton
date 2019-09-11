import { TestBed } from '@angular/core/testing';

import { FactbookFetchService } from './factbook-fetch.service';

describe('FactbookFetchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FactbookFetchService = TestBed.get(FactbookFetchService);
    expect(service).toBeTruthy();
  });
});
