import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DiscussionPage } from './discussion.page';

describe('DiscussionPage', () => {
  let component: DiscussionPage;
  let fixture: ComponentFixture<DiscussionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscussionPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DiscussionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
