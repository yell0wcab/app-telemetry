export class InvariantException<InvariantCode extends string> extends Error {
  constructor(protected invariantCode: InvariantCode, message: string) {
    super(`${invariantCode}:${message}`);
  }

  public getInvariantCode(): InvariantCode {
    return this.invariantCode;
  }
};

export abstract class AbstractExceptionsObserver<InvariantCode extends string> {
  public abstract captureException(exception: Error, breadcrumb: string, metadata?: Record<string, string>): void;
  public abstract captureInvariantException(exception: InvariantException<InvariantCode>, metadata?: Record<string, string>): void;
};

export abstract class ExceptionsWriter<InvariantCode extends string> {
  public abstract writeException(exception: Error, breadcrumb: string, metadata?: Record<string, string>): void;
  public abstract writeInvariantException(exception: InvariantException<InvariantCode>, metadata?: Record<string, string>): void;
};

export class ExceptionsObserver<InvariantCode extends string> extends AbstractExceptionsObserver<InvariantCode> {
  private exceptionWriters: ExceptionsWriter<InvariantCode>[];

  constructor(exceptionWriters: ExceptionsWriter<InvariantCode> | ExceptionsWriter<InvariantCode>[]) {
    super();
    if (Array.isArray(exceptionWriters)) {
      this.exceptionWriters = [ ...exceptionWriters ];
    }
    else {
      this.exceptionWriters = [ exceptionWriters ]
    }
  }

  public captureException(exception: Error, breadcrumb: string, metadata?: Record<string, string>): void {
    this.exceptionWriters.forEach((writer) => writer.writeException(exception, breadcrumb, metadata));
  }

  public captureInvariantException(exception: InvariantException<InvariantCode>, metadata?: Record<string, string>): void {
    this.exceptionWriters.forEach((writer) => writer.writeInvariantException(exception, metadata));
  }
};
