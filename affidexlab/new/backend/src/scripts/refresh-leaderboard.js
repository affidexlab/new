import { updateLeaderboardCache } from '../services/pointsService.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    console.log('🔄 Refreshing leaderboard cache...');
    await updateLeaderboardCache();
    console.log('✅ Leaderboard cache refreshed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Leaderboard refresh failed:', error);
    process.exit(1);
  }
}

run();
