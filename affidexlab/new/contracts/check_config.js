require('dotenv').config();
console.log('Private key present:', !!process.env.DEPLOYER_PRIVATE_KEY);
console.log('Private key length:', process.env.DEPLOYER_PRIVATE_KEY ? process.env.DEPLOYER_PRIVATE_KEY.length : 0);
console.log('Treasury:', process.env.TREASURY_WALLET);
