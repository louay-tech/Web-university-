import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  GraduationCap, Clock, FileText, Bell, Calendar, 
  BarChart3, LogOut, ChevronRight, CheckCircle2, XCircle, AlertCircle, Upload, X, Plus
} from "lucide-react";
import { toast } from "sonner";
import HeaderActions from "@/components/HeaderActions";
import { useLanguage } from "@/contexts/LanguageContext";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = ["08:00-09:30", "09:30-11:00", "11:00-12:30", "12:30-14:00", "14:00-15:30", "15:30-17:00"];

interface ScheduleCell { course: string; teacher: string; room: string; type: "lecture" | "lab" | "tutorial"; }
type ScheduleGrid = Record<string, Record<string, ScheduleCell | null>>;

// Student's current info
const STUDENT_INFO = { name: "Ahmed", lastName: "Benali", regNo: "202612345678", specialty: "Computer Science", level: "L3", group: "A" };

// Debt subjects data: subjects the student owes from previous years
interface DebtSubject {
  year: string; // e.g. "L1", "L2", "M1"
  subject: string;
  teachers: { name: string; group: string }[]; // teachers teaching this subject at that year level
}

// Simulated debt info for the student
const STUDENT_DEBTS: DebtSubject[] = [
  { year: "L1", subject: "Analysis", teachers: [{ name: "Dr. Saidi", group: "L1 — Group A" }, { name: "Prof. Mansouri", group: "L1 — Group B" }] },
  { year: "L1", subject: "Algebra", teachers: [{ name: "Dr. Amari", group: "L1 — Group A" }] },
];

