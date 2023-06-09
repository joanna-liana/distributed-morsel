import * as dotenv from 'dotenv';
dotenv.config();

import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import api from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

api.propagation.setGlobalPropagator(new W3CTraceContextPropagator());

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'dm-orders',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0',
  }),
  traceExporter: new OTLPTraceExporter({
    // the default value provided explictly
    url: `${process.env.JAEGER_HOST}:4318/v1/traces`,
    // optional - collection of custom headers to be sent with each request, empty by default
    headers: {},
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      // the default value provided explictly
      url: `${process.env.JAEGER_HOST}:4318/v1/metrics`,
      // an optional object containing custom headers to be sent with each request
      headers: {},
    }),
  }),
  instrumentations: [getNodeAutoInstrumentations(), new NestInstrumentation()],
});

sdk.start();
