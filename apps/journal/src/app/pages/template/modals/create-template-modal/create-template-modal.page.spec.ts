import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTemplateModalPage } from './create-template-modal.page';

describe('CreateTemplateModalPage', () => {
  let component: CreateTemplateModalPage;
  let fixture: ComponentFixture<CreateTemplateModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTemplateModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTemplateModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
