import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneComponent } from './milestone.component';

describe('MilestoneComponent', () => {
  let component: MilestoneComponent;
  let fixture: ComponentFixture<MilestoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
