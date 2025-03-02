import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import process from "process";

// Configure the OTLP Metric Exporter
const metricExporter = new OTLPMetricExporter({
  url: "https://otlp.nr-data.net:4317",
  headers: {
    "api-key": process.env.NEW_RELIC_LICENSE_KEY || "",
  },
});

// Initialize MeterProvider with PeriodicExportingMetricReader
const meterProvider = new MeterProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || "default-service",
  }),
  readers: [
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000, // Exports every 60 seconds
    }),
  ],
});

console.log("Metrics initialized with New Relic OTLP Exporter");

export default meterProvider;
