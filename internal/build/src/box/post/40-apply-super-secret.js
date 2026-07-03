// @call = applySuperSecretSettingsFunc()
const applySuperSecretSettingsFunc = (...rest) => {
  if (context.secret?.superSecretSettings) {
    return context.secret?.superSecretSettings;
  }

  return (...rest) => ({ ...rest });
};
