import type { Reporter, TestCase, TestError, TestResult, TestStep } from '@playwright/test/reporter';

const secrets = [process.env.GISTS_TOKEN, process.env.NO_GISTS_ACCESS_TOKEN].filter(
  (secret): secret is string => !!secret,
);

function mask(text?: string): string | undefined {
  return secrets.reduce((masked, secret) => masked?.split(secret).join('***'), text);
}

function maskError(error?: TestError) {
  if (!error) return;
  error.message = mask(error.message);
  error.stack = mask(error.stack);
  error.value = mask(error.value);
  error.snippet = mask(error.snippet);
  maskError(error.cause);
}

export default class MaskSecretsReporter implements Reporter {
  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep) {
    maskError(step.error);
  }

  onTestEnd(_test: TestCase, result: TestResult) {
    result.errors.forEach(maskError);
    maskError(result.error);
  }

  printsToStdio() {
    return false;
  }
}
