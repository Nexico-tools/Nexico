import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardtwoComponent } from './wizardtwo.component';

describe('WizardtwoComponent', () => {
  let component: WizardtwoComponent;
  let fixture: ComponentFixture<WizardtwoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WizardtwoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardtwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
