import { Request, Response, NextFunction } from "express";
import { meter } from "./otel";
// Initialize metrics meter
const requestCounter = meter.createCounter("http_requests_total", {
  description: "Counts all incoming HTTP requests",
});
const requestDurationHistogram = meter.createHistogram(
  "http_request_duration_seconds",
  {
    description: "Measures the duration of HTTP requests",
  }
);
/**
 * Express middleware to count HTTP requests.
 */
export function countRequestsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  requestCounter.add(1, { route: req.path, method: req.method });
  next();
}

/**
 * Express middleware to measure request duration.
 */
export function requestDurationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = process.hrtime();

  res.on("finish", () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationInSeconds = seconds + nanoseconds / 1e9;
    console.log(`Request Duration: ${durationInSeconds}s`); // Debugging line

    requestDurationHistogram.record(durationInSeconds, {
      route: req.path,
      method: req.method,
      status_code: res.statusCode,
    });
  });

  next();
}
