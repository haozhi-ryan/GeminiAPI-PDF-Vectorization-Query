import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from './read.js';
import { GoogleGenerativeAI } from '@google/generative-ai';


dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

const filePath = 'BRII Australian Cyber Security Strategy Challenge Factsheet PDF.pdf';
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

// Fetch data from a table
async function fetchData() {
  const { data, error } = await supabase
    .from('pdf_table')
    .select('*');

  if (error) console.error(error);
  else console.log(data);
}

async function uploadFile(filePath) {
    // Read file as binary
    const fileContent = fs.readFileSync(filePath); // Read as binary buffer

    // path.basename() returns the last segment of the path, typically the file name with its extension.
    const fileName = path.basename(filePath);
    const title = fileName.split('.')[0]; // Extract title from filename
    const text = await extractTextFromPDF(filePath);

    const vectorizedPDF = await embedText(text)

    

    // Insert data into the database
    const { data, error } = await supabase
    .from('pdf_table')
    .insert([
        {
            title: title,
            pdf_metadata: fileContent, // Add any additional metadata as needed
            pdf_vectorized: vectorizedPDF, // Store the binary content
        }
    ]);

    if (error) {
        console.error('Error uploading file:', error);
        return;
    }

    console.log('File uploaded successfully');

}

async function readPDF(filePath) {
    try {
        const text = await extractTextFromPDF(filePath);
        // console.log(embedText(text))
      } catch (error) {
        console.error('Failed to extract text:', error.message);
      }
  }
  
const getGeminiClient = () => {
    // Ensure the API key is provided
    if (!GEMINI_API_KEY) {
      throw new Error('Google API key is not set in environment variables');
    }

    // Initialize the Generative AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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

async function embedText(text) {
    try {
        const embeddingModel = getGeminiClient(); // Initialize the Gemini client
        const embeddedText = await embeddingModel.embedContent(text); // Generate embedding for the input text
        return embeddedText.embedding.values; // Return the embedding values
    } catch (error) {
        console.error('Error embedding text:', error.message);
        throw error; // Optionally rethrow the error
    }
}

uploadFile(filePath)

