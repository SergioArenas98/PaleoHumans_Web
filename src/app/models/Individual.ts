import { Site } from "./Site";

export interface Individual {
  individualId: number;
  site: Site;
  individualName: string;
  nmi: number;
  ageAtDeath: string;
  ageClass: string;
  sex: string;
}