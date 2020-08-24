import { TestBed } from '@angular/core/testing';

import { CollectiveGoalAuthGuardService } from './collective-goal-auth-guard.service';

describe('CollectiveGoalAuthGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectiveGoalAuthGuardService = TestBed.get(CollectiveGoalAuthGuardService);
    expect(service).toBeTruthy();
  });
});
