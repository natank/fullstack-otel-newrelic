import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import process from "process";

const provider = new NodeTracerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "default-service",
  }),
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: "https://otlp.nr-data.net:4317",
        headers: {
          "api-key": process.env.NEW_RELIC_LICENSE_KEY || "",
        },
      })
    ),
  ],
});

provider.register();

console.log("Tracing initialized with New Relic OTLP Exporter");

export default provider;
