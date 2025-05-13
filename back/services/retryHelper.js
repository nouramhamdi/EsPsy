// retryHelper.js
async function retryWithBackoff(fn, retries = 3, delay = 5000) {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0 && err.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after']) || delay;
        console.warn(`🔁 Rate limited, retrying in ${retryAfter}ms...`);
        await new Promise(res => setTimeout(res, retryAfter));
        return retryWithBackoff(fn, retries - 1, delay);
      }
      throw err;
    }
  }
  
  module.exports = { retryWithBackoff };
  