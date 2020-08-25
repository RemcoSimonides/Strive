import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExerciseDearFutureSelfPage } from './exercise-dear-future-self.page';

describe('ExerciseDearFutureSelfPage', () => {
  let component: ExerciseDearFutureSelfPage;
  let fixture: ComponentFixture<ExerciseDearFutureSelfPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseDearFutureSelfPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseDearFutureSelfPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
