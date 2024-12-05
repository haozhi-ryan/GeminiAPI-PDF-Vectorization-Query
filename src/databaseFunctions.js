import fs from 'fs';
import path from 'path';
import supabase from './supabaseClient.js';
import { extractTextFromPDF } from './extractText.js';
import { getGeminiClient } from './geminiAPI.js';

export async function fetchData() {
    console.log("Fetching data...");
    const { data, error } = await supabase
    .from('pdf_table')
    .select('*');

    if (error) console.error(error);
    else console.log(data);
}

export async function uploadFile(filePath) {
    try {
        const fileContent = fs.readFileSync(filePath); // Read as binary buffer
        const fileName = path.basename(filePath);
        const title = fileName.split('.')[0]; // Extract title from filename
        const text = await extractTextFromPDF(filePath);

        const vectorizedPDF = await embedText(text);

        const { data, error } = await supabase
            .from('pdf_table')
            .insert([
                {
                    title: title,
                    pdf_metadata: fileContent,
                    pdf_vectorized: vectorizedPDF,
                },
            ]);

        if (error) {
            console.error('Error uploading file:', error);
            return;
        }

        console.log('File uploaded successfully');
    } catch (error) {
        console.error('Error in uploadFile:', error.message);
    }
}

export async function embedText(text) {
    try {
        const embeddingModel = getGeminiClient(); // Initialize the Gemini client
        const embeddedText = await embeddingModel.embedContent(text); // Generate embedding for the input text
        return embeddedText.embedding.values; // Return the embedding values
    } catch (error) {
        console.error('Error embedding text:', error.message);
        throw error; // Optionally rethrow the error
    }
}

export async function retrieveContextFromDB(queryEmbedding, limit = 2) {
    try {
      // Call the similarity_search function using the Supabase RPC feature
      const { data, error } = await supabase
        .rpc('similarity_search', {
          query_embedding: queryEmbedding,
          result_limit: limit,
        });
  
      if (error) {
        console.error('Error performing similarity search:', error.message);
        throw error;
      }
  
      // Return the retrieved data or an empty array if no results
      return data.length > 0 ? data : [];
    } catch (error) {
      console.error('Error retrieving context from Supabase:', error.message);
      throw new Error('Failed to retrieve context from the database.');
    }
  }

