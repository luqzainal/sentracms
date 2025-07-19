import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple possible .env file locations
const possibleEnvPaths = [
  join(__dirname, '..', '.env'),
  join(__dirname, '..', '.env.local'),
  join(process.cwd(), '.env'),
  join(process.cwd(), '.env.local')
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  try {
    const result = dotenv.config({ path: envPath });
    if (result.parsed) {
      console.log(`✅ Environment loaded from: ${envPath}`);
      envLoaded = true;
      break;
    }
  } catch (error) {
    console.log(`❌ Failed to load from: ${envPath}`);
  }
}

if (!envLoaded) {
  console.log('⚠️ No .env file found in any of the expected locations');
}

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { script, description } = req.body;
    
    if (!script) {
      res.status(400).json({ error: 'Script name is required' });
      return;
    }

    console.log(`🔧 Running script: ${script} - ${description || 'No description'}`);

    // Define allowed scripts for security
    const allowedScripts = {
      'quick-fix-files': {
        command: 'node scripts/quick-fix-all-files.mjs',
        description: 'Fix ACL for all files'
      },
      'fix-existing-files-acl': {
        command: 'node scripts/fix-existing-files-acl.js',
        description: 'Fix ACL for existing files (detailed)'
      },
      'setup-automatic-acl': {
        command: 'node scripts/setup-automatic-acl.mjs',
        description: 'Setup automatic ACL system'
      }
    };

    const scriptConfig = allowedScripts[script];
    if (!scriptConfig) {
      res.status(400).json({ 
        error: 'Invalid script name',
        allowedScripts: Object.keys(allowedScripts)
      });
      return;
    }

    // Execute the script
    const { stdout, stderr } = await execAsync(scriptConfig.command, {
      cwd: process.cwd(),
      timeout: 60000, // 60 seconds timeout
      env: { ...process.env }
    });

    console.log('✅ Script executed successfully');
    console.log('📋 Output:', stdout);
    
    if (stderr) {
      console.log('⚠️ Script warnings:', stderr);
    }

    // Parse output to extract useful information
    let result = {
      success: true,
      message: `${scriptConfig.description} completed successfully`,
      output: stdout,
      warnings: stderr || null
    };

    // Try to extract specific information from output
    if (stdout.includes('Fixed:')) {
      const fixedMatch = stdout.match(/Fixed:\s*(\d+)/);
      const failedMatch = stdout.match(/Failed:\s*(\d+)/);
      const totalMatch = stdout.match(/Total files:\s*(\d+)/);
      
      if (fixedMatch) {
        result.fixedCount = parseInt(fixedMatch[1]);
      }
      if (failedMatch) {
        result.failedCount = parseInt(failedMatch[1]);
      }
      if (totalMatch) {
        result.totalFiles = parseInt(totalMatch[1]);
      }
    }

    res.status(200).json(result);

  } catch (error) {
    console.error('❌ Error running script:', error.message);
    
    // Handle timeout errors
    if (error.code === 'ETIMEDOUT') {
      res.status(408).json({ 
        error: 'Script execution timed out',
        details: 'The operation took too long to complete. Please try again.'
      });
      return;
    }

    // Handle other execution errors
    res.status(500).json({ 
      error: 'Failed to run script',
      details: error.message,
      stdout: error.stdout || null,
      stderr: error.stderr || null
    });
  }
} 