import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGoalPage } from './create-goal.page';

describe('CreateGoalPage', () => {
  let component: CreateGoalPage;
  let fixture: ComponentFixture<CreateGoalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGoalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
