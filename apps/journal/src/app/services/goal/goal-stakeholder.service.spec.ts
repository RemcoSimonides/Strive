import { TestBed } from '@angular/core/testing';

import { GoalStakeholderService } from './goal-stakeholder.service';

describe('GoalStakeholderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoalStakeholderService = TestBed.get(GoalStakeholderService);
    expect(service).toBeTruthy();
  });
});
