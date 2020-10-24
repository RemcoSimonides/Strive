import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalOptionsPopoverPage } from './options.component';

describe('GoalOptionsPopoverPage', () => {
  let component: GoalOptionsPopoverPage;
  let fixture: ComponentFixture<GoalOptionsPopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GoalOptionsPopoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GoalOptionsPopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
