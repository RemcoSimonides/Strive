import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalSharePopoverPage } from './goal-share-popover.page';

describe('GoalSharePopoverPage', () => {
  let component: GoalSharePopoverPage;
  let fixture: ComponentFixture<GoalSharePopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalSharePopoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalSharePopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
