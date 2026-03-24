import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BookOpen, Users, Clock, FileText, Bell, Calendar,
  BarChart3, LogOut, CheckCircle2, XCircle, AlertCircle, Check, X, Upload, Plus, ArrowLeft, Paperclip, Eye, Send, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import HeaderActions from "@/components/HeaderActions";
import { useLanguage } from "@/contexts/LanguageContext";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = ["08:00-09:30", "09:30-11:00", "11:00-12:30", "12:30-14:00", "14:00-15:30", "15:30-17:00"];

interface ScheduleCell { course: string; teacher: string; room: string; type: "lecture" | "lab" | "tutorial"; }
type ScheduleGrid = Record<string, Record<string, ScheduleCell | null>>;

// Teacher's courses and their groups
const TEACHER_COURSES = [
  {
    subject: "Network",
    groups: [
      { id: "net1", label: "L3 — Computer Science — Group A", students: [
        { name: "Ahmed Benali", regNo: "202612345678", status: "present" },
        { name: "Sara Hadj", regNo: "202612345679", status: "present" },
        { name: "Mohamed Saidi", regNo: "202612345680", status: "absent" },
      ]},
      { id: "net2", label: "L3 — Computer Science — Group B", students: [
        { name: "Amina Bouzid", regNo: "202612345681", status: "present" },
        { name: "Yacine Khelifi", regNo: "202612345682", status: "absent" },
      ]},
    ],
  },
  {
    subject: "Algorithme",
    groups: [
      { id: "algo1", label: "L2 — Computer Science — Group A", students: [
        { name: "Khaled Mansouri", regNo: "202612345683", status: "present" },
        { name: "Nour Djebbar", regNo: "202612345684", status: "present" },
      ]},
      { id: "algo2", label: "L2 — Computer Science — Group B", students: [
        { name: "Fatima Cherif", regNo: "202612345685", status: "present" },
        { name: "Amine Boudia", regNo: "202612345686", status: "absent" },
      ]},
      { id: "algo3", label: "L2 — Computer Science — Group C", students: [
        { name: "Rania Kaci", regNo: "202612345687", status: "present" },
      ]},
    ],
  },
];

// Teacher schedule to auto-detect current subject
const TEACHER_SCHEDULE = [
  { day: "Sunday", time: "08:00-09:30", subject: "Network", group: "L3 - Group A", room: "A101" },
  { day: "Sunday", time: "09:30-11:00", subject: "Network", group: "L3 - Group B", room: "A101" },
  { day: "Monday", time: "08:00-09:30", subject: "Algorithme", group: "L2 - Group A", room: "B205" },
  { day: "Monday", time: "09:30-11:00", subject: "Algorithme", group: "L2 - Group B", room: "B205" },
  { day: "Wednesday", time: "08:00-09:30", subject: "Algorithme", group: "L2 - Group C", room: "C302" },
  { day: "Wednesday", time: "09:30-11:00", subject: "Network", group: "L3 - Group A", room: "C302" },
];

// Debt students assigned to this teacher
interface DebtStudent {
  name: string;
  regNo: string;
  originalLevel: string;
  debtYear: string;
  debtSubject: string;
}

const DEBT_STUDENTS_FOR_TEACHER: Record<string, DebtStudent[]> = {
  "Network": [],
  "Algorithme": [
    { name: "Louay Chahdane", regNo: "202612345690", originalLevel: "L3", debtYear: "L1", debtSubject: "Algorithme" },
  ],
};

