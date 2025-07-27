#!/usr/bin/env node

// Combined script to clear and reinitialize the database
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔄 Database Reset Script');
console.log('========================\n');

console.log('This script will:');
console.log('1. 🗑️  Clear all existing data');
console.log('2. 🌱 Initialize with fresh sample data');
console.log('');

// Check for confirmation
const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
  console.log('⚠️  WARNING: This will permanently delete ALL existing data!');
  console.log('');
  console.log('🛡️  To proceed, run with --confirm flag:');
  console.log('   node reset-database.js --confirm');
  console.log('');
  process.exit(0);
}

async function runScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running ${scriptName}...`);
    
    const child = spawn('node', [scriptName, ...args], {
      stdio: 'inherit',
      cwd: __dirname
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset process...\n');
    
    // Step 1: Clear database
    await runScript('clear-database.js', ['--confirm']);
    
    // Step 2: Initialize fresh data
    await runScript('init-fresh-database.js');
    
    console.log('🎉 Database reset completed successfully!');
    console.log('');
    console.log('✨ Your database is now fresh with sample data');
    console.log('🧪 You can test the application with the sample URLs');
    console.log('👤 Login with: demo@shrinklink.com / password123');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    process.exit(1);
  }
}

resetDatabase();
