import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

/**
 * Class responsible for translating text using LangChain and OpenAI.
 */
export class Translator {
  private chain: RunnableSequence<{ text: string }, string>;

  /**
   * Initializes the Translator with the OpenAI API key.
   * @param apiKey - The OpenAI API key.
   */
  constructor(apiKey: string) {
    // Initialize the OpenAI language model
    const llm = new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey,
    });

    // Define a prompt template for the translation task
    const prompt = ChatPromptTemplate.fromTemplate(
      "Translate the following text to Spanish:\n\n{text}"
    );

    // Create a translation chain using LangChain's RunnableSequence
    this.chain = RunnableSequence.from([prompt, llm, new StringOutputParser()]);
  }

  /**
   * Translates the given text to Spanish.
   * @param inputText - The text to translate.
   * @returns The translated text.
   */
  async translateText(inputText: string): Promise<string> {
    try {
      // Execute the translation chain with the input text
      const translatedText = await this.chain.invoke({ text: inputText });
      return translatedText.trim();
    } catch (error) {
      console.error(`Error during translation: ${error}`);
      throw error;
    }
  }
}
