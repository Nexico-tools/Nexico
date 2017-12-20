import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardoneComponent } from './wizardone.component';

describe('WizardoneComponent', () => {
  let component: WizardoneComponent;
  let fixture: ComponentFixture<WizardoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WizardoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
