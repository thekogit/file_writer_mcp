import { spawn } from 'child_process';

const child = spawn('node', ['./dist/index.js', '--root', './test-output', '--backup'], {
  stdio: ['pipe', 'inherit', 'inherit']
});

console.log('Server started. Test it via an MCP client or manual tool call injection.');
// Since we can't easily pipe MCP JSON-RPC manually here without a client, 
// we will rely on unit tests and a build check.
setTimeout(() => {
    child.kill();
    process.exit(0);
}, 2000);
