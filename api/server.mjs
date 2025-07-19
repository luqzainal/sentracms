import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiHandler from './generate-upload-url.mjs';
import fixAclHandler from './fix-file-acl.mjs';
import fixAllFilesHandler from './fix-all-files.mjs';
import runScriptHandler from './run-script.mjs';

// Resolve the path to the .env file in the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../');
dotenv.config({ path: path.join(rootDir, '.env') });


const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Enable JSON body parsing
app.use(express.json());

// Use the existing serverless function as a route handler
// This makes the API available at http://localhost:3001/generate-upload-url
app.post('/generate-upload-url', apiHandler);

// Add route for fixing file ACL
app.post('/fix-file-acl', fixAclHandler);

// Add route for fixing all files ACL
app.post('/fix-all-files', fixAllFilesHandler);

// Add route for running scripts
app.post('/run-script', runScriptHandler);

app.listen(port, () => {
  console.log(`✅ API server listening at http://localhost:${port}`);
}); 