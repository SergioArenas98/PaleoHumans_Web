import { Individual } from "./Individual";
import { Specimen } from "./Specimen";
import { SpecimenIndividualId } from "./SpecimenIndividualId";

export interface SpecimenIndividual {
  id: SpecimenIndividualId;
  specimen: Specimen;
  individual: Individual;
}