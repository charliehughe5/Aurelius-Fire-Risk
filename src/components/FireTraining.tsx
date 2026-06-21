import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Award, 
  UserPlus, 
  CheckCircle2, 
  Compass, 
  Flame, 
  Key, 
  GraduationCap, 
  Users, 
  Upload, 
  ChevronRight, 
  FileBadge, 
  Search, 
  Clock, 
  ShieldAlert, 
  RefreshCw,
  Download,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  FileText,
  AlertTriangle,
  Mail,
  Locate,
  X,
  Copy,
  Check
} from 'lucide-react';

export interface Trainee {
  id: string;
  name: string;
  email: string;
  role: 'Staff' | 'Fire Warden' | 'Keyholder';
  siteName: string;
  trainingStatus: 'Not Started' | 'In Progress' | 'Certified';
  certifiedDate?: string;
  expiryDate?: string; // 1 year from certifiedDate
  completedVideo?: boolean;
  password?: string;
  certificateRef?: string;
}

interface FireTrainingProps {
  activeUser: { id: string; name: string; email: string; role: string };
  trainees: Trainee[];
  onAddTrainee: (newTrainee: Trainee) => void;
  onPassTraining: (traineeId: string, printedName: string) => void;
  onSimulateYearPassage: () => void;
  triggerSuccess: (msg: string) => void;
  triggerEmail: (type: 'onboarding' | 'dd_mandate' | 'contract' | 'drill_warning' | 'trainee_credentials' | 'lone_working_checkin' | 'lone_working_fra', data: any) => void;
  activeSite: any;
}

const COURSE_TABS = [
  { id: 'extinguisher', label: 'Extinguisher Control', icon: Flame, duration: '1 min video', standard: 'BS 5306-3' },
  { id: 'warden', label: 'Fire Warden Duties', icon: Users, duration: '1.5 mins video', standard: 'RRO 2005 Safety' },
  { id: 'keyholder', label: 'Keyholder Liaison', icon: Key, duration: '45s video', standard: 'BS 5839-1' },
  { id: 'lone_working', label: 'Lone Working Safety', icon: Locate, duration: '1.2 mins video', standard: 'HSE Guidance' },
  { id: 'manual_handling', label: 'Manual Handling', icon: Award, duration: '1 min video', standard: 'MHOR 1992 Code' },
  { id: 'hs_induction', label: 'Workplace H&S Induction', icon: BookOpen, duration: '2 mins video', standard: 'HASWA 1974 Act' },
];

