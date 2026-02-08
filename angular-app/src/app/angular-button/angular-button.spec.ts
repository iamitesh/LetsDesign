import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularButton } from './angular-button';

describe('AngularButton', () => {
  let component: AngularButton;
  let fixture: ComponentFixture<AngularButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
