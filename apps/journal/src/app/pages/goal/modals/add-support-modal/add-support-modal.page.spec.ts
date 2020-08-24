import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSupportModalPage } from './add-support-modal.page';

describe('AddSupportModalPage', () => {
  let component: AddSupportModalPage;
  let fixture: ComponentFixture<AddSupportModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSupportModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupportModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
