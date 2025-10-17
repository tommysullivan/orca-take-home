/**
 * Retry configuration options for exponential backoff
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 4
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before the first retry
   * @default 1000
   */
  initialRetryDelay?: number;

  /**
   * Exponential base for calculating retry delays
   * - Base 2: 1s, 2s, 4s, 8s, 16s
   * - Base 3: 1s, 3s, 9s, 27s, 81s (default)
   * @default 3
   */
  exponentialBase?: number;

  /**
   * Whether to only retry on 403 (rate limit) errors
   * If false, will retry on all errors
   * @default true
   */
  retryOnlyOn403?: boolean;

  /**
   * Optional description of the operation for logging
   */
  operationDescription?: string;
}

/**
 * Default retry options for API calls
 * - 4 retries with exponential backoff (base 3: 1s, 3s, 9s, 27s)
 * - Only retries on 403 rate limit errors
 */
export const DEFAULT_RETRY_OPTIONS: Partial<RetryOptions> = {
  maxRetries: 4,
  exponentialBase: 3,
  retryOnlyOn403: true,
};

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if an error is a 403 rate limit error
 */
function is403Error(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("403") ||
      error.message.toLowerCase().includes("forbidden")
    );
  }
  return false;
}

/**
 * Retry an async operation with exponential backoff
 *
 * This utility is designed to handle rate limiting and transient failures
 * when making API calls. It will retry the operation with increasing delays
 * between attempts.
 *
 * @example
 * ```typescript
 * // Retry with default settings (4 retries, base 3, only 403 errors)
 * const data = await retryWithBackoff(() => fetchDataFromAPI());
 *
 * // With custom description
 * const data = await retryWithBackoff(
 *   () => fetchDataFromAPI(),
 *   { operationDescription: "fetch user data" }
 * );
 *
 * // Customize retry behavior
 * const data = await retryWithBackoff(
 *   () => fetchDataFromAPI(),
 *   {
 *     maxRetries: 3,
 *     initialRetryDelay: 500,
 *     exponentialBase: 2,
 *     retryOnlyOn403: false, // retry on all errors
 *     operationDescription: "fetch user data"
 *   }
 * );
 * ```
 *
 * @param operation - The async function to retry
 * @param options - Retry configuration options (defaults to DEFAULT_RETRY_OPTIONS)
 * @returns The result of the operation
 * @throws The last error encountered if all retries fail
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_RETRY_OPTIONS.maxRetries!,
    initialRetryDelay = 1000,
    exponentialBase = DEFAULT_RETRY_OPTIONS.exponentialBase!,
    retryOnlyOn403 = DEFAULT_RETRY_OPTIONS.retryOnlyOn403!,
    operationDescription = "operation",
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      const shouldRetry = !retryOnlyOn403 || is403Error(error);

      // If this is the last attempt or we shouldn't retry, throw
      if (attempt === maxRetries || !shouldRetry) {
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = initialRetryDelay * Math.pow(exponentialBase, attempt);

      console.warn(
        `⚠️  ${
          retryOnlyOn403 ? "Rate limited (403)" : "Error"
        } on ${operationDescription}, ` +
          `retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`
      );

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error("Retry failed");
}
