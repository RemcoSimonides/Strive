import { TestBed } from '@angular/core/testing';

import { GoalAuthGuardService } from './goal-auth-guard.service';

describe('GoalAuthGuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoalAuthGuardService = TestBed.get(GoalAuthGuardService);
    expect(service).toBeTruthy();
  });
});
