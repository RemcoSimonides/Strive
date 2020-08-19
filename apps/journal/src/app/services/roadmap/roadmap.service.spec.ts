import { TestBed } from '@angular/core/testing';

import { RoadmapService } from './roadmap.service';

describe('RoadmapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoadmapService = TestBed.get(RoadmapService);
    expect(service).toBeTruthy();
  });
});
