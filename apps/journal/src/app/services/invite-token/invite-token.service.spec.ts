import { TestBed } from '@angular/core/testing';

import { InviteTokenService } from './invite-token.service';

describe('InviteTokenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InviteTokenService = TestBed.get(InviteTokenService);
    expect(service).toBeTruthy();
  });
});
