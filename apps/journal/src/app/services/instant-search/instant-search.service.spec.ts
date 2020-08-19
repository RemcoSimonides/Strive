import { TestBed } from '@angular/core/testing';

import { InstantSearchService } from './instant-search.service';

describe('InstantSearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstantSearchService = TestBed.get(InstantSearchService);
    expect(service).toBeTruthy();
  });
});
