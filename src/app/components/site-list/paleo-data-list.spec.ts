import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaleoDataListComponent } from './paleo-data-list';

describe('SiteList', () => {
  let component: PaleoDataListComponent;
  let fixture: ComponentFixture<PaleoDataListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaleoDataListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaleoDataListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
