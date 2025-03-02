import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

// Get the service name from the environment variable
const serviceName = process.env.OTEL_SERVICE_NAME || "unknown-service";

/**
 * Initializes OpenTelemetry metrics using Prometheus.
 */
export function initializeMetrics() {
  const prometheusExporter = new PrometheusExporter({}, () => {
    const { port, endpoint } = PrometheusExporter.DEFAULT_OPTIONS; // ✅ Get default port & endpoint dynamically
    console.log(
      `📊 Prometheus metrics available at http://localhost:${port}${endpoint}`
    );
  });

  const meterProvider = new MeterProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName, // ✅ Assign service name properly
    }),
    readers: [prometheusExporter],
  });

  return meterProvider.getMeter("otel-metrics");
}
