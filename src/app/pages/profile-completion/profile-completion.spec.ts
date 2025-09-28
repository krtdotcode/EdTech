import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCompletion } from './profile-completion';

describe('ProfileCompletion', () => {
  let component: ProfileCompletion;
  let fixture: ComponentFixture<ProfileCompletion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileCompletion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileCompletion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
