import * as environment from '../../config/environment.json';
type Environment = typeof environment;

function getEnvOrDefault<K extends keyof Environment, T extends Environment[K]>(name: K, defaultValue: T) {
  const processValue = process.env[name];

  if (processValue === undefined || processValue === "") {
    return defaultValue;
  } else {
    return processValue;
  }
}

const getBoolean = (value: boolean | string | undefined): boolean => {
  if (typeof (value) === "string") {
    if (value === "1" || value.toLowerCase() === "true") {
      return true;
    } else {
      return false;
    }
  } else if (value === undefined) {
    return false;
  } else {
    return value;
  }
}

export const SiriusConfig = {
  debug: getBoolean(getEnvOrDefault("debug", environment.debug)),
  testing: getBoolean(getEnvOrDefault("testing", environment.testing)),
  apiUrl: getEnvOrDefault("apiUrl", environment.apiUrl),
  tokenEndpoint: getEnvOrDefault("tokenEndpoint", environment.tokenEndpoint),
  isHighlightingEnabled: getBoolean(getEnvOrDefault("isHighlightingEnabled", environment.isHighlightingEnabled)),
  isRegistrationDisabled: getBoolean(getEnvOrDefault("isRegistrationDisabled", environment.isRegistrationDisabled)),
};
