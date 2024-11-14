import { AbstractLogger, AbstractLoggerFactory, LogLevel } from "../../logger/logger.js";
import { ExceptionsWriter, InvariantException } from "../exceptions_observer.js";

export class ExceptionsToLogWriter<InvariantCode extends string> extends ExceptionsWriter<InvariantCode> {
  protected logger: AbstractLogger;

  constructor(loggerFactory: AbstractLoggerFactory) {
    super();
    this.logger = loggerFactory.createLogger("Observer");
  }

  public writeException(exception: Error, breadcrumb: string, metadata?: Record<string, string>): void {
    this.logger.json('ExceptionCaptured', {
      metadata: metadata,
      breadcrumb,
      attachment: {
        exception,
      },
    });
  }

  public writeInvariantException(exception: InvariantException<InvariantCode>, metadata?: Record<string, string>): void {
    const invariantCode = exception.getInvariantCode();
    this.logger.json(invariantCode, {
      message: `Invariant: ${invariantCode}: ${exception.message}`,
      metadata: metadata,
      attachment: exception,
    }, LogLevel.ERROR);
  }
}
