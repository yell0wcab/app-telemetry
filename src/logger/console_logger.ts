import { AbstractLogger, AbstractLoggerFactory, JsonlineDocument, LogLevel } from "./logger.js";

class ConsoleLogger extends AbstractLogger {
  #logLevel: LogLevel;
  #scope: string;
  #prettify: boolean;
  #pinnedMetadata: Record<string, string>;

  constructor(logLevel: LogLevel, scope: string, prettify: boolean, pinnedMetadata: Record<string, string>) {
    super();
    this.#logLevel = logLevel;
    this.#scope = scope;
    this.#prettify = prettify;
    this.#pinnedMetadata = pinnedMetadata;
  }

  /**
   * Log a json document.
   *
   * @param key An identifier of this event, type of log, etc., for searching.
   * @param document A JsonlineDocument -- see per-field docs for usage.
   */
  json(key: string, document: JsonlineDocument, logLevel = LogLevel.INFO): void {
    if (this.#logLevel > logLevel) {
      return;
    }

    // Include any pinned metadata for this scope, but allow overriding it.
    document.metadata = {
      ...this.#pinnedMetadata,
      ...document.metadata,
    };

    const jsonline = {
      key,
      logLevel,
      scope: this.#scope,
      timestamp: (new Date()),
      document,
    };

    const space = this.#prettify ? 2 : undefined;

    try {
      console.log(JSON.stringify(jsonline, undefined, space));
    } catch (err: unknown) {
      // Attempt to log without the attachment, which is not type assured to be
      // JSON stringifiable.

      jsonline.document.attachment = "failedToStringify";

      console.log(JSON.stringify(jsonline, undefined, space));
    }
  }
};

export class ConsoleLoggerFactory extends AbstractLoggerFactory {
  constructor(private logLevel: LogLevel = LogLevel.INFO) {
    super();
  }

  public createLogger(scope: string, prettify: boolean = false, pinnedMetadata: Record<string, string> = {}): AbstractLogger {
    return new ConsoleLogger(this.logLevel, scope, prettify, pinnedMetadata);
  }
}
