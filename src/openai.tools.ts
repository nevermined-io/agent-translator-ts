import OpenAI from "openai";

/**
 * Class providing tools to interact with OpenAI's API.
 */
export class OpenAITools {
  private openai: OpenAI;

  /**
   * Initializes a new instance of the OpenAITools class.
   * @param apiKey - Your OpenAI API key.
   */
  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Translates the given text to Spanish using OpenAI's API.
   * @param text - The text to be translated.
   * @returns The translated text.
   */
  async translateText(text: string): Promise<string> {
    try {
      // Construct the prompt for translation
      const prompt = `Translate the following text to Spanish:\n\n${text}`;

      // Call the OpenAI API to perform the translation
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a Spanish language translator." },
          { role: "user", content: prompt },
        ],
      });

      // Extract the translated text from the response
      const translatedText = response.choices[0].message.content;

      if (translatedText === null) {
        throw new Error("Translation failed: received null response");
      }

      return translatedText;
    } catch (error) {
      console.error(`Error during translation: ${error}`);
      throw error;
    }
  }
}
