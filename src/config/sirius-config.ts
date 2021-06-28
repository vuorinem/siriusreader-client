import * as environment from '../../config/environment.json';

const getBoolean = (value: boolean | string | undefined): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  } else if (typeof (value) === "string") {
    if (value.trim() === "1" || value.trim().toLowerCase() === "true") {
      return true;
    } else {
      return false;
    }
  } else {
    return value;
  }
}

const getInt = (value: number | string | undefined): number | undefined => {
  if (value === undefined) {
    return undefined;
  } else if (typeof (value) === "number") {
    return value;
  } else {
    return parseInt(value);
  }
}

const getCharArray = (value: number | string | undefined): number[] | undefined => {
  if (typeof (value) !== 'string') {
    return undefined;
  } else {
    const arrayValue = [];
    for (let i = 0; i < value.length; i++) {
      arrayValue.push(value.charCodeAt(i));
    }
    return arrayValue;
  }
}

export const SiriusConfig = {
  debug: getBoolean(process.env.debug) ?? environment.debug,
  testing: getBoolean(process.env.testing) ?? environment.testing,
  apiUrl: process.env.apiUrl ?? environment.apiUrl,
  tokenEndpoint: process.env.tokenEndpoint ?? environment.tokenEndpoint,
  isHighlightingEnabled: getBoolean(process.env.isHighlightingEnabled) ?? environment.isHighlightingEnabled,
  isRegistrationDisabled: getBoolean(process.env.isRegistrationDisabled) ?? environment.isRegistrationDisabled,
  isReadingTimeDisplayed: getBoolean(process.env.isReadingTimeDisplayed) ?? environment.isReadingTimeDisplayed,
  infographicRefreshIntervalInSeconds: getInt(process.env.infographicRefreshIntervalInSeconds) ?? environment.infographicRefreshIntervalInSeconds,
  bdk: getCharArray(process.env.bdk) ?? getCharArray(environment.bdk) ?? [],
};
