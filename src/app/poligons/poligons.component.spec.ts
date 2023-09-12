import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoligonsComponent } from './poligons.component';

describe('PoligonsComponent', () => {
  let component: PoligonsComponent;
  let fixture: ComponentFixture<PoligonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoligonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoligonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
