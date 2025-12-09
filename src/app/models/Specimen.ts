import { Bone } from './Bone';

export interface Specimen {
  id: number;
  bone: Bone;
  specimenName: string;
  stratigraphicContext: string;
  upPhase: string;
  culturalAttribution: string;
  yearDiscovery: string;
  preserveIndex: string;
  burialContext: string;
  repository: string;
  datesBpUncal: string;
  rangeDates: string;
  datesBpCal: string;
  datingTechnique: string;
  datedMaterial: string;
  gravesGoods: string;
  boneProcessing: string;
  tracesOfOchre: string;
  contextRemainsReferences: string;
  chronoculturalReferences: string;
}