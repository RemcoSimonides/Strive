import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExerciseAssessLifePage } from './exercise-assess-life.page';

describe('ExerciseAssessLifePage', () => {
  let component: ExerciseAssessLifePage;
  let fixture: ComponentFixture<ExerciseAssessLifePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseAssessLifePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExerciseAssessLifePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
