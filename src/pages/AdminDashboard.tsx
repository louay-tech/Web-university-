import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck, Users, BookOpen, Clock, FileText, Bell, Calendar,
  BarChart3, LogOut, GraduationCap, Megaphone, Plus, TrendingUp,
  ArrowLeft, Download, Search, Edit, Trash2, MessageSquare, Eye, Save, AlertTriangle, X, UserPlus, Paperclip, Upload, ScanLine, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import HeaderActions from "@/components/HeaderActions";
import { useLanguage } from "@/contexts/LanguageContext";

interface Student { name: string; lastName: string; regNo: string; specialty: string; level: string; group: string; birthDate: string; birthPlace: string; email?: string; }
interface Teacher { name: string; email: string; dept: string; courses: number; }
interface PendingStudent { firstName: string; lastName: string; specialty: string; level: string; group: string; regNo: string; birthDate: string; birthPlace: string; email: string; }
interface PendingTeacher { name: string; email: string; department: string; password: string; }
interface PendingAdmin { firstName: string; lastName: string; birthDate: string; birthPlace: string; regNo: string; department: string; email: string; }
interface DebtRequest { studentName: string; regNo: string; specialty: string; level: string; debtYear: string; subjects: { name: string; teacher: string }[]; status: "pending" | "approved"; }
interface ScheduleCell { course: string; teacher: string; room: string; type: "lecture" | "lab" | "tutorial"; }
type ScheduleGrid = Record<string, Record<string, ScheduleCell | null>>;

const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Economics", "Biology"];
const YEARS = ["Year 1", "Year 2", "Year 3", "Master 1", "Master 2"];
const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const TIME_SLOTS = ["08:00-09:30", "09:30-11:00", "11:00-12:30", "12:30-14:00", "14:00-15:30", "15:30-17:00"];
const SPECIALTIES = ["Computer Science", "Mathematics", "Physics", "Economics", "Biology", "Chemistry", "English"];
const YEAR_OPTIONS = ["L1", "L2", "L3", "M1", "M2"];

