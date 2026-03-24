import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, BookOpen, ShieldCheck, Users, Clock, FileText, 
  Bell, BarChart3, Globe, Lock, Calendar, ChevronDown,
  Instagram, Facebook, Mail
} from "lucide-react";
import heroImage from "@/assets/hero-university.jpg";
import HeaderActions from "@/components/HeaderActions";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const }
  })
};

const Index = () => {
  const { t } = useLanguage();

  const scrollToEcosystem = () => {
    document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg text-foreground">UniAttend</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#ecosystem" className="hover:text-foreground transition-colors">{t("features")}</a>
            <a href="#security" className="hover:text-foreground transition-colors">{t("security")}</a>
            <a href="#footer" className="hover:text-foreground transition-colors">{t("contact")}</a>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions />
            <Link to="/login">
              <Button size="sm">{t("access_dashboard")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="University campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-90" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground/80 text-xs font-medium mb-6">
                <GraduationCap className="h-3.5 w-3.5" />
                {t("hero_university")}
              </span>
            </motion.div>
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
              style={{ color: "hsl(0, 0%, 100%)" }}
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
            >
              {t("hero_title_1")}<br />
              <span style={{ color: "hsl(168, 70%, 50%)" }}>{t("hero_title_2")}</span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl mb-8 max-w-xl leading-relaxed"
              style={{ color: "hsl(210, 20%, 80%)" }}
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
            >
              {t("hero_desc")}
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial="hidden" animate="visible" variants={fadeUp} custom={3}
            >
              <Link to="/login">
                <Button variant="hero" size="lg" className="text-base px-8">
                  {t("access_dashboard")}
                </Button>
              </Link>
              <Button variant="hero-outline" size="lg" className="text-base px-8" onClick={scrollToEcosystem}>
                {t("learn_more")} <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 glass border-t">
          <div className="container mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t("digital_attendance"), icon: Clock },
              { label: t("smart_justifications"), icon: FileText },
              { label: t("realtime_notifications"), icon: Bell },
              { label: t("analytics_reports"), icon: BarChart3 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: "hsl(210, 20%, 85%)" }}>
                <item.icon className="h-4 w-4" style={{ color: "hsl(168, 70%, 50%)" }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">{t("platform_ecosystem")}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">{t("three_roles_one_platform")}</h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{t("ecosystem_desc")}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: t("student"), icon: GraduationCap, color: "hsl(217, 91%, 40%)", features: [t("attendance_history"), t("weekly_schedule"), t("submit_justifications"), t("view_announcements"), t("receive_notifications")] },
              { title: t("teacher"), icon: BookOpen, color: "hsl(168, 70%, 40%)", features: [t("mark_attendance_feat"), t("view_student_list"), t("review_justifications"), t("generate_reports"), t("access_schedule")] },
              { title: t("administrator"), icon: ShieldCheck, color: "hsl(38, 92%, 50%)", features: [t("account_management"), t("attendance_monitoring"), t("statistics_dashboard"), t("reports_system"), t("announcement_management")] },
            ].map((role, i) => (
              <motion.div key={i} className="rounded-xl border bg-card p-8 shadow-card hover:shadow-elevated transition-all duration-300 group" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: `${role.color}15` }}>
                  <role.icon className="h-6 w-6" style={{ color: role.color }} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-card-foreground">{role.title}</h3>
                <ul className="space-y-3">
                  {role.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: role.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-semibold text-accent uppercase tracking-wider">{t("security_features")}</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">{t("built_for_trust")}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: t("role_based_access"), desc: t("secure_permissions") },
              { icon: Clock, title: t("realtime_updates"), desc: t("instant_sync") },
              { icon: Globe, title: t("multi_language"), desc: t("multi_lang_desc") },
              { icon: Calendar, title: t("schedule_management"), desc: t("secure_timetable") },
            ].map((item, i) => (
              <motion.div key={i} className="rounded-xl bg-card border p-6 text-center shadow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 gradient-hero text-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "hsl(0,0%,100%)" }}>{t("ready_to_modernize")}</h2>
            <p className="mb-8 max-w-lg mx-auto" style={{ color: "hsl(210, 20%, 80%)" }}>{t("join_uniattend")}</p>
            <Link to="/login">
              <Button variant="hero" size="lg" className="text-base px-10">{t("get_started")}</Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg text-foreground">UniAttend</span>
              </div>
              <p className="text-sm text-muted-foreground">{t("footer_univ")}<br />{t("modern_platform")}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t("quick_links")}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <a href="#ecosystem" className="block hover:text-primary transition-colors">{t("features")}</a>
                <a href="#security" className="block hover:text-primary transition-colors">{t("security")}</a>
                <Link to="/login" className="block hover:text-primary transition-colors">{t("login")}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t("contact")}</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <a href="mailto:contact@centre-univ-mila.dz" className="flex items-center gap-2 hover:text-primary transition-colors"><Mail className="h-4 w-4" /> centre-univ-mila.dz</a>
                <a href="https://www.instagram.com/universitedemila" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors"><Instagram className="h-4 w-4" /> @universitedemila</a>
                <a href="https://www.facebook.com/share/1CEs4mZDEH/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors"><Facebook className="h-4 w-4" /> Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
            <p>{t("footer_rights")}</p>
            <p className="mt-1">{t("footer_copyright")}</p>
            <p className="mt-2 text-muted-foreground/70">{t("footer_credit")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
