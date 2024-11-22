import pino from "pino";
import { EnvironmentName, Payments } from "@nevermined-io/payments";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const logger = pino({
  transport: { target: "pino-pretty" },
  level: "info",
});

/**
 * Initializes and returns a Payments instance.
 * @param nvmApiKey - Nevermined API Key.
 * @param environment - Nevermined environment (e.g., 'staging').
 * @returns A Payments instance.
 */
export function getPaymentsInstance(nvmApiKey: string, env: string) {
  logger.info("Initializing NVM Payments Library...");
  const payments = Payments.getInstance({
    nvmApiKey,
    environment: env as EnvironmentName,
  });

  if (!payments.isLoggedIn) {
    throw new Error("Failed to login to NVM Payments Library");
  }
  return payments;
}

/**
 * Initializes and returns a logger instance.
 * @returns A pino logger instance.
 */
export function getLogger() {
  return pino({
    transport: { target: "pino-pretty" },
    level: "info",
  });
}
