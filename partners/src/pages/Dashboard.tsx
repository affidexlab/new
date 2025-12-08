import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Partner {
  id: string;
  name: string;
  email: string;
  environment: string;
  active: boolean;
  createdAt: string;
  domains: string[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  stats?: {
    totalRequests: number;
    todayRequests: number;
  };
}

interface Stats {
  totalRequests: number;
  last30Days: Array<{
    date: string;
    requests: number;
  }>;
}

export default function Dashboard() {
  const [partnerId, setPartnerId] = useState<string>('');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showKey, setShowKey] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'https://api.decaflow.xyz';

  const fetchPartnerData = async () => {
    if (!partnerId.trim()) {
      setError('Please enter your Partner ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const partnerRes = await fetch(`${apiUrl}/v1/partners/me`, {
        headers: {
          'X-Partner-ID': partnerId
        }
      });

      if (!partnerRes.ok) {
        throw new Error('Invalid Partner ID or unauthorized');
      }

      const partnerData = await partnerRes.json();
      setPartner(partnerData.partner);

      const statsRes = await fetch(`${apiUrl}/v1/partners/stats`, {
        headers: {
          'X-Partner-ID': partnerId
        }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch partner data');
      setPartner(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe
  src="https://partners.decaflow.xyz/embed?partner=${partner?.name.toLowerCase().replace(/\s+/g, '')}"
  width="100%"
  height="600px"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>`;
    copyToClipboard(embedCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-[#1a1f3a] to-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">DecaFlow Partners</h1>
          <p className="text-gray-400">Partner Dashboard & Analytics</p>
        </div>

        {!partner ? (
          <div className="max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Sign In</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Partner API Key
                  </label>
                  <input
                    type="text"
                    value={partnerId}
                    onChange={(e) => setPartnerId(e.target.value)}
                    placeholder="pk_prod_xxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                  />
                </div>
                {error && (
                  <div className="text-red-400 text-sm">{error}</div>
                )}
                <button
                  onClick={fetchPartnerData}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Access Dashboard'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">Total Requests</div>
                <div className="text-3xl font-bold text-white">
                  {partner.stats?.totalRequests.toLocaleString() || 0}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">Today</div>
                <div className="text-3xl font-bold text-white">
                  {partner.stats?.todayRequests.toLocaleString() || 0}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-gray-400 text-sm mb-1">Status</div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${partner.active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="text-xl font-semibold text-white">
                    {partner.active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Usage Over Time</h2>
              {stats?.last30Days && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.last30Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Line type="monotone" dataKey="requests" stroke="#4F46E5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Partner Details</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">Name</div>
                    <div className="text-white font-medium">{partner.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email</div>
                    <div className="text-white font-medium">{partner.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Environment</div>
                    <div className="text-white font-medium capitalize">{partner.environment}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">API Key</div>
                    <div className="flex items-center gap-2">
                      <code className="text-white bg-black/30 px-2 py-1 rounded text-sm">
                        {showKey ? partner.id : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => setShowKey(!showKey)}
                        className="text-xs text-primary hover:underline"
                      >
                        {showKey ? 'Hide' : 'Show'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(partner.id)}
                        className="text-xs text-primary hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Rate Limits</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-400">Per Minute</div>
                    <div className="text-white font-medium">{partner.rateLimit.requestsPerMinute} requests</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Per Day</div>
                    <div className="text-white font-medium">{partner.rateLimit.requestsPerDay.toLocaleString()} requests</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Allowed Domains</div>
                    <div className="text-white font-medium">
                      {partner.domains.length > 0 ? partner.domains.join(', ') : 'All domains'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Integration Code</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Embed Widget</div>
                  <button
                    onClick={copyEmbedCode}
                    className="w-full text-left px-4 py-3 bg-black/30 rounded-lg text-white text-sm font-mono hover:bg-black/40 transition"
                  >
                    Click to copy embed code
                  </button>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">API Base URL</div>
                  <div className="px-4 py-3 bg-black/30 rounded-lg text-white text-sm font-mono">
                    {partner.environment === 'production' 
                      ? 'https://api.decaflow.xyz/v1'
                      : 'https://sandbox.decaflow.xyz/v1'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
