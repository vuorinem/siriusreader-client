export interface IUserDetails {
  deadline: string,
  isInformationSheetConfirmed: boolean;
  isConsentConfirmed: boolean;
  isBookSelected: boolean;
  isBookOpened: boolean;
  readingSpeedWordsPerMinute: number;
  answeredQuestionnaires: string[];
}
