import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RlCard } from './rl-card';

describe('RlCard', () => {
  let component: RlCard;
  let fixture: ComponentFixture<RlCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RlCard],
    }).compileComponents();

    fixture = TestBed.createComponent(RlCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
