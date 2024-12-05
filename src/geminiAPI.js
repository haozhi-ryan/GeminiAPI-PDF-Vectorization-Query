import { GoogleGenerativeAI } from '@google/generative-ai';
import readline from "readline";
import dotenv from 'dotenv';
import { embedText, retrieveContextFromDB } from './databaseFunctions.js'
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

function truncateContext(context, maxTokens = 900000) {
  const tokenized = context.split(" "); // Simple token approximation
  if (tokenized.length > maxTokens) {
      return tokenized.slice(0, maxTokens).join(" ") + "... [Truncated]";
  }
  return context;
}

// Helper function to get relevant context from the database
async function getContext(userQuery) {
  const queryEmbedding = await embedText(userQuery);
  const contextData = await retrieveContextFromDB(queryEmbedding);

  if (!contextData || contextData.length === 0) {
      return "No relevant context found.";
  }

  const formattedContext = contextData
      .map((row, index) => `Source [${index + 1}]:\nTitle: ${row.title}\nMetadata: ${row.metadata}\n---`)
      .join("\n\n");

  return truncateContext(formattedContext, 900000); // Keep the context under the token limit
}



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
        // Step 1: Retrieve relevant context from the database
        const context = await getContext(userMessage);

        // Step 2: Construct the message with or without context
        const chatInput = context !== "No relevant context found."
        ? `Context:\n${context}\n\nQuery: ${userMessage}`
        : userMessage;
    

        // Step 3: Send the user's message to Gemini and stream the response
        const result = await chat.sendMessageStream(chatInput);
        process.stdout.write("Gemini: ");
        for await (const chunk of result.stream) {
            process.stdout.write(chunk.text());
                    }
        console.log(); // Add a newline after the complete response
      } catch (error) {
        console.error("An error occurred:", error.message);
      }
    }
  }
  
  // Start the interactive chat
  interactiveChat();