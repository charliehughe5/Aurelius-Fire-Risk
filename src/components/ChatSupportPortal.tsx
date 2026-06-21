import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  MessageSquare, 
  Search, 
  Sparkles, 
  User as UserIcon, 
  CheckCheck, 
  ShieldCheck, 
  Zap, 
  Lock, 
  ChevronRight, 
  Phone, 
  Mail, 
  Award,
  Circle,
  HelpCircle,
  Calendar
} from 'lucide-react';

interface ClientSaaS {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: 'Active' | 'Suspended';
  subType: 'Enterprise Elite' | 'Standard Professional' | 'Basic Care';
  paymentStatus: 'Paid' | 'Outstanding' | 'Suspended';
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatSupportPortalProps {
  activeUser: { id: string; name: string; email: string; role: 'Admin' | 'Property Manager' | 'Site Inspector' | 'Trainee' };
  activeClient: ClientSaaS | null;
  triggerSuccess: (msg: string) => void;
  hasChatSupport: boolean;
  onToggleChatSupport: (enabled: boolean) => void;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    senderId: 'client-1',
    senderName: 'John Carter',
    recipientId: 'usr-charlie',
    body: 'Hi Charlie, we have a scheduled fire drill next Thursday at 10 AM. Do we need to log this in the digital logbook beforehand, or only after completion?',
    timestamp: '2026-06-19 14:15',
    isRead: true
  },
  {
    id: 'msg-2',
    senderId: 'usr-charlie',
    senderName: 'Charlie Hughes (Assessor)',
    recipientId: 'client-1',
    body: 'Hi John! Only log it inside the logbook AFTER completion once you have tracked the actual evacuation escape time and verified any door leaf holds. However, make sure you notify your alarm monitoring center beforehand to avoid false brigade callouts!',
    timestamp: '2026-06-19 14:32',
    isRead: true
  },
  {
    id: 'msg-3',
    senderId: 'client-2',
    senderName: 'Sarah Jenkins',
    recipientId: 'usr-charlie',
    body: 'Hello Charlie, we have an emergency bulkhead lighting bulb flickering in Apartment block A. Is this something that can wait for the quarterly inspect, or must we dispatch a technician instantly?',
    timestamp: '2026-06-20 09:12',
    isRead: true
  },
  {
    id: 'msg-4',
    senderId: 'usr-charlie',
    senderName: 'Charlie Hughes (Assessor)',
    recipientId: 'client-2',
    body: 'Hi Sarah! Under BS-5266 standards, secondary bulkhead lights should be repaired or replaced within 15 days of discovery. I strongly recommend having your resident caretaker resolve it now because any dark corridor with failed emergency coverage violates the FSO 2005 Article 14 rules.',
    timestamp: '2026-06-20 09:47',
    isRead: true
  },
  {
    id: 'msg-5',
    senderId: 'client-3',
    senderName: 'David Croft',
    recipientId: 'usr-charlie',
    body: 'Charlie, a tenant complained that the loading dock secondary alarm horn did not fire on Tuesday. We logged it on the checklist, but can you review the DDL log and check if the wiring loop was noted as high-risk during your last visual physical audit?',
    timestamp: '2026-06-20 16:30',
    isRead: false
  }
];

