import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from "readline";
import dotenv from 'dotenv';
dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const getGeminiClient = () => {
    // Ensure the API key is provided
    if (!GEMINI_API_KEY) {
      throw new Error('Google API key is not set in environment variables');
    }

    // Initialize the Generative AI client
    
    const model = genAI.getGenerativeModel({model:GeminiModels.TextEmbedding})
    console.log("Model successfully initiated!")

    return model

}

const GeminiModels = {
    Gemini15Flash8b: "gemini-1.5-flash-8b",
    Gemini15ProLatest: "gemini-1.5-pro-latest",
    Gemini15Flash: "gemini-1.5-flash",
    TextEmbedding: "text-embedding-004", // Uncommented to enable the text embedding model
};






// Make sure to include these imports:


// Make sure to include these imports:
// import { GoogleGenerativeAI } from "@google/generative-ai";
const model = genAI.getGenerativeModel({ model: GeminiModels.Gemini15Flash });

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

// Create an interface to read input from the user in the terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  
// Function to handle the conversation
async function interactiveChat() {
    console.log("You can now chat with Gemini. Type your message below:");
  
    while (true) {
      // Prompt the user for input
      const userMessage = await new Promise((resolve) => rl.question("> ", resolve));
  
      // If the user types "exit", end the chat
      if (userMessage.toLowerCase() === "exit") {
        console.log("Goodbye!");
        rl.close();
        break;
      }
  
      // Send the user's message to Gemini and stream the response
      try {
        const result = await chat.sendMessageStream(userMessage);
        process.stdout.write("Gemini: ");
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            process.stdout.write(chunkText);
          }
        console.log(); // Add a newline after the complete response
      } catch (error) {
        console.error("An error occurred:", error.message);
      }
    }
  }
  
  // Start the interactive chat
  interactiveChat();