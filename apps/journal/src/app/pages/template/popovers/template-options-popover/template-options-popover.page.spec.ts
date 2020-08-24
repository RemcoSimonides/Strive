import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateOptionsPopoverPage } from './template-options-popover.page';

describe('TemplateOptionsPopoverPage', () => {
  let component: TemplateOptionsPopoverPage;
  let fixture: ComponentFixture<TemplateOptionsPopoverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TemplateOptionsPopoverPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateOptionsPopoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
