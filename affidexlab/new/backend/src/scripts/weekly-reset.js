import { resetWeeklyPoints } from '../services/pointsService.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    console.log('🔄 Running weekly points reset...');
    await resetWeeklyPoints();
    console.log('✅ Weekly points reset completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Weekly reset failed:', error);
    process.exit(1);
  }
}

run();
