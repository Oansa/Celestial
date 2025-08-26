const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/welcome', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.post('/run-main', (req, res) => {
  // Logic to run main.py
  const pythonProcess = spawn('python', ['main.py'], { shell: true });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    res.status(200).json({ message: 'main.py executed successfully', output: data.toString() });
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    res.status(500).json({ error: 'Error executing main.py', details: data.toString() });
  });

  pythonProcess.on('close', (code) => {
    console.log(`main.py process exited with code ${code}`);
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// SSE endpoint for Ollama streaming - GET method
app.get('/api/stream/ollama', (req, res) => {
  const { model = 'llama2', prompt = '' } = req.query;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  console.log(`Starting Ollama stream: ${model} - ${prompt.substring(0, 50)}...`);

  // Spawn Ollama process
  const ollama = spawn('ollama', ['run', model], { 
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let buffer = '';
  let isFirstChunk = true;

  // Write prompt to stdin
  ollama.stdin.write(prompt + '\n');
  ollama.stdin.end();

  // Handle stdout data
  ollama.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;
    
    // Send chunk via SSE
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.trim()) {
        res.write(`data: ${line.trim()}\n\n`);
      }
    }
  });

  // Handle stderr data
  ollama.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('Ollama stderr:', error);
    res.write(`data: ERROR: ${error}\n\n`);
  });

  // Handle process close
  ollama.on('close', (code) => {
    if (buffer.trim()) {
      res.write(`data: ${buffer.trim()}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
    console.log(`Ollama process closed with code ${code}`);
  });

  // Handle process error
  ollama.on('error', (error) => {
    console.error('Failed to start Ollama:', error);
    res.write(`data: ERROR: Failed to start Ollama: ${error.message}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  // Handle client disconnect
  req.on('close', () => {
    ollama.kill();
    console.log('Client disconnected, Ollama process killed');
  });
});

// SSE endpoint for Ollama streaming - POST method
app.post('/api/chat/stream', (req, res) => {
  const { model = 'llama2', prompt = '', system = '' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  console.log(`Starting Ollama chat stream: ${model}`);

  // Build the full prompt
  let fullPrompt = '';
  if (system) {
    fullPrompt += `System: ${system}\n\n`;
  }
  fullPrompt += `User: ${prompt}\n\nAssistant:`;

  // Spawn Ollama process
  const ollama = spawn('ollama', ['run', model], { 
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  let buffer = '';

  // Write prompt to stdin
  ollama.stdin.write(fullPrompt + '\n');
  ollama.stdin.end();

  // Handle stdout data
  ollama.stdout.on('data', (data) => {
    const chunk = data.toString();
    buffer += chunk;
    
    // Send chunk via SSE
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.trim()) {
        res.write(`data: ${line.trim()}\n\n`);
      }
    }
  });

  // Handle stderr data
  ollama.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('Ollama stderr:', error);
    
    // Check for common errors
    if (error.includes('not found')) {
      res.write(`data: ERROR: Model '${model}' not found. Run 'ollama pull ${model}' to download it.\n\n`);
    } else if (error.includes('memory') || error.includes('out of memory')) {
      res.write(`data: ERROR: Out of memory. Try a smaller model like '${model}:7b'.\n\n`);
    } else {
      res.write(`data: ERROR: ${error}\n\n`);
    }
  });

  // Handle process close
  ollama.on('close', (code) => {
    if (buffer.trim()) {
      res.write(`data: ${buffer.trim()}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
    console.log(`Ollama chat process closed with code ${code}`);
  });

  // Handle process error
  ollama.on('error', (error) => {
    console.error('Failed to start Ollama:', error);
    res.write(`data: ERROR: Failed to start Ollama: ${error.message}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  });

  // Handle client disconnect
  req.on('close', () => {
    ollama.kill();
    console.log('Client disconnected, Ollama process killed');
  });
});

// Get available models
app.get('/api/models', async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const ollama = spawn('ollama', ['list'], { shell: true });
    
    let output = '';
    ollama.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    ollama.on('close', (code) => {
      if (code === 0) {
        // Parse the output to extract model names
        const lines = output.split('\n').slice(1); // Skip header
        const models = lines
          .filter(line => line.trim())
          .map(line => line.split(/\s+/)[0])
          .filter(name => name && !name.startsWith('NAME'));
        
        res.json({ models });
      } else {
        res.json({ models: ['llama2', 'llama2:7b', 'mistral', 'codellama'] });
      }
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.json({ models: ['llama2', 'llama2:7b', 'mistral', 'codellama'] });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/stream/ollama?model=llama2&prompt=...');
  console.log('  POST /api/chat/stream');
  console.log('  GET  /api/models');
});
