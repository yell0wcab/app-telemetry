/**
 * Type of an object suitable for logging as a jsonline document.
 *
 * This type contains a variety of fields, mostly optional, but providing
 * guidelines for logging structured data as a jsonline for better
 * surfacability in OpenSearch.
 */
export type JsonlineDocument = {
  /**
   * Optional message to attach.
   * This can be a templated string, but only if doing so would make more sense
   * than providing an attachment with searchable metadata.
   */
  message?: string;

  /**
   * Arbitrary attachment. This must be JSON stringifiable, or it will not be
   * attachable.
   */
  attachment?: unknown;

  /**
   * Breadcrumb - optional string hint about where this occurred, such as the
   * function or context that made this call.
   */
  breadcrumb?: string;

  /**
   * Metadata tags. These can be anything, but some recommended ones are
   * included as hints for standardization in searching.
   */
  metadata?: {
    botName?: string;
    topic?: string;
    user?: string;
  } & Record<string, string>;
};

export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4
};

export abstract class AbstractLogger {
  /**
   * Log a json document.
   *
   * @param key An identifier of this event, type of log, etc., for searching.
   * @param document A JsonlineDocument -- see per-field docs for usage.
   */
  public abstract json(key: string, document: JsonlineDocument, logLevel?: LogLevel): void;
};

/**
 * const loggerFactory: AbstractLoggerFactory = new ConsoleLoggerFactory(LogLevel.WARNING);
 * 
 * const logger: AbstractLogger = ServicesFactory.getLoggerFactory().create("module-name");
 * logger.json('ExceptionCaptured', {
 *   metadata,
 *   breadcrumb,
 *   attachment: {
 *     exception
 *   }
 * });
 */
export abstract class AbstractLoggerFactory {
  public abstract createLogger(scope: string, prettify?: boolean, pinnedMetadata?: Record<string, string>): AbstractLogger;
};

