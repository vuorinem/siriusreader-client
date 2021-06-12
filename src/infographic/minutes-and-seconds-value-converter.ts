export class MinutesAndSecondsValueConverter {
  public toView(value: unknown) {
    if (typeof (value) === 'string') {
      return this.print(parseFloat(value));
    } else if (typeof (value) === 'number') {
      return this.print(value);
    } else {
      return value;
    }
  }

  private print(minutes: number) {
    const seconds = Math.round((minutes * 60) % 60);
    const wholeMinutes = Math.floor(minutes);

    if (seconds === 0) {
      return wholeMinutes + ' minutes';
    }

    return `${wholeMinutes} minutes ${seconds} seconds`;
  }
}


