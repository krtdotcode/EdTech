import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryLang } from './try-lang';

describe('TryLang', () => {
  let component: TryLang;
  let fixture: ComponentFixture<TryLang>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TryLang]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TryLang);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