export default function ChatSupportPortal({
  activeUser,
  activeClient,
  triggerSuccess,
  hasChatSupport,
  onToggleChatSupport
}: ChatSupportPortalProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('aurelius_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('client-2'); // Sarah by default
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync messages with localStorage
  useEffect(() => {
    localStorage.setItem('aurelius_chat_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedClientId]);

  // Is user Client or Admin
  const isAdmin = activeUser.role === 'Admin' || activeUser.email === 'charlie@aurelius.com';

  // Determine current active chat client ID
  // For a normal client, they can only talk to Charlie (so they are the sender, recipient is Charlie)
  const currentClientId = isAdmin ? selectedClientId : (activeClient?.id || 'client-2');

  // Filter messages for current conversation
  const conversationMessages = messages.filter(m => {
    if (isAdmin) {
      // Admin sees messages between Charlie and the selected client
      return (m.senderId === currentClientId && m.recipientId === 'usr-charlie') ||
             (m.senderId === 'usr-charlie' && m.recipientId === currentClientId);
    } else {
      // Client sees messages between themselves and Charlie
      return (m.senderId === currentClientId && m.recipientId === 'usr-charlie') ||
             (m.senderId === 'usr-charlie' && m.recipientId === currentClientId);
    }
  });

  // Unique clients based on predefined users to show in list for Admin
  const clientProfiles = [
    { id: 'client-1', name: 'John Carter', orgName: 'Halifax Corporate Offices', email: 'j.carter@halifaxcorp.co.uk', hasActiveBolt: true },
    { id: 'client-2', name: 'Sarah Jenkins', orgName: 'Apex Managed Residential Block', email: 's.jenkins@apexliving.com', hasActiveBolt: hasChatSupport },
    { id: 'client-3', name: 'David Croft', orgName: 'Vanguard Industrial Hubs', email: 'd.croft@vanguardind.com', hasActiveBolt: false }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Guard for clients who do not have the bolt-on purchased
    if (!isAdmin && !hasChatSupport) {
      triggerSuccess('⚠️ Please unlock the £20.00/mo Chat Support bolt-on before initiating direct safety streams.');
      return;
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: isAdmin ? 'usr-charlie' : currentClientId,
      senderName: isAdmin ? 'Charlie Hughes (Assessor)' : (activeUser.name || 'Client Contact'),
      recipientId: isAdmin ? currentClientId : 'usr-charlie',
      body: inputMessage,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: isAdmin
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Trigger Charlie automatic answer if the client sent the message
    if (!isAdmin) {
      setIsTyping(true);
      const userText = inputMessage.toLowerCase();

      setTimeout(() => {
        setIsTyping(false);
        let replyText = `Hi there! Thanks for your query. I have received this safety stream ticket. Please confirm the site address and postcode so I can review our visual Level 1 inspection report under the FSO 2005.`;

        if (userText.includes('alarm') || userText.includes('siren')) {
          replyText = `Under BS-5839 standards, manual fire alarm triggers and sirens should be tested weekly. If you have detected loop drops or faulty horn relays, log this instantly in the Action Tracker and schedule a physical technician repair. Let me know if you need our approved electrical partner contacts!`;
        } else if (userText.includes('door') || userText.includes('frame')) {
          replyText = `Fire doors require a clear gap of 2mm to 4mm around top and side margins to function and activate the intumescent strip during a fire. If the door binding is preventing complete automatic closure, dispatch a Warden helper immediately to clear obstruction.`;
        } else if (userText.includes('light') || userText.includes('emergency')) {
          replyText = `Hi! Emergency illumination backup batteries (BS-5266) must operate continuously for at least 3 hours during primary power cuts. Flicker indicates charging module decline. Record this check in your portal and arrange replacement within 15 days.`;
        } else if (userText.includes('drill') || userText.includes('evac')) {
          replyText = `Great question. Drills should occur at least annually for typical commercial settings and twice annually to comply with BS-9999 for high-occupancy leisure spots. Ensure your local wardens are assigned to the Training Academy to keep accountability.`;
        } else if (userText.includes('certification') || userText.includes('nebosh')) {
          replyText = `Our digital NEBOSH certificate engine automatically compiles your periodic checklists into printable PDF portfolios. Use the 'One-Page Director Panel' to export the legal holding paperwork to secure your property marks.`;
        }

        const replyMessage: Message = {
          id: `reply-${Date.now()}`,
          senderId: 'usr-charlie',
          senderName: 'Charlie Hughes (Assessor)',
          recipientId: currentClientId,
          body: replyText,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          isRead: false
        };

        setMessages(prev => [...prev, replyMessage]);
        triggerSuccess('📩 New message response from Lead Assessor Charlie Hughes received!');
      }, 2500);
    }
  };

  const handlePurchaseBoltOn = () => {
    onToggleChatSupport(true);
    triggerSuccess('✨ Premium Specialist Chat Support Bolt-on activated successfully! £20.00 / month registered on your Direct Debit billing schedule. You now have direct access to Charlie Hughes.');

    // Add purchase event to simulated billing logs on local storage if desired,
    // or notify user. Let's send a notification email too!
    const testId = `BACS-BOLT-${Math.floor(100000 + Math.random() * 900000)}`;
    
    // Dispatch a virtual message confirmation inside the chat
    const systemWelcome: Message = {
      id: `sys-welcome-${Date.now()}`,
      senderId: 'usr-charlie',
      senderName: 'Charlie Hughes (Assessor)',
      recipientId: currentClientId,
      body: `🌟 Welcome Sarah! Your **£20.00/mo Chat Support Premium Bolt-on** has been activated and verified. You now enjoy a secure, private visual consultation pathway with me. Ask me anything about BS-5839 (Alarms), BS-5266 (Lighting), or FSO 2005 (Audit compliance).`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false
    };

    setMessages(prev => [...prev, systemWelcome]);
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 h-[680px] text-left select-text mb-6">
      
      {/* LEFT COLUMN: CHAT SELECTION / INFO FOR CLIENT */}
      <div className="lg:col-span-4 border-r border-neutral-200 bg-[#FAF9F6] flex flex-col h-full overflow-hidden">
        
        {/* Header Section */}
        <div className="p-4 bg-white border-b border-stone-150 space-y-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-900 rounded-lg text-white">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm tracking-tight font-sans">Aurelius Direct Message Portal</h3>
              <p className="text-[10px] text-slate-500 font-mono">NEBOSH COMPLIANCE STREAMS</p>
            </div>
          </div>

          {isAdmin && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-neutral-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Conversation List / Details */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {isAdmin ? (
            // ADMIN CLIENTS LIST
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-stone-500 font-mono block pl-1">Client Inboxes</span>
              {clientProfiles
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.orgName.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(c => {
                  const lastMsg = messages.filter(m => (m.senderId === c.id || m.recipientId === c.id)).slice(-1)[0];
                  const unreadCount = messages.filter(m => m.senderId === c.id && m.recipientId === 'usr-charlie' && !m.isRead).length;
                  const isSelected = selectedClientId === c.id;

                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected 
                          ? 'bg-white border-neutral-350 shadow-xs ring-1 ring-neutral-400' 
                          : 'bg-white/60 hover:bg-white border-stone-200'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700 uppercase border border-stone-300">
                          {c.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-bounce">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex justify-between items-baseline">
                          <strong className="text-neutral-900 text-xs font-sans truncate block">{c.name}</strong>
                          <span className="text-[9px] text-stone-400 font-mono shrink-0">
                            {lastMsg ? lastMsg.timestamp.split(' ')[1] : ''}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-mono truncate">{c.orgName}</p>

                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className="text-[10.5px] text-stone-600 truncate italic pr-2">
                            {lastMsg ? lastMsg.body : 'No previous communications...'}
                          </p>
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] uppercase tracking-wider shrink-0 font-bold ${
                            c.hasActiveBolt ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-stone-450'
                          }`}>
                            {c.hasActiveBolt ? 'Active Bolt-on' : 'No Bolt-on'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          ) : (
            // CLIENT PREVIEW OF SPECIALIST ASSESSOR
            <div className="space-y-4 pt-1">
              {/* Consultant Card */}
              <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-xs relative shrink-0">
                    <img 
                      src="/src/assets/images/charlie_hughes_1781988701562.jpg" 
                      alt="Charlie Hughes NEBOSH"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-xs tracking-tight">Charlie Hughes</h4>
                    <p className="text-[9.5px] uppercase font-mono text-amber-800 font-bold flex items-center gap-0.5">
                      <Award className="w-3 h-3" /> NEBOSH Lead Consultant
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed font-serif pt-1 border-t border-stone-100 italic">
                  "I serve as your dedicated private safety assessor. Ask me questions about localized fire safety policies, evacuation triggers or certification pathways."
                </p>

                <div className="space-y-1.5 pt-2 text-[10px] font-mono text-slate-500">
                  <p className="flex items-center gap-2 pt-1 border-t border-stone-100">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> aureliusfirerisk@consultant.com
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> +44 (0) 151 700 9005
                  </p>
                  <p className="flex items-center gap-2 text-stone-700 font-bold">
                    <Circle className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500 animate-pulse" /> Active Support SLA Online
                  </p>
                </div>
              </div>

              {/* Chat Bolt On Pricing card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-start border-b border-amber-100 pb-1.5">
                  <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-900 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" /> Support Premium Bolt-on
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider ${
                    hasChatSupport ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                  }`}>
                    {hasChatSupport ? 'Subscribed' : 'Action Needed'}
                  </span>
                </div>

                <p className="text-[10.5px] leading-relaxed text-stone-700">
                  Enable the direct specialist response pathway for <strong>£20.00 a month</strong>. Post unbounded physical compliance issues, BS-5839 triggers, or photo proofs directly to Charlie for immediate advisory sign-offs.
                </p>

                {!hasChatSupport ? (
                  <button
                    type="button"
                    onClick={handlePurchaseBoltOn}
                    className="w-full py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-mono font-extrabold uppercase text-[9px] rounded-lg shadow-sm tracking-wider transition-all cursor-pointer text-center"
                  >
                    🚀 Unlock Safety Chat Support (£20.00/mo)
                  </button>
                ) : (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[9.5px] text-emerald-850 font-mono flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Live Plan active on corporate invoice.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* System footer tag */}
        <div className="p-3 bg-stone-100 border-t border-neutral-200 text-center shrink-0">
          <p className="text-[9px] font-mono text-slate-400">AURELIUS CONVERSATIONAL AUDIT TRACE LOG v2.1</p>
        </div>

      </div>

      {/* RIGHT COLUMN: CHAT INTERFACE WINDOW */}
      <div className="lg:col-span-8 flex flex-col bg-white h-full overflow-hidden relative">
        
        {/* Chat Window Header */}
        <div className="p-4 border-b border-neutral-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            {isAdmin ? (
              // Selected Client Info Header
              (() => {
                const client = clientProfiles.find(c => c.id === currentClientId);
                return (
                  <div>
                    <h4 className="font-extrabold text-neutral-900 text-sm tracking-tight font-sans">
                      Chat with {client?.name || 'Client Representative'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {client?.orgName} • {client?.email}
                    </p>
                  </div>
                );
              })()
            ) : (
              // Charlie Hughes Assessor Header with his face icon
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-400 relative shrink-0">
                  <img 
                    src="/src/assets/images/charlie_hughes_1781988701562.jpg" 
                    alt="Charlie Hughes NEBOSH"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-neutral-900 text-sm tracking-tight font-sans flex items-center gap-1.5">
                    Lead Assessor Charlie Hughes
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    Senior Fire Safety Engineer (NEBOSH Cert)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-neutral-100 text-neutral-750 font-mono text-[9px] font-bold rounded-full uppercase tracking-wider">
              Secure Stream
            </span>
          </div>
        </div>

        {/* Message scrolling segment */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#FDFDFB] space-y-4 relative">
          
          {/* Welcome guidance block */}
          <div className="p-4 bg-amber-50/55 rounded-2xl border border-amber-200/50 max-w-2xl mx-auto space-y-2 text-center text-xs text-amber-900 leading-normal">
            <p className="font-extrabold flex items-center justify-center gap-1 uppercase tracking-wider font-sans text-[10.5px]">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              NEBOSH-Guided Specialist Communication Portal
            </p>
            <p className="text-slate-600 font-sans">
              All discussions are logged under our <strong className="text-stone-900">Zero-Liability Agreement</strong> to satisfy independent insurance auditors. Direct message threads are audited by Lead Assessor Charlie Hughes.
            </p>
          </div>

          {conversationMessages.map((msg, i) => {
            const isMe = isAdmin ? msg.senderId === 'usr-charlie' : msg.senderId === currentClientId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xl rounded-2xl p-4 space-y-1 shadow-xs border ${
                  isMe 
                    ? 'bg-neutral-900 text-white rounded-tr-none border-neutral-900 text-xs' 
                    : 'bg-white text-neutral-850 rounded-tl-none border-neutral-200 text-xs'
                }`}>
                  <div className="flex justify-between items-center gap-4">
                    <span className={`text-[9px] font-mono tracking-wide uppercase font-bold ${isMe ? 'text-amber-400' : 'text-neutral-400'}`}>
                      {msg.senderName}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-400">
                      {msg.timestamp}
                    </span>
                  </div>
                  
                  <p className="leading-relaxed whitespace-pre-line font-sans font-medium text-[11.5px]">
                    {msg.body}
                  </p>

                  <div className="text-right">
                    {isMe && (
                      <span className="inline-flex items-center gap-0.5 text-[8.5px] font-mono text-amber-500 font-bold uppercase">
                        <CheckCheck className="w-3 h-3" /> Reconciled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-xs rounded-2xl rounded-tl-none p-4 bg-white border border-stone-200 shadow-xs flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Charlie Hughes is compiling advice...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Non-subscribed input locking guard */}
        {!isAdmin && !hasChatSupport && (
          <div className="absolute inset-x-0 bottom-0 top-[80px] bg-white/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="p-3 bg-amber-50 text-amber-850 rounded-full border border-amber-300 shadow-sm animate-bounce">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-sm font-extrabold text-neutral-900 font-sans tracking-tight">Active Support Subscription Required</h4>
              <p className="text-[11px] text-stone-550 leading-relaxed font-sans">
                You are currently logged in as client <strong>{activeUser.name}</strong> of organization <strong className="text-black">{activeClient?.name}</strong>.
              </p>
              <p className="text-[11px] text-stone-500 leading-normal font-sans">
                Under UK Fire Safety auditing rules, direct digital consultation streams require the <strong>£20.00 a month</strong> support premium bolt-on to sustain certified auditor availability.
              </p>
            </div>

            <button
              onClick={handlePurchaseBoltOn}
              className="py-2.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white font-mono font-bold uppercase text-xs rounded-xl shadow-md tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              Unlock Premium Support Bolt-on (£20.00/mo)
            </button>
          </div>
        )}

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-neutral-200 flex gap-2 items-center shrink-0">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              isAdmin 
                ? "Type response as Chief Assessor Charlie Hughes..." 
                : "Type your query about alarm systems, compliance margins etc..."
            }
            className="flex-1 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-neutral-200 rounded-xl p-3 text-xs focus:outline-none transition-all placeholder:text-slate-400 text-neutral-900"
          />
          <button
            type="submit"
            className="p-3 bg-neutral-900 hover:bg-neutral-850 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
}
