import {
  AgentExecutionStatus,
  Payments,
  TaskLogMessage,
} from "@nevermined-io/payments";
import { OpenAITools } from "./openai.tools";
import { getLogger, getPaymentsInstance } from "./utils";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Retrieve environment variables
const NVM_ENVIRONMENT = process.env.NVM_ENVIRONMENT || "staging";
const NVM_API_KEY = process.env.NVM_API_KEY!;
const AGENT_DID = process.env.AGENT_DID!;
const OPEN_API_KEY = process.env.OPEN_API_KEY!;

const logger = getLogger();

const opts = {
  joinAccountRoom: false,
  joinAgentRooms: [AGENT_DID],
  subscribeEventTypes: ["step-updated"],
  getPendingEventsOnSubscribe: false,
};

let payments: Payments;
let openaiTools: OpenAITools;

/**
 * Processes incoming steps and performs translation using OpenAI API.
 * @param data - The data received from the subscription.
 */
async function processSteps(data: any) {
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
    logMessage({
      task_id: step.task_id,
      level: "info",
      message: `Starting translation of input query.`,
    });

    // Extract the input text that needs to be translated
    const inputText = step.input_query;

    // Perform the translation using OpenAITools
    const translatedText = await openaiTools.translateText(inputText);

    // Log the completion of the translation task
    logMessage({
      task_id: step.task_id,
      level: "info",
      message: `Translation completed: ${translatedText}`,
    });

    // Update the step with the translated text and mark it as completed
    const updateResult = await payments.query.updateStep(step.did, {
      ...step,
      step_status: AgentExecutionStatus.Completed,
      is_last: true,
      output: translatedText,
      cost: 5, // You can adjust the cost as needed
    });

    // Check if the update was successful
    if (updateResult.status === 201) {
      logMessage({
        task_status: AgentExecutionStatus.Completed,
        task_id: step.task_id,
        level: "info",
        message: `Step ${step.step_id} completed successfully!`,
      });
    } else {
      logMessage({
        task_status: AgentExecutionStatus.Failed,
        task_id: step.task_id,
        level: "error",
        message: `Error updating step ${step.step_id} - ${JSON.stringify(
          updateResult.data
        )}`,
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
function logMessage(logMessage: TaskLogMessage) {
  // Log the message locally
  if (logMessage.level === "error") logger.error(logMessage.message);
  else if (logMessage.level === "warning") logger.warn(logMessage.message);
  else if (logMessage.level === "debug") logger.debug(logMessage.message);
  else logger.info(logMessage.message);

  // Send the log message to Nevermined Payments API
  payments.query.logTask(logMessage);
}

/**
 * The main function that initializes the agent and subscribes to the AI protocol.
 */
async function main() {
  try {
    // Initialize the Payments instance
    payments = getPaymentsInstance(NVM_API_KEY, NVM_ENVIRONMENT);
    logger.info(`Connected to Nevermined Network: ${NVM_ENVIRONMENT}`);
    openaiTools = new OpenAITools(OPEN_API_KEY!);

    // Subscribe to the AI protocol to receive tasks assigned to this agent
    await payments.query.subscribe(processSteps, opts);

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
