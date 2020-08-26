import { TestBed } from '@angular/core/testing';

import { DiscussionPaginationService } from './discussion-pagination.service';

describe('DiscussionPaginationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DiscussionPaginationService = TestBed.get(DiscussionPaginationService);
    expect(service).toBeTruthy();
  });
});
