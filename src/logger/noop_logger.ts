import { AbstractLogger, AbstractLoggerFactory, JsonlineDocument, LogLevel } from "./logger.js";

class NoopLogger extends AbstractLogger {
  /**
   * Log a json document.
   *
   * @param key An identifier of this event, type of log, etc., for searching.
   * @param document A JsonlineDocument -- see per-field docs for usage.
   */
  json(_key: string, _document: JsonlineDocument, _logLevel = LogLevel.INFO): void {}
};

export class NoopLoggerFactory extends AbstractLoggerFactory {
  public createLogger(_scope: string, _prettify: boolean = false, _pinnedMetadata: Record<string, string> = {}): AbstractLogger {
    return new NoopLogger();
  }
}
