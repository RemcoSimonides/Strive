import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExerciseAffirmationExplanationPage } from './exercise-affirmation-explanation.page';

describe('ExerciseAffirmationExplanationPage', () => {
  let component: ExerciseAffirmationExplanationPage;
  let fixture: ComponentFixture<ExerciseAffirmationExplanationPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseAffirmationExplanationPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseAffirmationExplanationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
