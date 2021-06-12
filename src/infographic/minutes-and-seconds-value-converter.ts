export class MinutesAndSecondsValueConverter {
  public toView(value: unknown) {
    if (typeof (value) === 'string') {
      return MinutesAndSecondsValueConverter.print(parseFloat(value));
    } else if (typeof (value) === 'number') {
      return MinutesAndSecondsValueConverter.print(value);
    } else {
      return value;
    }
  }

  public static print(minutes: number) {
    const seconds = Math.round((minutes * 60) % 60);
    const wholeMinutes = Math.floor(minutes);

    if (seconds === 0) {
      return wholeMinutes + ' minutes';
    } else if (wholeMinutes === 0) {
      return seconds + ' seconds';
    } else {
      return `${wholeMinutes} minutes ${seconds} seconds`;
    }
  }
}


