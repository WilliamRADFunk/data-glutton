import { TestBed } from '@angular/core/testing';

import { FetchCoordinator } from './fetch-coordinator.service';

describe('FetchCoordinator', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FetchCoordinator = TestBed.get(FetchCoordinator);
    expect(service).toBeTruthy();
  });
});
