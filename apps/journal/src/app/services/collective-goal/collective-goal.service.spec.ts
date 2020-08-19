import { TestBed } from '@angular/core/testing';

import { CollectiveGoalService } from './collective-goal.service';

describe('CollectiveGoalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectiveGoalService = TestBed.get(CollectiveGoalService);
    expect(service).toBeTruthy();
  });
});
