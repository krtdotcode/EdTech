import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scheduling } from './scheduling';

describe('Scheduling', () => {
  let component: Scheduling;
  let fixture: ComponentFixture<Scheduling>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scheduling]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Scheduling);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
