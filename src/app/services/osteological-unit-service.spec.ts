import { TestBed } from '@angular/core/testing';

import { OsteologicalUnitService } from './osteological-unit-service';

describe('OsteologicalUnitService', () => {
  let service: OsteologicalUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OsteologicalUnitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