interface DebtRegistration {
  year: string;
  subject: string;
  teacher: string;
  teacherGroup: string;
}

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // Debt registration
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [debtYear, setDebtYear] = useState("");
  const [debtSubjects, setDebtSubjects] = useState<string[]>([]);
  const [debtTeacherSelections, setDebtTeacherSelections] = useState<Record<string, { teacher: string; group: string }>>({});
  const [debtRegistrations, setDebtRegistrations] = useState<DebtRegistration[]>([]);

  const availableDebtYears = [...new Set(STUDENT_DEBTS.map(d => d.year))];
  const availableSubjectsForYear = STUDENT_DEBTS.filter(d => d.year === debtYear);

  const handleDebtSubmit = () => {
    const registrations: DebtRegistration[] = [];
    for (const subj of debtSubjects) {
      const sel = debtTeacherSelections[subj];
      if (!sel) { toast.error(`${t("select")} ${t("teacher")} — ${subj}`); return; }
      registrations.push({ year: debtYear, subject: subj, teacher: sel.teacher, teacherGroup: sel.group });
    }
    setDebtRegistrations(prev => [...prev, ...registrations]);
    toast.success("🟢 ✅");
    setShowDebtForm(false);
    setDebtYear("");
    setDebtSubjects([]);
    setDebtTeacherSelections({});
  };

  const [absences] = useState([
    { course: "Mathematics", date: "2026-03-01", status: "Absent", justification: "Pending" },
    { course: "Physics", date: "2026-02-25", status: "Absent", justification: "Approved" },
    { course: "Database", date: "2026-02-20", status: "Absent", justification: "Rejected" },
    { course: "Networks", date: "2026-02-15", status: "Absent", justification: "Approved" },
  ]);

  const [scheduleGrid] = useState<ScheduleGrid>(() => {
    const grid: ScheduleGrid = {};
    DAYS.forEach(day => { grid[day] = {}; TIME_SLOTS.forEach(slot => { grid[day][slot] = null; }); });
    grid["Sunday"]["08:00-09:30"] = { course: "Mathematics", teacher: "Dr. Amari", room: "A101", type: "lecture" };
    grid["Sunday"]["09:30-11:00"] = { course: "Physics", teacher: "Dr. Benali", room: "B205", type: "lecture" };
    grid["Monday"]["08:00-09:30"] = { course: "Database", teacher: "Prof. Hadj", room: "C302", type: "lab" };
    grid["Monday"]["09:30-11:00"] = { course: "Networks", teacher: "Dr. Saidi", room: "D104", type: "tutorial" };
    grid["Tuesday"]["08:00-09:30"] = { course: "Algorithms", teacher: "Dr. Amari", room: "A101", type: "lecture" };
    grid["Wednesday"]["09:30-11:00"] = { course: "English", teacher: "Ms. Meriem", room: "E201", type: "tutorial" };
    return grid;
  });

  const cellColor = (type: string) => type === "lecture" ? "bg-blue-500/10 border-blue-500/30" : type === "lab" ? "bg-green-500/10 border-green-500/30" : type === "tutorial" ? "bg-orange-500/10 border-orange-500/30" : "";

  const announcements = [
    { title: "Exam Schedule Updated", type: "urgent" as const, date: "2026-03-05", target: "Computer Science — L3 — Group A" },
    { title: "Library Hours Extended", type: "normal" as const, date: "2026-03-04", target: "All — All" },
    { title: "Workshop: AI in Education", type: "important" as const, date: "2026-03-03", target: "Computer Science — L3" },
  ];

  const [justForm, setJustForm] = useState({ date: "", course: "", reason: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmitJustification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!justForm.date || !justForm.course || !justForm.reason) {
      toast.error(t("cancel"));
      return;
    }
    toast.success("✅");
    setJustForm({ date: "", course: "", reason: "" });
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
      if (!allowed.includes(ext)) { toast.error("PDF, JPG, PNG only"); return; }
      setSelectedFile(file);
      toast.success(`"${file.name}"`);
    }
  };

  const justStatus = (s: string) => {
    if (s === "Approved") return <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="h-3 w-3" />{t("approved")}</span>;
    if (s === "Rejected") return <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive"><XCircle className="h-3 w-3" />{t("rejected")}</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-warning"><AlertCircle className="h-3 w-3" />{t("pending")}</span>;
  };

  const announcementColor = (type: string) => {
    if (type === "urgent") return "border-l-4 border-l-destructive bg-destructive/5";
    if (type === "important") return "border-l-4 border-l-warning bg-warning/5";
    return "border-l-4 border-l-primary bg-primary/5";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">UniAttend</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{t("student_portal")}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions />
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setShowAnnouncements(!showAnnouncements)}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-1">
                <LogOut className="h-4 w-4" /> {t("logout")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {showAnnouncements && (
        <div className="fixed top-14 right-4 z-50 w-80 bg-card border rounded-xl shadow-elevated p-4 space-y-2">
          <h4 className="font-semibold text-card-foreground text-sm mb-2">{t("announcements")}</h4>
          {announcements.map((a, i) => (
            <div key={i} className={`rounded-lg p-3 text-xs ${announcementColor(a.type)}`}>
              <p className="font-medium text-card-foreground">{a.title}</p>
              <p className="text-muted-foreground mt-1">{a.date}</p>
            </div>
          ))}
          <button onClick={() => { setShowAnnouncements(false); setActiveTab("announcements"); }} className="text-xs text-primary hover:underline w-full text-center mt-2">
            {t("view_announcements")}
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("welcome_back")}, <span className="text-primary">{STUDENT_INFO.name}</span></h1>
          <p className="text-muted-foreground text-sm mt-1">{t("computer_science")} — {STUDENT_INFO.level} — {t("group")} {STUDENT_INFO.group}</p>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: "overview", label: t("overview"), icon: BarChart3 },
            { id: "attendance", label: t("attendance"), icon: Clock },
            { id: "justification", label: t("submit_justification"), icon: FileText },
            { id: "schedule", label: t("schedule"), icon: Calendar },
            { id: "announcements", label: t("announcements"), icon: Bell },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-primary-foreground shadow-card" : "text-muted-foreground hover:bg-muted"}`}>
              <tab.icon className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: t("total_classes"), value: "48", icon: Clock, color: "text-primary" },
                { label: t("total_absences"), value: "4", icon: XCircle, color: "text-destructive" },
                { label: t("attendance_rate"), value: "91.7%", icon: BarChart3, color: "text-success" },
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                { label: t("attendance_history"), icon: Clock, onClick: () => setActiveTab("attendance") },
                { label: t("submit_justification"), icon: FileText, onClick: () => setActiveTab("justification") },
                { label: t("view_announcements"), icon: Bell, onClick: () => setActiveTab("announcements") },
                { label: t("open_schedule"), icon: Calendar, onClick: () => setActiveTab("schedule") },
              ].map((action) => (
                <button key={action.label} onClick={action.onClick} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all duration-200 text-left group">
                  <action.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{action.label}</p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                </button>
              ))}
            </div>

            {/* Add Dett button */}
            {STUDENT_DEBTS.length > 0 && (
              <div className="mb-8">
                <Button variant="outline" onClick={() => setShowDebtForm(true)} className="gap-2 border-warning/30 text-warning hover:bg-warning/10">
                  <Plus className="h-4 w-4" /> {t("add_dett")}
                </Button>
              </div>
            )}

            {/* Debt registrations display */}
            {debtRegistrations.length > 0 && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 mb-8">
                <h4 className="font-semibold text-card-foreground text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-warning" /> {t("dett_registrations")}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/50">
                      <th className="text-left p-2 font-medium text-muted-foreground">{t("dett_year")}</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">{t("subject")}</th>
                      <th className="text-left p-2 font-medium text-muted-foreground">{t("teacher")}</th>
                    </tr></thead>
                    <tbody>
                      {debtRegistrations.map((d, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 text-card-foreground">{d.year}</td>
                          <td className="p-2 text-card-foreground">{d.subject}</td>
                          <td className="p-2 text-muted-foreground">{d.teacher} ({d.teacherGroup})</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Debt form modal */}
            {showDebtForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-card-foreground">{t("add_dett")}</h3>
                    <button onClick={() => setShowDebtForm(false)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
                  </div>

                  {/* Year selection */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs">{t("dett_year")} *</Label>
                      <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={debtYear} onChange={e => { setDebtYear(e.target.value); setDebtSubjects([]); setDebtTeacherSelections({}); }}>
                        <option value="">{t("select")}</option>
                        {availableDebtYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    {/* Subject selection (multi) */}
                    {debtYear && (
                      <div className="space-y-1">
                        <Label className="text-xs">{t("dett_subjects")} *</Label>
                        <div className="space-y-2">
                          {availableSubjectsForYear.map(d => (
                            <label key={d.subject} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 cursor-pointer">
                              <input type="checkbox" checked={debtSubjects.includes(d.subject)} onChange={e => {
                                if (e.target.checked) setDebtSubjects(prev => [...prev, d.subject]);
                                else {
                                  setDebtSubjects(prev => prev.filter(s => s !== d.subject));
                                  setDebtTeacherSelections(prev => { const n = { ...prev }; delete n[d.subject]; return n; });
                                }
                              }} className="rounded" />
                              <span className="text-sm text-card-foreground">{d.subject}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teacher selection per subject */}
                    {debtSubjects.map(subj => {
                      const debtInfo = STUDENT_DEBTS.find(d => d.year === debtYear && d.subject === subj);
                      if (!debtInfo) return null;
                      return (
                        <div key={subj} className="space-y-1">
                          <Label className="text-xs">{t("teacher")} — {subj} *</Label>
                          <div className="space-y-1">
                            {debtInfo.teachers.map(tc => (
                              <label key={tc.name} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${debtTeacherSelections[subj]?.teacher === tc.name ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                                <input type="radio" name={`teacher-${subj}`} checked={debtTeacherSelections[subj]?.teacher === tc.name} onChange={() => setDebtTeacherSelections(prev => ({ ...prev, [subj]: { teacher: tc.name, group: tc.group } }))} />
                                <div>
                                  <span className="text-sm text-card-foreground font-medium">{tc.name}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({tc.group})</span>
                                  <p className="text-xs text-muted-foreground">{subj}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    <Button onClick={handleDebtSubmit} disabled={!debtYear || debtSubjects.length === 0} className="w-full">{t("send")}</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border shadow-card overflow-hidden">
              <div className="p-5 border-b"><h3 className="font-semibold text-card-foreground">{t("recent_absences")}</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("course")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("date")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("status")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("justification_status")}</th>
                  </tr></thead>
                  <tbody>
                    {absences.map((a, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-card-foreground font-medium">{a.course}</td>
                        <td className="p-3 text-muted-foreground">{a.date}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">{t("absent")}</span></td>
                        <td className="p-3">{justStatus(a.justification)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "attendance" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card rounded-xl border shadow-card overflow-hidden">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-semibold text-card-foreground">{t("attendance_history")}</h3>
                <Button variant="outline" size="sm">{t("export")}</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("course")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("date")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("status")}</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">{t("justification_status")}</th>
                  </tr></thead>
                  <tbody>
                    {absences.map((a, i) => (
                      <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-card-foreground font-medium">{a.course}</td>
                        <td className="p-3 text-muted-foreground">{a.date}</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">{t("absent")}</span></td>
                        <td className="p-3">{justStatus(a.justification)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "justification" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-card rounded-xl border shadow-card p-6">
              <h3 className="font-semibold text-card-foreground mb-6">{t("submit_justification")}</h3>
              <form onSubmit={handleSubmitJustification} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("absence_date")} *</Label>
                    <Input type="date" value={justForm.date} onChange={(e) => setJustForm(prev => ({ ...prev, date: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("course_name")} *</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={justForm.course} onChange={(e) => setJustForm(prev => ({ ...prev, course: e.target.value }))} required>
                      <option value="">{t("select_course")}</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Physics">Physics</option>
                      <option value="Database">Database</option>
                      <option value="Networks">Networks</option>
                      <option value="Algorithms">Algorithms</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("reason_for_absence")} *</Label>
                  <Textarea placeholder={t("explain_reason")} rows={4} value={justForm.reason} onChange={(e) => setJustForm(prev => ({ ...prev, reason: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>{t("attachment_optional")}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <span className="text-sm text-foreground font-medium">{selectedFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }} className="p-1 rounded-full hover:bg-muted"><X className="h-4 w-4 text-muted-foreground" /></button>
                      </div>
                    ) : (
                      <><Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">{t("upload_pdf_jpg_png")}</p></>
                    )}
                    <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
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

        {activeTab === "schedule" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mb-4">
              <h3 className="font-semibold text-card-foreground">{t("weekly_schedule_title")}</h3>
              <p className="text-xs text-muted-foreground">{t("computer_science")} — {STUDENT_INFO.level} — {t("group")} {STUDENT_INFO.group}</p>
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
                        const cell = scheduleGrid[day]?.[slot];
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

        {activeTab === "announcements" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <h3 className="font-semibold text-card-foreground mb-4">{t("announcements")}</h3>
            {announcements.map((a, i) => (
              <div key={i} className={`rounded-xl border p-5 shadow-card ${announcementColor(a.type)}`}>
                <h4 className="font-semibold text-card-foreground">{a.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{t("target")}: {a.target} • {a.date}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
