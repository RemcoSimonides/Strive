import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGoalThumbnailComponent } from './create-goal-thumbnail.component';

describe('CreateGoalThumbnailComponent', () => {
  let component: CreateGoalThumbnailComponent;
  let fixture: ComponentFixture<CreateGoalThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateGoalThumbnailComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateGoalThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
