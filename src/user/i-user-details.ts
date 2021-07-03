export interface IUserDetails {
  isInformationSheetConfirmed: boolean;
  isConsentConfirmed: boolean;
  isBookSelected: boolean;
  isBookOpened: boolean;
  isInfographicReady: boolean;
  isBookFinished: boolean;
  isLocationPromptBlocked: boolean;
  readingSpeedWordsPerMinute: number;
  answeredQuestionnaires: string[];
  hasAnsweredAuthorQuestionnaire: boolean;
  isDebriefConfirmed: boolean;
}
