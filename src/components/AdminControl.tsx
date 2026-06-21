import React, { useState } from 'react';
import { 
  Users, 
  Trash2, 
  Lock, 
  Unlock, 
  Plus, 
  Building2, 
  ShieldCheck, 
  Database,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface ClientSaaS {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  suspensionReason?: string;
  subType: 'Enterprise Elite' | 'Standard Professional' | 'Basic Care';
  paymentStatus: 'Paid' | 'Outstanding' | 'Suspended';
}

interface AdminControlProps {
  clients: ClientSaaS[];
  onToggleSuspension: (clientId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onAddClient: (newClient: any) => void;
  triggerSuccess: (msg: string) => void;
}

export default function AdminControl({
  clients,
  onToggleSuspension,
  onDeleteClient,
  onAddClient,
  triggerSuccess
}: AdminControlProps) {
  const [showAddClient, setShowAddClient] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState<'Enterprise Elite' | 'Standard Professional' | 'Basic Care'>('Standard Professional');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newCl = {
      name,
      contact: contact || 'Responsible Site Manager',
      email: email || 'contact@client.co.uk',
      phone: phone || '020 7946 9999',
      subType: plan,
      agreedToTerms
    };

    onAddClient(newCl);
    setName('');
    setContact('');
    setEmail('');
    setPhone('');
    setAgreedToTerms(false);
    setShowAddClient(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Super Admin System Controller</h2>
          <p className="text-xs text-slate-500">Global SaaS provisioning. Manage multi-tenant isolation, billing states, and NEBOSH inspection reports.</p>
        </div>

        <button
          onClick={() => setShowAddClient(!showAddClient)}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Auto-Provision Client Workspace
        </button>
      </div>

      {showAddClient && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-205 rounded-2xl p-5 space-y-4 text-xs animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-800">Auto-Provision Organization Workspace</h3>
            <button type="button" onClick={() => setShowAddClient(false)} className="text-slate-400 hover:text-slate-650">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Client Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Halifax Corporate Offices"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Lead Responsible Contact</label>
                <input
                  type="text"
                  placeholder="e.g. John Carter"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">SaaS Plan Level</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as any)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800 text-slate-700"
                >
                  <option value="Enterprise Elite">Enterprise Elite (UK Corporate)</option>
                  <option value="Standard Professional">Standard Professional (Medium Biz)</option>
                  <option value="Basic Care">Basic Care (Local Landlord / Block)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Primary Compliance Email</label>
              <input
                type="email"
                placeholder="e.g. compliance@client.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Office Emergency Helpline</label>
              <input
                type="text"
                placeholder="e.g. 020 7946 0912"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5">
            <input 
              type="checkbox"
              id="admin-terms-preagree"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 accent-slate-900 border-stone-350 rounded cursor-pointer"
            />
            <label htmlFor="admin-terms-preagree" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Pre-activate client (By-pass agreement; client has signed a hardcopy of our zero-liability indemnity)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg transition-all"
          >
            Launch Auto-Provisioning Engine
          </button>
        </form>
      )}

      {/* Global Client organization roster */}
      <div className="bg-white border border-slate-205 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-205 flex items-center justify-between">
          <span className="text-xs uppercase font-mono text-slate-550 font-bold">Isolated Tenant Organization Matrices</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-900/5 text-slate-800 border border-slate-900/10 rounded font-mono text-[9px] uppercase font-bold tracking-wider">
            Admin Mode Secure
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {clients.map((c) => (
            <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-850 text-sm">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                    c.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-220 animate-pulse'
                  }`}>
                    {c.status === 'Active' ? 'ACTIVE ACCESS' : 'PENDING SUSPENSION'}
                  </span>
                  <span className="text-[10px] uppercase font-mono bg-slate-100 text-slate-550 px-2 py-0.5 rounded">
                    {c.subType}
                  </span>
                </div>
                <p className="text-slate-550">
                  Tenant ID: <strong className="font-mono text-slate-900 text-[11px]">{c.id}</strong> • Primary Contact Name: <strong className="text-slate-700">{c.contact}</strong>
                </p>
                <div className="flex gap-4 text-slate-450 text-[10px] font-mono">
                  <span>Helpline: {c.phone}</span>
                  <span>Email: {c.email}</span>
                </div>

                {c.status === 'Suspended' && (
                  <div className="flex items-start gap-1 p-2 bg-rose-50 border border-rose-200 text-rose-850 rounded max-w-md text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5 font-bold" />
                    <p>
                      <strong>Suspension Block trigger active:</strong> {c.suspensionReason || 'Non-payment of annual BS5839 certification fees'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleSuspension(c.id)}
                  className={`px-3 py-1.5 rounded-lg border font-bold text-[11px] transition-all flex items-center gap-1 ${
                    c.status === 'Active'
                      ? 'bg-white border-rose-200 hover:bg-rose-50 text-rose-705'
                      : 'bg-slate-900 border-slate-900 text-white'
                  }`}
                  title={c.status === 'Active' ? 'Suspend client portal' : 'Reactivate client portal'}
                >
                  {c.status === 'Active' ? 'Suspend Portal' : 'Unlock Portal'}
                </button>
                
                <button
                  onClick={() => onDeleteClient(c.id)}
                  className="p-2 bg-slate-50 border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Purge organizational trace"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
