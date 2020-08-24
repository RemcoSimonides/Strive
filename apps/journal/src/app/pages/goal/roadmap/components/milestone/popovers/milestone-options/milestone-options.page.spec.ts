import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MilestoneOptionsPage } from './milestone-options.page';

describe('MilestoneOptionsPage', () => {
  let component: MilestoneOptionsPage;
  let fixture: ComponentFixture<MilestoneOptionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MilestoneOptionsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MilestoneOptionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
