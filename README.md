[![banner](https://raw.githubusercontent.com/nevermined-io/assets/main/images/logo/banner_logo.png)](https://nevermined.io)

Translator Agent using Nevermined's Payments API (TypeScript)
=============================================================

> TypeScript agent that translates text using OpenAI's API via LangChain and integrates with Nevermined's task system.

> [nevermined.io](https://nevermined.io)

* * *

Table of Contents
-----------------

*   [Translator Agent using Nevermined's Payments API (TypeScript)](#translator-agent-using-nevermineds-payments-api-typescript)
    *   [Introduction](#introduction)
    *   [Getting Started](#getting-started)
        *   [Prerequisites](#prerequisites)
        *   [Installation](#installation)
    *   [Tutorial](#tutorial)
        *   [Implementing the Nevermined Integration](#implementing-the-nevermined-integration)
            *   [1. Setting Up the Environment](#1-setting-up-the-environment)
            *   [2. Installing Dependencies](#2-installing-dependencies)
    *   [Configuring Environment Variables](#configuring-environment-variables)
        *   [1. Nevermined API Key (`NVM_API_KEY`)](#1-nevermined-api-key-nvm_api_key)
        *   [2. Agent DID (`AGENT_DID`)](#2-agent-did-agent_did)
        *   [3. Other Environment Variables](#3-other-environment-variables)
        *   [4. Setting Up the `.env` File](#4-setting-up-the-env-file)
    *   [Integrating Nevermined Payment Protocol into Your Agent](#integrating-nevermined-payment-protocol-into-your-agent)
        *   [Initializing the Payments Client](#initializing-the-payments-client)
        *   [Subscribing to the AI Protocol](#subscribing-to-the-ai-protocol)
        *   [Handling Incoming Tasks](#handling-incoming-tasks)
            *   [Retrieving Step Information](#retrieving-step-information)
            *   [Processing the Task](#processing-the-task)
            *   [Updating Task Status and Logging](#updating-task-status-and-logging)
    *   [License](#license)

* * *

Introduction
------------

The Translator Agent is a TypeScript application that translates text using OpenAI's API via LangChain and integrates with Nevermined's Payments API to handle task management and execution. This agent listens for translation tasks assigned to it via Nevermined's AI protocol, processes them, and updates the task status accordingly.

Getting Started
---------------

### Prerequisites

*   Node.js v14 or higher
*   npm or yarn
*   Nevermined API Key
*   OpenAI API Key
*   Git

### Installation

1.  **Clone the repository**
    
    ```bash
    git clone https://github.com/nevermined-io/agent-translator-ts.git
    cd agent-translator-ts
    ```
    
2.  **Install the dependencies**
    
    ```bash
    npm install
    ```
    
3.  **Configure environment variables**
    
    *   Copy the `.env.example` file to `.env`
        
        ```bash
        cp .env.example .env
        ```
        
    *   Edit the `.env` file and add your API keys and configuration:
        
        ```makefile
        NVM_API_KEY=your_nevermined_api_key
        OPENAI_API_KEY=your_openai_api_key
        NVM_ENVIRONMENT=staging  # or 'production' as per your setup
        AGENT_DID=your_agent_did
        ```
        
4.  **Run the agent**
    
    ```bash
    npm start
    ```
    

Tutorial
--------

### Implementing the Nevermined Integration

This tutorial will guide you through the implementation of the Nevermined integration in the translator agent.

#### 1\. Setting Up the Environment

Ensure you have the following files in your project:

*   `main.ts`: The main script where the agent logic resides.
*   `translator.ts`: Contains the translation logic using OpenAI's API via LangChain.
*   `.env`: Stores your environment variables (API keys and configurations).
*   `.env.example`: An example of the `.env` file structure.
*   `package.json`: Lists all the Node.js dependencies required for the project.

#### 2\. Installing Dependencies

Install the necessary Node.js packages listed in `package.json`. The key dependencies related to the agent are:

*   `@nevermined-io/payments`: The TypeScript SDK for Nevermined's Payments API.
*   `@langchain/core`: For working with language models and chains.
*   `@langchain/openai`: OpenAI library wrapper for langchain.

```bash
npm install
```

Configuring Environment Variables
---------------------------------

Before integrating Nevermined into your agent, you need to configure some environment variables.

1.  **Nevermined API Key (`NVM_API_KEY`)**
    
    *   Generate your Nevermined API Key by logging into your account at [nevermined.app](https://nevermined.app).
    *   Navigate to your profile settings to create or retrieve your API key.
2.  **Agent DID (`AGENT_DID`)**
    
    *   The Agent Decentralized Identifier (DID) corresponds to the asset you create on the Nevermined platform.
    *   To obtain your Agent DID:
        *   Create a subscription plan and an asset on [nevermined.app](https://nevermined.app).
        *   The DID of the asset you created will serve as your Agent DID.
3.  **Other Environment Variables**
    
    *   **OpenAI API Key (`OPENAI_API_KEY`)**: Set this variable with your OpenAI API key.
    *   **Nevermined Environment (`NVM_ENVIRONMENT`)**: Specify the Nevermined environment you wish to connect to (`staging`, `production`, etc.).
4.  **Setting Up the `.env` File**
    
    Create a `.env` file in your project's root directory and add the following:
    
    ```makefile
    NVM_API_KEY=your_nevermined_api_key
    OPENAI_API_KEY=your_openai_api_key
    NVM_ENVIRONMENT=staging  # or 'production' as per your setup
    AGENT_DID=your_agent_did
    ```
    
    This file will store your sensitive information securely and keep it out of your source code.
    

Integrating Nevermined Payment Protocol into Your Agent
-------------------------------------------------------

Integrating Nevermined into your agent involves several key steps: initializing the Payments client, subscribing to the AI protocol, handling incoming tasks, and updating task status and logging.

### Initializing the Payments Client

To interact with Nevermined's Payments API, you need to initialize a `Payments` client in your agent's code. This client will handle authentication and provide methods to communicate with the Nevermined network.

```typescript
import { Payments, EnvironmentName } from "@nevermined-io/payments";
import dotenv from "dotenv";
import pino from "pino";

// Load environment variables
dotenv.config();

// Retrieve environment variables
const NVM_ENVIRONMENT = process.env.NVM_ENVIRONMENT || "staging";
const NVM_API_KEY = process.env.NVM_API_KEY!;
const logger = pino({ level: "info" });

// Initialize the Payments instance
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

const payments = initializePayments(NVM_API_KEY, NVM_ENVIRONMENT);
logger.info(`Connected to Nevermined Network: ${NVM_ENVIRONMENT}`);
```

In this snippet:

*   **`nvmApiKey`**: Your Nevermined API key from the environment variables.
*   **`environment`**: Specifies the Nevermined environment to connect to.
*   **`initializePayments()`**: Initializes the Payments client.

By initializing the Payments client, your agent is now authenticated and ready to interact with the Nevermined network.

### Subscribing to the AI Protocol

Next, you need to subscribe your agent to the AI protocol to start receiving tasks assigned to it. This involves setting up an asynchronous listener that triggers whenever a new task is available.

```typescript
import { AgentExecutionStatus } from "@nevermined-io/payments";

// Retrieve environment variables
const AGENT_DID = process.env.AGENT_DID!;

// Subscription options
const opts = {
  joinAccountRoom: false,
  joinAgentRooms: [AGENT_DID],
  subscribeEventTypes: ["step-updated"],
  getPendingEventsOnSubscribe: false,
};

/**
 * The main function that initializes the agent and subscribes to the AI protocol.
 */
async function main() {
  try {
    // Initialize the Payments instance
    const payments = initializePayments(NVM_API_KEY, NVM_ENVIRONMENT);
    logger.info(`Connected to Nevermined Network: ${NVM_ENVIRONMENT}`);

    // Create an instance of the Translator class
    const translator = new Translator(OPENAI_API_KEY);

    // Subscribe to the AI protocol to receive tasks assigned to this agent
    await payments.query.subscribe(run, opts);

    logger.info("Waiting for events!");
  } catch (error) {
    logger.error(`Error in main function: ${error}`);
    payments.query.disconnect();
    process.exit(1);
  }
}

// Start the agent by calling the main function
main();
```

Here:

*   **`run`**: The callback function in your agent that processes incoming tasks.
*   **`joinAccountRoom`**: Set to `false` to focus on agent-specific events.
*   **`joinAgentRooms`**: A list containing your Agent DID to subscribe to tasks assigned to your agent.
*   **`getPendingEventsOnSubscribe`**: If `true`, retrieves any pending events upon subscription.

This subscription ensures your agent listens for and receives tasks from the Nevermined network.

### Handling Incoming Tasks

When a task is assigned to your agent, the callback function you specified (`run`) is invoked. This function should handle retrieving task details, processing the task, and updating its status.

#### Retrieving Step Information

First, retrieve the details of the task's current step using the `step_id` provided in the incoming data.

```typescript
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
```

*   **`data`**: The data received from the subscription.
*   **`payments.query.getStep()`**: Fetches the details of the specified step, such as input data and status.

#### Processing the Task

Extract the necessary input from the step and perform the required processing. For example, if your agent translates text, you would retrieve the text to translate:

```typescript
    // Log the initiation of the translation task
    await logMessage({
      task_id: step.task_id,
      level: "info",
      message: `Starting translation...`,
    });

    // Extract the input text that needs to be translated
    const inputText = step.input_query;

    // Perform the task using your agent's processing logic
    const translatedText = await translator.translateText(inputText);
```

Replace `translator.translateText` with the actual function or method your agent uses to process the task.

#### Updating Task Status and Logging

After processing the task, update the task's status and provide any output or results back to the Nevermined network.

```typescript
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
  } catch (error) {
    logger.error(`Error processing steps: ${error}`);
  }
}
```

Here:

*   **`updateStep()`**: Updates the step's status and output in the Nevermined network.
*   **`step_status`**: Set to `Completed` to indicate successful completion.
*   **`output`**: The result of your agent's processing.
*   **`is_last`**: Indicates whether this is the last step in the task.

Log the completion of the task for tracking and debugging purposes:

```typescript
async function logMessage(logMessage: TaskLogMessage) {
  // Log the message locally
  if (logMessage.level === "error") logger.error(logMessage.message);
  else if (logMessage.level === "warning") logger.warn(logMessage.message);
  else if (logMessage.level === "debug") logger.debug(logMessage.message);
  else logger.info(logMessage.message);

  // Send the log message to Nevermined Payments API
  await payments.query.logTask(logMessage);
}
```

In case of errors during processing, handle exceptions and update the task status accordingly:

```typescript
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
```

* * *

License
-------

```
Copyright 2024 Nevermined

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```