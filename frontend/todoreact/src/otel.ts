import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { ZoneContextManager } from "@opentelemetry/context-zone-peer-dep";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { propagation, context } from "@opentelemetry/api";
import axios from "axios";
import "zone.js";
// Set up the tracer provider
const provider = new WebTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: "todoreact",
  }),
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: "http://localhost:4319/v1/traces",
      })
    ),
    new SimpleSpanProcessor(new ConsoleSpanExporter()),
  ],
});

// Register the provider
provider.register({
  contextManager: new ZoneContextManager(),
});

// Automatically instrument Fetch and XHR requests
registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation(),
    new XMLHttpRequestInstrumentation(),
  ],
});

// Inject trace context into Axios requests manually
axios.interceptors.request.use((config) => {
  // Ensure headers object exists
  config.headers = config.headers || {};

  // Inject the current active trace context into the request headers
  propagation.inject(context.active(), config.headers, {
    set: (carrier, key, value) => {
      carrier[key] = value;
    },
  });

  return config;
});

console.log(
  "OpenTelemetry initialized for todoreact with trace context propagation"
);
