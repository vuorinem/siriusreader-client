import { PLATFORM } from 'aurelia-pal';
import { HttpClient } from 'aurelia-fetch-client';
import { bindable, ComponentAttached, autoinject, ComponentDetached } from 'aurelia-framework';
import { IQuestionnaireDetails } from './i-questionnaire-details';
import { QuestionnaireService } from './questionnaire-service';
import { QuestionAndAnswer } from './question-and-answer';

@autoinject
export class NrQuestionnaire implements ComponentAttached, ComponentDetached {

  @bindable private name!: string;

  private formElement!: HTMLFormElement;

  private questionnaire!: IQuestionnaireDetails;
  private questionsAndAndswers: QuestionAndAnswer[] = [];

  private onBeforeUnload = (event: Event) => this.handleBeforeUnload(event);

  constructor(
    private element: Element,
    private http: HttpClient,
    private questionnaireService: QuestionnaireService) {
  }

  public async attached() {
    this.questionnaire = await this.questionnaireService.getQuestionnaire(this.name);

    this.questionsAndAndswers = this.questionnaire.questions
      .map(question => new QuestionAndAnswer(question, { questionNumber: question.number }));

    window.addEventListener('beforeunload', this.onBeforeUnload, false);
  }

  public detached() {
    window.removeEventListener('beforeunload', this.onBeforeUnload, false);
  }

  private async submit() {
    if (this.formElement.checkValidity() === false) {
      this.formElement.classList.add('was-validated');

      return;
    }

    await this.questionnaireService.sendAnswers(this.name,
      this.questionsAndAndswers.map(i => i.answer));

    const submitEvent = new CustomEvent('submitted', {
      bubbles: false,
      cancelable: false,
    });

    this.element.dispatchEvent(submitEvent);
  }

  private handleBeforeUnload(event: Event) {
    event.preventDefault();
    event.returnValue = false;
  }

}
