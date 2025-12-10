import { resetMonthlyPoints } from '../services/pointsService.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    console.log('🔄 Running monthly points reset...');
    await resetMonthlyPoints();
    console.log('✅ Monthly points reset completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Monthly reset failed:', error);
    process.exit(1);
  }
}

run();
