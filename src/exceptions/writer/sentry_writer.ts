import * as Sentry from "@sentry/node";
import { ExceptionsWriter, InvariantException } from "../exceptions_observer.js";

export class ExceptionsToSentryWriter<InvariantCode extends string> extends ExceptionsWriter<InvariantCode> {
  public writeException(exception: Error, breadcrumb: string, metadata?: Record<string, string>): void {
    const scope = Sentry.getCurrentScope().clone();
    scope.setTags({
      breadcrumb,
      ...metadata,
    });
    Sentry.captureException(exception);
  }

  public writeInvariantException(exception: InvariantException<InvariantCode>, metadata?: Record<string, string>): void {
    const invariantCode = exception.getInvariantCode();
    const sentryScope = Sentry.getCurrentScope().clone();
    sentryScope.setTags({
      invariantCode,
      ...metadata,
    });
    Sentry.captureException(exception);
  }
}
