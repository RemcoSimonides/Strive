import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePostModalPage } from './create-post-modal.page';

describe('CreatePostModalPage', () => {
  let component: CreatePostModalPage;
  let fixture: ComponentFixture<CreatePostModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePostModalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePostModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
