import { TestBed } from '@angular/core/testing';
import { Site } from '../models/Site';

describe('Sites', () => {
  let service: Site;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = {} as Site;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
