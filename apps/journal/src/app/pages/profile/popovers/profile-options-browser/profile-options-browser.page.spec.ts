import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ProfileOptionsBrowserPage } from './profile-options-browser.page';

describe('ProfileOptionsBrowserPage', () => {
  let component: ProfileOptionsBrowserPage;
  let fixture: ComponentFixture<ProfileOptionsBrowserPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileOptionsBrowserPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileOptionsBrowserPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
