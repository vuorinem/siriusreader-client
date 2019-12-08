export interface IUserDetails {
    deadline: string,
    isInformationSheetConfirmed: boolean;
    isConsentConfirmed: boolean;
    isBookSelected: boolean;
    isDebriefConfirmed: boolean;
    readingSpeedWordsPerMinute: number;
    answeredQuestionnaires: string[];
}
