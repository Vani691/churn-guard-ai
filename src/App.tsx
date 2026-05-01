/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Search, 
  Filter,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerData, PredictionResult, Recommendation } from './types';
import { cn } from './lib/utils';

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-3xl font-bold text-slate-900">{value}</span>
      <span className="text-sm text-slate-500 mt-1">{subValue}</span>
    </div>
  </motion.div>
);

const RiskBadge = ({ level }: { level: string }) => {
  const colors = {
    High: 'bg-red-50 text-red-700 border-red-100',
    Medium: 'bg-amber-50 text-amber-700 border-amber-100',
    Low: 'bg-emerald-50 text-emerald-700 border-emerald-100'
  };
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", colors[level as keyof typeof colors])}>
      {level}
    </span>
  );
};

// --- Main App ---

export default function App() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, statsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/stats')
      ]);
      const custData = await custRes.json();
      const statsData = await statsRes.json();
      setCustomers(custData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = async (customer: CustomerData) => {
    setSelectedCustomer(customer);
    setPrediction(null);
    setRecommendations([]);
    setRecLoading(true);

    try {
      const predRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer)
      });
      const predData = await predRes.json();
      setPrediction(predData);

      const recRes = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, prediction: predData })
      });
      const recData = await recRes.json();
      setRecommendations(recData);
    } catch (err) {
      console.error(err);
    } finally {
      setRecLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const importanceData = stats ? Object.entries(stats.feature_importance).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    value: Math.round((value as number) * 100)
  })).sort((a, b) => b.value - a.value) : [];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Activity className="animate-spin text-indigo-600" size={48} />
        <p className="text-slate-500 font-medium font-mono">Initializing Neural Engine...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded">PRO</span>
              <span className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase">Security Level: Alpha</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter flex items-center gap-3 text-slate-900">
              ChurnGuard <span className="text-indigo-600">AI</span>
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Predictive Analytics & Retention Intelligence Dashboard</p>
          </div>
          <div className="flex flex-col items-end gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM STATUS: OPERATIONAL
            </div>
            <div className="bg-slate-900 text-slate-100 px-3 py-1 rounded flex items-center gap-2">
              <BrainCircuit size={12} />
              Inference Engine: v4.2
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Base" 
            value={(customers.length * 1234).toLocaleString()} 
            subValue="Actively Monitored" 
            icon={Users} 
            color="bg-slate-900" 
          />
          <StatCard 
            title="Avg Churn" 
            value="12.4%" 
            subValue="MTD Performance" 
            icon={TrendingDown} 
            color="bg-indigo-600" 
          />
          <StatCard 
            title="Risk Alerts" 
            value="24" 
            subValue="Critical Intervention" 
            icon={AlertTriangle} 
            color="bg-rose-500" 
          />
          <StatCard 
            title="Model Conf." 
            value={`${(stats?.model_accuracy * 100).toFixed(1)}%`} 
            subValue="RandomForest Ensemble" 
            icon={Activity} 
            color="bg-emerald-600" 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-bottom border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Activity size={20} className="text-indigo-600" />
                  Real-time Monitoring
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by ID or Region..." 
                    className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Usage</th>
                      <th className="px-6 py-4">Health</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredCustomers.map((c) => (
                      <tr 
                        key={c.customer_id} 
                        onClick={() => handleCustomerSelect(c)}
                        className={cn(
                          "group cursor-pointer hover:bg-slate-50 transition-colors",
                          selectedCustomer?.customer_id === c.customer_id && "bg-indigo-50/50"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-900">{c.customer_id}</span>
                            <span className="text-xs text-slate-400">{c.region} • {c.plan_type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <RiskBadge level={c.health_score < 40 ? 'High' : c.health_score < 70 ? 'Medium' : 'Low'} />
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {Math.round(c.monthly_usage)} GB
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  c.health_score < 40 ? "bg-red-500" : c.health_score < 70 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${c.health_score}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-700">{c.health_score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Feature Importance Global */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <PieChartIcon size={20} className="text-indigo-600" />
                Global Feature Importance
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={importanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      axisLine={false}
                      tickLine={false}
                      style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', fill: '#64748b' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded text-xs shadow-xl border border-slate-800">
                              <p className="font-bold">{payload[0].value}% Impact</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {importanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Analysis Sidebar */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!selectedCustomer ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-100/50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
                >
                  <Search className="text-slate-300 mb-4" size={48} />
                  <h4 className="text-slate-500 font-bold mb-2">Select a Customer</h4>
                  <p className="text-slate-400 text-sm max-w-[200px]">
                    Click on a record to run prediction and generate AI recommendations.
                  </p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xl text-slate-900">{selectedCustomer.customer_id}</h4>
                      <p className="text-xs text-slate-400">Analysis for {selectedCustomer.region}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="text-slate-300 hover:text-slate-600"
                    >
                      <Search size={18} />
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Score</span>
                      <span className={cn(
                        "text-2xl font-black",
                        selectedCustomer.health_score < 40 ? "text-red-600" : selectedCustomer.health_score < 70 ? "text-amber-600" : "text-emerald-600"
                      )}>{selectedCustomer.health_score}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full",
                          selectedCustomer.health_score < 40 ? "bg-red-500" : selectedCustomer.health_score < 70 ? "bg-amber-500" : "bg-emerald-500"
                        )}
                        style={{ width: `${selectedCustomer.health_score}%` }}
                      />
                    </div>
                  </div>

                  {recLoading ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                      <Activity className="animate-spin text-indigo-600" />
                      <p className="text-xs font-mono text-slate-400 animate-pulse">RUNNING INFERENCE ENGINE...</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Churn Probability</label>
                        <div className="flex items-center justify-between">
                          <span className="text-4xl font-black text-slate-900">
                            {Math.round((prediction?.churn_probability || 0) * 100)}%
                          </span>
                          <RiskBadge level={prediction?.risk_level || 'Low'} />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-xs font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2">
                          <Activity size={14} />
                          Retention Strategies
                        </h5>
                        <div className="space-y-3">
                          {recommendations.map((rec, i) => (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i} 
                              className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-sm text-slate-800">{rec.action}</span>
                                <span className={cn(
                                  "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                                  rec.priority === 'Critical' ? "bg-red-600 text-white" : rec.priority === 'High' ? "bg-orange-500 text-white" : "bg-blue-500 text-white"
                                )}>{rec.priority}</span>
                              </div>
                              <p className="text-xs text-slate-500 leading-relaxed">{rec.reason}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