const GROUPS_MAP: Record<string, Record<string, string[]>> = {
  "Computer Science": { "L1": ["A", "B"], "L2": ["A", "B"], "L3": ["A", "B", "C"], "M1": ["A"], "M2": ["A"] },
  "Mathematics": { "L1": ["A", "B"], "L2": ["A", "B"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Physics": { "L1": ["A", "B"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Economics": { "L1": ["A"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Biology": { "L1": ["A", "B"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Chemistry": { "L1": ["A"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "English": { "L1": ["A"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [manageView, setManageView] = useState<string | null>(null);
  const { t } = useLanguage();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const barData = [
    { name: "L1", attendance: 88 }, { name: "L2", attendance: 82 },
    { name: "L3", attendance: 91 }, { name: "M1", attendance: 95 }, { name: "M2", attendance: 89 },
  ];
  const pieData = [
    { name: t("present"), value: 90, color: "hsl(152, 60%, 40%)" },
    { name: t("absent"), value: 10, color: "hsl(0, 72%, 51%)" },
  ];

  const [announcements, setAnnouncements] = useState([
    { title: "Exam Period Starts March 15", type: "urgent", audience: "students", target: "All — All — All", date: "2026-03-05" },
    { title: "New Library Resources Available", type: "normal", audience: "students", target: "Computer Science — L3 — Group A", date: "2026-03-04" },
    { title: "Faculty Meeting March 10", type: "important", audience: "teachers", target: "All — All — All", date: "2026-03-03" },
  ]);

  const [annAudience, setAnnAudience] = useState<"students" | "teachers" | null>(null);
  const [annForm, setAnnForm] = useState({ title: "", type: "normal", specialty: "", year: "", group: "", message: "" });
  const [teacherSearchAnn, setTeacherSearchAnn] = useState("");
  const [selectedTeacherAnn, setSelectedTeacherAnn] = useState<Teacher | null>(null);
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);

  const [studentsData, setStudentsData] = useState<Student[]>([
    { name: "Ahmed", lastName: "Benali", regNo: "STU2024001", specialty: "Computer Science", level: "L3", group: "A", birthDate: "2000-05-15", birthPlace: "Mila" },
    { name: "Sara", lastName: "Hadj", regNo: "STU2024002", specialty: "Computer Science", level: "L3", group: "A", birthDate: "2001-03-20", birthPlace: "Constantine" },
    { name: "Mohamed", lastName: "Saidi", regNo: "STU2024003", specialty: "Mathematics", level: "L2", group: "B", birthDate: "1999-11-10", birthPlace: "Setif" },
    { name: "Amina", lastName: "Bouzid", regNo: "STU2024004", specialty: "Physics", level: "M1", group: "A", birthDate: "2000-07-22", birthPlace: "Mila" },
  ]);
  const [studentSearch, setStudentSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<Student>({ name: "", lastName: "", regNo: "", specialty: "", level: "", group: "", birthDate: "", birthPlace: "" });
  const [duplicatesFound, setDuplicatesFound] = useState<{ regNo: string; students: Student[] }[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showUnintegratedStudents, setShowUnintegratedStudents] = useState(false);

  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([
    { firstName: "Louay", lastName: "Chahdane", specialty: "Computer Science", level: "L3", group: "A", regNo: "STU2024010", birthDate: "2001-06-15", birthPlace: "Mila", email: "louay.chahdane.etu@centre-univ-mila.dz" },
  ]);
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([
    { name: "Dr. Mebarki", email: "mebarki@univ-mila.dz", department: "Computer Science", password: "mebarki123" },
  ]);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [showUnintegratedTeachers, setShowUnintegratedTeachers] = useState(false);
  const [showUnintegratedAdmins, setShowUnintegratedAdmins] = useState(false);

  // Debt management
  const [debtRequests, setDebtRequests] = useState<DebtRequest[]>([
    { studentName: "Louay Chahdane", regNo: "202612345690", specialty: "Computer Science", level: "L3", debtYear: "L1", subjects: [{ name: "Analysis", teacher: "Dr. Saidi" }, { name: "Algebra", teacher: "Dr. Amari" }], status: "pending" },
  ]);
  const [showDebtManagement, setShowDebtManagement] = useState(false);

  const [teachersData, setTeachersData] = useState<Teacher[]>([
    { name: "Dr. Amari", email: "amari@univ-mila.dz", dept: "Computer Science", courses: 4 },
    { name: "Dr. Benali", email: "benali@univ-mila.dz", dept: "Physics", courses: 3 },
    { name: "Prof. Hadj", email: "hadj@univ-mila.dz", dept: "Mathematics", courses: 5 },
  ]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [newTeacher, setNewTeacher] = useState<Teacher>({ name: "", email: "", dept: "", courses: 0 });
  const filteredTeachersAnn = teachersData.filter(tc =>
    tc.name.toLowerCase().includes(teacherSearchAnn.toLowerCase()) || tc.email.toLowerCase().includes(teacherSearchAnn.toLowerCase())
  );

  // Schedules
  const [scheduleDept, setScheduleDept] = useState<string | null>(null);
  const [scheduleYear, setScheduleYear] = useState<string | null>(null);
  const [scheduleGroup, setScheduleGroup] = useState<string | null>(null);
  const [scheduleSpecialty, setScheduleSpecialty] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [addingSchedule, setAddingSchedule] = useState(false);
  const [newScheduleInfo, setNewScheduleInfo] = useState({ department: "", specialty: "", year: "", group: "" });
  const [scheduleGrid, setScheduleGrid] = useState<ScheduleGrid>(() => {
    const grid: ScheduleGrid = {};
    DAYS.forEach(day => { grid[day] = {}; TIME_SLOTS.forEach(slot => { grid[day][slot] = null; }); });
    grid["Sunday"]["08:00-09:30"] = { course: "Programming", teacher: "Prof. Ahmed", room: "Room 23", type: "lecture" };
    grid["Sunday"]["09:30-11:00"] = { course: "Database Lab", teacher: "Dr. Benali", room: "Lab 3", type: "lab" };
    grid["Monday"]["08:00-09:30"] = { course: "Algorithms TD", teacher: "Dr. Amari", room: "Room 15", type: "tutorial" };
    grid["Tuesday"]["11:00-12:30"] = { course: "Networks", teacher: "Prof. Hadj", room: "Amphi A", type: "lecture" };
    return grid;
  });

  const [reportPreview, setReportPreview] = useState<string | null>(null);

  const [supportRequests, setSupportRequests] = useState([
    { id: 1, subject: "Justification Review", from: "Ahmed Benali", type: "Student", date: "2026-03-06", status: "open", details: "Student submitted medical certificate for absence on 2026-03-01. Teacher rejected with reason: 'Document not certified by university health center.'", attachment: "medical_cert.pdf" },
    { id: 2, subject: "Schedule Conflict", from: "Dr. Amari", type: "Teacher", date: "2026-03-05", status: "open", details: "Two classes scheduled at the same time on Monday 08:00-09:30 in different rooms.", attachment: null },
    { id: 3, subject: "Grade Issue", from: "Sara Hadj", type: "Student", date: "2026-03-04", status: "resolved", details: "Student reports incorrect grade in Mathematics module.", attachment: null },
    { id: 4, subject: "Account Access Request", from: "Louay Chahdane", type: "Student", date: "2026-03-07", status: "open", details: "New student requesting account access. Registration number: STU2024010, Email: louay.chahdane.etu@centre-univ-mila.dz", attachment: null, requestType: "student_registration" },
    { id: 5, subject: "Account Access Request", from: "Dr. Mebarki", type: "Teacher", date: "2026-03-07", status: "open", details: "New teacher requesting platform access. Email: mebarki@univ-mila.dz, Department: Computer Science", attachment: null, requestType: "teacher_registration" },
  ]);
  const [viewingSupport, setViewingSupport] = useState<typeof supportRequests[0] | null>(null);

  const newStudentGroups = GROUPS_MAP[newStudent.specialty]?.[newStudent.level] || [];
  const editStudentGroups = editingStudent ? (GROUPS_MAP[editingStudent.specialty]?.[editingStudent.level] || []) : [];

  const handleAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.message || !annAudience) { toast.error("!"); return; }
    const targetStr = `${annForm.specialty || t("all_specialties")} — ${annForm.year || t("all_years")} — ${annForm.group || t("all_groups")}`;
    setAnnouncements(prev => [{ title: annForm.title, type: annForm.type, audience: annAudience, target: targetStr, date: new Date().toISOString().split("T")[0] }, ...prev]);
    if (annForm.type === "urgent" || annForm.type === "important") {
      toast.success("📧 Email notification sent!");
    }
    toast.success(t("publish") + " ✅");
    setShowAnnouncementForm(false);
    setAnnAudience(null);
    setAnnForm({ title: "", type: "normal", specialty: "", year: "", group: "", message: "" });
  };

  const handleExportReport = (type: string) => toast.success(`${type} ✅`);

  const findDuplicates = () => {
    const seen = new Map<string, Student[]>();
    studentsData.forEach(s => { if (!seen.has(s.regNo)) seen.set(s.regNo, []); seen.get(s.regNo)!.push(s); });
    const dupes = Array.from(seen.entries()).filter(([, v]) => v.length > 1).map(([regNo, students]) => ({ regNo, students }));
    setDuplicatesFound(dupes);
    setShowDuplicates(true);
    if (dupes.length === 0) toast.success(t("no_duplicates_found") || "No duplicates found");
  };

  const filteredStudents = studentsData.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.lastName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.regNo.toLowerCase().includes(studentSearch.toLowerCase()) || s.specialty.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const handleDeleteStudent = (regNo: string) => { setStudentsData(prev => prev.filter(s => s.regNo !== regNo)); toast.success("✅"); };
  const handleSaveEditStudent = () => { if (!editingStudent) return; setStudentsData(prev => prev.map(s => s.regNo === editingStudent.regNo ? editingStudent : s)); setEditingStudent(null); toast.success("✅"); };
  const handleAddStudent = () => {
    if (!newStudent.name || !newStudent.lastName || !newStudent.regNo) { toast.error("!"); return; }
    setStudentsData(prev => [...prev, newStudent]); setNewStudent({ name: "", lastName: "", regNo: "", specialty: "", level: "", group: "", birthDate: "", birthPlace: "" }); setAddingStudent(false); toast.success("✅");
  };

  const handleAddPendingStudent = (ps: PendingStudent) => {
    const autoRegNo = ps.regNo;
    const autoPassword = `pass${autoRegNo.slice(-4)}`;
    setStudentsData(prev => [...prev, { name: ps.firstName, lastName: ps.lastName, regNo: autoRegNo, specialty: ps.specialty, level: ps.level, group: ps.group, birthDate: ps.birthDate, birthPlace: ps.birthPlace, email: ps.email }]);
    setPendingStudents(prev => prev.filter(p => p.regNo !== ps.regNo));
    // Auto-resolve related support request
    setSupportRequests(prev => prev.map(s => (s as any).requestType === "student_registration" && s.from === `${ps.firstName} ${ps.lastName}` ? { ...s, status: "resolved" } : s));
    toast.success(`✅ ${t("added")} ${ps.firstName} ${ps.lastName} — 📧 ${ps.email} — 🔑 ${autoRegNo} / ${autoPassword}`);
  };

  const handleAddPendingTeacher = (pt: PendingTeacher) => {
    setTeachersData(prev => [...prev, { name: pt.name, email: pt.email, dept: pt.department, courses: 0 }]);
    setPendingTeachers(prev => prev.filter(p => p.email !== pt.email));
    // Auto-resolve related support request
    setSupportRequests(prev => prev.map(s => (s as any).requestType === "teacher_registration" && s.from === pt.name ? { ...s, status: "resolved" } : s));
    toast.success(`✅ ${t("added")} ${pt.name} — 📧 ${pt.email}`);
  };

  const handleAddPendingAdmin = (pa: PendingAdmin) => {
    setPendingAdmins(prev => prev.filter(p => p.email !== pa.email));
    // Auto-resolve related support request
    setSupportRequests(prev => prev.map(s => (s as any).requestType === "admin_registration" && s.from === `${pa.firstName} ${pa.lastName}` ? { ...s, status: "resolved" } : s));
    toast.success(`✅ ${t("added")} ${pa.firstName} ${pa.lastName} — 📧 ${pa.email} — ${t("department")}: ${pa.department}`);
  };

  const filteredTeachers = teachersData.filter(tc =>
    tc.name.toLowerCase().includes(teacherSearch.toLowerCase()) || tc.email.toLowerCase().includes(teacherSearch.toLowerCase()) || tc.dept.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const handleDeleteTeacher = (email: string) => { setTeachersData(prev => prev.filter(tc => tc.email !== email)); toast.success("✅"); };
  const handleSaveEditTeacher = () => { if (!editingTeacher) return; setTeachersData(prev => prev.map(tc => tc.email === editingTeacher.email ? editingTeacher : tc)); setEditingTeacher(null); toast.success("✅"); };
  const handleAddTeacher = () => {
    if (!newTeacher.name || !newTeacher.email) { toast.error("!"); return; }
    setTeachersData(prev => [...prev, newTeacher]); setNewTeacher({ name: "", email: "", dept: "", courses: 0 }); setAddingTeacher(false); toast.success("✅");
  };

  const handleApproveDebt = (regNo: string) => {
    setDebtRequests(prev => prev.map(d => d.regNo === regNo ? { ...d, status: "approved" as const } : d));
    toast.success("✅ " + t("approved"));
  };

  const handleCellEdit = (day: string, slot: string, field: keyof ScheduleCell, value: string) => {
    setScheduleGrid(prev => {
      const newGrid = { ...prev }; newGrid[day] = { ...newGrid[day] };
      if (!newGrid[day][slot]) newGrid[day][slot] = { course: "", teacher: "", room: "", type: "lecture" };
      (newGrid[day][slot] as any)[field] = value; return newGrid;
    });
  };
  const handleDeleteCell = (day: string, slot: string) => { setScheduleGrid(prev => { const g = { ...prev }; g[day] = { ...g[day] }; g[day][slot] = null; return g; }); };
  const cellColor = (type: string) => type === "lecture" ? "bg-blue-500/10 border-blue-500/30" : type === "lab" ? "bg-green-500/10 border-green-500/30" : type === "tutorial" ? "bg-orange-500/10 border-orange-500/30" : "";

  const handlePdfScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("PDF only!"); return;
    }
    toast.info(`📄 ${t("scanning_pdf")}: ${file.name}...`);
    
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let allText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        allText += pageText + "\n";
      }
      
      // Parse timetable from text
      const newGrid: ScheduleGrid = {};
      DAYS.forEach(day => { newGrid[day] = {}; TIME_SLOTS.forEach(slot => { newGrid[day][slot] = null; }); });
      
      // Try to detect structure from PDF text
      const lines = allText.split("\n").filter(l => l.trim().length > 0);
      const dayMap: Record<string, string> = {
        "saturday": "Saturday", "samedi": "Saturday", "السبت": "Saturday",
        "sunday": "Sunday", "dimanche": "Sunday", "الأحد": "Sunday",
        "monday": "Monday", "lundi": "Monday", "الاثنين": "Monday",
        "tuesday": "Tuesday", "mardi": "Tuesday", "الثلاثاء": "Tuesday",
        "wednesday": "Wednesday", "mercredi": "Wednesday", "الأربعاء": "Wednesday",
        "thursday": "Thursday", "jeudi": "Thursday", "الخميس": "Thursday",
      };
      
      let currentDay = "";
      let currentSlotIdx = 0;
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase().trim();
        
        // Check if line is a day
        for (const [key, val] of Object.entries(dayMap)) {
          if (lowerLine.includes(key)) {
            currentDay = val;
            currentSlotIdx = 0;
            break;
          }
        }
        
        // Check for time slots
        for (let si = 0; si < TIME_SLOTS.length; si++) {
          if (line.includes(TIME_SLOTS[si]) || line.includes(TIME_SLOTS[si].replace("-", " - "))) {
            currentSlotIdx = si;
            break;
          }
        }
        
        // Try to extract course info (look for patterns with room numbers, teacher names)
        if (currentDay && line.trim().length > 3) {
          const roomMatch = line.match(/(?:room|salle|قاعة|amphi|lab)\s*[:\-]?\s*(\S+)/i) || line.match(/((?:Room|Salle|Lab|Amphi)\s*\w+)/i);
          const hasSubjectContent = line.length > 5 && !Object.keys(dayMap).some(d => lowerLine === d);
          
          if (hasSubjectContent && !TIME_SLOTS.some(s => line.trim() === s)) {
            const parts = line.split(/[,;|\t]+/).map(p => p.trim()).filter(p => p.length > 0);
            if (parts.length >= 1 && currentSlotIdx < TIME_SLOTS.length) {
              const slot = TIME_SLOTS[currentSlotIdx];
              if (!newGrid[currentDay][slot]) {
                const courseName = parts[0] || "";
                const teacherName = parts.length > 1 ? parts[1] : "";
                const roomName = roomMatch ? roomMatch[1] : (parts.length > 2 ? parts[2] : "");
                const typeGuess = lowerLine.includes("tp") || lowerLine.includes("lab") ? "lab" 
                  : lowerLine.includes("td") || lowerLine.includes("tutorial") ? "tutorial" 
                  : "lecture";
                
                if (courseName && courseName.length > 2) {
                  newGrid[currentDay][slot] = {
                    course: courseName,
                    teacher: teacherName,
                    room: roomName,
                    type: typeGuess as "lecture" | "lab" | "tutorial"
                  };
                  currentSlotIdx++;
                }
              }
            }
          }
        }
      }
      
      // Check if we extracted anything
      const hasContent = DAYS.some(d => TIME_SLOTS.some(s => newGrid[d][s] !== null));
      
      if (hasContent) {
        setScheduleGrid(newGrid);
        toast.success(`✅ ${t("pdf_scan_success")}`);
      } else {
        // Fallback: put text content as notes and create a basic grid
        toast.warning(t("pdf_scan_partial"));
        // Still set an empty grid so user can edit manually
        setScheduleGrid(newGrid);
        setEditMode(true);
      }
    } catch (err) {
      console.error("PDF parsing error:", err);
      toast.error(t("pdf_scan_error"));
    }
    
    if (pdfInputRef.current) pdfInputRef.current.value = "";
  };

  const handleResolveSupport = (id: number) => {
    const req = supportRequests.find(s => s.id === id);
    if (!req) return;
    if ((req as any).requestType === "student_registration") {
      setManageView("students");
      setShowUnintegratedStudents(true);
      return;
    }
    if ((req as any).requestType === "teacher_registration") {
      setManageView("teachers");
      setShowUnintegratedTeachers(true);
      return;
    }
    if ((req as any).requestType === "admin_registration") {
      setShowUnintegratedAdmins(true);
      return;
    }
    setViewingSupport(req);
  };
  const confirmResolve = (id: number) => { setSupportRequests(prev => prev.map(s => s.id === id ? { ...s, status: "resolved" } : s)); setViewingSupport(null); toast.success("✅"); };

  const BackButton = () => (
    <Button variant="ghost" size="sm" onClick={() => { setManageView(null); setEditingStudent(null); setAddingStudent(false); setEditingTeacher(null); setAddingTeacher(false); setShowUnintegratedStudents(false); setShowUnintegratedTeachers(false); setShowUnintegratedAdmins(false); setScheduleDept(null); setScheduleYear(null); setScheduleGroup(null); setScheduleSpecialty(null); setAddingSchedule(false); setShowDebtManagement(false); }} className="mb-4 gap-1">
      <ArrowLeft className="h-4 w-4" /> {t("back")}
    </Button>
  );

  const newScheduleGroups = GROUPS_MAP[newScheduleInfo.specialty]?.[newScheduleInfo.year] || [];

  const renderManageView = () => {
    if (!manageView) return null;

    if (manageView === "students") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BackButton />
          {editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="font-semibold text-card-foreground mb-4">{t("edit_student")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>{t("first_name")}</Label><Input value={editingStudent.name} onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("last_name")}</Label><Input value={editingStudent.lastName} onChange={e => setEditingStudent({ ...editingStudent, lastName: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("reg_number")}</Label><Input value={editingStudent.regNo} disabled /></div>
                  <div className="space-y-1"><Label>{t("specialty")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingStudent.specialty} onChange={e => setEditingStudent({ ...editingStudent, specialty: e.target.value, group: "" })}>
                      {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("level")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingStudent.level} onChange={e => setEditingStudent({ ...editingStudent, level: e.target.value, group: "" })}>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("group")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingStudent.group} onChange={e => setEditingStudent({ ...editingStudent, group: e.target.value })}>
                      <option value="">{t("select")}</option>
                      {editStudentGroups.map(g => <option key={g} value={g}>{t("group")} {g}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("birth_date")}</Label><Input type="date" value={editingStudent.birthDate} onChange={e => setEditingStudent({ ...editingStudent, birthDate: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("birth_place")}</Label><Input value={editingStudent.birthPlace} onChange={e => setEditingStudent({ ...editingStudent, birthPlace: e.target.value })} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={handleSaveEditStudent}><Save className="h-3 w-3 mr-1" />{t("save")}</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingStudent(null)}>{t("cancel")}</Button>
                </div>
              </div>
            </div>
          )}
          {addingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="font-semibold text-card-foreground mb-4">{t("add_student")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>{t("first_name")} *</Label><Input value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("last_name")} *</Label><Input value={newStudent.lastName} onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("reg_number")} *</Label><Input value={newStudent.regNo} onChange={e => setNewStudent({ ...newStudent, regNo: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("specialty")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={newStudent.specialty} onChange={e => setNewStudent({ ...newStudent, specialty: e.target.value, group: "" })}>
                      <option value="">{t("select")}</option>{SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("level")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={newStudent.level} onChange={e => setNewStudent({ ...newStudent, level: e.target.value, group: "" })}>
                      <option value="">{t("select")}</option>{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("group")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={newStudent.group} onChange={e => setNewStudent({ ...newStudent, group: e.target.value })} disabled={newStudentGroups.length === 0}>
                      <option value="">{t("select")}</option>{newStudentGroups.map(g => <option key={g} value={g}>{t("group")} {g}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("birth_date")}</Label><Input type="date" value={newStudent.birthDate} onChange={e => setNewStudent({ ...newStudent, birthDate: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("birth_place")}</Label><Input value={newStudent.birthPlace} onChange={e => setNewStudent({ ...newStudent, birthPlace: e.target.value })} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={handleAddStudent}><Plus className="h-3 w-3 mr-1" />{t("add")}</Button>
                  <Button variant="outline" size="sm" onClick={() => setAddingStudent(false)}>{t("cancel")}</Button>
                </div>
              </div>
            </div>
          )}

          {showUnintegratedStudents && (
            <div className="bg-warning/5 border border-warning/20 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-warning" />
                  {t("unintegrated_users")} ({pendingStudents.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUnintegratedStudents(false)}><X className="h-4 w-4" /></Button>
              </div>
              {pendingStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("no_pending_requests")}</p>
              ) : (
                <div className="space-y-3">
                  {pendingStudents.map((ps, i) => (
                    <div key={i} className="bg-card rounded-lg border p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <p><span className="text-muted-foreground">{t("first_name")}:</span> <span className="font-medium text-card-foreground">{ps.firstName}</span></p>
                        <p><span className="text-muted-foreground">{t("last_name")}:</span> <span className="font-medium text-card-foreground">{ps.lastName}</span></p>
                        <p><span className="text-muted-foreground">{t("specialty")}:</span> <span className="font-medium text-card-foreground">{ps.specialty}</span></p>
                        <p><span className="text-muted-foreground">{t("level")}:</span> <span className="font-medium text-card-foreground">{ps.level}</span></p>
                        <p><span className="text-muted-foreground">{t("group")}:</span> <span className="font-medium text-card-foreground">{ps.group}</span></p>
                        <p><span className="text-muted-foreground">{t("birth_date")}:</span> <span className="font-medium text-card-foreground">{ps.birthDate}</span></p>
                        <p><span className="text-muted-foreground">{t("birth_place")}:</span> <span className="font-medium text-card-foreground">{ps.birthPlace}</span></p>
                        <p className="col-span-2"><span className="text-muted-foreground">{t("email")}:</span> <span className="font-medium text-card-foreground">{ps.email}</span></p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">🔑 {t("auto_credentials_note")}</p>
                      <Button size="sm" onClick={() => handleAddPendingStudent(ps)}>
                        <Plus className="h-3 w-3 mr-1" /> {t("add")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="p-5 border-b flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-card-foreground">{t("manage_students")}</h3>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder={t("search_students")} className="pl-9 h-9 w-48" value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
                </div>
                {pendingStudents.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setShowUnintegratedStudents(!showUnintegratedStudents)} className="gap-1">
                    <UserPlus className="h-3 w-3" /> {t("unintegrated_users")} ({pendingStudents.length})
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={findDuplicates}><AlertTriangle className="h-3 w-3 mr-1" />{t("find_duplicates")}</Button>
                <Button size="sm" onClick={() => setAddingStudent(true)}><Plus className="h-4 w-4 mr-1" /> {t("add")}</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("name")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("reg_number")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("specialty")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("level")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("group")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("actions")}</th>
                </tr></thead>
                <tbody>
                  {filteredStudents.map((s, i) => (
                    <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-card-foreground">{s.name} {s.lastName}</td>
                      <td className="p-3 text-muted-foreground">{s.regNo}</td>
                      <td className="p-3 text-muted-foreground">{s.specialty}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{s.level}</span></td>
                      <td className="p-3 text-muted-foreground">{s.group}</td>
                      <td className="p-3 flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingStudent(s)}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteStudent(s.regNo)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">{t("no_students_found")}</td></tr>}
                </tbody>
              </table>
            </div>
            {showDuplicates && (
              <div className="mt-4 border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    {t("find_duplicates")} ({duplicatesFound.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowDuplicates(false)}>✕</Button>
                </div>
                {duplicatesFound.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t("no_students_found")}</p>
                ) : (
                  <div className="space-y-4">
                    {duplicatesFound.map(({ regNo, students }) => (
                      <div key={regNo} className="border rounded-lg p-3 bg-card">
                        <p className="font-medium text-sm text-destructive mb-2">{t("reg_number")}: {regNo} — {students.length} entries</p>
                        <table className="w-full text-sm">
                          <thead><tr className="bg-muted/50">
                            <th className="text-left p-2 text-muted-foreground">{t("name")}</th>
                            <th className="text-left p-2 text-muted-foreground">{t("specialty")}</th>
                            <th className="text-left p-2 text-muted-foreground">{t("level")}</th>
                            <th className="text-left p-2 text-muted-foreground">{t("group")}</th>
                            <th className="text-left p-2 text-muted-foreground">{t("actions")}</th>
                          </tr></thead>
                          <tbody>
                            {students.map((s, idx) => {
                              const others = students.filter((_, j) => j !== idx);
                              const diffSpecialty = others.some(o => o.specialty !== s.specialty);
                              const diffLevel = others.some(o => o.level !== s.level);
                              const diffGroup = others.some(o => o.group !== s.group);
                              return (
                                <tr key={idx} className="border-t">
                                  <td className="p-2">{s.name} {s.lastName}</td>
                                  <td className={`p-2 ${diffSpecialty ? "text-destructive font-bold" : "text-muted-foreground"}`}>{s.specialty}</td>
                                  <td className={`p-2 ${diffLevel ? "text-destructive font-bold" : "text-muted-foreground"}`}>{s.level}</td>
                                  <td className={`p-2 ${diffGroup ? "text-destructive font-bold" : "text-muted-foreground"}`}>{s.group}</td>
                                  <td className="p-2 flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingStudent(s)}><Edit className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                      setStudentsData(prev => {
                                        let found = false;
                                        return prev.filter(st => {
                                          if (!found && st.regNo === s.regNo && st.group === s.group && st.specialty === s.specialty && st.level === s.level) { found = true; return false; }
                                          return true;
                                        });
                                      });
                                      setDuplicatesFound(prev => prev.map(d => d.regNo === regNo ? { ...d, students: d.students.filter((_, j) => j !== idx) } : d).filter(d => d.students.length > 1));
                                      toast.success("✅");
                                    }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    if (manageView === "teachers") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BackButton />
          {editingTeacher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-md mx-4">
                <h3 className="font-semibold text-card-foreground mb-4">{t("edit_teacher")}</h3>
                <div className="space-y-3">
                  <div className="space-y-1"><Label>{t("name")}</Label><Input value={editingTeacher.name} onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("email")}</Label><Input value={editingTeacher.email} disabled /></div>
                  <div className="space-y-1"><Label>{t("department")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={editingTeacher.dept} onChange={e => setEditingTeacher({ ...editingTeacher, dept: e.target.value })}>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("courses")}</Label><Input type="number" value={editingTeacher.courses} onChange={e => setEditingTeacher({ ...editingTeacher, courses: Number(e.target.value) })} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={handleSaveEditTeacher}><Save className="h-3 w-3 mr-1" />{t("save")}</Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingTeacher(null)}>{t("cancel")}</Button>
                </div>
              </div>
            </div>
          )}
          {addingTeacher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-md mx-4">
                <h3 className="font-semibold text-card-foreground mb-4">{t("add_teacher")}</h3>
                <div className="space-y-3">
                  <div className="space-y-1"><Label>{t("name")} *</Label><Input value={newTeacher.name} onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("email")} *</Label><Input value={newTeacher.email} onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })} /></div>
                  <div className="space-y-1"><Label>{t("department")}</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={newTeacher.dept} onChange={e => setNewTeacher({ ...newTeacher, dept: e.target.value })}>
                      <option value="">{t("select")}</option>{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select></div>
                  <div className="space-y-1"><Label>{t("courses")}</Label><Input type="number" value={newTeacher.courses} onChange={e => setNewTeacher({ ...newTeacher, courses: Number(e.target.value) })} /></div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={handleAddTeacher}><Plus className="h-3 w-3 mr-1" />{t("add")}</Button>
                  <Button variant="outline" size="sm" onClick={() => setAddingTeacher(false)}>{t("cancel")}</Button>
                </div>
              </div>
            </div>
          )}

          {showUnintegratedTeachers && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-accent" />
                  {t("unintegrated_users")} ({pendingTeachers.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowUnintegratedTeachers(false)}><X className="h-4 w-4" /></Button>
              </div>
              {pendingTeachers.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("no_pending_requests")}</p>
              ) : (
                <div className="space-y-3">
                  {pendingTeachers.map((pt, i) => (
                    <div key={i} className="bg-card rounded-lg border p-4">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <p><span className="text-muted-foreground">{t("name")}:</span> <span className="font-medium text-card-foreground">{pt.name}</span></p>
                        <p><span className="text-muted-foreground">{t("email")}:</span> <span className="font-medium text-card-foreground">{pt.email}</span></p>
                        <p><span className="text-muted-foreground">{t("department")}:</span> <span className="font-medium text-card-foreground">{pt.department}</span></p>
                      </div>
                      <Button size="sm" onClick={() => handleAddPendingTeacher(pt)}>
                        <Plus className="h-3 w-3 mr-1" /> {t("add")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="p-5 border-b flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-card-foreground">{t("manage_teachers")}</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder={t("search_teachers")} className="pl-9 h-9 w-48" value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} />
                </div>
                {pendingTeachers.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setShowUnintegratedTeachers(!showUnintegratedTeachers)} className="gap-1">
                    <UserPlus className="h-3 w-3" /> {t("unintegrated_users")} ({pendingTeachers.length})
                  </Button>
                )}
                <Button size="sm" onClick={() => setAddingTeacher(true)}><Plus className="h-4 w-4 mr-1" /> {t("add")}</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("name")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("email")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("department")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("courses")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("actions")}</th>
                </tr></thead>
                <tbody>
                  {filteredTeachers.map((tc, i) => (
                    <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-card-foreground">{tc.name}</td>
                      <td className="p-3 text-muted-foreground">{tc.email}</td>
                      <td className="p-3 text-muted-foreground">{tc.dept}</td>
                      <td className="p-3 text-muted-foreground">{tc.courses}</td>
                      <td className="p-3 flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingTeacher(tc)}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTeacher(tc.email)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">{t("no_teachers_found")}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      );
    }

    if (manageView === "schedules") {
      // Adding new schedule flow
      if (addingSchedule) {
        if (!newScheduleInfo.department) {
          return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="ghost" size="sm" onClick={() => setAddingSchedule(false)} className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> {t("back")}</Button>
            <h3 className="font-semibold text-card-foreground mb-4">{t("add_schedule")} — {t("select_department")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DEPARTMENTS.map(d => (<button key={d} onClick={() => setNewScheduleInfo({ ...newScheduleInfo, department: d })} className="bg-card rounded-xl border p-5 shadow-card hover:shadow-elevated transition-all text-left group">
                <BookOpen className="h-5 w-5 text-primary mb-2" /><p className="font-medium text-card-foreground group-hover:text-primary transition-colors">{d}</p>
              </button>))}
            </div></motion.div>);
        }
        if (!newScheduleInfo.year) {
          return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="ghost" size="sm" onClick={() => setNewScheduleInfo({ ...newScheduleInfo, department: "" })} className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> {t("back")}</Button>
            <h3 className="font-semibold text-card-foreground mb-2">{newScheduleInfo.department}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("select_year")}</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {YEAR_OPTIONS.map(y => (<button key={y} onClick={() => setNewScheduleInfo({ ...newScheduleInfo, year: y })} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all text-center group">
                <p className="font-medium text-card-foreground group-hover:text-primary transition-colors">{y}</p>
              </button>))}
            </div></motion.div>);
        }
        if (!newScheduleInfo.group) {
          return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button variant="ghost" size="sm" onClick={() => setNewScheduleInfo({ ...newScheduleInfo, year: "" })} className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> {t("back")}</Button>
            <h3 className="font-semibold text-card-foreground mb-2">{newScheduleInfo.department} — {newScheduleInfo.year}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("select_group")}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(newScheduleGroups.length > 0 ? newScheduleGroups : ["A", "B", "C"]).map(g => (<button key={g} onClick={() => {
                setNewScheduleInfo({ ...newScheduleInfo, group: g });
                // Reset grid for new schedule
                const grid: ScheduleGrid = {};
                DAYS.forEach(day => { grid[day] = {}; TIME_SLOTS.forEach(slot => { grid[day][slot] = null; }); });
                setScheduleGrid(grid);
                setEditMode(true);
                setAddingSchedule(false);
                setScheduleDept(newScheduleInfo.department);
                setScheduleYear(newScheduleInfo.year);
                setScheduleGroup(g);
              }} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all text-center group">
                <p className="font-medium text-card-foreground group-hover:text-primary transition-colors">{t("group")} {g}</p>
              </button>))}
            </div></motion.div>);
        }
      }

      if (!scheduleDept) {
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}><BackButton />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-card-foreground">{t("select_department")}</h3>
            <Button size="sm" onClick={() => { setAddingSchedule(true); setNewScheduleInfo({ department: "", specialty: "", year: "", group: "" }); }}>
              <Plus className="h-4 w-4 mr-1" /> {t("add")}
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {DEPARTMENTS.map(d => (<button key={d} onClick={() => setScheduleDept(d)} className="bg-card rounded-xl border p-5 shadow-card hover:shadow-elevated transition-all text-left group">
              <BookOpen className="h-5 w-5 text-primary mb-2" /><p className="font-medium text-card-foreground group-hover:text-primary transition-colors">{d}</p>
            </button>))}
          </div></motion.div>);
      }
      if (!scheduleYear) {
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={() => setScheduleDept(null)} className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> {t("back")}</Button>
          <h3 className="font-semibold text-card-foreground mb-2">{scheduleDept}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t("select_year")}</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {YEARS.map(y => (<button key={y} onClick={() => setScheduleYear(y)} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all text-center group">
              <p className="font-medium text-card-foreground group-hover:text-primary transition-colors">{y}</p>
            </button>))}
          </div></motion.div>);
      }
      if (!scheduleGroup) {
        const deptGroups = GROUPS_MAP[scheduleDept]?.[scheduleYear?.replace("Year ", "L").replace("Master ", "M")] || ["A", "B", "C", "D"];
        return (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={() => setScheduleYear(null)} className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> {t("back")}</Button>
          <h3 className="font-semibold text-card-foreground mb-2">{scheduleDept} — {scheduleYear}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t("select_group")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {deptGroups.map(g => (<button key={g} onClick={() => setScheduleGroup(g)} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all text-center group">
              <p className="font-medium text-card-foreground group-hover:text-primary transition-colors">{t("group")} {g}</p>
            </button>))}
          </div></motion.div>);
      }
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Button variant="ghost" size="sm" onClick={() => setScheduleGroup(null)} className="mb-4 gap-1"><ArrowLeft className="h-4 w-4" /> {t("back")}</Button>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-card-foreground">{scheduleDept} — {scheduleYear} — {t("group")} {scheduleGroup}</h3>
              <p className="text-xs text-muted-foreground">{t("weekly_schedule_title")}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant={editMode ? "default" : "outline"} onClick={() => setEditMode(!editMode)}>
                <Edit className="h-3 w-3 mr-1" /> {editMode ? t("done_editing") : t("edit_mode")}
              </Button>
              {editMode && <Button size="sm" onClick={() => { setEditMode(false); toast.success("✅"); }}><Save className="h-3 w-3 mr-1" />{t("save")}</Button>}
              <Button size="sm" variant="outline" onClick={() => pdfInputRef.current?.click()}>
                <ScanLine className="h-3 w-3 mr-1" /> Scan PDF
              </Button>
              <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfScan} />
              <Button size="sm" variant="outline" onClick={() => toast.success("PDF ✅")}><Download className="h-3 w-3 mr-1" />PDF</Button>
            </div>
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
                        <td key={slot} className={`p-1 border min-w-[120px] align-top ${cell ? cellColor(cell.type) : "hover:bg-muted/20"}`}>
                          {editMode ? (
                            <div className="space-y-1">
                              <Input placeholder={t("course")} className="h-6 text-xs p-1" value={cell?.course || ""} onChange={e => handleCellEdit(day, slot, "course", e.target.value)} />
                              <Input placeholder={t("teacher")} className="h-6 text-xs p-1" value={cell?.teacher || ""} onChange={e => handleCellEdit(day, slot, "teacher", e.target.value)} />
                              <Input placeholder={t("room")} className="h-6 text-xs p-1" value={cell?.room || ""} onChange={e => handleCellEdit(day, slot, "room", e.target.value)} />
                              <div className="flex gap-1">
                                <select className="h-6 text-xs border rounded flex-1 bg-background" value={cell?.type || "lecture"} onChange={e => handleCellEdit(day, slot, "type", e.target.value)}>
                                  <option value="lecture">{t("lecture")}</option><option value="lab">{t("lab")}</option><option value="tutorial">{t("tutorial")}</option>
                                </select>
                                {cell && <button onClick={() => handleDeleteCell(day, slot)} className="text-destructive hover:bg-destructive/10 rounded p-0.5"><X className="h-3 w-3" /></button>}
                              </div>
                            </div>
                          ) : cell ? (
                            <div className="p-1"><p className="font-semibold text-card-foreground">{cell.course}</p><p className="text-muted-foreground">{cell.teacher}</p><p className="text-muted-foreground">{cell.room}</p></div>
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
      );
    }

    if (manageView === "reports") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BackButton />
          {reportPreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-card-foreground">{reportPreview}</h3>
                  <button onClick={() => setReportPreview(null)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <div className="border rounded-lg p-4 space-y-3 text-sm">
                  <p className="font-medium text-card-foreground">{t("report")}: {reportPreview}</p>
                  <p className="text-muted-foreground">{t("generated")}: {new Date().toLocaleDateString()}</p>
                  <p className="text-muted-foreground">{t("period")}: {currentMonth}</p>
                  <div className="border-t pt-3 mt-3">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-muted/50"><th className="p-2 text-left">{t("name")}</th><th className="p-2 text-left">{t("status")}</th></tr></thead>
                      <tbody>
                        <tr className="border-t"><td className="p-2">{t("total_students")}</td><td className="p-2">2,450</td></tr>
                        <tr className="border-t"><td className="p-2">{t("average_attendance")}</td><td className="p-2">89%</td></tr>
                        <tr className="border-t"><td className="p-2">{t("total_absences")}</td><td className="p-2">245</td></tr>
                        <tr className="border-t"><td className="p-2">{t("justified_absences")}</td><td className="p-2">180</td></tr>
                        <tr className="border-t"><td className="p-2">{t("unjustified_absences")}</td><td className="p-2">65</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="bg-card rounded-xl border shadow-card p-6">
            <h3 className="font-semibold text-card-foreground mb-6">{t("reports")}</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: t("student_attendance_report"), desc: t("full_attendance_by_student"), icon: GraduationCap },
                { title: t("course_attendance_report"), desc: t("attendance_stats_per_course"), icon: BookOpen },
                { title: t("absence_report"), desc: t("detailed_absence_records"), icon: FileText },
                { title: t("justification_report"), desc: t("summary_justifications"), icon: Clock },
              ].map((r) => (
                <div key={r.title} className="border rounded-lg p-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <r.icon className="h-5 w-5 text-warning mt-0.5" />
                    <div><p className="font-medium text-card-foreground text-sm">{r.title}</p><p className="text-xs text-muted-foreground mt-1">{r.desc}</p></div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => setReportPreview(r.title)}><Eye className="h-3 w-3 mr-1" /> {t("show")}</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportReport(r.title + " (PDF)")}><Download className="h-3 w-3 mr-1" /> PDF</Button>
                    <Button variant="outline" size="sm" onClick={() => handleExportReport(r.title + " (CSV)")}>CSV</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      );
    }

    if (manageView === "support") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BackButton />
          {viewingSupport && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-card rounded-xl border shadow-elevated p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-card-foreground">{t("support_request_details")}</h3>
                  <button onClick={() => setViewingSupport(null)} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("from")}:</span><span className="font-medium text-card-foreground">{viewingSupport.from} ({viewingSupport.type})</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("subject")}:</span><span className="font-medium text-card-foreground">{viewingSupport.subject}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("date")}:</span><span className="text-card-foreground">{viewingSupport.date}</span></div>
                  <div className="border-t pt-3"><p className="text-muted-foreground mb-1">{t("details")}:</p><p className="text-card-foreground">{viewingSupport.details}</p></div>
                  {viewingSupport.attachment && (
                    <div className="border-t pt-3">
                      <p className="text-muted-foreground mb-1">{t("attachment")}:</p>
                      <button
                        onClick={() => toast.info(`📎 ${t("view_attachment")}: ${viewingSupport.attachment}`)}
                        className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg p-3 hover:bg-primary/10 transition-colors w-full text-left"
                      >
                        <Paperclip className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">{viewingSupport.attachment}</span>
                        <Eye className="h-4 w-4 text-primary ml-auto" />
                      </button>
                    </div>
                  )}
                  {viewingSupport.type === "Student" && !(viewingSupport as any).requestType && (
                    <div className="border-t pt-3">
                      <p className="text-muted-foreground mb-1">{t("teacher_rejection_reason")}:</p>
                      <p className="text-destructive text-sm">Document not certified by university health center.</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="success" onClick={() => { confirmResolve(viewingSupport.id); toast.success(t("accept_justification")); }}>{t("accept_justification")}</Button>
                        <Button size="sm" variant="destructive" onClick={() => confirmResolve(viewingSupport.id)}>{t("deny")}</Button>
                      </div>
                    </div>
                  )}
                  {viewingSupport.type === "Teacher" && !(viewingSupport as any).requestType && (
                    <div className="border-t pt-3"><Button size="sm" onClick={() => confirmResolve(viewingSupport.id)}>{t("mark_resolved")}</Button></div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="p-5 border-b"><h3 className="font-semibold text-card-foreground">{t("support_requests")}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("subject")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("from")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("type")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("date")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("status")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("actions")}</th>
                </tr></thead>
                <tbody>
                  {supportRequests.map(req => (
                    <tr key={req.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-card-foreground">{req.subject}</td>
                      <td className="p-3 text-muted-foreground">{req.from}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.type === "Student" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>{req.type}</span></td>
                      <td className="p-3 text-muted-foreground">{req.date}</td>
                      <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${req.status === "open" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}>{req.status === "open" ? t("open") : t("resolved")}</span></td>
                      <td className="p-3 flex gap-1">
                        {req.status === "open" && <Button size="sm" variant="outline" onClick={() => handleResolveSupport(req.id)}>{t("resolve")}</Button>}
                        <Button size="sm" variant="ghost" onClick={() => setViewingSupport(req)}><Eye className="h-3 w-3" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      );
    }

    if (manageView === "debtors") {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <BackButton />
          <div className="bg-card rounded-xl border shadow-card overflow-hidden">
            <div className="p-5 border-b"><h3 className="font-semibold text-card-foreground">{t("manage_debtors")}</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("name")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("reg_number")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("specialty")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("level")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("dett_year")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("dett_subjects")}</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">{t("actions")}</th>
                </tr></thead>
                <tbody>
                  {debtRequests.map((d, i) => (
                    <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-card-foreground">{d.studentName}</td>
                      <td className="p-3 text-muted-foreground">{d.regNo}</td>
                      <td className="p-3 text-muted-foreground">{d.specialty}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">{d.level}</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">{d.debtYear}</span></td>
                      <td className="p-3">{d.subjects.map((s, j) => <span key={j} className="block text-xs text-card-foreground">{s.name} <span className="text-muted-foreground">({s.teacher})</span></span>)}</td>
                      <td className="p-3">
                        {d.status === "pending" ? (
                          <Button size="sm" onClick={() => handleApproveDebt(d.regNo)}>{t("approve")}</Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><CheckCircle2 className="h-3 w-3" />{t("approved")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {debtRequests.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">{t("no_pending_requests")}</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-warning" />
            <span className="font-bold text-foreground">UniAttend</span>
            <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">{t("admin_panel")}</span>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions />
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setShowAnnouncements(!showAnnouncements)}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
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
          {announcements.slice(0, 5).map((a, i) => (
            <div key={i} className={`rounded-lg p-3 text-xs ${a.type === "urgent" ? "border-l-4 border-l-destructive bg-destructive/5" : a.type === "important" ? "border-l-4 border-l-warning bg-warning/5" : "border-l-4 border-l-primary bg-primary/5"}`}>
              <p className="font-medium text-card-foreground">{a.title}</p>
              <p className="text-muted-foreground mt-1">{a.audience === "teachers" ? t("announcement_for_teachers") : t("announcement_for_students")} • {a.date}</p>
            </div>
          ))}
          <button onClick={() => { setShowAnnouncements(false); setActiveTab("announcements"); setManageView(null); }} className="text-xs text-primary hover:underline w-full text-center mt-2">{t("view_announcements")}</button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("administration")} <span className="text-warning">{t("panel")}</span></h1>
          <p className="text-muted-foreground text-sm mt-1">{t("hero_university")}</p>
        </motion.div>

        {manageView ? renderManageView() : (
          <>
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {[
                { id: "overview", label: t("overview"), icon: BarChart3 },
                { id: "statistics", label: t("statistics"), icon: TrendingUp },
                { id: "announcements", label: t("announcements"), icon: Megaphone },
                { id: "manage", label: t("management"), icon: Users },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-warning text-warning-foreground shadow-card" : "text-muted-foreground hover:bg-muted"}`}>
                  <tab.icon className="h-4 w-4" />{tab.label}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: t("total_students"), value: "2,450", icon: GraduationCap, color: "text-primary" },
                    { label: t("total_teachers"), value: "185", icon: BookOpen, color: "text-accent" },
                    { label: t("pending_justifications"), value: "23", icon: FileText, color: "text-warning" },
                    { label: t("urgent_notifications"), value: "3", icon: Bell, color: "text-destructive" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card rounded-xl border p-5 shadow-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <p className="text-2xl md:text-3xl font-bold text-card-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: t("manage_students"), icon: GraduationCap, view: "students" },
                    { label: t("manage_teachers"), icon: BookOpen, view: "teachers" },
                    { label: t("manage_schedules"), icon: Calendar, view: "schedules" },
                  ].map((item) => (
                    <button key={item.label} onClick={() => setManageView(item.view)} className="bg-card rounded-xl border p-4 shadow-card hover:shadow-elevated transition-all duration-200 text-left group">
                      <item.icon className="h-5 w-5 text-warning mb-2" />
                      <p className="text-sm font-medium text-card-foreground group-hover:text-warning transition-colors">{item.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "statistics" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">📊 {t("monthly_statistics")} — <span className="font-semibold text-foreground">{currentMonth}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{t("stats_reset")}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">{t("attendance_by_level")} — {currentMonth}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={barData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip /><Bar dataKey="attendance" fill="hsl(217, 91%, 40%)" radius={[6, 6, 0, 0]} /></BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-card rounded-xl border p-6 shadow-card">
                    <h3 className="font-semibold text-card-foreground mb-4">{t("overall_attendance")} — {currentMonth}</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">{pieData.map((entry, i) => (<Cell key={i} fill={entry.color} />))}</Pie><Tooltip /></PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      {pieData.map((d) => (<div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />{d.name} ({d.value}%)</div>))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "announcements" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-foreground">{t("announcements")}</h3>
                  <Button onClick={() => setShowAnnouncementForm(!showAnnouncementForm)} className="gap-1"><Plus className="h-4 w-4" /> {t("new_announcement")}</Button>
                </div>

                {showAnnouncementForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border p-6 shadow-card mb-6">
                    {!annAudience ? (
                      <div>
                        <h4 className="font-semibold text-card-foreground mb-4">{t("select_audience")}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setAnnAudience("students")} className="bg-primary/5 border-2 border-primary/20 hover:border-primary rounded-xl p-6 text-center transition-all">
                            <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
                            <p className="font-semibold text-card-foreground">{t("announcement_for_students")}</p>
                          </button>
                          <button onClick={() => setAnnAudience("teachers")} className="bg-accent/5 border-2 border-accent/20 hover:border-accent rounded-xl p-6 text-center transition-all">
                            <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
                            <p className="font-semibold text-card-foreground">{t("announcement_for_teachers")}</p>
                          </button>
                        </div>
                        <div className="mt-4">
                          <Button variant="outline" onClick={() => setShowAnnouncementForm(false)}>{t("cancel")}</Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleAnnouncement} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${annAudience === "teachers" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                            {annAudience === "teachers" ? t("announcement_for_teachers") : t("announcement_for_students")}
                          </span>
                          <button type="button" onClick={() => { setAnnAudience(null); setSelectedTeacherAnn(null); setTeacherSearchAnn(""); }} className="text-xs text-muted-foreground hover:text-foreground">{t("back")}</button>
                        </div>

                        {annAudience === "teachers" ? (
                          <div className="space-y-4">
                            <div className="space-y-2 relative">
                              <Label>{t("teacher")} *</Label>
                              {selectedTeacherAnn ? (
                                <div className="flex items-center gap-2 p-3 bg-accent/5 border border-accent/20 rounded-lg">
                                  <div className="flex-1">
                                    <p className="font-medium text-card-foreground">{selectedTeacherAnn.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedTeacherAnn.email} — {selectedTeacherAnn.dept}</p>
                                  </div>
                                  <button type="button" onClick={() => { setSelectedTeacherAnn(null); setTeacherSearchAnn(""); }} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
                                </div>
                              ) : (
                                <>
                                  <div className="relative">
                                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                      placeholder={t("search_teachers")}
                                      className="pl-9"
                                      value={teacherSearchAnn}
                                      onChange={e => { setTeacherSearchAnn(e.target.value); setShowTeacherDropdown(true); }}
                                      onFocus={() => setShowTeacherDropdown(true)}
                                    />
                                  </div>
                                  {showTeacherDropdown && teacherSearchAnn.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg shadow-elevated max-h-48 overflow-y-auto" style={{ top: "100%" }}>
                                      {filteredTeachersAnn.length > 0 ? filteredTeachersAnn.map((tc, i) => (
                                        <button key={i} type="button" onClick={() => { setSelectedTeacherAnn(tc); setTeacherSearchAnn(""); setShowTeacherDropdown(false); }} className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-sm">
                                          <p className="font-medium text-popover-foreground">{tc.name}</p>
                                          <p className="text-xs text-muted-foreground">{tc.email} — {tc.dept}</p>
                                        </button>
                                      )) : (
                                        <div className="p-4 text-center">
                                          <p className="text-sm text-muted-foreground mb-2">{t("no_teachers_found")}</p>
                                          <Button type="button" size="sm" variant="outline" onClick={() => { setShowAnnouncementForm(false); setAnnAudience(null); setManageView("teachers"); setAddingTeacher(true); }}>
                                            <Plus className="h-3 w-3 mr-1" /> {t("add_teacher")}
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{t("title")}</Label>
                                <Input placeholder={t("announcement_title")} value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} required />
                              </div>
                              <div className="space-y-2">
                                <Label>{t("type")}</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={annForm.type} onChange={e => setAnnForm({ ...annForm, type: e.target.value })}>
                                  <option value="normal">{t("normal")}</option><option value="important">{t("important")}</option><option value="urgent">{t("urgent")}</option>
                                </select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("message")}</Label>
                              <Textarea placeholder={t("write_announcement")} rows={4} value={annForm.message} onChange={e => setAnnForm({ ...annForm, message: e.target.value })} required />
                            </div>
                            {(annForm.type === "important" || annForm.type === "urgent") && (
                              <p className="text-xs text-warning flex items-center gap-1">📧 {t("announcement_for_teachers")} — Email: {selectedTeacherAnn?.email || "..."}</p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>{t("title")}</Label>
                                <Input placeholder={t("announcement_title")} value={annForm.title} onChange={e => setAnnForm({ ...annForm, title: e.target.value })} required />
                              </div>
                              <div className="space-y-2">
                                <Label>{t("type")}</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={annForm.type} onChange={e => setAnnForm({ ...annForm, type: e.target.value })}>
                                  <option value="normal">{t("normal")}</option><option value="important">{t("important")}</option><option value="urgent">{t("urgent")}</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t("target_specialty")}</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={annForm.specialty} onChange={e => setAnnForm({ ...annForm, specialty: e.target.value })}>
                                  <option value="">{t("all_specialties")}</option>{SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t("target_year")}</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={annForm.year} onChange={e => setAnnForm({ ...annForm, year: e.target.value })}>
                                  <option value="">{t("all_years")}</option>{YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>{t("target_group")}</Label>
                                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={annForm.group} onChange={e => setAnnForm({ ...annForm, group: e.target.value })}>
                                  <option value="">{t("all_groups")}</option>
                                  {(GROUPS_MAP[annForm.specialty]?.[annForm.year] || ["A", "B", "C", "D"]).map(g => <option key={g} value={g}>{t("group")} {g}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>{t("message")}</Label>
                              <Textarea placeholder={t("write_announcement")} rows={4} value={annForm.message} onChange={e => setAnnForm({ ...annForm, message: e.target.value })} required />
                            </div>
                            {(annForm.type === "important" || annForm.type === "urgent") && (
                              <p className="text-xs text-warning flex items-center gap-1">📧 {t("type")}: {annForm.type}</p>
                            )}
                          </>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button type="submit" className="gap-1"><Megaphone className="h-4 w-4" /> {t("publish")}</Button>
                          <Button type="button" variant="outline" onClick={() => { setShowAnnouncementForm(false); setAnnAudience(null); }}>{t("cancel")}</Button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}

                <div className="space-y-3">
                  {announcements.map((a, i) => (
                    <div key={i} className={`rounded-xl border p-4 ${a.type === "urgent" ? "border-l-4 border-l-destructive bg-destructive/5" : a.type === "important" ? "border-l-4 border-l-warning bg-warning/5" : "border-l-4 border-l-primary bg-primary/5"}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.audience === "teachers" ? t("announcement_for_teachers") : t("announcement_for_students")} • {a.target} • {a.date}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.type === "urgent" ? "bg-destructive/10 text-destructive" : a.type === "important" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
                          {t(a.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "manage" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: t("manage_students"), desc: t("add_edit_remove_students"), icon: GraduationCap, view: "students" },
                    { label: t("manage_teachers"), desc: t("manage_faculty"), icon: BookOpen, view: "teachers" },
                    { label: t("manage_schedules"), desc: t("timetable_config"), icon: Calendar, view: "schedules" },
                    { label: t("manage_debtors"), desc: t("manage_debtors_desc"), icon: AlertTriangle, view: "debtors" },
                    { label: t("reports"), desc: t("generate_export_reports"), icon: BarChart3, view: "reports" },
                    { label: t("support_requests"), desc: t("review_user_requests"), icon: MessageSquare, view: "support" },
                  ].map((item) => (
                    <button key={item.label} onClick={() => setManageView(item.view)} className="bg-card rounded-xl border p-5 shadow-card hover:shadow-elevated transition-all duration-200 text-left group">
                      <item.icon className="h-6 w-6 text-warning mb-3" />
                      <p className="font-semibold text-card-foreground group-hover:text-warning transition-colors text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;