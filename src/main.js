import { retrieveContextFromDB, fetchData, uploadFile, embedText } from './databaseFunctions.js'

const filePath = "Cybersecurity_Understanding_Phishing_Attacks.pdf"


// uploadFile(filePath)


// fetchData();



// Testing the retrieval of PDFs and their similarity
// async function main(text) {

//     const queryEmbedding  = await embedText(text);
  
//     try {
        
//       const context = await retrieveContextFromDB(queryEmbedding, 5);
  
//       if (context.length === 0) {
//         console.log('No relevant context found.');
//       } else {
//         console.log('Retrieved Context:', context);
//       }
//     } catch (error) {
//       console.error('Error:', error.message);
//     }
//   }
// const query = 'cyber'
// main(query);
