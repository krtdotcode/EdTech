import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Practice } from './practice';

describe('Practice', () => {
  let component: Practice;
  let fixture: ComponentFixture<Practice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Practice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Practice);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
