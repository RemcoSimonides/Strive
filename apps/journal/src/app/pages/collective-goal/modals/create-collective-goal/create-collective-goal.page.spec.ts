import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCollectiveGoalPage } from './create-collective-goal.page';

describe('CreateCollectiveGoalPage', () => {
  let component: CreateCollectiveGoalPage;
  let fixture: ComponentFixture<CreateCollectiveGoalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCollectiveGoalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCollectiveGoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
