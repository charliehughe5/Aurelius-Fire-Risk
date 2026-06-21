import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Upload, 
  Camera, 
  Check, 
  Info, 
  HelpCircle,
  Plus
} from 'lucide-react';
import { RemediationTask } from '../types';

interface ActionTrackerProps {
  tasks: RemediationTask[];
  onToggleStatus: (
    taskId: string, 
    currentStatus: string, 
    forcedStatus?: 'Open' | 'In Progress' | 'Escrow Assigned' | 'Resolved',
    comments?: string,
    photoEvidence?: string
  ) => void;
  activeUser: any;
  activeSite: any;
  triggerSuccess: (msg: string) => void;
  onAddManualAction: (newAction: RemediationTask) => void;
}

export default function ActionTracker({
  tasks,
  onToggleStatus,
  activeUser,
  activeSite,
  triggerSuccess,
  onAddManualAction
}: ActionTrackerProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Dynamic action-specific forms or comments state
  const [taskShowForm, setTaskShowForm] = useState<Record<string, boolean>>({});
  const [taskComments, setTaskComments] = useState<Record<string, string>>({});
  const [taskPhoto, setTaskPhoto] = useState<Record<string, string>>({});

  // Interactive Action creation state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');
  const [newAssignee, setNewAssignee] = useState('');
  const [newCategory, setNewCategory] = useState('Fire Doors');

  const filteredTasks = tasks.filter(task => {
    // Isolated to the active site
    if (activeSite && task.propertyId !== activeSite.id) return false;
    
    // Search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const inDetails = task.details.toLowerCase().includes(searchLower);
      const inType = task.checkType.toLowerCase().includes(searchLower);
      if (!inDetails && !inType) return false;
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'open' && task.status === 'Resolved') return false;
      if (filterStatus === 'resolved' && task.status !== 'Resolved') return false;
    }

    return true;
  });

  const handleCreateManualAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDetails) return;

    const customTask: RemediationTask = {
      id: `act-manual-${Date.now()}`,
      propertyId: activeSite?.id || 'site-1',
      checkType: newCategory,
      severity: newSeverity,
      status: 'Open',
      assignedTo: newAssignee || activeUser.name,
      loggedAt: new Date().toISOString().split('T')[0],
      details: `${newTitle}: ${newDetails}`
    };

    onAddManualAction(customTask);
    setNewTitle('');
    setNewDetails('');
    setShowAddForm(false);
    triggerSuccess('Vague-free corporate action added directly to site compliance ledger.');
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Urgent':
        return 'bg-rose-50 border-rose-250 text-rose-700 font-bold';
      case 'High':
        return 'bg-amber-50 border-amber-250 text-amber-700 font-bold';
      case 'Medium':
        return 'bg-slate-100 border-slate-200 text-slate-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Corrective Actions Ledger</h2>
          <p className="text-xs text-slate-500">Track and upload evidence to close outstanding fire safety deficiencies at {activeSite?.name}.</p>
        </div>

        {activeUser?.role === 'Admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Issue Action Ticket
          </button>
        )}
      </div>

      {/* Manual action issue block (only Admin) */}
      {showAddForm && (
        <form onSubmit={handleCreateManualAction} className="bg-slate-50 border border-slate-205 rounded-2xl p-5 space-y-4 text-xs animate-fadeIn">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-800">Assign New Regulatory Remediation Ticket</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-650">Cancel</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Action Subject</label>
              <input
                type="text"
                placeholder="e.g. Ground floor lobby dual emergency ballast failure"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Assigned Lead</label>
                <input
                  type="text"
                  placeholder="e.g. Site Warden"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-500">Regulatory Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                >
                  <option>Fire Doors</option>
                  <option>Emergency Lighting</option>
                  <option>Smoke Alarms</option>
                  <option>Escape Routes</option>
                  <option>Housekeeping</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Deficiency Details</label>
              <textarea
                placeholder="List exact measurements, tolerances, or locations to ensure zero ambiguity..."
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-800"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500">Risk Severity Rating</label>
              <div className="grid grid-cols-1 gap-1.5">
                {['Urgent', 'High', 'Medium', 'Low'].map((sevType) => (
                  <button
                    key={sevType}
                    type="button"
                    onClick={() => setNewSeverity(sevType as any)}
                    className={`py-1 rounded text-center border font-bold ${
                      newSeverity === sevType
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sevType}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg transition-all"
          >
            Authorize Compliance Ticket Release
          </button>
        </form>
      )}

      {/* Filter and search deck */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-slate-205 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search details / check types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-slate-800 text-neutral-800"
          />
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 text-slate-600 ml-auto text-xs font-bold max-w-fit">
          <button 
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            All Open Tasks
          </button>
          <button 
            type="button"
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === 'open' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Unresolved Only
          </button>
          <button 
            type="button"
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1.5 rounded-md transition-all ${filterStatus === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Fully Closed
          </button>
        </div>
      </div>

      {/* Grid of Action items */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center p-12 bg-white border border-slate-205 rounded-3xl text-slate-550 space-y-2">
            <Check className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Perfect compliance reached!</h4>
            <p className="text-[11px] text-slate-450 max-w-xs mx-auto">There are zero unresolved safety corrective duties identified for {activeSite?.name} under current filtration parameters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 transition-all hover:border-slate-300 ${
                task.status === 'Resolved' ? 'opacity-90 border-slate-200 bg-slate-50/50' : 'border-slate-205 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 border text-[9px] uppercase font-bold font-mono rounded-md ${getSeverityBadge(task.severity)}`}>
                    {task.severity} Risk
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {task.id.slice(0, 10)}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                  <span>Due Window: {task.status === 'Resolved' ? 'Closed' : task.severity === 'Urgent' ? '7 Days' : '28 Days'}</span>
                  <span className="text-slate-300">•</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    task.status === 'Resolved' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Action content description */}
              <div className="space-y-2.5">
                <h3 className="text-sm font-extrabold text-slate-850 flex items-center gap-2">
                  {task.checkType} Core Remediation Unit
                </h3>
                <p className="text-xs text-slate-655 font-medium leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <strong>Deficiency Location & Finding:</strong> {task.details}
                </p>
              </div>

              {/* Critically Important Plain English Explanation box */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                <div className="md:col-span-4 flex items-start gap-1.5">
                  <Info className="w-4 h-4 text-orange-505 shrink-0 mt-0.5" />
                  <span className="text-[10px] font-bold uppercase text-orange-650 tracking-wider">Plain English Explanation:</span>
                </div>
                <div className="md:col-span-8">
                  <p className="text-xs text-slate-505 leading-relaxed italic">
                    {task.checkType.includes('Door') 
                      ? 'Fire doors secure escape corridors and prevent superheated toxic fumes from blocking routes during active evacuations. Restoring seal integrity and latch speeds ensures people have up to 60 minutes of breathing insulation during safe building egress.'
                      : task.checkType.includes('Light')
                      ? 'Emergency lighting outlines escape paths during complete power failure. Replacing batteries within 14 working days avoids total occupant blackout and crushing bottlenecks during stampedes.'
                      : task.checkType.includes('Alarm')
                      ? 'Audible warning systems provide instant sensory cues to escape. Corroborating speaker horns ensures workers are warned on day zero.'
                      : 'Uncontrolled rubbish acts as immediate fuel during initial sparks. Moving transport boxes out of furnace cell coordinates blocks catastrophic fire load growth.'}
                  </p>
                </div>
              </div>

              {/* Display custom comments and photos on resolved tasks */}
              {task.status === 'Resolved' && (task.comments || task.photoEvidence) && (
                <div className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl space-y-1 text-xs">
                  <p className="font-extrabold text-emerald-950 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <span>📝 Completed Task Audit Trial</span>
                  </p>
                  {task.comments && (
                    <p className="text-slate-700 italic">
                      <strong>Inspector Comment:</strong> "{task.comments}"
                    </p>
                  )}
                  {task.photoEvidence && (
                    <p className="text-[11px] font-semibold text-emerald-800 font-mono mt-1 flex items-center gap-1 border-t border-emerald-200/50 pt-1">
                      <span>📸 Attached Evidence:</span> <strong>{task.photoEvidence}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Actions footer block */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] text-slate-450 font-mono">
                <div>
                  <span>Report Source: Annual BAFE Survey Review Template</span>
                </div>
                <div className="flex items-center gap-2">
                  {task.status !== 'Resolved' ? (
                    <button
                      type="button"
                      onClick={() => setTaskShowForm(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold font-sans rounded-lg transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-950" />
                      Sign Off Job / Complete Task
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-emerald-600 font-sans font-bold text-xs">
                        <Check className="w-4 h-4" />
                        Signed off securely
                      </span>
                      
                      {/* MOVE TO UNRESOLVED / REOPEN BUTTON (Requested) */}
                      <button
                        type="button"
                        onClick={() => {
                          onToggleStatus(task.id, task.status, 'Open', '', '');
                          triggerSuccess(`Ticket reopened. Moved back to Open ticket registry.`);
                        }}
                        className="px-2.5 py-1 bg-rose-55 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-800 text-[10px] font-extrabold uppercase rounded transition-all cursor-pointer font-sans"
                        title="Reopen card and move back to open ticket ledger"
                      >
                        ⚠️ Move to Unresolved
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Sign-off form (Requested comments, optional photo upload, & status update) */}
              {task.status !== 'Resolved' && taskShowForm[task.id] && (
                <div className="p-4 bg-amber-500/5 border border-amber-250 rounded-xl space-y-3.5 animate-fadeIn text-slate-800 text-xs">
                  <div className="flex justify-between items-center pb-1 border-b border-amber-200/60">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                       ✨ Aurelius Remediation Sign-Off Process
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setTaskShowForm(prev => ({ ...prev, [task.id]: false }))} 
                      className="text-slate-450 hover:text-slate-750 text-[10px] font-mono font-bold"
                    >
                      [Cancel]
                    </button>
                  </div>

                  {/* Comments component (Required) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">
                      Required comments / Remediation details
                    </label>
                    <textarea
                      placeholder="Specify how the issue was verified and resolved (e.g. replaced smoke battery cell, lubricated fire door hinge clearance)..."
                      value={taskComments[task.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTaskComments(prev => ({ ...prev, [task.id]: val }));
                      }}
                      rows={2.5}
                      className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-600 text-slate-900 placeholder:text-slate-400 font-medium font-sans"
                    />
                  </div>

                  {/* Photo Evidence component (Supported, explicitly marked NOT MANDATORY) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">
                      Photo Evidence <span className="text-slate-500 font-normal lowercase">(Optional / Not Mandatory)</span>
                    </label>

                    {taskPhoto[task.id] ? (
                      <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg p-2 animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span className="text-[11px] font-mono font-bold text-emerald-800">{taskPhoto[task.id]}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setTaskPhoto(prev => ({ ...prev, [task.id]: '' }))}
                          className="text-xs text-rose-600 font-extrabold hover:underline"
                        >
                          Clear Photo
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-slate-505">Provide photographic evidence if completed, otherwise skip:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {[
                            { label: 'IMG_4119.jpg', detail: 'Hinge Gap Restored' },
                            { label: 'IMG_4220.jpg', detail: 'Passage Cleared' },
                            { label: 'IMG_4325.jpg', detail: 'New Luminaire Bulb' }
                          ].map((photo, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => {
                                setTaskPhoto(prev => ({ ...prev, [task.id]: `${photo.label} - ${photo.detail}` }));
                                triggerSuccess(`Mock physical photo preview attached: "${photo.detail}"`);
                              }}
                              className="py-1 px-2.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-700 text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 font-semibold text-center hover:border-slate-350 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              {photo.detail}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-2.5 pt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const commentTxt = taskComments[task.id] || 'Remediation completed and verified physically by fire wardens.';
                        const photoTxt = taskPhoto[task.id];
                        onToggleStatus(task.id, task.status, 'Resolved', commentTxt, photoTxt);
                        setTaskShowForm(prev => ({ ...prev, [task.id]: false }));
                      }}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-805 text-white font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      Sign Off & Move to Completed
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
