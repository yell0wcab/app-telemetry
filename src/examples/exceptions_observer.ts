import { ExceptionsObserver, InvariantException } from "../exceptions/exceptions_observer.js";
import { ExceptionsToLogWriter } from "../exceptions/writer/log_writer.js";
import { ConsoleLoggerFactory } from "../logger/console_logger.js";

type InvariantCode = 
  | 'no_subscriptions_for_topic'
  | 'attempted_bca_rpc_no_client'
  | 'attempted_send_proto_without_connection';

const observer = new ExceptionsObserver<InvariantCode>([
  new ExceptionsToLogWriter(new ConsoleLoggerFactory())
]);
observer.captureException(new Error('test error'), 'breadcrumb');
observer.captureInvariantException(new InvariantException('no_subscriptions_for_topic', 'message'));