export default function FireTraining({
  activeUser,
  trainees,
  onAddTrainee,
  onPassTraining,
  onSimulateYearPassage,
  triggerSuccess,
  triggerEmail,
  activeSite
}: FireTrainingProps) {
  const [activeCourseTab, setActiveCourseTab] = useState<'extinguisher' | 'warden' | 'keyholder' | 'lone_working' | 'manual_handling' | 'hs_induction'>('extinguisher');
  const [traineeSubTab, setTraineeSubTab] = useState<'courses' | 'lone-working'>('courses');
  const [completedCoursesByEmail, setCompletedCoursesByEmail] = useState<Record<string, string[]>>({});
  const [staffSearch, setStaffSearch] = useState('');

  // Trainee Onboarding form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Staff' | 'Fire Warden' | 'Keyholder'>('Fire Warden');

  // Trainee Video Player Simulation
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0); // 0 to 90 seconds (1min 30s)
  const [isMuted, setIsMuted] = useState(false);
  const [lastDispatchedAlert, setLastDispatchedAlert] = useState<string | null>(null);
  const videoIntervalRef = useRef<any>(null);

  // Trainee Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examPassed, setExamPassed] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [declaredLegal, setDeclaredLegal] = useState(false);
  const [showInvitationEmail, setShowInvitationEmail] = useState<any | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // --- Lone Working Hub States ---
  const [loneLocation, setLoneLocation] = useState('');
  const [loneTask, setLoneTask] = useState('');
  const [loneCommsCheck, setLoneCommsCheck] = useState(false);
  const [loneEgressCheck, setLoneEgressCheck] = useState(false);
  const [lonePreconditionCheck, setLonePreconditionCheck] = useState(false);
  const [loneFrameCheck, setLoneFrameCheck] = useState(false);
  const [buddyName, setBuddyName] = useState('');
  const [buddyEmail, setBuddyEmail] = useState('');
  const [buddyInterval, setBuddyInterval] = useState('60');
  
  // Compiled Assessment Preview State
  const [compiledFRA, setCompiledFRA] = useState<any | null>(null);
  const [savedFRAList, setSavedFRAList] = useState<any[]>([]);

  // Active check-in heartbeat
  const [activeCheckIn, setActiveCheckIn] = useState<any | null>(null);
  const [checkInSecondsLeft, setCheckInSecondsLeft] = useState(0);
  const [checkInLog, setCheckInLog] = useState<any[]>([]);

  // Countdown timer for active Lone Worker check-in heartbeat
  useEffect(() => {
    let timerId: any = null;
    if (activeCheckIn && checkInSecondsLeft > 0) {
      timerId = setInterval(() => {
        setCheckInSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerId);
            triggerSuccess("🚨 Lone Working Buddy alert: Heartbeat interval completed. Confirm contact!");
            triggerEmail('drill_warning', {
              email: activeCheckIn.buddyEmail,
              siteName: activeCheckIn.siteLocation,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [activeCheckIn, checkInSecondsLeft]);

  const handleLoneCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddyEmail || !loneLocation || !loneTask) {
      triggerSuccess("Please specify buddy email, site location, and task description to activate your safety check-in.");
      return;
    }
    const durationMinutes = parseInt(buddyInterval) || 60;
    const todayStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
    
    const checkInData = {
      id: `ci-${Date.now()}`,
      timestamp: todayStr,
      senderName: activeUser.name,
      senderEmail: activeUser.email,
      siteLocation: loneLocation,
      taskDescription: loneTask,
      buddyName: buddyName || 'On-Duty Colleague',
      buddyEmail,
      buddyFeedbackInterval: `${durationMinutes} minutes`,
      commsVerified: loneCommsCheck,
      egressChecked: loneEgressCheck,
    };

    setActiveCheckIn(checkInData);
    setCheckInSecondsLeft(durationMinutes * 60);
    setCheckInLog(prev => [checkInData, ...prev]);

    triggerSuccess(`Heartbeat check-in registered! Colleague notified via simulated secure BACS email dispatch.`);
    triggerEmail('lone_working_checkin', checkInData);
  };

  const handleCheckoutCheckIn = () => {
    setActiveCheckIn(null);
    setCheckInSecondsLeft(0);
    triggerSuccess("Checked out safely! Safe termination signal transmitted to off-site colleague.");
  };

  const handleCompileFRA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loneLocation || !loneTask) {
      triggerSuccess("Fill out location and nature of activity before compiling.");
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const newFra = {
      id: `fra-${Date.now()}`,
      dateStr: todayStr,
      workerName: activeUser.name,
      siteLocation: loneLocation,
      taskDescription: loneTask,
      buddyName: buddyName || 'Off-site Buddy',
      buddyFeedbackInterval: `${buddyInterval} mins`,
      commsVerified: loneCommsCheck,
      egressChecked: loneEgressCheck,
      preconditionsChecked: lonePreconditionCheck,
      frameChecked: loneFrameCheck,
      refNum: `AR-LWFRA-${Math.floor(1000 + Math.random()*9000)}`
    };

    setCompiledFRA(newFra);
    setSavedFRAList(prev => [newFra, ...prev]);
    triggerSuccess("Digital Lone Working Assessment Compiled! Regulatory Copy generated below.");
    triggerEmail('lone_working_fra', newFra);
  };

  // Calculate countdown days left
  const calculateDaysRemaining = (expiryStr?: string) => {
    if (!expiryStr) return null;
    const ref = new Date('2026-06-20');
    const exp = new Date(expiryStr);
    const diff = exp.getTime() - ref.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const currentTraineeRecord = trainees.find(t => t.email.toLowerCase() === activeUser.email.toLowerCase());

  // Dynamic lesson durations
  const getCourseDuration = (courseId: string) => {
    switch(courseId) {
      case 'extinguisher': return 40;
      case 'warden': return 60;
      case 'keyholder': return 30;
      case 'lone_working': return 50;
      case 'manual_handling': return 40;
      case 'hs_induction': return 80;
      default: return 50;
    }
  };

  const totalVideoDuration = getCourseDuration(activeCourseTab);

  // Dynamic Multi-Course Quiz bank
  const getCourseQuestions = (courseId: string) => {
    switch(courseId) {
      case 'warden':
        return [
          {
            id: 1,
            q: "What is the primary operational objective of a designated Fire Warden during a building hazard evacuation?",
            options: [
              "Ensure the rapid, structured egress of all zone occupants through emergency exits, and sweep defined facility sectors.",
              "Physically fight massive engulfing structures with hand tools alone.",
              "Stay silent at their desk to preserve corporate productivity."
            ],
            correct: 0
          },
          {
            id: 2,
            q: "What is the statutory frequency for testing fire exit doors and checking escape path safety?",
            options: [
              "Weekly inspect routes for clear passage and check that self-closing doors latch securely.",
              "Once every three years by an outsourced specialized team only.",
              "Only if a regulator or inspector visits the premise."
            ],
            correct: 0
          },
          {
            id: 3,
            q: "Where should gym and leisure facility occupants gather immediately after evacuating the premises?",
            options: [
              "At the dedicated, pre-defined Assembly Point (exterior safe zone) to complete a roll-call check.",
              "In the swimming pool or steam room cabins.",
              "Directly in front of the incoming emergency responder vehicles."
            ],
            correct: 0
          }
        ];
      case 'keyholder':
        return [
          {
            id: 1,
            q: "What is the primary role of a Keyholder when responding to an out-of-hours fire alarm call-out?",
            options: [
              "Safe perimeter attendance, liaise with responding Fire & Rescue crews, and provide keys/alarm access.",
              "Invasive entry inside complex spaces with zero emergency tools.",
              "Mute the sirens and leave the site without checking the active causes."
            ],
            correct: 0
          },
          {
            id: 2,
            q: "When reviewing fire alarm control panels on-site (BS 5839), what does a 'fault' amber light typically indicate?",
            options: [
              "A system issue (e.g. battery backup loss, detector disconnect, or wiring breakage) requiring visual assessor review.",
              "An active fire chemical engulfment in progress.",
              "Normal, pristine operating condition that can be ignored."
            ],
            correct: 0
          },
          {
            id: 3,
            q: "Who conducts the regular structural system tests at low-risk gyms and leisure sites under UK code?",
            options: [
              "Trained internal staff keyholders/wardens completing weekly testing runs.",
              "Strictly third-party certified fire engineers only.",
              "The local police authority."
            ],
            correct: 0
          }
        ];
      case 'lone_working':
        return [
          {
            id: 1,
            q: "What is the primary health and safety obligation for a lone worker under HSE rules?",
            options: [
              "Maintain an active, regular check-in protocol, verify communication links, and report any site hazards to a supervisor.",
              "Avoid reporting injuries until after the weekend is over.",
              "Disable panic detectors to save battery power on control loops."
            ],
            correct: 0
          },
          {
            id: 2,
            q: "In a gym or leisure facility, what is the safest approach when completing the visual daily lockup alone?",
            options: [
              "Systematically sweep guest locker rooms, verify saunas are powered off, check that security backdoors are locked, and dispatch a check-in confirmation.",
              "Leave gym weights strewn on floors and lock exits from the outside without checking voids.",
              "Switch off emergency escape route bulkhead lights to conserve power."
            ],
            correct: 0
          },
          {
            id: 3,
            q: "If a lone worker experiences an alarm alert or injury, what is the best immediate communication practice?",
            options: [
              "Activate the digital Lone Working Check-In / SOS trigger to notify the designated off-site supervisor instantly.",
              "Wait in place up to 12 hours without telling anyone.",
              "Bypass standard notification channels to avoid disturbing colleagues' personal time."
            ],
            correct: 0
          }
        ];
      case 'manual_handling':
        return [
          {
            id: 1,
            q: "What is the safest posture when lifting a heavy item (e.g., replacement gym plates or chemical supplies) from the floor?",
            options: [
              "Stable base feet, bend at knees and hips, keep the back straight, and lift smoothly using leg power.",
              "Keep legs locked straight and bend aggressively at the spine.",
              "Quickly twist the lower torso while lifting at full arm's length."
            ],
            correct: 0
          },
          {
            id: 2,
            q: "Under the Manual Handling Regulations (MHOR), what is the preferred safety option for transferring heavy sports gear?",
            options: [
              "Use mechanical aids (e.g., hand trolleys, mechanical lifters) or get a colleague's assistance.",
              "Forceful carry of heavy loads alone, disregarding fatigue.",
              "Throwing the items across safety transit paths."
            ],
            correct: 0
          },
          {
            id: 3,
            q: "What does the 'T.I.L.E.' risk assessment acronym represent in manual handling operations?",
            options: [
              "Task, Individual capacity, Load weight/dimensions, and Environment characteristics.",
              "Trigger, Inspection index, Location status, and Extinguisher checklist.",
              "Time interval, Isolate, Leverage, and Egress sweep."
            ],
            correct: 0
          }
        ];
      case 'hs_induction':
        return [
          {
            id: 1,
            q: "Under the Health and Safety at Work Act 1974, what is the key statutory duty of every employee?",
            options: [
              "Take reasonable care of their own safety and cooperate with the employer on basic safety compliance.",
              "Bear all structural maintenance costs for fire doors.",
              "Personally inspect ceiling insulation materials on a weekly basis."
            ],
            correct: 0
          },
          {
            id: 2,
            q: "What immediate action should be taken if a liquid spill is spotted on gym walkways or locker room tiles?",
            options: [
              "Cordon off the wet tiles immediately, apply high-contrast warning cones, clean the spill, and report the hazard in logs.",
              "Leave it to dry on its own to save effort.",
              "Pretend not to see it and walk quickly in the other direction."
            ],
            correct: 0
          },
          {
            id: 3,
            q: "Where should the official H&S Law Poster and mandatory First Aid equipment list be located in the gym?",
            options: [
              "In an easily seen and accessible communal staff area or gym lobby corridor.",
              "Locked inside a secure safe in the off-site director's private vehicle.",
              "Draped over the high-voltage electrical distribution board."
            ],
            correct: 0
          }
        ];
      case 'extinguisher':
      default:
        return [
          {
            id: 1,
            q: "Which safety extinguisher is primary matches electrical or server panel flare-ups according to BS 5306 standards?",
            options: [
              "Water jet cylinder",
              "Carbon Dioxide (CO2) or clean agent gas",
              "Water mist or coarse foam spray"
            ],
            correct: 1
          },
          {
            id: 2,
            q: "What is the mandatory interval frequency for fire wardens to evaluate escape pathways and exit door seals under the UK regulatory safety order?",
            options: [
              "Daily/weekly routine sweeps",
              "Once every two years",
              "Only after an active alarm has triggered"
            ],
            correct: 0
          },
          {
            id: 3,
            q: "What is the primary operational obligation of a designated site keyholder when an out-of-hours automatic fire alarm triggers?",
            options: [
              "Immediately search the burning crawlspaces alone",
              "Exemplify zero action and wait 24 hours",
              "Liaise at the secure perimeter, hand master emergency keys to the UK Fire Service, and unlock the alarm annunciator panel"
            ],
            correct: 2
          }
        ];
    }
  };

  const quizQuestions = getCourseQuestions(activeCourseTab);

  // Video progress controller
  useEffect(() => {
    if (isPlaying) {
      videoIntervalRef.current = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= totalVideoDuration) {
            setIsPlaying(false);
            clearInterval(videoIntervalRef.current);
            triggerSuccess("Interactive video chapter complete! 3-Question Exam is unlocked.");
            return totalVideoDuration;
          }
          return prev + 1.5; // speed up tick for responsive testing
        });
      }, 1000);
    } else {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    }
    return () => {
      if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    };
  }, [isPlaying]);

  const handleSeekAttempt = () => {
    setLastDispatchedAlert("⚠️ Skipping prohibited. UK Fire Safety Audits require watching instructional training videos fully.");
    setTimeout(() => setLastDispatchedAlert(null), 4000);
  };

  const handleOnboardStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const mockPassword = `AUR-${Math.floor(100 + Math.random()*900)}`;
    const newPerson: Trainee = {
      id: `trainee-${Date.now()}`,
      name: newName,
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      siteName: activeSite?.name || 'Harlow Plaza - Sector 7C',
      trainingStatus: 'Not Started',
      password: mockPassword,
      completedVideo: false
    };

    onAddTrainee(newPerson);
    triggerSuccess(`Successfully registered ${newName} into BACS e-learning workspace.`);

    // Trigger dynamic invitation popup state so director can inspect credentials
    setShowInvitationEmail({
      name: newName,
      email: newEmail.trim().toLowerCase(),
      password: mockPassword,
      role: newRole,
      siteName: activeSite?.name || 'Harlow Plaza - Sector 7C'
    });

    // Send simulated email
    triggerEmail('trainee_credentials', {
      name: newName,
      email: newEmail.trim().toLowerCase(),
      password: mockPassword,
      role: newRole,
      siteName: activeSite?.name || 'Harlow Plaza - Sector 7C'
    });

    setNewName('');
    setNewEmail('');
  };

  const handleManualSignOff = (traineeId: string) => {
    onPassTraining(traineeId, 'Charlie Hughes Authorized');
    triggerSuccess("Manual assessor sign-off certified successfully.");
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, index) => {
      if (examAnswers[index] === q.correct) {
        score += 1;
      }
    });

    if (score === quizQuestions.length) {
      if (!digitalSignature || !declaredLegal) {
        triggerSuccess("You must type your full legal name and declare statutory compliance above to finalize sign-off.");
        return;
      }
      
      const emailKey = activeUser.email.toLowerCase();
      setCompletedCoursesByEmail(prev => {
        const existing = prev[emailKey] || [];
        if (!existing.includes(activeCourseTab)) {
          return {
            ...prev,
            [emailKey]: [...existing, activeCourseTab]
          };
        }
        return prev;
      });

      setExamPassed(true);
      setExamStarted(false);
      // Reset video progress so they can select and watch other courses
      setVideoProgress(0);
      setExamAnswers({});
      setDigitalSignature('');
      setDeclaredLegal(false);

      if (currentTraineeRecord) {
        onPassTraining(currentTraineeRecord.id, digitalSignature);
      } else {
        onPassTraining('trainee-1', digitalSignature);
      }
      
      const courseName = COURSE_TABS.find(t => t.id === activeCourseTab)?.label || "Selected Unit";
      triggerSuccess(`Certified ✅ Passed "${courseName}". Dynamic record reported instantly to director ledger.`);
    } else {
      triggerSuccess(`Score: ${score}/3. You must answer all questions correctly to satisfy British Standards auditing criteria.`);
    }
  };

  const filteredTrainees = trainees.filter(t => {
    if (!staffSearch) return true;
    return t.name.toLowerCase().includes(staffSearch.toLowerCase()) || 
           t.siteName.toLowerCase().includes(staffSearch.toLowerCase()) ||
           t.role.toLowerCase().includes(staffSearch.toLowerCase());
  });

  const isTraineeView = activeUser.role === 'Trainee';

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      
      {/* 1. TRAINEE PORTAL VIEW (IF LOGGED IN AS TRAINEE) */}
      {isTraineeView ? (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-sm border border-slate-800">
            <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 bg-amber-500 text-slate-950 rounded tracking-wider">
              Secure Trainee Workspace
            </span>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Aurelius E-Learning Academy</h2>
                <p className="text-slate-400 text-xs mt-1">
                  Access: <strong>{activeUser.name}</strong> ({currentTraineeRecord?.role || 'Staff'}) • Site: <strong>{currentTraineeRecord?.siteName}</strong>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-450 block uppercase">TRAINING PIPELINE</span>
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
                  currentTraineeRecord?.trainingStatus === 'Certified' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-350'
                }`}>
                  Status: {currentTraineeRecord?.trainingStatus || 'Not Started'}
                </span>
              </div>
            </div>
          </div>
          {/* Sub-tabs for Trainee Workspace */}
          <div className="flex border-b border-slate-200 gap-1 select-none">
            <button
              onClick={() => setTraineeSubTab('courses')}
              className={`px-4 py-2.5 text-xs font-bold font-mono border-b-2 transition-all uppercase flex items-center gap-1.5 ${
                traineeSubTab === 'courses'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Academy Classes (6 Courses)
            </button>
            <button
              onClick={() => setTraineeSubTab('lone-working')}
              className={`px-4 py-2.5 text-xs font-bold font-mono border-b-2 transition-all uppercase flex items-center gap-1.5 ${
                traineeSubTab === 'lone-working'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-450 hover:text-slate-700'
              }`}
            >
              <Locate className="w-4 h-4 text-emerald-600" />
              Digital Lone Working Hub
            </button>
          </div>

          {/* Core Content Area */}
          {traineeSubTab === 'courses' ? (
            <div className="space-y-6">
              {/* If overall certified, show dynamic certificate card at the top */}
              {currentTraineeRecord?.trainingStatus === 'Certified' && (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-emerald-950">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-200 shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold">Overall UK compliance Certified</h3>
                      <p className="text-[11px] text-emerald-700 leading-normal mt-0.5">
                        Charlie Hughes associated NEBOSH accreditation active. Sign-off logged on {currentTraineeRecord.certifiedDate}.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const printContent = document.getElementById("academy-certificate-card")?.innerHTML;
                      if (printContent) {
                        const originalContent = document.body.innerHTML;
                        document.body.innerHTML = printContent;
                        window.print();
                        document.body.innerHTML = originalContent;
                        window.location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-[10px] uppercase rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Print Legal Certificate
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT: Course Video Player & Exam */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* PLAYER CONTAINER */}
                  <div className="bg-slate-950 text-white rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                    <div className="bg-slate-900 p-3 flex justify-between items-center text-xs border-b border-slate-800 font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400 font-bold shrink-0" />
                        ACTIVE MODULE: {
                          activeCourseTab === 'extinguisher' ? '1. PASS INSTRUCTIONS' :
                          activeCourseTab === 'warden' ? '2. FIRE WARDEN PROTOCOLS' :
                          activeCourseTab === 'keyholder' ? '3. KEYHOLDER ESCALATION' :
                          activeCourseTab === 'lone_working' ? '4. LONE WORKING PROTECTION' :
                          activeCourseTab === 'manual_handling' ? '5. TILE POSTURE MANUAL TRANSFERS' :
                          '6. HASWA WORKPLACE INDUCTION'
                        }
                      </span>
                      <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">
                        {COURSE_TABS.find(t => t.id === activeCourseTab)?.standard}
                      </span>
                    </div>

                    <div className="h-60 bg-slate-900 relative flex items-center justify-center p-6 text-center select-none">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
                      
                      {lastDispatchedAlert && (
                        <div className="absolute top-4 left-4 right-4 bg-red-600 text-white text-[11px] font-bold py-2 px-3 rounded shadow-lg flex items-center gap-1.5 animate-bounce z-40">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{lastDispatchedAlert}</span>
                        </div>
                      )}

                      <div className="space-y-4 max-w-md z-30">
                        <h4 className="text-base font-extrabold tracking-tight text-white leading-tight">
                          {isPlaying ? (
                            <span className="inline-flex items-center gap-1.5 text-amber-400">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                              Simulated E-Learning Stream Active...
                            </span>
                          ) : videoProgress >= totalVideoDuration ? (
                            <span className="text-emerald-400 font-extrabold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-4 h-4 shrink-0" /> Interactive Chapter Fully Viewed
                            </span>
                          ) : (
                            <span className="text-slate-200">Interactive Lecture Paused</span>
                          )}
                        </h4>
                        
                        <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                          {
                            activeCourseTab === 'extinguisher' ? 'Deploys British Standard BS 5306 regulations covering extinguisher chemistries, target nozzles, and PASS fanning.' :
                            activeCourseTab === 'warden' ? 'Exposes UK FSO 2005 warden duties, structural sweep pathways, occupant audits, and panic escape pushes.' :
                            activeCourseTab === 'keyholder' ? 'Evaluates BS 5839 panel annunciators, master lock keys, safe perimeter waits, and fire responder liaisons.' :
                            activeCourseTab === 'lone_working' ? 'Covers lone worker emergency contacts, cell dead-zones, gym lockups, saunas power-offs, and check-in heartbeats.' :
                            activeCourseTab === 'manual_handling' ? 'Demonstrates stable base liftoff stances, center of gravity lifts, sports gear carriers, and heavy items transfer.' :
                            'Walks through communal workspace induction, poster placements, wet-floor cones layout, first-aid, and hazard logging.'
                          }
                        </p>

                        <div className="p-3 bg-black/50 rounded-xl border border-slate-800/80 text-left max-w-xs mx-auto">
                          <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold tracking-wider">WORKSPACE RADIAL FEED</span>
                          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-300">
                            <span>Watch Progress: {Math.round((videoProgress/totalVideoDuration)*100)}%</span>
                            <span>Time: 0:{(Math.floor(videoProgress)).toString().padStart(2, '0')} / {totalVideoDuration}s</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                            <div className="bg-amber-400 h-1 transition-all" style={{ width: `${(videoProgress/totalVideoDuration)*100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PLAYER CONTROLS */}
                    <div className="bg-slate-900 p-4 flex items-center gap-4 text-xs font-mono select-none">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-lg flex items-center gap-1 transition-colors capitalize text-[10.5px]"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        <span>{isPlaying ? 'Pause' : 'Stream Course Video'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsPlaying(false);
                          setVideoProgress(0);
                          triggerSuccess("Lesson slide re-wound.");
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                        title="Re-watch"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      {/* Timeline */}
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-[9px] text-slate-400">0:00</span>
                        <input
                          type="range"
                          min="0"
                          max={totalVideoDuration}
                          value={videoProgress}
                          onChange={handleSeekAttempt}
                          className="flex-1 accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                        />
                        <span className="text-[9px] text-slate-400">{totalVideoDuration}s</span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE QUESTION EXAM PANEL */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wide font-sans">
                          {COURSE_TABS.find(t => t.id === activeCourseTab)?.label} Exam
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">3 Critical Questions (100% correct score required to lock credential)</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded uppercase">
                        BS Standard
                      </span>
                    </div>

                    {videoProgress < totalVideoDuration ? (
                      <div className="p-8 text-center bg-stone-50 border border-slate-200 rounded-xl space-y-3">
                        <ShieldAlert className="w-7 h-7 text-amber-500 mx-auto animate-pulse" />
                        <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans leading-normal">
                          The statutory evaluation questions for this module are currently locked. You must stream/progress the instructional training video slide fully to satisfy audit parity guidelines.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="space-y-3.5 text-left">
                          {quizQuestions.map((q, qIdx) => (
                            <div key={q.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                              <p className="font-bold text-slate-900">{q.id}. {q.q}</p>
                              <div className="space-y-1.5 pl-2 font-medium">
                                {q.options.map((opt, optIdx) => (
                                  <label key={optIdx} className="flex items-start gap-2.5 cursor-pointer p-1.5 rounded hover:bg-slate-200/50 transition-colors select-none text-slate-600">
                                    <input
                                      type="radio"
                                      name={`trainee-quiz-${q.id}`}
                                      checked={examAnswers[qIdx] === optIdx}
                                      onChange={() => setExamAnswers(prev => ({ ...prev, [qIdx]: optIdx }))}
                                      className="accent-slate-950 mt-0.5 shrink-0"
                                    />
                                    <span className="text-[11px] leading-tight">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* SIGN-OFF ATTESTATION STATEMENT */}
                        <div className="p-4 bg-orange-50/45 border border-orange-200 rounded-xl space-y-3 text-xs">
                          <p className="font-bold text-orange-950 uppercase text-[9.5px] tracking-wide flex items-center gap-1 font-sans">
                            <ShieldAlert className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                            Statutory Trainee Legal Declaration
                          </p>
                          <p className="text-[10.5px] leading-relaxed text-slate-700">
                            By certifying my digital signature below, I attest under penalty of audit non-conformance that I have watched the safety lecture module, completely understood all questions, and stand logged on the Aurelius compliance workspace.
                          </p>

                          <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            <div className="space-y-1">
                              <label className="text-[9.5px] font-mono font-bold text-slate-500 uppercase">Employee Print Name</label>
                              <input
                                type="text"
                                value={digitalSignature}
                                onChange={(e) => setDigitalSignature(e.target.value)}
                                className="w-full bg-white border border-slate-250 rounded-lg py-2 px-3 text-[11px] font-bold focus:outline-none focus:border-slate-800"
                                placeholder="Signature Verification"
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                              <input
                                type="checkbox"
                                id="legal-declare-box"
                                checked={declaredLegal}
                                onChange={(e) => setDeclaredLegal(e.target.checked)}
                                className="w-4 h-4 accent-slate-900 border-slate-300 rounded cursor-pointer"
                              />
                              <label htmlFor="legal-declare-box" className="text-[10px] font-bold text-slate-600 cursor-pointer select-none">
                                I verify my answers and sign off unit.
                              </label>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={submitQuiz}
                          disabled={Object.keys(examAnswers).length < quizQuestions.length}
                          className="w-full py-2.5 bg-slate-950 text-white hover:bg-slate-850 disabled:opacity-50 font-mono font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-sm"
                        >
                          Sign Off Lesson & Certify compliance
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Academy Syllabus Ledger */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="text-xs uppercase font-bold tracking-wide text-slate-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4.5 h-4.5 text-amber-500" />
                      Academic Curriculum
                    </h3>
                    <p className="text-[9.5px] text-slate-400 mt-0.5">Select a module to progress lesson.</p>
                  </div>

                  <div className="space-y-2.5">
                    {COURSE_TABS.map((tab) => {
                      const emailKey = activeUser.email.toLowerCase();
                      const hasPassed = (completedCoursesByEmail[emailKey] || []).includes(tab.id);
                      const isActive = activeCourseTab === tab.id;
                      const IconComponent = tab.icon;

                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveCourseTab(tab.id as any);
                            setVideoProgress(0);
                            setExamAnswers({});
                            setIsPlaying(false);
                          }}
                          className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                            isActive
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : hasPassed
                              ? 'bg-emerald-50/50 hover:bg-emerald-50 border-emerald-250 text-slate-700'
                              : 'bg-stone-50/40 hover:bg-stone-50 border-slate-200/80 text-slate-650'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-1">
                            <span className={`text-[9px] font-mono uppercase font-extrabold px-1.5 py-0.2 rounded ${
                              isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-500 border border-slate-200/50'
                            }`}>
                              {tab.standard}
                            </span>
                            {hasPassed ? (
                              <span className="text-emerald-600 font-extrabold font-mono text-[9px] flex items-center gap-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                PASSED
                              </span>
                            ) : isActive ? (
                              <span className="text-amber-400 font-bold font-mono text-[9px] flex items-center gap-0.5 shrink-0">
                                <Clock className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                                WATCHING
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium font-mono text-[9px]">
                                PENDING
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 flex items-center gap-2">
                            <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : hasPassed ? 'text-emerald-600' : 'text-slate-450'}`} />
                            <span className="text-xs font-bold font-sans tracking-tight">{tab.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <hr className="border-slate-100" />

                  {/* Charlie Hughes Accreditations Disclaimers */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[10.5px]">
                    <p className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wide font-mono">NEBOSH Assessor Verification</p>
                    <p className="text-slate-500 font-sans leading-relaxed">
                      All units are designed and audited by independent fire expert <strong>Charlie Hughes (NEBOSH Fire Certified)</strong>. Providing specialty assessments for gyms and leisure facilities.
                    </p>
                  </div>
                </div>

              </div>

              {/* Secret Printable Element */}
              <div id="academy-certificate-card" className="hidden">
                <div style={{ padding: "40px", border: "10px double #4A4A4A", fontFamily: "Georgia, serif", textAlign: "center", textTransform: "none", color: "#111" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "1px", margin: "0 0 10px 0" }}>AURELIUS FIRE SAFETY ACADEMY</h1>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", color: "#555", margin: "0 0 30px 0" }}>CERTIFICATE OF COMPLIANCE ACQUITTAL</h3>
                  <p style={{ fontSize: "14px", margin: "0 0 20px 0" }}>This legally validates that the active employee:</p>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold", textDecoration: "underline", margin: "0 0 20px 0" }}>{activeUser.name}</h2>
                  <p style={{ fontSize: "13px", lineHeight: "1.6", margin: "0 0 30px 0" }}>
                    has successfully completed, tested, and resolved all 6 compliance modules (Extinguisher BS 5306-3, Wardens RRO 2005, Keyholders, Lone Working Safety (HSE), Manual Handling MHOR 1992, and Health & Safety induction Act 1974) for organization site <strong>{currentTraineeRecord?.siteName}</strong> under strict NEBOSH independent parameters.
                  </p>
                  <hr style={{ border: "0", borderTop: "1px solid #CCC", margin: "0 auto 20px auto", width: "60%" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#444" }}>
                    <div>
                      <p>CERTIFICATE REF: {currentTraineeRecord?.certificateRef || "AR-RRO-F-7119"}</p>
                      <p>CERTIFIED DATE: {currentTraineeRecord?.certifiedDate || "2026-06-20"}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p><strong>Charlie Hughes</strong></p>
                      <p>NEBOSH Fire Safety Certified Consultant</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Lone Working Operations Hub */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: DIGITAL RISK ASSESSMENT TEMPLATE BUILDER */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* ASSESSMENT GENERATOR FORM */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs uppercase font-black text-slate-900 tracking-wide flex items-center gap-2">
                        <FileText className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                        Digital Lone Working Risk Assessment (FRA)
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">Analyze gym/leisure workspace lone-duty hazard controls.</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-800 border-emerald-200 px-2 py-0.5 rounded">
                      HSE Compliance template
                    </span>
                  </div>

                  <form onSubmit={handleCompileFRA} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase font-mono">1. Local Site Location / Area</label>
                        <input
                          type="text"
                          required
                          value={loneLocation}
                          onChange={(e) => setLoneLocation(e.target.value)}
                          placeholder="e.g. Reception & Sauna Plant Room"
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-800 font-bold text-slate-850"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase font-mono">2. Nature of Lone Work Activity</label>
                        <input
                          type="text"
                          required
                          value={loneTask}
                          onChange={(e) => setLoneTask(e.target.value)}
                          placeholder="e.g. Visual locker sweep & locking cardio deck"
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg py-2 px-3 focus:outline-none focus:border-slate-800 font-bold text-slate-850"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase font-mono">3. Buddy name</label>
                        <input
                          type="text"
                          required
                          value={buddyName}
                          onChange={(e) => setBuddyName(e.target.value)}
                          placeholder="e.g. Liam Davies"
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-3 focus:outline-none focus:border-slate-800 font-bold text-slate-850"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase font-mono">4. Buddy Email Contact</label>
                        <input
                          type="email"
                          required
                          value={buddyEmail}
                          onChange={(e) => setBuddyEmail(e.target.value)}
                          placeholder="liam@gymcompany.co.uk"
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-3 focus:outline-none focus:border-slate-800 font-mono font-bold text-slate-850"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase font-mono">5. Buddy Check-In Interval</label>
                        <select
                          value={buddyInterval}
                          onChange={(e) => setBuddyInterval(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 rounded-lg py-1.5 px-2.5 focus:outline-none focus:border-slate-800 font-bold text-slate-800"
                        >
                          <option value="15">Every 15 minutes</option>
                          <option value="30">Every 30 minutes</option>
                          <option value="60">Every 60 minutes</option>
                          <option value="120">Every 2 hours</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <p className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wide">6. Mandatory Safety Attestations Checklist</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <label className="flex items-start gap-2 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-lg cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={loneCommsCheck}
                            onChange={(e) => setLoneCommsCheck(e.target.checked)}
                            className="mt-0.5 accent-emerald-600 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-850 block leading-tight text-[11px]">Communications Link Verified</span>
                            <span className="text-[10px] text-slate-450">Mobile cell signal, battery & panic alarms fully pre-checked.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-lg cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={loneEgressCheck}
                            onChange={(e) => setLoneEgressCheck(e.target.checked)}
                            className="mt-0.5 accent-emerald-600 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-850 block leading-tight text-[11px]">Visual Escape Paths Cleared (Level 1)</span>
                            <span className="text-[10px] text-slate-450">Push pad escape corridors and signs are unobstructed.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-lg cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={lonePreconditionCheck}
                            onChange={(e) => setLonePreconditionCheck(e.target.checked)}
                            className="mt-0.5 accent-emerald-600 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-850 block leading-tight text-[11px]">Individual Fit-To-Work Status</span>
                            <span className="text-[10px] text-slate-450">Employee has no medical preconditions preventing lone-duty.</span>
                          </div>
                        </label>

                        <label className="flex items-start gap-2 p-2 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-lg cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={loneFrameCheck}
                            onChange={(e) => setLoneFrameCheck(e.target.checked)}
                            className="mt-0.5 accent-emerald-600 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-850 block leading-tight text-[11px]">Basic Door & Frame Checks</span>
                            <span className="text-[10px] text-slate-450">Visual examination of frames and latching. Non-sleeping properties.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-extrabold tracking-wider text-[10.5px] uppercase rounded-xl transition-colors shadow-sm"
                    >
                      Compile digital Assessment & Log Copy
                    </button>
                  </form>
                </div>

                {/* SHOW RECORD COMPILED PREVIEW */}
                {compiledFRA && (
                  <div className="bg-[#FAF9F6] border-2 border-slate-350 rounded-2xl p-6 shadow-md relative font-serif text-xs text-slate-900 select-text">
                    <span className="absolute top-4 right-4 text-[7.5px] font-sans font-mono border bg-white text-slate-450 px-1.5 py-0.5 rounded select-none">
                      REF: {compiledFRA.refNum}
                    </span>
                    <div className="text-center space-y-1 border-b border-slate-200 pb-3 font-sans">
                      <h4 className="text-sm font-black tracking-widest uppercase text-slate-950">AURELIUS LONE WORKING RISK ASSESSMENT</h4>
                      <p className="text-[9px] font-bold text-emerald-800 tracking-wider">CERTIFICATE OF VISUAL SAFETY LEVEL 1 AUDIT</p>
                      <p className="text-[10px] text-slate-455">Independent Assessor: Charlie Hughes • NEBOSH Fire Safety Certified</p>
                    </div>

                    <div className="py-4 space-y-3 leading-relaxed">
                      <div className="grid grid-cols-2 gap-4 font-sans text-[10.5px] border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-slate-400 text-[9px] font-mono leading-none lowercase">completed safety rep:</p>
                          <p className="font-bold text-slate-800 mt-1">{compiledFRA.workerName}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-[9px] font-mono leading-none lowercase">location audited:</p>
                          <p className="font-bold text-slate-800 mt-1">{compiledFRA.siteLocation}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="font-bold font-sans text-[10px] uppercase text-stone-550">Risk mitigation parameters:</p>
                        <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                          <li><strong>Nature of lone shift:</strong> {compiledFRA.taskDescription}</li>
                          <li><strong>Designated buddy contact:</strong> {compiledFRA.buddyName} (Every {compiledFRA.buddyFeedbackInterval})</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 font-sans text-[10px]">
                        <div className={`p-2 rounded border ${compiledFRA.commsVerified ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250'}`}>
                          ✔ Comms Pre-Verified: {compiledFRA.commsVerified ? 'YES' : 'NO'}
                        </div>
                        <div className={`p-2 rounded border ${compiledFRA.egressChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250'}`}>
                          ✔ Egress Push bars checked: {compiledFRA.egressChecked ? 'YES' : 'NO'}
                        </div>
                        <div className={`p-2 rounded border ${compiledFRA.preconditionsChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250'}`}>
                          ✔ Individual Preconditions OK: {compiledFRA.preconditionsChecked ? 'YES' : 'NO'}
                        </div>
                        <div className={`p-2 rounded border ${compiledFRA.frameChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-rose-50 text-rose-800 border-rose-250'}`}>
                          ✔ Visual Frame Alignments clear: {compiledFRA.frameChecked ? 'YES' : 'NO'}
                        </div>
                      </div>

                      <p className="text-[10px] leading-relaxed text-slate-500 italic font-sans text-center pt-2 border-t border-slate-100">
                        Visual inspection only, excluding cavities or complex void penetration. Restricted strictly to non-sleeping small-to-medium premises.
                      </p>
                    </div>

                    <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-lg border border-slate-200 mt-2 font-sans text-[10.5px]">
                      <span className="font-mono text-[9px] text-slate-400 font-bold">STATE: RECORD FILED IN VAULT</span>
                      <button
                        onClick={() => {
                          const originalContent = document.body.innerHTML;
                          const printTarget = document.getElementById("academy-certificate-card")?.nextElementSibling?.innerHTML;
                          if (printTarget) {
                            document.body.innerHTML = printTarget;
                            window.print();
                            document.body.innerHTML = originalContent;
                            window.location.reload();
                          }
                        }}
                        className="py-1 px-2.5 bg-slate-900 text-white font-mono hover:bg-slate-800 rounded font-extrabold uppercase text-[9px] transition-all"
                      >
                        Print Compliance Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: BUDDY SHIFT CHECK-IN & LOG */}
              <div className="lg:col-span-4 space-y-6 text-xs text-slate-800 leading-normal">
                
                {/* ACTIVE CHECK-IN HEARTBEAT PANEL */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-left">
                  <h4 className="text-xs uppercase font-extrabold text-slate-900 tracking-wide flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Clock className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                    Live Shift Heartbeat Node
                  </h4>

                  {activeCheckIn ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl space-y-3 font-sans">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping shrink-0" />
                            ACTIVE LONE WORK SIGNAL
                          </span>
                          <span className="text-[10px] font-mono leading-none tracking-tight">Interval: {activeCheckIn.buddyFeedbackInterval}</span>
                        </div>
                        
                        <div className="text-center py-4 space-y-1">
                          <p className="text-[28px] font-black font-mono tracking-tight leading-none text-emerald-800 font-sans">
                            {Math.floor(checkInSecondsLeft / 3600).toString().padStart(2, '0')}:
                            {Math.floor((checkInSecondsLeft % 3600) / 60).toString().padStart(2, '0')}:
                            {Math.floor(checkInSecondsLeft % 60).toString().padStart(2, '0')}
                          </p>
                          <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide">Time Until Next Heartbeat Check</p>
                        </div>

                        <div className="text-[10.5px] border-t border-emerald-250 pt-2 space-y-1">
                          <p className="font-semibold">📍 Location: <strong>{activeCheckIn.siteLocation}</strong></p>
                          <p className="text-emerald-800 font-sans text-[10px]">Buddy Contact: {activeCheckIn.buddyName} ({activeCheckIn.buddyEmail})</p>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckoutCheckIn}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono font-extrabold text-[10px] uppercase tracking-wide rounded-lg transition-colors shadow-sm"
                      >
                        Check-Out Safely (Finish Shift)
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLoneCheckIn} className="space-y-3 text-xs">
                      <div className="p-3 bg-stone-50 border border-slate-200 rounded-xl text-[11px] leading-relaxed text-slate-500">
                        Are you about to conduct visual checks in secluded areas or outside normal business hours? Activating the heartbeat establishes buddy notification emails.
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-700 hover:bg-emerald-850 text-white font-mono font-extrabold text-[10px] uppercase tracking-widest rounded-lg transition-all"
                      >
                        Register Lone Work Check-In
                      </button>
                    </form>
                  )}
                </div>

                {/* CURRENT SESSION CHECK-IN LOG */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3.5 text-left">
                  <h4 className="text-[11px] font-extrabold uppercase text-slate-900 tracking-wide">Heartbeat Activity Logs</h4>
                  
                  {checkInLog.length === 0 ? (
                    <p className="text-[10.5px] text-slate-400 italic">No lone working check-ins logged in this session.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto space-y-2">
                      {checkInLog.map((log) => (
                        <div key={log.id} className="pt-2 text-[10px] font-mono space-y-1">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{log.timestamp}</span>
                            <span className="text-emerald-700 font-black uppercase text-[8.5px]">CHECKED IN</span>
                          </div>
                          <p className="text-slate-500 font-sans text-[10.5px]">📍 Location: {log.siteLocation}</p>
                          <p className="text-[9px] text-slate-400">Buddy notified: {log.buddyEmail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </div>
      ) : (
        
        /* 2. MAIN DIRECTOR VIEW */
        <div className="space-y-8">
          
          {/* HEADER CONTROL ROWS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-205 pb-4">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 rounded">
                Qualified BAFE & NEBOSH Regulatory Frameworks
              </span>
              <h2 id="training-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                Aurelius Fire Safety Academy
              </h2>
              <p className="text-slate-550 text-xs mt-1">
                Onboard corporate staff as trainees, monitor active countdown expirations, and automatically trigger annual reassignment sweeps.
              </p>
            </div>

            {/* Expire year test button */}
            <button
              onClick={onSimulateYearPassage}
              className="px-4 py-2 bg-stone-50 hover:bg-stone-100 ring-1 ring-stone-250 hover:ring-stone-350 text-neutral-800 font-mono text-[10px] uppercase font-bold rounded-lg transition-all flex items-center gap-1.5"
              title="Test annual automatic reassignment cycle"
            >
              <RefreshCw className="w-4 h-4 text-rose-700 animate-spin-slow" />
              Simulate 1-Year Passage (Reassign refreshers)
            </button>
          </div>

          {/* SIMULATED CREDENTIALS NOTIFICATION BANNER */}
          {showInvitationEmail && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-5 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-xs uppercase font-mono">Dispatched Trainee Invitation Portal Notice</h4>
                    <p className="text-[10.5px] text-stone-450 mt-0.5">The added employee received customized credentials to complete safety training.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const shareText = `Dear ${showInvitationEmail.name},\n\nYou have been enrolled as an active ${showInvitationEmail.role} for property ${showInvitationEmail.siteName}.\n\nTo complete your safety induction and satisfy regional RRO 2005 compliance standards, please login to the portal and pass the short certified exam:\n\n🚀 Secure Portal Link: https://aurelius-compliance.co.uk/academy\n👤 Your Login Email: ${showInvitationEmail.email}\n🔑 Your Security Password: ${showInvitationEmail.password}\n\nBest regards,\nAurelius Fire Safety Management`;
                      navigator.clipboard.writeText(shareText);
                      setCopiedInvite(true);
                      triggerSuccess('📋 Copied Complete Credentials Packet to Clipboard! Ready to paste and send to employee.');
                      setTimeout(() => setCopiedInvite(false), 3000);
                    }}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-[10.5px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedInvite ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copy Credentials Packet
                      </>
                    )}
                  </button>
                  <button onClick={() => { setShowInvitationEmail(null); setCopiedInvite(false); }} className="text-stone-450 hover:text-stone-705 p-1 rounded-full hover:bg-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-stone-200 text-xs text-stone-750 font-mono max-w-xl space-y-2 leading-relaxed relative">
                <p><strong>To:</strong> {showInvitationEmail.email}</p>
                <p><strong>Subject:</strong> Action Required: Aurelius Safety Portal Credentials Onboarding</p>
                <hr className="border-stone-100" />
                <p>Dear {showInvitationEmail.name},</p>
                <p>You have been enrolled as an active <strong>{showInvitationEmail.role}</strong> for property <strong>{showInvitationEmail.siteName}</strong>.</p>
                <p>To satisfy the legal burdens of the <strong>UK Fire Regulatory Reform Order 2005 (RRO 2005)</strong>, you must watch the interactive video PASS standard demonstration and complete the certified 3-Question Exam.</p>
                <p className="p-3 bg-stone-100 border border-stone-300 rounded-lg max-w-md select-all cursor-pointer" title="Double click or click Copy button to copy packet" onClick={() => {
                  const shareText = `Dear ${showInvitationEmail.name},\n\nYou have been enrolled as an active ${showInvitationEmail.role} for property ${showInvitationEmail.siteName}.\n\nTo complete your safety induction and satisfy regional RRO 2005 compliance standards, please login to the portal and pass the short certified exam:\n\n🚀 Secure Portal Link: https://aurelius-compliance.co.uk/academy\n👤 Your Login Email: ${showInvitationEmail.email}\n🔑 Your Security Password: ${showInvitationEmail.password}\n\nBest regards,\nAurelius Fire Safety Management`;
                  navigator.clipboard.writeText(shareText);
                  setCopiedInvite(true);
                  triggerSuccess('📋 Copied Login & Password credentials snippet!');
                  setTimeout(() => setCopiedInvite(false), 3000);
                }}>
                  🚀 <strong>Secure Portal URL:</strong> https://aurelius-compliance.co.uk/academy<br />
                  👤 <strong>Your Login Email:</strong> {showInvitationEmail.email}<br />
                  🔑 <strong>Your Security Password:</strong> {showInvitationEmail.password}
                  <span className="block text-[8.5px] text-indigo-600 mt-2 font-sans font-bold uppercase tracking-wider">💡 Click box to copy credentials instantaneously</span>
                </p>
                <p className="text-[10px] text-stone-450 italic leading-snug">
                  *This e-learning invitation complies with BACS Direct Debit security structures. Cancellation notice period is 30 days. No individual passwords should reside in clear text.
                </p>
              </div>
            </div>
          )}

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: ACTIVE COURSE SYLLABUS DIRECTORY */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
                <div className="border-b border-rose-200/20 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                    <Compass className="w-4 h-4 text-amber-600 animate-spin-slow" />
                    British Standards academy Syllabus Catalog
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">Target: RRO 2005 Order Matched</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {COURSE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveCourseTab(tab.id as any);
                        }}
                        className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          activeCourseTab === tab.id
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`w-5 h-5 ${activeCourseTab === tab.id ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 bg-slate-900/10 text-slate-400 rounded">
                            {tab.duration}
                          </span>
                        </div>
                        <div className="mt-3 text-xs">
                          <p className="text-[11px] font-bold leading-tight">{tab.label}</p>
                          <p className={`text-[9px] font-mono mt-0.5 ${activeCourseTab === tab.id ? 'text-slate-400' : 'text-slate-400'}`}>
                            {tab.standard}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Course Content Canvas */}
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 text-xs leading-relaxed text-slate-700">
                  {activeCourseTab === 'extinguisher' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-800 max-w-fit rounded text-[10px] font-bold uppercase font-sans">
                        <Flame className="w-3.5 h-3.5" /> Extinguisher Guidance Standards (BS 5306)
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-950">Classification & Fire Class Deployment</h4>
                      <p>
                        To satisfy British Standard <strong>BS 5306-3</strong>, staff must align extinguisher chemistries with safety targets. Deployment utilizes the global <strong>P.A.S.S.</strong> protocol:
                      </p>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 font-sans">
                        <li className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <strong>1. Pull the Pin</strong>: Break safety seals cleanly.
                        </li>
                        <li className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <strong>2. Aim Low</strong>: Direct nozzles at base embers, not surface flares.
                        </li>
                        <li className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <strong>3. Squeeze Level</strong>: Depress handle toggles at uniform distance.
                        </li>
                        <li className="p-2.5 bg-white border border-slate-200 rounded-lg">
                          <strong>4. Sweep Area</strong>: Fan discharges side-to-side across base.
                        </li>
                      </ul>
                    </div>
                  )}

                  {activeCourseTab === 'warden' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 max-w-fit rounded text-[10px] font-bold uppercase">
                        <Users className="w-3.5 h-3.5" /> Regulatory Reform (Fire Safety) Order 2005
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-950 font-sans">Active Duties & Evacuation Procedures</h4>
                      <p>
                        Appointed Fire Wardens maintain daily operational oversight of building occupants, compartmentalization bounds, and escape pathways:
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-[11px] text-slate-600 font-sans">
                        <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5">
                          <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-800 text-[10px] shrink-0 mt-0.5">A</div>
                          <p><strong>Path Clearance</strong>: Daily assurance that fire lanes, emergency exit vestibules, Stairways, and final panic-push doors are completely free of structural or waste obstacles.</p>
                        </div>
                        <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-start gap-2.5">
                          <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-800 text-[10px] shrink-0 mt-0.5">B</div>
                          <p><strong>Roll Call Auditing</strong>: Guiding evacuations, sweeping specific structural sectors, checking sanitary bathrooms, and correlating assembly roster heads for emergency services.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCourseTab === 'keyholder' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 max-w-fit rounded text-[10px] font-bold uppercase">
                        <Key className="w-3.5 h-3.5" /> Out-of-Hours Fire Safety Protocol (BS 5839)
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-950 font-sans">First-Response & Emergency Liaison Operations</h4>
                      <p>
                        Aurelius Keyholders act as the interface between secure property blocks and UK Fire Responders when active alarms trip during vacant hours:
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc pl-4 font-sans">
                        <li>Maintain secure, active possession of all emergency access master override fobs.</li>
                        <li>Respond safely without entering active smoke hazards alone until responders clear parameters.</li>
                        <li>Unlock master annunciator indicator screens and pinpoint tripped sensor codes instantly.</li>
                      </ul>
                    </div>
                  )}

                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: FAST ONBOARDING FORM & ACTIVE ROSTER */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* FAST REGISTER ONBOARD FORM */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-wider text-slate-905 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <UserPlus className="w-4.5 h-4.5 text-amber-600" />
                  Onboard Trainee Account
                </h3>

                <form onSubmit={handleOnboardStaff} className="space-y-3.5 text-xs text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Employee Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Isla Brown"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Employee Email (Trainee Login)</label>
                    <input
                      type="email"
                      placeholder="isla@company.co.uk"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-800 font-mono text-stone-750 font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase font-mono">Designated Safety Assignment</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-250 rounded-lg px-3 py-2 font-bold focus:outline-none focus:border-slate-800 text-xs text-stone-750"
                    >
                      <option value="Staff">General Occupant / Onboarding</option>
                      <option value="Fire Warden">Appointed Fire Warden (RRO 2005)</option>
                      <option value="Keyholder">Designated Keyholder (Liaison)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-mono font-extrabold text-xs uppercase tracking-wider rounded-lg transition-all"
                  >
                    Add User & Dispatched Login Email
                  </button>
                </form>
              </div>

              {/* TRAINEES DIR WITH LIVE REF_COUNTDOWNS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-slate-850 flex items-center gap-1.5">
                    <FileBadge className="w-4.5 h-4.5 text-amber-600" />
                    Warden Academy Countdown Ledger
                  </h3>
                  <span className="text-[8px] font-mono font-bold bg-slate-100 text-slate-550 px-1.5 py-0.5 rounded">
                    Wardens: {trainees.length}
                  </span>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter by name/duty/site..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2 py-1.5 text-[10px] focus:outline-none focus:border-slate-500 font-medium"
                  />
                </div>

                {/* Staff listing */}
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1 text-xs space-y-3 pt-1">
                  {filteredTrainees.map((person) => {
                    const daysLeft = calculateDaysRemaining(person.expiryDate);
                    return (
                      <div key={person.id} className="pt-2.5 space-y-1.5 text-left select-text">
                        <div className="flex justify-between items-start gap-1">
                          <div>
                            <p className="font-extrabold text-slate-800">{person.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">{person.email}</p>
                          </div>
                          
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono tracking-wider shrink-0 ${
                            person.role === 'Fire Warden'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                              : person.role === 'Keyholder'
                              ? 'bg-blue-50 text-blue-700 border border-blue-150'
                              : 'bg-slate-100 text-slate-550 border border-slate-200'
                          }`}>
                            {person.role}
                          </span>
                        </div>

                        <div className="text-[9px] font-mono text-slate-550 flex flex-wrap justify-between pr-1 gap-1">
                          <span>Site: {person.siteName}</span>
                          {person.password && <span className="text-slate-450">Login Pass: {person.password}</span>}
                        </div>

                        <div className="flex justify-between items-center text-[9.5px] pt-1.5 text-slate-500 border-t border-slate-100/50">
                          <span className="font-mono flex items-center gap-1">
                            {person.trainingStatus === 'Certified' ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Signed Off
                              </span>
                            ) : (
                              <span className="text-amber-700 font-bold flex items-center gap-0.5">
                                <Clock className="w-3 h-3 text-amber-500 shrink-0 animate-pulse" /> Pending
                              </span>
                            )}
                          </span>

                          <span>
                            {person.trainingStatus === 'Certified' && daysLeft !== null ? (
                              daysLeft <= 0 ? (
                                <span className="px-1 bg-red-100 border border-red-250 text-red-800 font-bold text-[8.5px] uppercase font-sans animate-pulse rounded">
                                  🔴 EXPIRED / RE-ASSIGNED
                                </span>
                              ) : daysLeft <= 30 ? (
                                <span className="text-rose-700 font-bold bg-rose-50 px-1 py-0.2 border border-rose-200 rounded font-sans leading-none text-[8.5px]">
                                  ⚠️ Expiring soon ({daysLeft} days)
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 border border-emerald-250 rounded font-sans leading-none text-[8.5px]">
                                  🟢 Expiring: <strong>{daysLeft}d left</strong>
                                </span>
                              )
                            ) : (
                              <span className="text-slate-400 font-semibold font-sans italic">Not certified</span>
                            )}
                          </span>

                          {person.trainingStatus !== 'Certified' && (
                            <button
                              onClick={() => handleManualSignOff(person.id)}
                              className="px-1.5 py-0.5 bg-slate-900 border border-slate-900 text-white rounded font-bold text-[8.5px] uppercase hover:bg-slate-800 transition-colors shrink-0"
                            >
                              Assessor Sign-Off
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
