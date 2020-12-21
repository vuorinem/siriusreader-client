export interface IUserDetails {
  isInformationSheetConfirmed: boolean;
  isConsentConfirmed: boolean;
  isBookSelected: boolean;
  isBookOpened: boolean;
  isBookFinished: boolean;
  readingSpeedWordsPerMinute: number;
  answeredQuestionnaires: string[];
  isIntrinsicCondition: boolean | null;
}
