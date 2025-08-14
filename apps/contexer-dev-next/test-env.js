// Test script to check environment variables
console.log('Environment variables:');
console.log('THIRD_API_KEY:', process.env.THIRD_API_KEY ? 'SET' : 'NOT SET');
console.log('THIRD_API_URL:', process.env.THIRD_API_URL ? 'SET' : 'NOT SET');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');
console.log('OPENAI_API_URL:', process.env.OPENAI_API_URL ? 'SET' : 'NOT SET');
console.log('CLAUDE_API_KEY:', process.env.CLAUDE_API_KEY ? 'SET' : 'NOT SET');
console.log('CLAUDE_API_URL:', process.env.CLAUDE_API_URL ? 'SET' : 'NOT SET');
console.log('DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? 'SET' : 'NOT SET');
console.log('DEEPSEEK_API_URL:', process.env.DEEPSEEK_API_URL ? 'SET' : 'NOT SET');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'SET' : 'NOT SET');
console.log('OPENROUTER_API_URL:', process.env.OPENROUTER_API_URL ? 'SET' : 'NOT SET');

// Show all env vars that contain 'API'
console.log('\nAll API-related environment variables:');
Object.keys(process.env)
  .filter(key => key.toUpperCase().includes('API'))
  .forEach(key => {
    console.log(`${key}:`, process.env[key] ? 'SET' : 'NOT SET');
  });


