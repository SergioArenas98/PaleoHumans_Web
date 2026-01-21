import { Site } from './Site';
import { UnitType } from './UnitType';
import { Specimen } from './Specimen';
import { Individual } from './Individual';

export interface OsteologicalUnit {
  osteologicalUnitId: number;
  site: Site;
  unitType: UnitType;
  nmi: number;
  mniStatistical: number;
  stratigraphicContext: string;
  upPhase: string;
  culturalAttribution: string;
  yearDiscovery: string;
  preservationIndex: string;
  burialContext: string;
  graveGoods: string;
  boneProcessing: string;
  tracesOfOchre: string;
  contextRemainsReferences: string;
  chronoculturalReferences: string;
  specimens?: Specimen[];
  individuals?: Individual[];
}