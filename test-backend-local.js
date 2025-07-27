#!/usr/bin/env node

/**
 * Test script to verify backend works locally before deployment
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing ShrinkLink Backend Locally...\n');

// Start the backend server
console.log('🚀 Starting backend server...');
const backend = spawn('npm', ['start'], {
    cwd: join(__dirname, 'BACKEND'),
    stdio: 'pipe',
    shell: true
});

let serverStarted = false;

backend.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📤 Backend:', output.trim());
    
    if (output.includes('ShrinkLink Backend API running')) {
        serverStarted = true;
        console.log('✅ Backend server started successfully!');
        
        // Test the health endpoint
        setTimeout(testHealthEndpoint, 2000);
    }
});

backend.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('❌ Backend Error:', error.trim());
});

backend.on('close', (code) => {
    console.log(`🔚 Backend process exited with code ${code}`);
    process.exit(code);
});

async function testHealthEndpoint() {
    try {
        console.log('\n🔍 Testing health endpoint...');
        const response = await fetch('http://localhost:5000/health');
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health check passed:', data);
        } else {
            console.error('❌ Health check failed:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('❌ Health check error:', error.message);
    }
    
    // Stop the server
    console.log('\n🛑 Stopping backend server...');
    backend.kill('SIGTERM');
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, stopping backend...');
    backend.kill('SIGTERM');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, stopping backend...');
    backend.kill('SIGTERM');
    process.exit(0);
});

// Timeout after 30 seconds
setTimeout(() => {
    if (!serverStarted) {
        console.error('❌ Backend failed to start within 30 seconds');
        backend.kill('SIGTERM');
        process.exit(1);
    }
}, 30000);
