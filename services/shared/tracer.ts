import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";

const serviceName = process.env.OTEL_SERVICE_NAME || "unknown-service";

/**
 * Initializes OpenTelemetry tracing.
 */
export function initializeTracing(): NodeSDK {
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://jaeger:4317",
  });

  const resource = new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  });

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations(),
      new HttpInstrumentation(),
    ],
  });

  try {
    sdk.start();
    console.log("✅ Tracing initialized successfully.");
  } catch (error) {
    console.error("❌ Error initializing tracing:", error);
  }

  return sdk;
}
