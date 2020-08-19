import { TestBed } from '@angular/core/testing';

import { CollectiveGoalStakeholderService } from './collective-goal-stakeholder.service';

describe('CollectiveGoalStakeholderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CollectiveGoalStakeholderService = TestBed.get(CollectiveGoalStakeholderService);
    expect(service).toBeTruthy();
  });
});
