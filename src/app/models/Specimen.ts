import { OsteologicalUnit } from './OsteologicalUnit';
import { Bone } from './Bone';

export interface Specimen {
  specimenId: number;
  specimenName: string;
  datesBpUncal: number;
  datesRange: number;
  datingTechnique: string;
  datingMaterial: string;
  repository: string;
  osteologicalUnits?: OsteologicalUnit[];
  bones?: Bone[];
}