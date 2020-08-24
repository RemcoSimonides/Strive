import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveGoalPage } from './collective-goal.page';

describe('CollectiveGoalPage', () => {
  let component: CollectiveGoalPage;
  let fixture: ComponentFixture<CollectiveGoalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectiveGoalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectiveGoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
