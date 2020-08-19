import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AuthModalPage } from './auth-modal.page';

describe('AuthModalPage', () => {
  let component: AuthModalPage;
  let fixture: ComponentFixture<AuthModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuthModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
