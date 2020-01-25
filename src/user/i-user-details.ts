export interface IUserDetails {
  deadline: string,
  isInformationSheetConfirmed: boolean;
  isConsentConfirmed: boolean;
  isBookSelected: boolean;
  isBookOpened: boolean;
  isDebriefConfirmed: boolean;
  readingSpeedWordsPerMinute: number;
  answeredQuestionnaires: string[];
}
