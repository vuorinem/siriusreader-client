export class ApplicationState {
  public isMenuOpen: boolean = false;
  public isFocused: boolean = true;
  public isActive: boolean = true;
  public isReading: boolean = false;
  public isLibrary: boolean = false;
  public isHidden: boolean = false;
  public isHighlightMenuOpen: boolean = false;

  public libraryVisibleBooks: number[] = [];
  public libraryVisibleSections: string[] = [];
}
