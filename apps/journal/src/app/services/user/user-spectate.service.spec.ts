import { TestBed } from '@angular/core/testing';

import { UserSpectateService } from './user-spectate.service';

describe('UserSpectateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UserSpectateService = TestBed.get(UserSpectateService);
    expect(service).toBeTruthy();
  });
});
