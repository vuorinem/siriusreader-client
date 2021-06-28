import { IQuestionnaireScore } from "./i-questionnaire-score";

export interface IReaderMotivation {
  motivationType: string,
  scores: IQuestionnaireScore[],
}
