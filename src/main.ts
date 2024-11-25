// src/main.ts

import {
  AgentExecutionStatus,
  Payments,
  TaskLogMessage,
  EnvironmentName,
} from "@nevermined-io/payments";
import { Translator } from "./translator";
import dotenv from "dotenv";
import pino from "pino";

// Load environment variables
dotenv.config();

// Retrieve environment variables
const NVM_ENVIRONMENT = process.env.NVM_ENVIRONMENT || "staging";
const NVM_API_KEY = process.env.NVM_API_KEY!;
const AGENT_DID = process.env.AGENT_DID!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

const logger = pino({
  transport: { target: "pino-pretty" },
  level: "info",
});

// Initialize Payments instance
let payments: Payments;
// Initialize Translator instance
let translator: Translator;

/**
 * Processes incoming steps and performs translation using LangChain.
 * @param data - The data received from the subscription.
 */
async function run(data: any) {
  try {
    // Parse the incoming data
    const eventData = JSON.parse(data);
    logger.info(`Received event: ${JSON.stringify(eventData)}`);

    // Retrieve the step information using the step_id from eventData
    const step = await payments.query.getStep(eventData.step_id);
    logger.info(
      `Processing Step ${step.task_id} - ${step.step_id} [${step.step_status}]: ${step.input_query}`
    );

    // Check if the step status is pending; if not, skip processing
    if (step.step_status !== AgentExecutionStatus.Pending) {
      logger.warn(`Step ${step.step_id} is not pending. Skipping...`);
      return;
    }

    // Log the initiation of the translation task
    await logMessage({
      task_id: step.task_id,
      level: "info",
      message: `Starting translation...`,
    });

    // Extract the input text that needs to be translated
    const inputText = step.input_query;

    try {
      // Use the Translator instance to translate the text
      const translatedText = await translator.translateText(inputText);

      // Log the translated text
      logger.info(`Translation: ${translatedText}`);

      // Update the step with the translated text and mark it as completed
      const updateResult = await payments.query.updateStep(step.did, {
        ...step,
        step_status: AgentExecutionStatus.Completed,
        is_last: true,
        output: translatedText,
        cost: 5, // Adjust the cost as needed
      });

      // Log the completion of the translation task
      if (updateResult.status === 201) {
        await logMessage({
          task_id: step.task_id,
          message: "Translation completed.",
          level: "info",
          task_status: AgentExecutionStatus.Completed,
        });
      } else {
        await logMessage({
          task_id: step.task_id,
          message: `Error updating step ${step.step_id} - ${JSON.stringify(
            updateResult.data
          )}`,
          level: "error",
          task_status: AgentExecutionStatus.Failed,
        });
      }
    } catch (e) {
      // Handle any exceptions that occur during the translation
      logger.error(`Error during translation: ${e}`);
      await logMessage({
        task_id: step.task_id,
        message: `Error during translation: ${e}`,
        level: "error",
        task_status: AgentExecutionStatus.Failed,
      });
    }
  } catch (error) {
    logger.error(`Error processing steps: ${error}`);
  }
}

/**
 * Logs messages and sends them to the Nevermined Payments API.
 * @param logMessage - The log message to be sent.
 */
async function logMessage(logMessage: TaskLogMessage) {
  // Log the message locally
  if (logMessage.level === "error") logger.error(logMessage.message);
  else if (logMessage.level === "warning") logger.warn(logMessage.message);
  else if (logMessage.level === "debug") logger.debug(logMessage.message);
  else logger.info(logMessage.message);

  // Send the log message to Nevermined Payments API
  await payments.query.logTask(logMessage);
}

/**
 * Initializes the Payments instance.
 * @param nvmApiKey - Nevermined API Key.
 * @param environment - Nevermined environment (e.g., 'staging').
 * @returns A Payments instance.
 */
function initializePayments(nvmApiKey: string, environment: string) {
  logger.info("Initializing Nevermined Payments Library...");
  const paymentsInstance = Payments.getInstance({
    nvmApiKey,
    environment: environment as EnvironmentName,
  });

  if (!paymentsInstance.isLoggedIn) {
    throw new Error("Failed to login to Nevermined Payments Library");
  }
  return paymentsInstance;
}

/**
 * The main function that initializes the agent and subscribes to the AI protocol.
 */
async function main() {
  try {
    // Initialize the Payments instance
    payments = initializePayments(NVM_API_KEY, NVM_ENVIRONMENT);
    logger.info(`Connected to Nevermined Network: ${NVM_ENVIRONMENT}`);

    // Create an instance of the Translator class
    translator = new Translator(OPENAI_API_KEY);

    // Subscription options
    const opts = {
      joinAccountRoom: false,
      joinAgentRooms: [AGENT_DID],
      subscribeEventTypes: ["step-updated"],
      getPendingEventsOnSubscribe: false,
    };

    // Subscribe to the AI protocol to receive tasks assigned to this agent
    await payments.query.subscribe(run, opts);

    logger.info("Waiting for events!");
  } catch (error) {
    logger.error(`Error in main function: ${error}`);
    payments.query.disconnect();
    process.exit(1);
  }
}

logger.info("Starting AI Translator Agent...");

// Start the agent by calling the main function
main();