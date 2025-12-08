import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PARTNERS_FILE = path.join(__dirname, '../../data/partners.json');
const STATS_FILE = path.join(__dirname, '../../data/partner-stats.json');

class PartnerStore {
  constructor() {
    this.ensureDataDir();
    this.partners = this.loadPartners();
    this.stats = this.loadStats();
  }

  ensureDataDir() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  loadPartners() {
    try {
      if (fs.existsSync(PARTNERS_FILE)) {
        const data = fs.readFileSync(PARTNERS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error loading partners:', err);
    }
    
    const defaultPartners = {
      'tychi_prod_pk_live_8x9y2z3a4b5c6d7e': {
        id: 'tychi_prod_pk_live_8x9y2z3a4b5c6d7e',
        name: 'Tychi Wallet',
        email: 'tech@tychiwallet.com',
        active: true,
        environment: 'production',
        createdAt: new Date().toISOString(),
        domains: ['tychiwallet.com', 'app.tychiwallet.com'],
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerDay: 10000
        }
      },
      'tychi_test_pk_sandbox_1a2b3c4d5e6f7g8h': {
        id: 'tychi_test_pk_sandbox_1a2b3c4d5e6f7g8h',
        name: 'Tychi Wallet (Sandbox)',
        email: 'tech@tychiwallet.com',
        active: true,
        environment: 'sandbox',
        createdAt: new Date().toISOString(),
        domains: ['localhost', 'test.tychiwallet.com'],
        rateLimit: {
          requestsPerMinute: 50,
          requestsPerDay: 5000
        }
      }
    };

    this.savePartners(defaultPartners);
    return defaultPartners;
  }

  loadStats() {
    try {
      if (fs.existsSync(STATS_FILE)) {
        const data = fs.readFileSync(STATS_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
    return {};
  }

  savePartners(partners = this.partners) {
    try {
      fs.writeFileSync(PARTNERS_FILE, JSON.stringify(partners, null, 2));
    } catch (err) {
      console.error('Error saving partners:', err);
    }
  }

  saveStats(stats = this.stats) {
    try {
      fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (err) {
      console.error('Error saving stats:', err);
    }
  }

  getPartner(partnerId) {
    return this.partners[partnerId];
  }

  getAllPartners() {
    return Object.values(this.partners);
  }

  createPartner(name, email, environment = 'production') {
    const partnerId = this.generatePartnerId(environment);
    
    const partner = {
      id: partnerId,
      name,
      email,
      active: true,
      environment,
      createdAt: new Date().toISOString(),
      domains: [],
      rateLimit: {
        requestsPerMinute: environment === 'production' ? 100 : 50,
        requestsPerDay: environment === 'production' ? 10000 : 5000
      }
    };

    this.partners[partnerId] = partner;
    this.savePartners();

    return partner;
  }

  generatePartnerId(environment) {
    const prefix = environment === 'production' ? 'prod' : 'test';
    const random = crypto.randomBytes(12).toString('hex');
    return `pk_${prefix}_${random}`;
  }

  recordRequest(partnerId) {
    const today = new Date().toISOString().split('T')[0];
    
    if (!this.stats[partnerId]) {
      this.stats[partnerId] = {
        totalRequests: 0,
        daily: {}
      };
    }

    this.stats[partnerId].totalRequests++;
    
    if (!this.stats[partnerId].daily[today]) {
      this.stats[partnerId].daily[today] = 0;
    }
    this.stats[partnerId].daily[today]++;

    if (this.stats[partnerId].totalRequests % 100 === 0) {
      this.saveStats();
    }
  }

  getPartnerStats(partnerId) {
    return this.stats[partnerId] || { totalRequests: 0, daily: {} };
  }

  updatePartner(partnerId, updates) {
    if (!this.partners[partnerId]) {
      return null;
    }

    this.partners[partnerId] = {
      ...this.partners[partnerId],
      ...updates,
      id: partnerId,
      updatedAt: new Date().toISOString()
    };

    this.savePartners();
    return this.partners[partnerId];
  }

  deactivatePartner(partnerId) {
    return this.updatePartner(partnerId, { active: false });
  }

  activatePartner(partnerId) {
    return this.updatePartner(partnerId, { active: true });
  }
}

export const partnerStore = new PartnerStore();
