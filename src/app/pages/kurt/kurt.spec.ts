import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Kurt } from './kurt';

describe('Kurt', () => {
  let component: Kurt;
  let fixture: ComponentFixture<Kurt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Kurt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Kurt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
