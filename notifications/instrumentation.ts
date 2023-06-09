import {
  getNodeAutoInstrumentations
} from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import * as opentelemetry from '@opentelemetry/sdk-node';
import {
  SemanticResourceAttributes
} from '@opentelemetry/semantic-conventions';


const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'dm-notifications',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new OTLPTraceExporter({
    // the default value provided explictly
    url: `${process.env.JAEGER_HOST}:4318/v1/traces`,
    // optional - collection of custom headers
    // to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // the default value provided explictly
      url: `${process.env.JAEGER_HOST}:4318/v1/metrics`,
      // an optional object containing custom headers
      // to be sent with each request
      headers: {},
    }),
  }),
  instrumentations: [
    getNodeAutoInstrumentations(),
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

sdk.start();
