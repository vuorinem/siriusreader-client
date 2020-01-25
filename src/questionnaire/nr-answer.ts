import { Disposable, observable } from 'aurelia-binding';
import { IQuestionDetails } from './i-question-details';
import { bindable, bindingMode, ComponentBind, ComponentUnbind, autoinject, BindingEngine } from 'aurelia-framework';

@autoinject
export class NrAnswer implements ComponentBind, ComponentUnbind {

  @bindable private question!: IQuestionDetails;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) private value?: string;

  private observsers: Disposable[] = [];

  private selectedGenres: string[] = [];

  private yesnoOptions = [
    'Yes',
    'No',
  ];

  private genderOptions = [
    'Female',
    'Male',
    'Other',
    'Prefer not to say',
  ];

  private trueOptions = [
    '1 <br/> Not at all true',
    '2',
    '3',
    '4 <br/> Somewhat true',
    '5',
    '6',
    '7 <br/> Very true',
  ];

  private educationOptions = [
    'Elementary',
    'High school',
    'College',
    'Undergraduate',
    'Postgraduate',
  ];

  private frequencyOptions = [
    'Every day',
    'A few times a week',
    'A few times a month',
    'A few times a year',
    'Never',
  ];

  private genreOptions = [
    'Biographies / autobiographies',
    'Celebrities / television',
    'Classic novels',
    'Crime, thrillers and mystery',
    'Fantasy',
    'Graphic novels',
    'Historical fiction',
    'History',
    'Horror',
    'Humour',
    'Modern fiction',
    'Poetry',
    'Politics / current affairs',
    'Religion and spirituality',
    'Romance',
    'Science',
    'Science fiction',
    'Self-help',
    'Special interests / hobbies',
    'Sports',
    'Travel',
  ];

  private bookCountOptions = [
    'More than 50 books',
    '26-50 books',
    '16-25 books',
    '7-15 books',
    '3-6 books',
    '1-2 books',
    'None',
  ];

  private reasonOptions = [
    {
      title: 'To improve health and well being',
      description: 'For example to relax, to fall asleep or to improve mental health',
    },
    {
      title: 'Intellectual improvement',
      description: 'For example to gain general knowledge, or to learn a language',
    },
    {
      title: 'Personal development',
      description: ' For example to increase creativeness, self-esteem or empathy',
    },
    {
      title: 'Social reasons',
      description: 'For example to take part in cultural activities or to enhance understanding of others',
    },
    {
      title: 'Enjoyment',
      description: 'For example because you enjoy reading, like books or it makes you happy',
    },
    {
      title: 'Boredom',
      description: 'For example to avoid boredom or to pass time',
    },
    {
      title: 'I only read if I have to',
      description: '',
    },
    {
      title: 'I do not read',
      description: '',
    },
  ]

  private enjoymentOptions = [
    'Very much',
    'Somewhat',
    'Moderately',
    'A little',
    'Not at all',
  ];

  private previouslyReadOptions = [
    'No, this was my first time reading this story',
    'Yes, I have read this story before',
    'Not sure',
  ];

  private progressOptions = [
    '100% - The entire story',
    '90%',
    '80%',
    '70%',
    '60%',
    '50% - Half of the story',
    '40%',
    '30%',
    '20%',
    '10%',
    '0% - None of the story',
  ];

  private get name(): string {
    return 'question-' + this.question.number;
  }

  constructor(private bindingEngine: BindingEngine) {
  }

  public bind() {
    if (this.question.questionType === 'genres') {
      this.observsers.push(this.bindingEngine.collectionObserver(this.selectedGenres).subscribe(() => {
        this.value = this.selectedGenres.join(',');
      }));
    }
  }

  public unbind() {
    let observer;
    while (observer = this.observsers.pop()) {
      observer.dispose();
    }
  }

}
