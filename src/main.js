import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { extractTextFromPDF } from './extract-text.js';
import { getGeminiClient } from './gemini-api.js'; 

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const filePath = 'BRII Australian Cyber Security Strategy Challenge Factsheet PDF.pdf';

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

// uploadFile(filePath)



