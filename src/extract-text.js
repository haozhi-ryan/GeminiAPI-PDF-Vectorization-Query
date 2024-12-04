import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('./pdf-parse-wrapper.cjs');
import fs from 'fs/promises';

// console.log('pdfParse loaded successfully.');

export async function extractTextFromPDF(filePath) {
    try {
      // Read the file as a buffer
      const fileBuffer = await fs.readFile(filePath);
  
      // Parse the PDF content
      const pdfData = await pdfParse(fileBuffer);
  
      // return the extracted text
    //   console.log('Type of pdfData.text:', typeof pdfData.text);
      return pdfData.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error.message);
    }
  }




