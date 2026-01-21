import { Site } from './Site';
import { OsteologicalUnit } from './OsteologicalUnit';

export interface Individual {
  individualId: number;
  individualName: string;
  ageAtDeath: string;
  ageClass: string;
  sex: string;
  osteologicalUnits?: OsteologicalUnit[];
}