import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorComponent } from './text-editor.component';

describe('TextEditorComponent', () => {
  let component: TextEditorComponent;
  let fixture: ComponentFixture<TextEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextEditorComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
