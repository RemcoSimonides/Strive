import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatePage } from './template.page';

describe('TemplatePage', () => {
  let component: TemplatePage;
  let fixture: ComponentFixture<TemplatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
