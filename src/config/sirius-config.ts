import * as environment from '../../config/environment.json';

export const SiriusConfig = {
  debug: !!(process.env.debug ?? environment.debug),
  testing: !!(process.env.testing ?? environment.testing),
  apiUrl: process.env.apiUrl ?? environment.apiUrl,
  tokenEndpoint: process.env.tokenEndpoint ?? environment.tokenEndpoint,
  isHighlightingEnabled: !!(process.env.isHighlightingEnabled ?? environment.isHighlightingEnabled),
  isRegistrationDisabled: !!(process.env.isRegistrationDisabled ?? environment.isRegistrationDisabled),
};
