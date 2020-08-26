import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalPage } from './goal.page';

describe('GoalPage', () => {
  let component: GoalPage;
  let fixture: ComponentFixture<GoalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
