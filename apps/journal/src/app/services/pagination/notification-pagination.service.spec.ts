import { TestBed } from '@angular/core/testing';

import { NotificationPaginationService } from './notification-pagination.service';

describe('NotificationPaginationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NotificationPaginationService = TestBed.get(NotificationPaginationService);
    expect(service).toBeTruthy();
  });
});
