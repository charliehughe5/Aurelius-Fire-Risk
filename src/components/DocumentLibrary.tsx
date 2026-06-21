import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  ExternalLink, 
  Lock, 
  Info,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Edit3,
  X,
  Plus
} from 'lucide-react';
import { DocumentRecord } from '../types';

interface DocumentLibraryProps {
  documents: DocumentRecord[];
  activeSite: any;
  activeUser: any;
  triggerSuccess: (msg: string) => void;
}

export default function DocumentLibrary({
  documents,
  activeSite,
  activeUser,
  triggerSuccess
}: DocumentLibraryProps) {
  const [localDocs, setLocalDocs] = useState<DocumentRecord[]>([]);
  const [searchDoc, setSearchDoc] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  // Upload Document State
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'Risk Assessment' | 'Maintenance Cert' | 'Training Log' | 'Regulatory Approval'>('Risk Assessment');
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
  const [newSize, setNewSize] = useState('2.4 MB');

  // Edit Action State
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'Risk Assessment' | 'Maintenance Cert' | 'Training Log' | 'Regulatory Approval'>('Risk Assessment');
  const [editExpiry, setEditExpiry] = useState('');
  const [editStatus, setEditStatus] = useState<'Valid' | 'Expiring Soon' | 'Expired'>('Valid');

  // Sync with prop documents initially and keeps responsive
  useEffect(() => {
    setLocalDocs(documents);
  }, [documents]);

  const filteredDocs = localDocs.filter(doc => {
    if (searchDoc) {
      if (!doc.title.toLowerCase().includes(searchDoc.toLowerCase())) return false;
    }
    
    if (selectedTag !== 'all') {
      if (selectedTag === 'fra' && doc.type !== 'Risk Assessment') return false;
      if (selectedTag === 'cert' && doc.type !== 'Maintenance Cert') return false;
      if (selectedTag === 'training' && doc.type !== 'Training Log') return false;
    }

    return true;
  });

  const handleSimulateDownload = (title: string, id: string) => {
    triggerSuccess(`Secure BAFE record transmission initiated. Downloaded: "${title}"`);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setNewTitle(file.name);
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
      setNewSize(`${sizeInMB} MB`);
      triggerSuccess(`File detected: ${file.name} ready for secure staging.`);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const uploadedRecord: DocumentRecord = {
      id: `doc-${Date.now()}`,
      title: newTitle.endsWith('.pdf') ? newTitle : `${newTitle}.pdf`,
      type: newType,
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: newExpiry,
      status: new Date(newExpiry) < new Date() ? 'Expired' : 'Valid',
      fileSize: newSize
    };

    setLocalDocs(prev => [uploadedRecord, ...prev]);
    setShowUploadForm(false);
    setNewTitle('');
    triggerSuccess(`Regulatory record safely staged: "${uploadedRecord.title}" is valid.`);
  };

  const handleStartEdit = (doc: DocumentRecord) => {
    setEditingDocId(doc.id);
    setEditTitle(doc.title);
    setEditType(doc.type);
    setEditExpiry(doc.expiryDate);
    setEditStatus(doc.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle) return;

    setLocalDocs(prev => prev.map(d => {
      if (d.id === editingDocId) {
        return {
          ...d,
          title: editTitle.endsWith('.pdf') ? editTitle : `${editTitle}.pdf`,
          type: editType,
          expiryDate: editExpiry,
          status: editStatus
        };
      }
      return d;
    }));

    setEditingDocId(null);
    triggerSuccess(`Successfully saved changes to asset compliance doc: "${editTitle}"`);
  };

  const handleDeleteDoc = (id: string, title: string) => {
    if (window.confirm(`Are you absolutely sure you want to permanently delete "${title}"? This cannot be undone.`)) {
      setLocalDocs(prev => prev.filter(d => d.id !== id));
      triggerSuccess(`Document record successfully purged from digital cabinet.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 id="library-heading" className="text-xl font-bold text-slate-800 tracking-tight">Regulatory Document Vault</h2>
          <p className="text-xs text-slate-500">Secure AES-250 cloud cabinet holding BAFE contractor certs, staff warden logs, and FRA checklists.</p>
        </div>

        <button 
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="px-4 py-2 bg-slate-900 border border-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm hover:bg-slate-800 transition-all flex items-center gap-1.5 self-start sm:self-center"
        >
          {showUploadForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
          {showUploadForm ? 'Collapse Upload' : 'Upload Safety PDF'}
        </button>
      </div>

      {/* Collapsible Upload Form Staging Area */}
      {showUploadForm && (
        <form onSubmit={handleUploadSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-scaleUp text-left">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-3 border-b border-rose-200/20">
            Securely Stage Safety / FRA Document Record
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Drag & Drop Canvas Staging */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                dragActive ? 'border-amber-600 bg-amber-500/10' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
            >
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-[11px] font-bold text-slate-700">Drag & drop compliance PDF here</p>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">Or simulate manual local files (pdf/zip)</p>
              <input
                type="file"
                className="hidden"
                id="manual-file-pick"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const f = e.target.files[0];
                    setNewTitle(f.name);
                    setNewSize(`${(f.size / (1024 * 1024)).toFixed(1)} MB`);
                  }
                }}
              />
              <label 
                htmlFor="manual-file-pick"
                className="mt-3 px-3 py-1 bg-white border border-slate-250 hover:bg-slate-50 rounded text-[10px] font-bold text-slate-700 font-mono"
              >
                Select File
              </label>
            </div>

            {/* Document Attributes */}
            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Document Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800"
                  placeholder="e.g. London Office FRA Inspection Report 2026"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-505 uppercase">Record Category</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800 font-bold"
                  >
                    <option value="Risk Assessment">Risk Assessment (FRA)</option>
                    <option value="Maintenance Cert">Maintenance Certification</option>
                    <option value="Training Log">Training Log history</option>
                    <option value="Regulatory Approval">Regulatory Approval</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Binds Expiry</label>
                  <input
                    type="date"
                    value={newExpiry}
                    onChange={(e) => setNewExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg transition-all"
                >
                  Approve and Stash into Library Cabinet
                </button>
              </div>
            </div>

          </div>
        </form>
      )}

      {/* Edit Form Inline Modal overlay overlay */}
      {editingDocId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleSaveEdit} className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full space-y-4 text-xs text-left shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Edit Asset Compliance Certificate</h3>
              <button 
                onClick={() => setEditingDocId(null)}
                className="text-slate-400 hover:text-slate-700"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Document Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Record Category</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-slate-805"
                >
                  <option value="Risk Assessment">Risk Assessment (FRA)</option>
                  <option value="Maintenance Cert">Maintenance Certification</option>
                  <option value="Training Log">Training Log history</option>
                  <option value="Regulatory Approval">Regulatory Approval</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Renewal Expiry</label>
                  <input
                    type="date"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Staging Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 font-bold focus:outline-none"
                  >
                    <option value="Valid">Valid (Compliant)</option>
                    <option value="Expiring Soon">Expiring Soon (30d)</option>
                    <option value="Expired">Expired (Non-Compliant)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingDocId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-205 text-slate-700 font-bold uppercase rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider rounded-lg"
              >
                Save Staging
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 border border-slate-205 rounded-2xl shadow-xs">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            className="w-full bg-slate-50 border border-slate-250 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-slate-800 font-serif"
          />
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1 text-slate-605 text-xs font-bold ml-auto max-w-fit">
          <button 
            onClick={() => setSelectedTag('all')}
            className={`px-3 py-1.5 rounded-md transition-all ${selectedTag === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            All Documents
          </button>
          <button 
            onClick={() => setSelectedTag('fra')}
            className={`px-3 py-1.5 rounded-md transition-all ${selectedTag === 'fra' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Assessments
          </button>
          <button 
            onClick={() => setSelectedTag('cert')}
            className={`px-3 py-1.5 rounded-md transition-all ${selectedTag === 'cert' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Maint. Certs
          </button>
          <button 
            onClick={() => setSelectedTag('training')}
            className={`px-3 py-1.5 rounded-md transition-all ${selectedTag === 'training' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Training Logs
          </button>
        </div>
      </div>

      {/* List of active materials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-2 text-center p-12 bg-white border border-slate-205 rounded-2xl text-slate-500 text-xs">
            No compliance papers correspond to active filters. Try broad searches.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div 
              key={doc.id} 
              className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs hover:border-slate-350 transition-all flex items-start gap-4 text-left"
            >
              <div className="p-3 bg-slate-105 text-slate-800 rounded-xl shrink-0">
                <FileText className="w-5 h-5 text-slate-850" />
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight" title={doc.title}>{doc.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold shrink-0 border ${
                    doc.status === 'Valid' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-205'
                      : doc.status === 'Expiring Soon'
                      ? 'bg-amber-50 text-amber-700 border-amber-205'
                      : 'bg-rose-50 text-rose-750 border-rose-220'
                  }`}>
                    {doc.status}
                  </span>
                </div>

                <p className="text-[10px] text-slate-450 font-mono">
                  Type: <strong className="text-slate-600">{doc.type}</strong> • Size: {doc.fileSize}
                </p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-100">
                  <span className="flex items-center gap-1 text-[9px]">
                    <Calendar className="w-3.5 h-3.5" />
                    Expires: {doc.expiryDate}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEdit(doc)}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded transition-colors"
                      title="Edit Document Meta parameters"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      className="p-1.5 hover:bg-slate-100 text-rose-500 hover:text-rose-700 rounded transition-colors"
                      title="Purge safety file permanently"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSimulateDownload(doc.title, doc.id)}
                      className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded transition-colors"
                      title="Download Secure PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-850" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
