export interface IUserDetails {
  deadline: string,
  isInformationSheetConfirmed: boolean;
  isConsentConfirmed: boolean;
  isBookSelected: boolean;
  isBookOpened: boolean;
  isBookFinished: boolean;
  readingSpeedWordsPerMinute: number;
  answeredQuestionnaires: string[];
  isIntrinsicCondition: boolean | null;
}
