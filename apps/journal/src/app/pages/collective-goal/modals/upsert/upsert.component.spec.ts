import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertCollectiveGoalPage } from './upsert.component';

describe('CreateCollectiveGoalPage', () => {
  let component: UpsertCollectiveGoalPage;
  let fixture: ComponentFixture<UpsertCollectiveGoalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpsertCollectiveGoalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpsertCollectiveGoalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
