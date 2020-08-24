import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultRoadmapComponent } from './default-roadmap.component';

describe('DefaultRoadmapComponent', () => {
  let component: DefaultRoadmapComponent;
  let fixture: ComponentFixture<DefaultRoadmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefaultRoadmapComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefaultRoadmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
