import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExerciseDailyGratefulnessPage } from './exercise-daily-gratefulness.page';

describe('ExerciseDailyGratefulnessPage', () => {
  let component: ExerciseDailyGratefulnessPage;
  let fixture: ComponentFixture<ExerciseDailyGratefulnessPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseDailyGratefulnessPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseDailyGratefulnessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
