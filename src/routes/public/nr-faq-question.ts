import { bindable, containerless } from "aurelia-framework";

@containerless
export class NrFaqQuestion {
  @bindable private question: string = "";

  private isSelected: boolean = false;
  private answerElement?: HTMLElement;

  private select() {
    if (this.isSelected) {
      if (this.answerElement) {
        this.answerElement.style.maxHeight = "";
      }
      this.isSelected = false;
      return;
    }

    if (this.answerElement) {
      this.answerElement.style.maxHeight = this.answerElement?.scrollHeight + "px";
    }

    this.isSelected = true;
  }
}
