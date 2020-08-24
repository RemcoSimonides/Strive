import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveGoalSharePopoverPage } from './collective-goal-share-popover.page';

describe('CollectiveGoalSharePopoverPage', () => {
  let component: CollectiveGoalSharePopoverPage;
  let fixture: ComponentFixture<CollectiveGoalSharePopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectiveGoalSharePopoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectiveGoalSharePopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
