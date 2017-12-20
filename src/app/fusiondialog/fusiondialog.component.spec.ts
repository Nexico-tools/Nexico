import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FusiondialogComponent } from './fusiondialog.component';

describe('FusiondialogComponent', () => {
  let component: FusiondialogComponent;
  let fixture: ComponentFixture<FusiondialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FusiondialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FusiondialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
