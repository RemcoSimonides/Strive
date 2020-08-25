import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileOptionsPage } from './profile-options.page';

describe('ProfileOptionsPage', () => {
  let component: ProfileOptionsPage;
  let fixture: ComponentFixture<ProfileOptionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileOptionsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileOptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
