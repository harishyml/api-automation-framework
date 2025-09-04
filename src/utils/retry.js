const { info, warn, error } = require("./logger");
const { retryAttempts, retryDelay, logErrors } = require("../config/config");

async function withRetry(fn, label) {
  let attempt = 0;
  while (true) {
    try {
      const result = await fn();
      if (attempt > 0 && logErrors) info(`Retry succeeded: ${label}`, { attempt });
      return result;
    } catch (err) {
      attempt++;
      if (attempt > retryAttempts) {
        if (logErrors) error(`Retry failed: ${label}`, { attempt, message: err.message });
        throw err;
      } else {
        if (logErrors) warn(`Retry failed: ${label}`, { attempt, message: err.message });
        await new Promise((res) => setTimeout(res, retryDelay));
      }
    }
  }
}

function createFlakyFunction(failuresBeforeSuccess = 2, returnValue = { success: true }) {
  let counter = 0;
  return async () => {
    counter++;
    if (counter <= failuresBeforeSuccess) {
      throw new Error("Temporary failure");
    }
    return { data: returnValue };
  };
}

module.exports = { withRetry, createFlakyFunction };
