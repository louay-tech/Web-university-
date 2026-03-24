import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, BookOpen, ShieldCheck, Eye, EyeOff, ArrowLeft, UserPlus, KeyRound, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import HeaderActions from "@/components/HeaderActions";
import { useLanguage } from "@/contexts/LanguageContext";

type Role = "student" | "teacher" | "admin" | null;
type ForgotView = null | "student_form" | "teacher_options" | "teacher_form" | "admin_options" | "admin_form";

const DEMO_CREDS: Record<string, { id: string; pass: string }> = {
  student: { id: "202612345678", pass: "student123" },
  teacher: { id: "teacher@univ-mila.dz", pass: "teacher123" },
  admin: { id: "admin@univ-mila.dz", pass: "admin123" },
};

const SPECIALTIES = ["Computer Science", "Mathematics", "Physics", "Economics", "Biology", "Chemistry", "English"];
const YEAR_OPTIONS = ["L1", "L2", "L3", "M1", "M2"];
const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Economics", "Biology"];

const GROUPS_MAP: Record<string, Record<string, string[]>> = {
  "Computer Science": { "L1": ["A", "B"], "L2": ["A", "B"], "L3": ["A", "B", "C"], "M1": ["A"], "M2": ["A"] },
  "Mathematics": { "L1": ["A", "B"], "L2": ["A", "B"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Physics": { "L1": ["A", "B"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Economics": { "L1": ["A"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Biology": { "L1": ["A", "B"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "Chemistry": { "L1": ["A"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
  "English": { "L1": ["A"], "L2": ["A"], "L3": ["A"], "M1": ["A"], "M2": ["A"] },
};

// Simulated existing student regNos (12 digit format: YYYY + 8 digits)
const EXISTING_REGNOS = ["202612345678", "202612345679", "202612345680", "202612345681"];
const EXISTING_ADMIN_REGNOS = ["202600000001", "202600000002"];

// Validate registration number: must be exactly 12 digits
const isValidRegNo = (regNo: string) => /^\d{12}$/.test(regNo);

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [forgotView, setForgotView] = useState<ForgotView>(null);
  const [adminLoginMode, setAdminLoginMode] = useState<"email" | "regNo">("email");
  const [studentSubmitted, setStudentSubmitted] = useState(false);
  const [teacherSubmitted, setTeacherSubmitted] = useState(false);
  const [adminSubmitted, setAdminSubmitted] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [studentForgot, setStudentForgot] = useState({
    firstName: "", lastName: "", specialty: "", level: "", group: "",
    regNo: "", birthDate: "", birthPlace: "", regPassword: "", email: ""
  });

  const [teacherForgot, setTeacherForgot] = useState({
    name: "", email: "", department: "", password: ""
  });

  const [adminForgot, setAdminForgot] = useState({
    firstName: "", lastName: "", birthDate: "", birthPlace: "",
    regNo: "", regPassword: "", department: "", email: "", gmailPassword: ""
  });

  const roles = [
    { id: "student" as const, label: t("student"), icon: GraduationCap, desc: t("access_attendance_schedule"), color: "hsl(217, 91%, 40%)" },
    { id: "teacher" as const, label: t("teacher"), icon: BookOpen, desc: t("mark_attendance_manage"), color: "hsl(168, 70%, 40%)" },
    { id: "admin" as const, label: t("administrator"), icon: ShieldCheck, desc: t("full_platform_management"), color: "hsl(38, 92%, 50%)" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    // Validate registration number format for student and admin regNo mode
    if (selectedRole === "student" || (selectedRole === "admin" && adminLoginMode === "regNo")) {
      if (!isValidRegNo(identifier)) {
        toast.error(t("invalid_data_retry"));
        return;
      }
    }

    const creds = DEMO_CREDS[selectedRole];
    if (selectedRole === "admin" && adminLoginMode === "regNo") {
      if (identifier === "202600000001" && password === "admin123") {
        toast.success(`${t("welcome_back")}!`);
        setTimeout(() => navigate(`/admin`), 800);
        return;
      }
    }
    if (identifier === creds.id && password === creds.pass) {
      toast.success(`${t("welcome_back")}!`);
      setTimeout(() => navigate(`/${selectedRole}`), 800);
    } else {
      toast.error(t("invalid_data_retry"));
    }
  };

  const studentRegNoExists = studentForgot.regNo.length > 0 && EXISTING_REGNOS.includes(studentForgot.regNo);
  const adminRegNoExists = adminForgot.regNo.length > 0 && EXISTING_ADMIN_REGNOS.includes(adminForgot.regNo);

  const studentGroups = GROUPS_MAP[studentForgot.specialty]?.[studentForgot.level] || [];

  const handleStudentForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForgot.firstName || !studentForgot.lastName || !studentForgot.regNo || !studentForgot.email) {
      toast.error("!"); return;
    }
    if (studentRegNoExists) return;
    setStudentSubmitted(true);
  };

  const handleTeacherForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForgot.name || !teacherForgot.email) {
      toast.error("!"); return;
    }
    setTeacherSubmitted(true);
  };

  const handleAdminForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForgot.firstName || !adminForgot.lastName || !adminForgot.email) {
      toast.error("!"); return;
    }
    if (adminRegNoExists) return;
    setAdminSubmitted(true);
  };

  const roleInfo = selectedRole ? roles.find(r => r.id === selectedRole) : null;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold" style={{ color: "hsl(0,0%,100%)" }}>UniAttend</span>
          </Link>
          <HeaderActions />
        </div>

        <div className="rounded-2xl bg-card shadow-elevated p-8">
          <AnimatePresence mode="wait">
            {/* Forgot password - Student form */}
            {forgotView === "student_form" && (
              <motion.div key="student-forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { setForgotView(null); setStudentSubmitted(false); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                {studentSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🟢 ✅</div>
                    <p className="text-sm text-card-foreground font-medium mb-2">{t("student_add_time")}</p>
                    <p className="text-xs text-muted-foreground">{t("student_add_fallback")}</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-card-foreground mb-1">{t("request_account_access")}</h2>
                    <p className="text-xs text-muted-foreground mb-4">{t("fill_complete_info")}</p>
                    <form onSubmit={handleStudentForgotSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("first_name")} *</Label>
                          <Input className="h-9 text-sm" value={studentForgot.firstName} onChange={e => setStudentForgot({...studentForgot, firstName: e.target.value})} required />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("last_name")} *</Label>
                          <Input className="h-9 text-sm" value={studentForgot.lastName} onChange={e => setStudentForgot({...studentForgot, lastName: e.target.value})} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("specialty")}</Label>
                          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={studentForgot.specialty} onChange={e => setStudentForgot({...studentForgot, specialty: e.target.value, group: ""})}>
                            <option value="">{t("select")}</option>
                            {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("level")}</Label>
                          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={studentForgot.level} onChange={e => setStudentForgot({...studentForgot, level: e.target.value, group: ""})}>
                            <option value="">{t("select")}</option>
                            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("group")}</Label>
                          <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={studentForgot.group} onChange={e => setStudentForgot({...studentForgot, group: e.target.value})} disabled={studentGroups.length === 0}>
                            <option value="">{t("select")}</option>
                            {studentGroups.map(g => <option key={g} value={g}>{t("group")} {g}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("reg_number")} *</Label>
                          <Input className="h-9 text-sm" value={studentForgot.regNo} onChange={e => setStudentForgot({...studentForgot, regNo: e.target.value})} required placeholder="202612345678" />
                          {studentRegNoExists && (
                            <p className="text-xs text-destructive">{t("reg_already_exists")}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("birth_date")}</Label>
                          <Input type="date" className="h-9 text-sm" value={studentForgot.birthDate} onChange={e => setStudentForgot({...studentForgot, birthDate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("birth_place")}</Label>
                          <Input className="h-9 text-sm" value={studentForgot.birthPlace} onChange={e => setStudentForgot({...studentForgot, birthPlace: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("password")} ({t("reg_number")}) *</Label>
                        <Input className="h-9 text-sm" value={studentForgot.regPassword} onChange={e => setStudentForgot({...studentForgot, regPassword: e.target.value})} required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("email_address")} *</Label>
                        <Input type="email" className="h-9 text-sm" placeholder="louay.chahdane.etu@centre-univ-mila.dz" value={studentForgot.email} onChange={e => setStudentForgot({...studentForgot, email: e.target.value})} required />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={studentRegNoExists}>{t("send")}</Button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* Forgot password - Teacher options */}
            {forgotView === "teacher_options" && (
              <motion.div key="teacher-options" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { setForgotView(null); setTeacherSubmitted(false); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                <h2 className="text-xl font-bold text-card-foreground mb-4">{t("forgot_password")}</h2>
                <div className="space-y-3">
                  <button onClick={() => { window.open("https://mail.google.com", "_blank"); }} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-card transition-all text-left group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{t("change_password")}</p>
                      <p className="text-xs text-muted-foreground">{t("change_password_desc")}</p>
                    </div>
                  </button>
                  <button onClick={() => setForgotView("teacher_form")} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-card transition-all text-left group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10">
                      <UserPlus className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground group-hover:text-accent transition-colors">{t("request_to_add")}</p>
                      <p className="text-xs text-muted-foreground">{t("request_to_add_desc")}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Forgot password - Teacher form */}
            {forgotView === "teacher_form" && (
              <motion.div key="teacher-forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { setForgotView("teacher_options"); setTeacherSubmitted(false); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                {teacherSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🟢 ✅</div>
                    <p className="text-sm text-card-foreground font-medium mb-2">{t("teacher_add_success")}</p>
                    <p className="text-xs text-muted-foreground">{t("teacher_add_fallback")}</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-card-foreground mb-1">{t("request_to_add")}</h2>
                    <p className="text-xs text-muted-foreground mb-4">{t("fill_teacher_info")}</p>
                    <form onSubmit={handleTeacherForgotSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs">{t("name")} *</Label>
                        <Input className="h-9 text-sm" value={teacherForgot.name} onChange={e => setTeacherForgot({...teacherForgot, name: e.target.value})} required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("email_address")} *</Label>
                        <Input type="email" className="h-9 text-sm" value={teacherForgot.email} onChange={e => setTeacherForgot({...teacherForgot, email: e.target.value})} required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("department")}</Label>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={teacherForgot.department} onChange={e => setTeacherForgot({...teacherForgot, department: e.target.value})}>
                          <option value="">{t("select")}</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("password")} *</Label>
                        <Input className="h-9 text-sm" value={teacherForgot.password} onChange={e => setTeacherForgot({...teacherForgot, password: e.target.value})} required />
                      </div>
                      <Button type="submit" className="w-full" size="lg">{t("send")}</Button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* Forgot password - Admin options */}
            {forgotView === "admin_options" && (
              <motion.div key="admin-options" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { setForgotView(null); setAdminSubmitted(false); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                <h2 className="text-xl font-bold text-card-foreground mb-4">{t("forgot_password")}</h2>
                <div className="space-y-3">
                  <button onClick={() => { setAdminLoginMode("regNo"); setForgotView(null); setIdentifier(""); setPassword(""); }} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-card transition-all text-left group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/10">
                      <Hash className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground group-hover:text-warning transition-colors">{t("login_with_reg")}</p>
                      <p className="text-xs text-muted-foreground">{t("login_with_reg_desc")}</p>
                    </div>
                  </button>
                  <button onClick={() => { window.open("https://mail.google.com", "_blank"); }} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-card transition-all text-left group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                      <KeyRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{t("change_password")}</p>
                      <p className="text-xs text-muted-foreground">{t("change_gmail_password_desc")}</p>
                    </div>
                  </button>
                  <button onClick={() => setForgotView("admin_form")} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-card transition-all text-left group">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent/10">
                      <UserPlus className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground group-hover:text-accent transition-colors">{t("request_to_add")}</p>
                      <p className="text-xs text-muted-foreground">{t("request_to_add_desc")}</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Forgot password - Admin form */}
            {forgotView === "admin_form" && (
              <motion.div key="admin-forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { setForgotView("admin_options"); setAdminSubmitted(false); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                {adminSubmitted ? (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">🟢 ✅</div>
                    <p className="text-sm text-card-foreground font-medium mb-2">{t("teacher_add_success")}</p>
                    <p className="text-xs text-muted-foreground">{t("teacher_add_fallback")}</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-card-foreground mb-1">{t("request_to_add")}</h2>
                    <p className="text-xs text-muted-foreground mb-4">{t("fill_complete_info")}</p>
                    <form onSubmit={handleAdminForgotSubmit} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("first_name")} *</Label>
                          <Input className="h-9 text-sm" value={adminForgot.firstName} onChange={e => setAdminForgot({...adminForgot, firstName: e.target.value})} required />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("last_name")} *</Label>
                          <Input className="h-9 text-sm" value={adminForgot.lastName} onChange={e => setAdminForgot({...adminForgot, lastName: e.target.value})} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("birth_date")}</Label>
                          <Input type="date" className="h-9 text-sm" value={adminForgot.birthDate} onChange={e => setAdminForgot({...adminForgot, birthDate: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("birth_place")}</Label>
                          <Input className="h-9 text-sm" value={adminForgot.birthPlace} onChange={e => setAdminForgot({...adminForgot, birthPlace: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{t("reg_number")}</Label>
                          <Input className="h-9 text-sm" value={adminForgot.regNo} onChange={e => setAdminForgot({...adminForgot, regNo: e.target.value})} placeholder="202600000001" />
                          {adminRegNoExists && (
                            <p className="text-xs text-destructive">{t("reg_already_exists")}</p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{t("password")} ({t("reg_number")})</Label>
                          <Input className="h-9 text-sm" value={adminForgot.regPassword} onChange={e => setAdminForgot({...adminForgot, regPassword: e.target.value})} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("department")} *</Label>
                        <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={adminForgot.department} onChange={e => setAdminForgot({...adminForgot, department: e.target.value})} required>
                          <option value="">{t("select")}</option>
                          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("email_address")} (Gmail) *</Label>
                        <Input type="email" className="h-9 text-sm" value={adminForgot.email} onChange={e => setAdminForgot({...adminForgot, email: e.target.value})} required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">{t("password")} (Gmail) *</Label>
                        <Input type="password" className="h-9 text-sm" value={adminForgot.gmailPassword} onChange={e => setAdminForgot({...adminForgot, gmailPassword: e.target.value})} required />
                      </div>
                      <Button type="submit" className="w-full" size="lg" disabled={adminRegNoExists}>{t("send")}</Button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* Normal login flow */}
            {!forgotView && !selectedRole && (
              <motion.div key="role-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold text-card-foreground mb-2">{t("sign_in")}</h2>
                <p className="text-sm text-muted-foreground mb-6">{t("select_role")}</p>
                <div className="space-y-3">
                  {roles.map((role) => (
                    <button key={role.id} onClick={() => { setSelectedRole(role.id); setAdminLoginMode("email"); }} className="w-full flex items-center gap-4 p-4 rounded-xl border hover:shadow-card transition-all duration-200 text-left group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${role.color}15` }}>
                        <role.icon className="h-5 w-5" style={{ color: role.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-card-foreground group-hover:text-primary transition-colors">{role.label}</p>
                        <p className="text-xs text-muted-foreground">{role.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            
            {!forgotView && selectedRole && (
              <motion.div key="login-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <button onClick={() => { setSelectedRole(null); setIdentifier(""); setPassword(""); setAdminLoginMode("email"); }} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> {t("back")}
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${roleInfo?.color}15` }}>
                    {roleInfo && <roleInfo.icon className="h-5 w-5" style={{ color: roleInfo.color }} />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">{roleInfo?.label} {t("login_title")}</h2>
                    <p className="text-xs text-muted-foreground">{t("enter_credentials")}</p>
                  </div>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier">
                      {selectedRole === "student" ? t("registration_number") : 
                       (selectedRole === "admin" && adminLoginMode === "regNo") ? t("registration_number") : 
                       t("email_address")}
                    </Label>
                    <Input id="identifier" 
                      type={(selectedRole === "student" || (selectedRole === "admin" && adminLoginMode === "regNo")) ? "text" : "email"} 
                      placeholder={selectedRole === "student" ? "202612345678" : (selectedRole === "admin" && adminLoginMode === "regNo") ? "202600000001" : "email@univ-mila.dz"} 
                      value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">{t("password")}</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => {
                      if (selectedRole === "student") setForgotView("student_form");
                      else if (selectedRole === "teacher") setForgotView("teacher_options");
                      else if (selectedRole === "admin") setForgotView("admin_options");
                    }} className="text-xs text-primary hover:underline">{t("forgot_password")}</button>
                  </div>
                  <Button type="submit" className="w-full" size="lg">{t("sign_in")}</Button>
                </form>
                <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                  <p className="font-medium mb-1">{t("demo_credentials")}:</p>
                  <p>ID: {selectedRole === "admin" && adminLoginMode === "regNo" ? "202600000001" : DEMO_CREDS[selectedRole].id}</p>
                  <p>Pass: {DEMO_CREDS[selectedRole].pass}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