// Build teacher schedule grid for visual display
const buildTeacherScheduleGrid = (): ScheduleGrid => {
  const grid: ScheduleGrid = {};
  DAYS.forEach(day => { grid[day] = {}; TIME_SLOTS.forEach(slot => { grid[day][slot] = null; }); });
  TEACHER_SCHEDULE.forEach(s => {
    grid[s.day][s.time] = { course: s.subject, teacher: s.group, room: s.room, type: "tutorial" };
  });
  return grid;
};

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // Auto-detect current subject from schedule
  const currentSubject = useMemo(() => {
    const now = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[now.getDay()];
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTime = currentHour * 60 + currentMin;
    
    const todayClasses = TEACHER_SCHEDULE.filter(s => s.day === today);
    for (const cls of todayClasses) {
      const [start] = cls.time.split("-");
      const [sh, sm] = start.split(":").map(Number);
      const [end] = cls.time.split("-").slice(1);
      const [eh, em] = end.split(":").map(Number);
      if (currentTime >= sh * 60 + sm && currentTime <= eh * 60 + em) {
        return cls.subject;
      }
    }
    return TEACHER_COURSES[0]?.subject || null;
  }, []);

  // Attendance: subject-based
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [additionalGroups, setAdditionalGroups] = useState<string[]>([]);
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [showDebtStudents, setShowDebtStudents] = useState(false);

  const activeSubjectCourse = TEACHER_COURSES.find(c => c.subject === (selectedSubject || currentSubject));
  const allGroupsForSubject = activeSubjectCourse?.groups || [];

  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [debtAttendance, setDebtAttendance] = useState<Record<string, string>>({});

  const initAttendanceForGroup = (groupId: string) => {
    const group = allGroupsForSubject.find(g => g.id === groupId);
    if (group) {
      setAttendance(prev => {
        const next = { ...prev };
        group.students.forEach(s => { if (!(s.regNo in next)) next[s.regNo] = s.status; });
        return next;
      });
    }
  };

  const currentDebtStudents = selectedSubject ? (DEBT_STUDENTS_FOR_TEACHER[selectedSubject] || []) : [];
  const hasDebtStudents = currentDebtStudents.length > 0;

  const [justifications, setJustifications] = useState([
    { student: "Mohamed Saidi", course: "Network", date: "2026-03-01", reason: "Medical appointment", status: "pending", rejectReason: "" },
    { student: "Yacine Khelifi", course: "Network", date: "2026-02-25", reason: "Family emergency", status: "pending", rejectReason: "" },
    { student: "Amine Boudia", course: "Algorithme", date: "2026-02-20", reason: "Transport issue", status: "approved", rejectReason: "" },
  ]);

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; index: number; reason: string }>({ open: false, index: -1, reason: "" });

  const teacherAnnouncements = [
    { title: "Faculty Meeting March 10", type: "important" as const, date: "2026-03-03" },
  ];

  const [teacherJustForm, setTeacherJustForm] = useState({ date: "", course: "", reason: "" });
  const [teacherFile, setTeacherFile] = useState<File | null>(null);

  // Problem reporting
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [problemType, setProblemType] = useState("");
  const [problemGroup, setProblemGroup] = useState("");
  const [problemRoom, setProblemRoom] = useState("");
  const [problemDesc, setProblemDesc] = useState("");

  const handleSendProblem = () => {
    if (!problemType || !problemDesc) { toast.error("!"); return; }
    toast.success(t("problem_sent_success"));
    setShowProblemForm(false);
    setProblemType("");
    setProblemGroup("");
    setProblemRoom("");
    setProblemDesc("");
  };

  const allTeacherGroups = TEACHER_COURSES.flatMap(c => c.groups.map(g => ({ subject: c.subject, ...g })));

  // Schedule grid
  const [teacherScheduleGrid] = useState<ScheduleGrid>(buildTeacherScheduleGrid);

  // Viewing justification file
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  const cellColor = (type: string) => type === "lecture" ? "bg-blue-500/10 border-blue-500/30" : type === "lab" ? "bg-green-500/10 border-green-500/30" : type === "tutorial" ? "bg-orange-500/10 border-orange-500/30" : "";

  const toggleAttendance = (regNo: string) => {
    setAttendance(prev => ({ ...prev, [regNo]: prev[regNo] === "present" ? "absent" : "present" }));
  };

  const toggleDebtAttendance = (regNo: string) => {
    setDebtAttendance(prev => ({ ...prev, [regNo]: prev[regNo] === "present" ? "absent" : "present" }));
  };

  const handleSaveAttendance = () => {
    const subjectName = selectedSubject || currentSubject;
    const groupLabel = allGroupsForSubject.find(g => g.id === selectedGroup)?.label || "";
    toast.success(t("save_attendance") + " ✅", { description: `${subjectName} — ${groupLabel} — ${new Date().toLocaleDateString()}` });
  };

  const handleJustificationApprove = (index: number) => {
    setJustifications(prev => prev.map((j, i) => i === index ? { ...j, status: "approved" } : j));
    toast.success(t("approved") + " ✅");
  };

  const handleRejectConfirm = () => {
    if (!rejectDialog.reason.trim()) { toast.error(t("reason_for_rejection")); return; }
    setJustifications(prev => prev.map((j, i) => i === rejectDialog.index ? { ...j, status: "rejected", rejectReason: rejectDialog.reason } : j));
    toast.success(t("rejected"));
    setRejectDialog({ open: false, index: -1, reason: "" });
  };

  const handleTeacherJustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherJustForm.date || !teacherJustForm.course || !teacherJustForm.reason) { toast.error("!"); return; }
    toast.success("✅");
    setTeacherJustForm({ date: "", course: "", reason: "" });
    setTeacherFile(null);
  };

  const handleTeacherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setTeacherFile(file); toast.success(`"${file.name}"`); }
  };

  const statusBadge = (s: string) => {
    if (s === "present") return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success"><Check className="h-3 w-3" />{t("present")}</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive"><X className="h-3 w-3" />{t("absent")}</span>;
  };

  const justStatusBadge = (s: string) => {
    if (s === "approved") return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="h-3 w-3" />{t("approved")}</span>;
    if (s === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="h-3 w-3" />{t("rejected")}</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-warning"><AlertCircle className="h-3 w-3" />{t("pending")}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-accent" />
            <span className="font-bold text-foreground">UniAttend</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{t("teacher_portal")}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions />
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setShowAnnouncements(!showAnnouncements)}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              {teacherAnnouncements.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-1"><LogOut className="h-4 w-4" /> {t("logout")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {showAnnouncements && (
        <div className="fixed top-14 right-4 z-50 w-80 bg-card border rounded-xl shadow-elevated p-4 space-y-2">
          <h4 className="font-semibold text-card-foreground text-sm mb-2">{t("announcements")}</h4>
          {teacherAnnouncements.length > 0 ? teacherAnnouncements.map((a, i) => {
            const typeClass = a.type === "important" ? "border-l-4 border-l-warning bg-warning/5" : "border-l-4 border-l-primary bg-primary/5";
            return (
              <div key={i} className={`rounded-lg p-3 text-xs ${typeClass}`}>
                <p className="font-medium text-card-foreground">{a.title}</p>
                <p className="text-muted-foreground mt-1">{a.date}</p>
              </div>
            );
          }) : <p className="text-xs text-muted-foreground">—</p>}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("welcome_back")}, <span className="text-accent">Professor Amari</span></h1>
          <p className="text-muted-foreground text-sm mt-1">{t("department_cs")}</p>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview", label: t("overview"), icon: BarChart3 },
            { id: "attendance", label: t("mark_attendance"), icon: Clock },
            { id: "justifications", label: t("justifications"), icon: FileText },
            { id: "submit_justification", label: t("submit_justification"), icon: Upload },
            { id: "send_problem", label: t("send_problem"), icon: AlertTriangle },
            { id: "schedule", label: t("schedule"), icon: Calendar },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-accent text-accent-foreground shadow-card" : "text-muted-foreground hover:bg-muted"}`}>
              <tab.icon className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: t("my_courses"), value: String(TEACHER_COURSES.length), icon: BookOpen, color: "text-accent" },
                { label: t("total_students"), value: String(TEACHER_COURSES.reduce((sum, c) => sum + c.groups.reduce((gs, g) => gs + g.students.length, 0), 0)), icon: Users, color: "text-primary" },
                { label: t("todays_classes"), value: "2", icon: Clock, color: "text-info" },
                { label: t("pending_reviews"), value: String(justifications.filter(j => j.status === "pending").length), icon: FileText, color: "text-warning" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card rounded-xl border p-5 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!selectedSubject ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-card-foreground">{t("select_subject")}</h3>
                {currentSubject && (
                  <p className="text-xs text-muted-foreground bg-accent/10 rounded-lg px-3 py-2 inline-block">
                    📅 {t("current_subject")}: <span className="font-semibold text-accent">{currentSubject}</span>
                  </p>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TEACHER_COURSES.map(course => (
                    <button key={course.subject} onClick={() => { setSelectedSubject(course.subject); setSelectedGroup(null); setAdditionalGroups([]); setShowDebtStudents(false); }} className={`bg-card rounded-xl border p-5 shadow-card hover:shadow-elevated transition-all text-left group ${course.subject === currentSubject ? "border-accent/50 bg-accent/5" : ""}`}>
                      <BookOpen className="h-5 w-5 text-accent mb-2" />
                      <p className="font-medium text-card-foreground group-hover:text-accent transition-colors">{course.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">{course.groups.length} {t("group")}</p>
                      {course.subject === currentSubject && <span className="text-xs text-accent font-medium mt-1 block">📌 {t("current_subject")}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ) : !selectedGroup ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedSubject(null); }} className="gap-1 p-1 h-auto">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold text-card-foreground">{selectedSubject} — {t("select_group")}</h3>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allGroupsForSubject.map(g => (
                    <button key={g.id} onClick={() => { setSelectedGroup(g.id); initAttendanceForGroup(g.id); }} className="bg-card rounded-xl border p-5 shadow-card hover:shadow-elevated transition-all text-left group">
                      <Users className="h-5 w-5 text-accent mb-2" />
                      <p className="font-medium text-card-foreground group-hover:text-accent transition-colors">{g.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{g.students.length} {t("total_students")}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-xl border shadow-card overflow-hidden">
                <div className="p-5 border-b flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedGroup(null); setAdditionalGroups([]); setShowGroupSelector(false); setAttendance({}); setShowDebtStudents(false); setDebtAttendance({}); }} className="gap-1 p-1 h-auto">
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h3 className="font-semibold text-card-foreground">{t("mark_attendance")} — {selectedSubject}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {allGroupsForSubject.find(g => g.id === selectedGroup)?.label} — {new Date().toLocaleDateString()}
                      {additionalGroups.length > 0 && ` + ${additionalGroups.length} ${t("group")}`}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {hasDebtStudents && (
                      <Button size="sm" variant={showDebtStudents ? "default" : "outline"} onClick={() => {
                        setShowDebtStudents(!showDebtStudents);
                        if (!showDebtStudents) {
                          currentDebtStudents.forEach(ds => {
                            if (!(ds.regNo in debtAttendance)) setDebtAttendance(prev => ({ ...prev, [ds.regNo]: "absent" }));
                          });
                        }
                      }} className="gap-1 border-warning/30 text-warning hover:bg-warning/10">
                        {t("dett")} ({currentDebtStudents.length})
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setShowGroupSelector(!showGroupSelector)}>
                      <Plus className="h-3 w-3 mr-1" /> {t("add_group_makeup")}
                    </Button>
                    <Button size="sm" onClick={handleSaveAttendance}>{t("save_attendance")}</Button>
                  </div>
                </div>

                {showGroupSelector && (
                  <div className="p-4 border-b bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-2">{t("add_group_makeup_desc")}</p>
                    <div className="flex flex-wrap gap-2">
                      {allGroupsForSubject.filter(g => g.id !== selectedGroup && !additionalGroups.includes(g.id)).map(g => (
                        <Button key={g.id} variant="outline" size="sm" onClick={() => {
                          setAdditionalGroups(prev => [...prev, g.id]);
                          setAttendance(prev => {
                            const next = { ...prev };
                            g.students.forEach(s => { if (!(s.regNo in next)) next[s.regNo] = s.status; });
                            return next;
                          });
                        }}>
                          <Plus className="h-3 w-3 mr-1" /> {g.label}
                        </Button>
                      ))}
                      {additionalGroups.map(gId => {
                        const g = allGroupsForSubject.find(gr => gr.id === gId);
                        return g ? (
                          <span key={gId} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                            {g.label}
                            <button onClick={() => setAdditionalGroups(prev => prev.filter(id => id !== gId))} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Debt students section */}
                {showDebtStudents && currentDebtStudents.length > 0 && (
                  <div className="p-4 border-b bg-warning/5">
                    <h4 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" /> {t("dett")} — {selectedSubject}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead><tr className="bg-warning/10">
                          <th className="text-left p-2 font-medium text-muted-foreground">{t("student")}</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">{t("reg_number")}</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">{t("level")}</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">{t("dett_year")}</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">{t("status")}</th>
                          <th className="text-left p-2 font-medium text-muted-foreground">{t("action")}</th>
                        </tr></thead>
                        <tbody>
                          {currentDebtStudents.map(ds => (
                            <tr key={ds.regNo} className="border-t">
                              <td className="p-2 font-medium text-card-foreground">{ds.name}</td>
                              <td className="p-2 text-muted-foreground">{ds.regNo}</td>
                              <td className="p-2 text-muted-foreground">{ds.originalLevel}</td>
                              <td className="p-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">{ds.debtYear}</span></td>
                              <td className="p-2">{statusBadge(debtAttendance[ds.regNo] || "absent")}</td>
                              <td className="p-2"><Button variant="outline" size="sm" onClick={() => toggleDebtAttendance(ds.regNo)}>{t("toggle")}</Button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("student")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("reg_number")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("group")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("status")}</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">{t("action")}</th>
                    </tr></thead>
                    <tbody>
                      {[selectedGroup, ...additionalGroups].map(gId => {
                        const group = allGroupsForSubject.find(g => g.id === gId);
                        if (!group) return null;
                        return group.students.map((s) => (
                          <tr key={s.regNo} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-medium text-card-foreground">{s.name}</td>
                            <td className="p-3 text-muted-foreground">{s.regNo}</td>
                            <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent">{group.label.split(" — ").pop()}</span></td>
                            <td className="p-3">{statusBadge(attendance[s.regNo] || "present")}</td>
                            <td className="p-3"><Button variant="outline" size="sm" onClick={() => toggleAttendance(s.regNo)}>{t("toggle")}</Button></td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "justifications" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {rejectDialog.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-md mx-4">
                  <h3 className="font-semibold text-card-foreground mb-4">{t("reason_for_rejection")}</h3>
                  <Textarea placeholder={t("explain_rejection")} rows={4} value={rejectDialog.reason} onChange={(e) => setRejectDialog(prev => ({ ...prev, reason: e.target.value }))} />
                  <div className="flex gap-2 mt-4">
                    <Button variant="destructive" size="sm" onClick={handleRejectConfirm}>{t("confirm_reject")}</Button>
                    <Button variant="outline" size="sm" onClick={() => setRejectDialog({ open: false, index: -1, reason: "" })}>{t("cancel")}</Button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-card rounded-xl border shadow-card overflow-hidden">
              <div className="p-5 border-b"><h3 className="font-semibold text-card-foreground">{t("justifications")}</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("student")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("course")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("date")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("reason")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("attachment")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("status")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("actions")}</th>
                  </tr></thead>
                  <tbody>
                    {justifications.map((j, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-card-foreground">{j.student}</td>
                        <td className="p-3 text-muted-foreground">{j.course}</td>
                        <td className="p-3 text-muted-foreground">{j.date}</td>
                        <td className="p-3 text-muted-foreground">{j.reason}</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.info(`📎 ${t("view_attachment")}: justification_${j.student.replace(/\s/g, "_")}.pdf`)}>
                            <Paperclip className="h-3 w-3" /> {t("show_file")}
                          </Button>
                        </td>
                        <td className="p-3">
                          {justStatusBadge(j.status)}
                          {j.status === "rejected" && j.rejectReason && <p className="text-xs text-destructive mt-1">{t("reason")}: {j.rejectReason}</p>}
                        </td>
                        <td className="p-3">
                          {j.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="success" size="sm" onClick={() => handleJustificationApprove(i)}>{t("approve")}</Button>
                              <Button variant="destructive" size="sm" onClick={() => setRejectDialog({ open: true, index: i, reason: "" })}>{t("reject")}</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "submit_justification" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="font-semibold text-card-foreground mb-6">{t("submit_justification_teacher")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("submit_to_admin")}</p>
              <form onSubmit={handleTeacherJustSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("absence_date")} *</Label>
                    <Input type="date" value={teacherJustForm.date} onChange={(e) => setTeacherJustForm(prev => ({ ...prev, date: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("course_name")} *</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={teacherJustForm.course} onChange={(e) => setTeacherJustForm(prev => ({ ...prev, course: e.target.value }))} required>
                      <option value="">{t("select_course")}</option>
                      {TEACHER_COURSES.map(c => <option key={c.subject} value={c.subject}>{c.subject}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("reason_for_absence")} *</Label>
                  <Textarea placeholder={t("explain_reason")} rows={4} value={teacherJustForm.reason} onChange={(e) => setTeacherJustForm(prev => ({ ...prev, reason: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("attachment_optional")}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    {teacherFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <span className="text-sm text-foreground font-medium">{teacherFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setTeacherFile(null); }} className="p-1 rounded-full hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    ) : (
                      <><Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">{t("upload_pdf_jpg_png")}</p></>
                    )}
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleTeacherFileChange} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{t("submit_justification")}</Button>
                  <Button type="button" variant="outline" onClick={() => setActiveTab("overview")}>{t("cancel")}</Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {activeTab === "send_problem" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="font-semibold text-card-foreground mb-6">{t("send_problem")}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("type")} *</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={problemType} onChange={e => { setProblemType(e.target.value); setProblemGroup(""); setProblemRoom(""); }}>
                    <option value="">{t("select")}</option>
                    <option value="group_problem">{t("group_problem")}</option>
                    <option value="schedule_problem">{t("schedule_problem")}</option>
                    <option value="room_problem">{t("room_problem")}</option>
                  </select>
                </div>
                {problemType === "group_problem" && (
                  <div className="space-y-2">
                    <Label>{t("group")} *</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={problemGroup} onChange={e => setProblemGroup(e.target.value)}>
                      <option value="">{t("select")}</option>
                      {allTeacherGroups.map(g => <option key={g.id} value={g.label}>{g.subject} — {g.label}</option>)}
                    </select>
                  </div>
                )}
                {problemType === "room_problem" && (
                  <div className="space-y-2">
                    <Label>{t("room")} *</Label>
                    <Input placeholder={t("room")} value={problemRoom} onChange={e => setProblemRoom(e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{t("problem_description")} *</Label>
                  <Textarea placeholder={t("describe_problem")} rows={4} value={problemDesc} onChange={e => setProblemDesc(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSendProblem} className="gap-1"><Send className="h-4 w-4" /> {t("send")}</Button>
                  <Button variant="outline" onClick={() => setActiveTab("overview")}>{t("cancel")}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4">
              <h3 className="font-semibold text-card-foreground">{t("weekly_schedule_title")}</h3>
              <p className="text-xs text-muted-foreground">{t("department_cs")} — Professor Amari</p>
            </div>
            <div className="flex gap-3 mb-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500/30" /> {t("lecture")}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30" /> {t("lab")}</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-orange-500/30" /> {t("tutorial")}</span>
            </div>
            <div className="bg-card rounded-xl border shadow-card overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead><tr className="bg-muted/50">
                  <th className="p-2 border font-medium text-muted-foreground w-24">{t("day_time")}</th>
                  {TIME_SLOTS.map(slot => (<th key={slot} className="p-2 border font-medium text-muted-foreground whitespace-nowrap">{slot}</th>))}
                </tr></thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day}>
                      <td className="p-2 border font-medium text-card-foreground bg-muted/30">{day}</td>
                      {TIME_SLOTS.map(slot => {
                        const cell = teacherScheduleGrid[day]?.[slot];
                        return (
                          <td key={slot} className={`p-1 border min-w-[120px] align-top ${cell ? cellColor(cell.type) : ""}`}>
                            {cell ? (
                              <div className="p-1">
                                <p className="font-semibold text-card-foreground">{cell.course}</p>
                                <p className="text-muted-foreground">{cell.teacher}</p>
                                <p className="text-muted-foreground">{cell.room}</p>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
