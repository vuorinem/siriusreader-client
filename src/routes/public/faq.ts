type Question = {
  title: string,
  content: string,
  isSelected?: boolean,
  answerElement?: HTMLElement,
}

export class Faq {
  questions: Question[] = [
    {
      title: "What is a F.A.Q.",
      content: "It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. It's frequently asked questions. ",
    }
  ];

  private selectQuestion(question: Question) {
    if (question.isSelected) {
      if (question.answerElement) {
        question.answerElement.style.maxHeight = "";
      }
      question.isSelected = false;
      return;
    }

    this.questions.filter(q => q.isSelected).forEach(q => q.isSelected = false);

    if (question.answerElement) {
      question.answerElement.style.maxHeight = question.answerElement?.scrollHeight + "px";
    }

    question.isSelected = true;
  }
}
