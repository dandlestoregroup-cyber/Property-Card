import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  Star,
  MapPin,
  MessageSquare,
  Sparkles,
  Award,
  MoveRight,
  Coffee,
  Waves,
  Milestone,
  PawPrint,
  ChevronRight,
  ChevronLeft,
  Eye,
  X,
  Trash2,
  Plus,
  Loader2,
  Calendar,
  Layers,
  DollarSign,
  Users,
  Zap,
  BarChart3,
  Gift,
  FileText,
  Settings,
  Image as ImageIcon,
  Home,
  TrendingUp,
  Wallet,
  CalendarCheck,
  Phone,
  Send,
  Clock,
  Lock,
  Ship,
  Car,
  ShoppingBag,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Volume2,
  Copy,
  Download,
  ExternalLink,
} from "lucide-react";

/* ==================== GLOBAL STYLES ==================== */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Plus+Jakarta+Sans:wght@400;500;700;800&family=IBM+Plex+Sans+Arabic:wght@300;400;600;700&display=swap');
    :root{
      --font-serif:'Playfair Display',serif;
      --font-sans:'Plus Jakarta Sans',sans-serif;
      --font-ar:'IBM Plex Sans Arabic',sans-serif;
    }
    *{box-sizing:border-box}
    body{font-family:var(--font-sans);background:#f8fafc;margin:0}
    [dir="rtl"] *{font-family:var(--font-ar)!important}
    h1,h2,h3,h4,.font-serif{font-family:var(--font-serif)}
    .shimmer{
      background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);
      background-size:200% 100%;
      animation:shimmer 2s infinite
    }
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  `}</style>
);

/* ==================== TYPES ==================== */
type Lang = "en" | "ar";
type Plan = "basic" | "pro";
type Tab =
  | "listing"
  | "gallery"
  | "pricing"
  | "calendar"
  | "inbox"
  | "guidebook"
  | "marketing"
  | "upsells"
  | "analytics"
  | "team"
  | "integrations"
  | "settings";

type BookingStatus = "pending" | "confirmed" | "hold" | "expired" | "cancelled";
type BookingSource = "direct" | "airbnb" | "booking";
type BookingMode = "check_availability" | "instant_booking";

type MsgStatus = "pending" | "sent" | "replied";
type ICalStatus = "connected" | "error" | "syncing";

type Inquiry = {
  id: string;
  createdAt: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  estimate: number;
  source: "guest_web";
  status: "new" | "handled";
};

type Booking = {
  id: string;
  guest: string;
  email?: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  status: BookingStatus;
  source: BookingSource;
  holdExpiresAt?: string;
};

type Message = {
  id: string;
  guest: string;
  email?: string;
  content: string;
  aiReply: string;
  confidence: number;
  read: boolean;
  aiHandled: boolean;
  status: MsgStatus;
  createdAt: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "broker" | "cleaner" | "viewer";
  commission?: number;
};

type Upsell = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  icon: any;
};

type ICalConnection = {
  id: string;
  platform: "Airbnb" | "Booking.com" | "Other";
  url: string;
  status: ICalStatus;
  lastSync?: string;
  importedDates: string[];
};

type HolidayRule = { name: string; dates: string; start: string; end: string; mult: number };

type PropertyCore = typeof INITIAL_PROPERTY;

type Property = PropertyCore & {
  plan: Plan;
  booking_mode: BookingMode;
  hold_minutes: number;
  allow_instant_confirm: boolean;
  cancellation_policy_en: string;
  cancellation_policy_ar: string;
  welcome_en?: string;
  welcome_ar?: string;
  blocked_dates_manual: string[];
  blocked_dates_imported: string[];
};

/* ==================== MOCK DATA ==================== */
const HOLIDAYS: HolidayRule[] = [
  { name: "Ramadan", dates: "Feb 17 - Mar 18", start: "2026-02-17", end: "2026-03-18", mult: 0.7 },
  { name: "Eid al-Fitr", dates: "Mar 19 - Mar 23", start: "2026-03-19", end: "2026-03-23", mult: 2.0 },
  { name: "Eid al-Adha", dates: "May 26 - May 30", start: "2026-05-26", end: "2026-05-30", mult: 2.0 },
];

const INITIAL_PROPERTY = {
  id: "prop-1",
  status: "draft",
  name_en: "Salty Life Villa",
  name_ar: "فيلا سالتي لايف",
  location_en: "Azha, Ain Sokhna",
  location_ar: "أزهى، العين السخنة",
  hero_tag_en: "Azha Resort",
  hero_tag_ar: "منتجع أزهى",
  tagline_en: "Where the desert meets the sea.",
  tagline_ar: "حيث تلتقي الصحراء بالبحر.",
  desc_en: "A sanctuary of light and water.",
  desc_ar: "ملاذ من الضوء والماء.",
  secret_title_en: "A Little Secret",
  secret_title_ar: "سر صغير",
  secret_head_en: "Why guests check out late?",
  secret_head_ar: "لماذا يتأخر الضيوف؟",
  secret_body_en: "Villa aligned at 42° to catch perfect sunrise.",
  secret_body_ar: "الفيلا بزاوية 42 درجة لشروق مثالي.",
  destination_badge_en: "The Community",
  destination_badge_ar: "المجتمع",
  destination_head_en: "Azha El Sokhna",
  destination_head_ar: "أزهى السخنة",
  destination_body_en: "5.5km of crystal lagoons and white beaches.",
  destination_body_ar: "٥٫٥ كم من البحيرات والشواطئ.",
  dist_value: "150m",
  phase_value: "Phase 1",
  pets_allowed: true,
  rating: 4.9,
  base_price: 12500,
  cleaning_fee: 500,
  min_nights: 2,
  weekend_mult: 1.2,
  hero_image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1400",
  secondary_image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600",
  agent_name_en: "Youssef Ahmed",
  agent_name_ar: "يوسف أحمد",
  whatsapp: "20123456789",
  agent_avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
  amenities_en: ["Fast WiFi", "Smart TV", "Nespresso", "AC", "Parking", "24/7 Security"],
  amenities_ar: ["واي فاي سريع", "تلفزيون ذكي", "نسبريسو", "تكييف", "موقف", "أمن ٢٤/٧"],
  specs: { sleeps: 8, rooms: 3, level: "Ground" },
  gallery: [
    { src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000", title_en: "Lagoon View", title_ar: "إطلالة البحيرة" },
    { src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1000", title_en: "Master Suite", title_ar: "الجناح الرئيسي" },
    { src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000", title_en: "Kitchen", title_ar: "المطبخ" },
  ],
  blocked_dates: [] as string[],
};

const INITIAL_BOOKINGS: Booking[] = [
  { id: "b1", guest: "Mohamed Salah", checkIn: "2026-02-05", checkOut: "2026-02-08", nights: 3, guests: 4, total: 41000, status: "confirmed", source: "direct" },
  { id: "b2", guest: "Sarah Williams", checkIn: "2026-02-12", checkOut: "2026-02-19", nights: 7, guests: 6, total: 92000, status: "pending", source: "airbnb" },
  { id: "b3", guest: "Julia Schmidt", checkIn: "2026-03-21", checkOut: "2026-03-28", nights: 7, guests: 8, total: 54400, status: "pending", source: "booking" },
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    guest: "Sarah Williams",
    email: "sarah@email.com",
    content: "Hi! Is early check-in possible on Feb 12th? We arrive around 10am.",
    aiReply: "Hi Sarah! Early check-in at 10am is available for an additional 500 EGP. Would you like me to arrange it?",
    confidence: 92,
    read: true,
    aiHandled: false,
    status: "pending",
    createdAt: "2026-01-28T10:30:00Z",
  },
  {
    id: "m2",
    guest: "Mohamed Salah",
    email: "mohamed@email.com",
    content: "What's the WiFi password?",
    aiReply: "Hi Mohamed! The WiFi details will be shared in the welcome guide 24 hours before check-in. Anything else you need?",
    confidence: 98,
    read: true,
    aiHandled: true,
    status: "sent",
    createdAt: "2026-01-27T15:20:00Z",
  },
];

const TEAM: TeamMember[] = [
  { id: "t1", name: "Ahmed Hassan", email: "ahmed@saltylife.app", role: "owner" },
  { id: "t2", name: "Omar Farid", email: "omar@gmail.com", role: "broker", commission: 10 },
  { id: "t3", name: "Fatma Ali", email: "fatma@gmail.com", role: "cleaner" },
];

const UPSELLS_SEED: Upsell[] = [
  { id: "u1", name: "Early Check-in", price: 350, active: true, icon: Clock },
  { id: "u2", name: "Late Check-out", price: 400, active: true, icon: Clock },
  { id: "u3", name: "Airport Transfer", price: 600, active: true, icon: Car },
  { id: "u4", name: "Grocery Pack", price: 450, active: false, icon: ShoppingBag },
  { id: "u5", name: "Yacht Trip", price: 2500, active: false, icon: Ship },
];

const INITIAL_ICAL: ICalConnection[] = [
  { id: "ic1", platform: "Airbnb", url: "https://airbnb.com/calendar/ical/demo.ics", status: "connected", lastSync: "2026-01-29T08:00:00Z", importedDates: [] },
  { id: "ic2", platform: "Booking.com", url: "https://admin.booking.com/ical/demo.ics", status: "connected", lastSync: "2026-01-29T07:45:00Z", importedDates: [] },
];

/* ==================== HELPERS ==================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const fmtMoney = (n: number) => n.toLocaleString("en-US");
const toISO = (d: Date) => d.toISOString().slice(0, 10);
const between = (d: string, start: string, end: string) => d >= start && d <= end;

const nightsBetween = (checkIn: string, checkOut: string) => {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
};

const dateRange = (startISO: string, endISO: string) => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  const out: string[] = [];
  const d = new Date(start);
  while (d < end) {
    out.push(toISO(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
};

const isEgyptWeekend = (d: Date) => {
  const dow = d.getDay();
  return dow === 4 || dow === 5; // Thu/Fri
};

const computeDayPrice = (isoDate: string, base: number, weekendMult: number) => {
  const d = new Date(isoDate + "T00:00:00");
  let mult = 1;

  for (const h of HOLIDAYS) {
    if (between(isoDate, h.start, h.end)) {
      mult = h.mult;
      return { price: Math.round(base * mult), label: h.name, mult };
    }
  }

  if (isEgyptWeekend(d)) mult = weekendMult;
  return { price: Math.round(base * mult), label: mult !== 1 ? "Weekend" : "Base", mult };
};

const estimateTotal = (checkIn: string, checkOut: string, base: number, weekendMult: number, cleaningFee: number) => {
  if (!checkIn || !checkOut) return 0;
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) return 0;
  const days = dateRange(checkIn, checkOut);
  const sum = days.reduce((acc, day) => acc + computeDayPrice(day, base, weekendMult).price, 0);
  return sum + cleaningFee;
};

const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/* ==================== UI PRIMITIVES ==================== */
const Badge = ({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "premium" | "danger";
  size?: "xs" | "sm" | "md";
  className?: string;
}) => {
  const v: Record<string, string> = {
    default: "bg-stone-100 text-stone-600",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-sky-100 text-sky-700",
    premium: "bg-gradient-to-r from-amber-400 to-orange-500 text-white",
    danger: "bg-rose-100 text-rose-700",
  };
  const s: Record<string, string> = {
    xs: "px-2 py-0.5 text-[9px]",
    sm: "px-2.5 py-1 text-[10px]",
    md: "px-3 py-1.5 text-xs",
  };
  return (
    <span className={`inline-flex items-center rounded-full font-black uppercase tracking-wider ${v[variant]} ${s[size]} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  loading,
  icon,
  className = "",
  disabled,
  title,
}: any) => {
  const v: Record<string, string> = {
    primary: "bg-slate-950 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 border border-stone-200 hover:bg-stone-50",
    ghost: "hover:bg-stone-100 text-stone-600",
    teal: "bg-teal-600 text-white hover:bg-teal-500",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };
  const s: Record<string, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
    xs: "px-3 py-1.5 text-[11px]",
  };
  const isDisabled = disabled || loading;
  return (
    <button
      title={title}
      onClick={isDisabled ? undefined : onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-black tracking-wide transition active:scale-[0.99] ${v[variant]} ${s[size]} ${
        isDisabled ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon ? icon : null}
      {children}
    </button>
  );
};

const Card = ({ children, className = "", padding = "md", hover = false }: any) => {
  const p: Record<string, string> = { none: "", sm: "p-4", md: "p-6", lg: "p-8" };
  return (
    <div
      className={`rounded-3xl bg-white border border-stone-100 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ${
        hover ? "hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] transition" : ""
      } ${p[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

const FieldCard = ({ title, action, children, className = "" }: any) => (
  <Card className={className} padding="md">
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="text-sm font-black tracking-tight text-slate-900">{title}</div>
      {action}
    </div>
    {children}
  </Card>
);

const TextInput = ({ label, className = "", hint, ...props }: any) => (
  <label className={`block ${className}`}>
    {label ? <div className="text-[11px] font-black uppercase tracking-widest text-stone-500 mb-2">{label}</div> : null}
    <input
      {...props}
      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 outline-none focus:border-teal-500 text-sm text-slate-900 placeholder:text-stone-400"
    />
    {hint ? <div className="mt-2 text-[11px] text-stone-500">{hint}</div> : null}
  </label>
);

const TextArea = ({ label, className = "", hint, ...props }: any) => (
  <label className={`block ${className}`}>
    {label ? <div className="text-[11px] font-black uppercase tracking-widest text-stone-500 mb-2">{label}</div> : null}
    <textarea
      {...props}
      className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 outline-none focus:border-teal-500 text-sm text-slate-900 placeholder:text-stone-400 resize-none"
    />
    {hint ? <div className="mt-2 text-[11px] text-stone-500">{hint}</div> : null}
  </label>
);

const Toggle = ({ checked, onChange, label, disabled }: any) => (
  <div className={`flex items-center justify-between gap-3 ${disabled ? "opacity-60" : ""}`}>
    <div className="text-sm font-bold text-slate-900">{label}</div>
    <label className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
      <input disabled={disabled} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`w-12 h-7 rounded-full transition ${checked ? "bg-teal-600" : "bg-stone-300"}`} />
      <span className={`absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition ${checked ? "translate-x-5" : ""}`} />
    </label>
  </div>
);

const Segmented = ({ value, onChange, options, disabled, lockedText }: any) => (
  <div
    className={`p-1 rounded-2xl bg-stone-100 border border-stone-200 inline-flex gap-1 ${disabled ? "opacity-60" : ""}`}
    title={disabled ? lockedText : ""}
  >
    {options.map((o: any) => (
      <button
        key={o.value}
        onClick={disabled ? undefined : () => onChange(o.value)}
        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition ${
          value === o.value ? "bg-slate-950 text-white" : "text-stone-600 hover:bg-white"
        } ${disabled ? "cursor-not-allowed" : ""}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const MotionDiv = memo(({ children, className = "", delay = 0 }: any) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<any>(null);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
});

/* ==================== PAYWALL ==================== */
const LockRow = ({ title, desc, plan, required = "pro" as Plan }: any) => {
  const locked = plan !== required;
  return (
    <div className={`p-4 rounded-2xl border ${locked ? "border-stone-200 bg-stone-50" : "border-emerald-200 bg-emerald-50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-black text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-stone-600">{desc}</div>
        </div>
        {locked ? (
          <Badge variant="warning" size="sm" className="gap-1">
            <Lock className="w-3 h-3" />
            Upgrade
          </Badge>
        ) : (
          <Badge variant="success" size="sm">
            Enabled
          </Badge>
        )}
      </div>
    </div>
  );
};

/* ==================== GUEST VIEW ==================== */
const GuestView = ({
  property: p,
  lang,
  plan,
  bookings,
  blockedAll,
  onRequestAvailability,
  onInstantBook,
}: {
  property: Property;
  lang: Lang;
  plan: Plan;
  bookings: Booking[];
  blockedAll: Set<string>;
  onRequestAvailability: (payload: { checkIn: string; checkOut: string; guests: number }) => void;
  onInstantBook: (payload: { checkIn: string; checkOut: string; guests: number; name: string; phone: string; email: string }) => void;
}) => {
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guests, setGuests] = useState(2);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [instant, setInstant] = useState({ name: "", phone: "", email: "" });

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const bookingModeLocked = p.booking_mode === "instant_booking" && plan !== "pro";

  const nights = useMemo(() => nightsBetween(dates.checkIn, dates.checkOut), [dates.checkIn, dates.checkOut]);
  const est = useMemo(
    () => estimateTotal(dates.checkIn, dates.checkOut, p.base_price, p.weekend_mult, p.cleaning_fee),
    [dates.checkIn, dates.checkOut, p.base_price, p.weekend_mult, p.cleaning_fee]
  );

  const validation = useMemo(() => {
    if (!dates.checkIn || !dates.checkOut) return { ok: false, msg: t("Select dates", "اختار التواريخ") };
    if (nights <= 0) return { ok: false, msg: t("Check-out must be after check-in", "المغادرة لازم بعد الوصول") };
    if (nights < p.min_nights) return { ok: false, msg: t(`Minimum ${p.min_nights} nights`, `الحد الأدنى ${p.min_nights} ليالي`) };

    const days = dateRange(dates.checkIn, dates.checkOut);
    const conflict = days.find((d) => {
      const booked = bookings.some(
        (b) => b.status !== "cancelled" && b.status !== "expired" && dateRange(b.checkIn, b.checkOut).includes(d)
      );
      return blockedAll.has(d) || booked;
    });

    if (conflict) return { ok: false, msg: t("Selected dates not available", "التواريخ غير متاحة") };
    return { ok: true, msg: "" };
  }, [dates.checkIn, dates.checkOut, nights, p.min_nights, blockedAll, bookings, lang]);

  const handleWA = () => {
    const text = t(`Interested in ${p.name_en}. Can you confirm availability?`, `مهتم بـ ${p.name_ar}. ممكن تأكيد التوفر؟`);
    window.open(waLink(p.whatsapp, text), "_blank");
  };

  const submit = () => {
    if (!validation.ok) return;

    if (p.booking_mode === "check_availability") {
      onRequestAvailability({ checkIn: dates.checkIn, checkOut: dates.checkOut, guests });
      return;
    }

    if (bookingModeLocked) return;

    onInstantBook({
      checkIn: dates.checkIn,
      checkOut: dates.checkOut,
      guests,
      name: instant.name,
      phone: instant.phone,
      email: instant.email,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={p.hero_image} alt="hero" className="w-full h-[560px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-slate-50" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-10">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="premium" size="md">
              <Sparkles className="w-4 h-4 mr-2" />
              {t(p.hero_tag_en, p.hero_tag_ar)}
            </Badge>

            <div className="flex items-center gap-2">
              <Badge variant="default" size="md" className="bg-white/85 text-slate-900 border border-white/80">
                {t("From", "من")} {fmtMoney(p.base_price)} EGP
              </Badge>
              {p.booking_mode === "instant_booking" ? (
                <Badge variant="info" size="md" className="bg-white/85 text-slate-900 border border-white/80">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {t("Instant booking", "حجز فوري")}
                </Badge>
              ) : (
                <Badge variant="default" size="md" className="bg-white/85 text-slate-900 border border-white/80">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t("Check availability", "تأكيد توفر")}
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-7">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow">
                {t(p.name_en, p.name_ar)}
              </h1>
              <div className="mt-3 flex items-center gap-3 text-white/90">
                <MapPin className="w-4 h-4" />
                <div className="text-sm font-bold">{t(p.location_en, p.location_ar)}</div>
              </div>
              <div className="mt-6 max-w-xl">
                <div className="text-xl font-serif text-white">{t(p.tagline_en, p.tagline_ar)}</div>
                <div className="mt-2 text-sm text-white/80">{t(p.desc_en, p.desc_ar)}</div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="bg-white/95 border-white/60" padding="md">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-widest text-stone-500">{t("Rating", "التقييم")}</div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <div className="text-sm font-black text-slate-900">{p.rating}</div>
                    <Badge variant="success" size="xs">
                      <Award className="w-3 h-3 mr-1" />
                      {t("Top", "مميز")}
                    </Badge>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { icon: Waves, label: t("Beach", "الشاطئ"), value: p.dist_value },
                    { icon: Milestone, label: t("Phase", "المرحلة"), value: p.phase_value },
                    { icon: PawPrint, label: t("Pets", "حيوانات"), value: t(p.pets_allowed ? "OK" : "No", p.pets_allowed ? "مسموح" : "غير مسموح") },
                    { icon: Coffee, label: t("Coffee", "قهوة"), value: "Nespresso" },
                  ].map((it, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-2 text-stone-600">
                        <it.icon className="w-4 h-4" />
                        <div className="text-[11px] font-black uppercase tracking-widest">{it.label}</div>
                      </div>
                      <div className="mt-2 text-sm font-black text-slate-900">{it.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <img src={p.agent_avatar} alt="agent" className="w-10 h-10 rounded-xl object-cover border border-stone-100" />
                  <div className="min-w-0">
                    <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">{t("Broker", "المضيف")}</div>
                    <div className="text-sm font-black text-slate-900 truncate">{t(p.agent_name_en, p.agent_name_ar)}</div>
                  </div>
                  <div className="ml-auto">
                    <Button size="xs" variant="secondary" onClick={handleWA} icon={<Phone className="w-4 h-4" />}>
                      {t("WhatsApp", "واتساب")}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 pb-20 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            {/* Amenities */}
            <MotionDiv delay={50}>
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black text-slate-900">{t("Amenities", "المرافق")}</div>
                  <Badge variant="info">{t("Included", "مشمول")}</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(lang === "ar" ? p.amenities_ar : p.amenities_en).map((a, i) => (
                    <span key={i} className="px-3 py-2 rounded-2xl bg-stone-50 border border-stone-100 text-sm font-bold text-stone-700">
                      {a}
                    </span>
                  ))}
                </div>
              </Card>
            </MotionDiv>

            {/* Secret */}
            <MotionDiv delay={100}>
              <Card hover className="relative overflow-hidden">
                <div className="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-teal-200/30 blur-2xl" />
                <Badge variant="premium">{t(p.secret_title_en, p.secret_title_ar)}</Badge>
                <div className="mt-4 text-2xl font-black tracking-tight text-slate-900">{t(p.secret_head_en, p.secret_head_ar)}</div>
                <div className="mt-3 text-sm text-stone-600 leading-relaxed">{t(p.secret_body_en, p.secret_body_ar)}</div>
              </Card>
            </MotionDiv>

            {/* Gallery */}
            <MotionDiv delay={150}>
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black text-slate-900">{t("Gallery", "المعرض")}</div>
                    <div className="text-xs text-stone-500">{t("Inside the villa", "صور الفيلا")}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGalleryIdx((g) => clamp(g - 1, 0, p.gallery.length - 1))}
                      className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGalleryIdx((g) => clamp(g + 1, 0, p.gallery.length - 1))}
                      className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl overflow-hidden border border-stone-100">
                  <img src={p.gallery[galleryIdx]?.src} alt="gallery" className="w-full h-[360px] object-cover" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm font-black text-slate-900">
                    {String(galleryIdx + 1).padStart(2, "0")} / {String(p.gallery.length).padStart(2, "0")}
                  </div>
                  <div className="text-sm text-stone-600">{t(p.gallery[galleryIdx]?.title_en || "", p.gallery[galleryIdx]?.title_ar || "")}</div>
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto">
                  {p.gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIdx(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition ${
                        galleryIdx === i ? "border-teal-500" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.src} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Card>
            </MotionDiv>

            {/* Destination */}
            <MotionDiv delay={200}>
              <Card hover>
                <Badge variant="info">{t(p.destination_badge_en, p.destination_badge_ar)}</Badge>
                <div className="mt-4 text-2xl font-black tracking-tight text-slate-900">{t(p.destination_head_en, p.destination_head_ar)}</div>
                <div className="mt-3 text-sm text-stone-600 leading-relaxed">{t(p.destination_body_en, p.destination_body_ar)}</div>
              </Card>
            </MotionDiv>

            {/* House Rules + Cancellation */}
            <MotionDiv delay={250}>
              <Card hover>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black text-slate-900">{t("House Rules", "القواعد")}</div>
                  <Badge variant="warning">{t("Respect the space", "احترام المكان")}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: Clock, text: t("Check-in: 3 PM", "الوصول: ٣ م") },
                    { icon: Clock, text: t("Checkout: 11 AM", "المغادرة: ١١ ص") },
                    { icon: Users, text: t(`Max ${p.specs.sleeps}`, `حد ${p.specs.sleeps}`) },
                    { icon: Volume2, text: t("Quiet 10PM", "هدوء ١٠ م") },
                  ].map((r, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-2 text-stone-700">
                      <r.icon className="w-4 h-4" />
                      <div className="text-sm font-bold">{r.text}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-2xl border border-stone-200 bg-white">
                  <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">
                    {t("Cancellation policy", "سياسة الإلغاء")}
                  </div>
                  <div className="mt-2 text-sm text-stone-700 leading-relaxed">{t(p.cancellation_policy_en, p.cancellation_policy_ar)}</div>
                </div>
              </Card>
            </MotionDiv>
          </div>

          {/* Booking Box */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 space-y-4">
              <Card className="border-stone-100" hover>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black text-slate-900">{t("Booking", "الحجز")}</div>
                  {p.booking_mode === "instant_booking" ? (
                    <Badge variant="info">{t("Instant booking", "حجز فوري")}</Badge>
                  ) : (
                    <Badge variant="default">{t("Check availability", "تأكيد توفر")}</Badge>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <TextInput type="date" label={t("Check In", "الوصول")} value={dates.checkIn} onChange={(e: any) => setDates({ ...dates, checkIn: e.target.value })} />
                  <TextInput type="date" label={t("Check Out", "المغادرة")} value={dates.checkOut} onChange={(e: any) => setDates({ ...dates, checkOut: e.target.value })} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <TextInput
                    type="number"
                    min={1}
                    max={p.specs.sleeps}
                    label={t("Guests", "الضيوف")}
                    value={guests}
                    onChange={(e: any) => setGuests(+e.target.value)}
                  />
                  <div className="col-span-2">
                    <div className="text-[11px] font-black uppercase tracking-widest text-stone-500 mb-2">
                      {t("Estimate", "تقدير")}
                    </div>
                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
                      <div className="text-sm font-black text-slate-900">{est ? `${fmtMoney(est)} EGP` : t("Select dates", "اختار التواريخ")}</div>
                      <div className="text-[11px] text-stone-500 mt-1">
                        {nights > 0 ? t(`${nights} nights + cleaning`, `${nights} ليالي + تنظيف`) : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instant booking fields */}
                {p.booking_mode === "instant_booking" && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">{t("Guest details", "بيانات الضيف")}</div>
                      {bookingModeLocked ? (
                        <Badge variant="warning" size="xs" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Pro
                        </Badge>
                      ) : (
                        <Badge variant="success" size="xs">
                          {t("Enabled", "مفعل")}
                        </Badge>
                      )}
                    </div>

                    <div className={`mt-3 grid grid-cols-1 gap-3 ${bookingModeLocked ? "opacity-60" : ""}`}>
                      <TextInput disabled={bookingModeLocked} label={t("Full name", "الاسم")} value={instant.name} onChange={(e: any) => setInstant({ ...instant, name: e.target.value })} />
                      <div className="grid grid-cols-2 gap-3">
                        <TextInput
                          disabled={bookingModeLocked}
                          label={t("Phone", "الهاتف")}
                          value={instant.phone}
                          onChange={(e: any) => setInstant({ ...instant, phone: e.target.value })}
                          placeholder="2012xxxxxxx"
                        />
                        <TextInput
                          disabled={bookingModeLocked}
                          label={t("Email", "الإيميل")}
                          value={instant.email}
                          onChange={(e: any) => setInstant({ ...instant, email: e.target.value })}
                          placeholder="name@email.com"
                        />
                      </div>
                    </div>

                    {bookingModeLocked && (
                      <div className="mt-3 p-3 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-xs">
                        {t("Instant booking is a Pro feature.", "الحجز الفوري ضمن خطة Pro.")}
                      </div>
                    )}
                  </div>
                )}

                {!validation.ok && (dates.checkIn || dates.checkOut) ? (
                  <div className="mt-4 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-3">{validation.msg}</div>
                ) : null}

                <div className="mt-4 flex gap-3">
                  <Button
                    className="flex-1"
                    variant={p.booking_mode === "check_availability" ? "secondary" : "teal"}
                    onClick={submit}
                    disabled={!validation.ok || (p.booking_mode === "instant_booking" && bookingModeLocked)}
                    icon={p.booking_mode === "check_availability" ? <MessageSquare className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
                  >
                    {p.booking_mode === "check_availability" ? t("Request Availability", "طلب توفر") : t("Book Now", "احجز الآن")}
                  </Button>

                  <Button variant="secondary" onClick={handleWA} icon={<Phone className="w-4 h-4" />}>
                    {t("WhatsApp", "واتساب")}
                  </Button>
                </div>
              </Card>

              {/* Floating CTA */}
              <button
                onClick={handleWA}
                className="w-full rounded-2xl bg-slate-950 text-white px-5 py-4 font-black flex items-center justify-between hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="premium" size="xs">
                    {t("Direct", "مباشر")}
                  </Badge>
                  <div className="text-sm">{t("Contact", "تواصل")}</div>
                </div>
                <MoveRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==================== ADMIN TABS ==================== */
const ListingTab = ({ draft, setDraft, plan }: any) => {
  const lockedOptimize = plan !== "pro"; // Phase 2 paid placeholder
  return (
    <div className="space-y-6">
      <FieldCard title="English" action={<Badge variant="info" size="sm">EN</Badge>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextInput label="Name" value={draft.name_en} onChange={(e: any) => setDraft({ ...draft, name_en: e.target.value })} />
          <TextInput label="Location" value={draft.location_en} onChange={(e: any) => setDraft({ ...draft, location_en: e.target.value })} />
          <TextInput label="Tagline" value={draft.tagline_en} onChange={(e: any) => setDraft({ ...draft, tagline_en: e.target.value })} />
        </div>
        <TextArea className="mt-3" label="Description" rows={3} value={draft.desc_en} onChange={(e: any) => setDraft({ ...draft, desc_en: e.target.value })} />
      </FieldCard>

      <FieldCard title="Arabic" action={<Badge variant="info" size="sm">AR</Badge>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <TextInput label="الاسم" value={draft.name_ar} onChange={(e: any) => setDraft({ ...draft, name_ar: e.target.value })} />
          <TextInput label="الموقع" value={draft.location_ar} onChange={(e: any) => setDraft({ ...draft, location_ar: e.target.value })} />
          <TextInput label="الجملة" value={draft.tagline_ar} onChange={(e: any) => setDraft({ ...draft, tagline_ar: e.target.value })} />
        </div>
        <TextArea className="mt-3" label="الوصف" rows={3} value={draft.desc_ar} onChange={(e: any) => setDraft({ ...draft, desc_ar: e.target.value })} />
      </FieldCard>

      <FieldCard title="Specs" action={<Badge variant="default" size="sm">Core</Badge>}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <TextInput
            label="Sleeps"
            type="number"
            value={draft.specs.sleeps}
            onChange={(e: any) => setDraft({ ...draft, specs: { ...draft.specs, sleeps: +e.target.value } })}
          />
          <TextInput
            label="Rooms"
            type="number"
            value={draft.specs.rooms}
            onChange={(e: any) => setDraft({ ...draft, specs: { ...draft.specs, rooms: +e.target.value } })}
          />
          <TextInput
            label="Level"
            value={draft.specs.level}
            onChange={(e: any) => setDraft({ ...draft, specs: { ...draft.specs, level: e.target.value } })}
          />
          <TextInput
            label="Rating"
            type="number"
            step="0.1"
            value={draft.rating}
            onChange={(e: any) => setDraft({ ...draft, rating: +e.target.value })}
          />
        </div>
      </FieldCard>

      <FieldCard title="Listing Optimization (Phase 2)" action={<Badge variant="warning" size="sm">Paid</Badge>}>
        <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-slate-900">Optimize Listing (AI)</div>
            <div className="mt-1 text-xs text-stone-600">Auto-improve title, hook, amenities order, and conversion layout.</div>
          </div>
          <Button
            disabled={lockedOptimize}
            title={lockedOptimize ? "Upgrade to Pro" : ""}
            variant="secondary"
            icon={lockedOptimize ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          >
            {lockedOptimize ? "Locked" : "Run"}
          </Button>
        </div>
      </FieldCard>
    </div>
  );
};

const GalleryTab = ({ draft, setDraft, plan }: any) => {
  const lockedEdit = plan !== "pro"; // Phase 2 paid placeholder
  return (
    <div className="space-y-6">
      <FieldCard title="Hero Image" action={<Badge variant="default">Core</Badge>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          <div className="md:col-span-1 rounded-3xl overflow-hidden border border-stone-100">
            <img src={draft.hero_image} alt="hero" className="w-full h-52 object-cover" />
          </div>
          <div className="md:col-span-2 space-y-3">
            <TextInput label="Hero URL" value={draft.hero_image} onChange={(e: any) => setDraft({ ...draft, hero_image: e.target.value })} />
            <TextInput label="Secondary URL" value={draft.secondary_image} onChange={(e: any) => setDraft({ ...draft, secondary_image: e.target.value })} />
          </div>
        </div>
      </FieldCard>

      <FieldCard
        title={`Gallery (${draft.gallery.length}/6)`}
        action={
          <Button
            size="xs"
            variant="secondary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              if (draft.gallery.length >= 6) return;
              setDraft({
                ...draft,
                gallery: [...draft.gallery, { src: draft.hero_image, title_en: "New", title_ar: "جديد" }],
              });
            }}
          >
            Add
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.gallery.map((img: any, i: number) => (
            <div key={i} className="p-4 rounded-3xl border border-stone-100 bg-white">
              <div className="rounded-2xl overflow-hidden border border-stone-100">
                <img src={img.src} alt="g" className="w-full h-44 object-cover" />
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <TextInput
                  label="Image URL"
                  value={img.src}
                  onChange={(e: any) => {
                    const g = [...draft.gallery];
                    g[i] = { ...g[i], src: e.target.value };
                    setDraft({ ...draft, gallery: g });
                  }}
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Title EN"
                    value={img.title_en}
                    onChange={(e: any) => {
                      const g = [...draft.gallery];
                      g[i] = { ...g[i], title_en: e.target.value };
                      setDraft({ ...draft, gallery: g });
                    }}
                  />
                  <TextInput
                    label="Title AR"
                    value={img.title_ar}
                    onChange={(e: any) => {
                      const g = [...draft.gallery];
                      g[i] = { ...g[i], title_ar: e.target.value };
                      setDraft({ ...draft, gallery: g });
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant="danger"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => setDraft({ ...draft, gallery: draft.gallery.filter((_: any, idx: number) => idx !== i) })}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FieldCard>

      <FieldCard title="Edit Photos (Phase 2)" action={<Badge variant="warning">Paid</Badge>}>
        <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-slate-900">Image Editing</div>
            <div className="mt-1 text-xs text-stone-600">Clean, upscale, remove clutter, and create consistent listing visuals.</div>
          </div>
          <Button disabled={lockedEdit} variant="secondary" icon={<Lock className="w-4 h-4" />} title="Phase 2 Paid">
            Locked
          </Button>
        </div>
      </FieldCard>
    </div>
  );
};

const PricingTab = ({ draft, setDraft }: any) => (
  <div className="space-y-6">
    <FieldCard title="Core Pricing" action={<Badge variant="default">Core</Badge>}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <TextInput label="Base price (EGP)" type="number" value={draft.base_price} onChange={(e: any) => setDraft({ ...draft, base_price: +e.target.value })} />
        <TextInput label="Cleaning fee (EGP)" type="number" value={draft.cleaning_fee} onChange={(e: any) => setDraft({ ...draft, cleaning_fee: +e.target.value })} />
        <TextInput label="Min nights" type="number" value={draft.min_nights} onChange={(e: any) => setDraft({ ...draft, min_nights: +e.target.value })} />
        <TextInput label="Weekend multiplier" type="number" step="0.1" value={draft.weekend_mult} onChange={(e: any) => setDraft({ ...draft, weekend_mult: +e.target.value })} />
      </div>
    </FieldCard>

    <FieldCard title="Holiday Pricing" action={<Badge variant="info">Rules</Badge>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {HOLIDAYS.map((h) => (
          <div key={h.name} className="p-4 rounded-2xl border border-stone-100 bg-stone-50">
            <div className="text-sm font-black text-slate-900">{h.name}</div>
            <div className="mt-1 text-xs text-stone-500">{h.dates}</div>
            <div className="mt-3">
              <Badge variant={h.mult >= 1 ? "warning" : "success"}>{h.mult}x</Badge>
            </div>
          </div>
        ))}
      </div>
    </FieldCard>

    <FieldCard title="Preview (Next 7 Days)" action={<Badge variant="default">Preview</Badge>}>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const iso = toISO(d);
          const p = computeDayPrice(iso, draft.base_price, draft.weekend_mult);
          return (
            <div key={iso} className="p-3 rounded-2xl border border-stone-100 bg-white text-center">
              <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className="mt-1 text-lg font-black text-slate-900">{d.getDate()}</div>
              <div className="mt-2 text-sm font-black text-slate-900">{fmtMoney(p.price)} EGP</div>
              {p.mult !== 1 ? (
                <div className="mt-2">
                  <Badge variant="info" size="xs">
                    {p.label}
                  </Badge>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </FieldCard>
  </div>
);

const CalendarTab = ({ property, setProperty, bookings, blockedAll, plan }: any) => {
  const [month, setMonth] = useState(new Date(2026, 1, 1)); // Feb 2026
  const [selected, setSelected] = useState<string[]>([]);

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1).getDay();

  const bookedDates = useMemo(() => {
    const set = new Set<string>();
    bookings
      .filter((b: Booking) => b.status === "confirmed" || b.status === "hold")
      .forEach((b: Booking) => dateRange(b.checkIn, b.checkOut).forEach((d) => set.add(d)));
    return set;
  }, [bookings]);

  const getBookingOn = (date: string) => {
    return bookings.find((b: Booking) => (b.status === "confirmed" || b.status === "hold") && dateRange(b.checkIn, b.checkOut).includes(date));
  };

  const formatDate = (d: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const toggleSelect = (date: string) => {
    if (bookedDates.has(date) || blockedAll.has(date)) return;
    setSelected((s) => (s.includes(date) ? s.filter((x) => x !== date) : [...s, date]));
  };

  const clear = () => setSelected([]);

  const blockSelected = () => {
    const merged = Array.from(new Set([...(property.blocked_dates_manual || []), ...selected]));
    setProperty({ ...property, blocked_dates_manual: merged });
    setSelected([]);
  };

  const unblock = (date: string) => {
    const merged = (property.blocked_dates_manual || []).filter((d: string) => d !== date);
    setProperty({ ...property, blocked_dates_manual: merged });
  };

  const days: React.ReactNode[] = [];
  for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} />);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = formatDate(d);
    const isBooked = bookedDates.has(date);
    const isBlocked = blockedAll.has(date);
    const isSel = selected.includes(date);
    const booking = getBookingOn(date);
    const price = computeDayPrice(date, property.base_price, property.weekend_mult);

    days.push(
      <div
        key={date}
        onClick={() => toggleSelect(date)}
        className={`h-20 p-2 rounded-2xl cursor-pointer transition border relative overflow-hidden ${
          isBooked
            ? "bg-teal-100 border-teal-200 cursor-not-allowed"
            : isBlocked
            ? "bg-stone-100 border-stone-200 cursor-not-allowed"
            : isSel
            ? "bg-slate-900 text-white border-slate-900"
            : price.mult !== 1
            ? "bg-amber-50 border-amber-200 hover:border-teal-300"
            : "bg-white border-stone-100 hover:border-teal-300"
        }`}
        title={isBlocked && !isBooked ? "Blocked" : isBooked ? "Booked" : ""}
      >
        <div className={`text-sm font-black ${isSel ? "text-white" : "text-slate-900"}`}>{d}</div>

        {isBooked && (
          <div className="mt-1 text-[10px] font-black text-teal-800">
            Booked
            <div className="mt-1 text-[10px] text-teal-900 font-bold">{booking?.guest.split(" ")[0]}</div>
          </div>
        )}

        {isBlocked && !isBooked && (
          <div className="mt-1 text-[10px] font-black text-stone-600">
            Blocked
            {property.blocked_dates_manual?.includes(date) ? (
              <button
                className="mt-1 text-[10px] underline text-stone-700 hover:text-slate-900"
                onClick={(e) => {
                  e.stopPropagation();
                  unblock(date);
                }}
              >
                Unblock
              </button>
            ) : (
              <div className="mt-1 text-[10px] text-stone-500">iCal</div>
            )}
          </div>
        )}

        {!isBooked && !isBlocked && (
          <div className={`absolute right-2 bottom-2 text-[10px] font-black ${isSel ? "text-white/90" : "text-stone-600"}`}>
            {fmtMoney(price.price)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FieldCard
        title="Calendar"
        action={
          <div className="flex items-center gap-2">
            <Button size="xs" variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} icon={<ChevronLeft className="w-4 h-4" />}>
              Prev
            </Button>
            <Button size="xs" variant="secondary" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} icon={<ChevronRight className="w-4 h-4" />}>
              Next
            </Button>
          </div>
        }
      >
        <div className="flex items-center justify-between">
          <div className="text-sm font-black text-slate-900">{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
          <div className="flex items-center gap-2">
            <Badge variant="info" size="xs">
              Thu/Fri weekend
            </Badge>
            <Badge variant="warning" size="xs">
              Holiday rules
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-[10px] font-black uppercase tracking-widest text-stone-500">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-2">
              {d}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">{days}</div>

        {selected.length > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="text-sm font-bold text-stone-700">{selected.length} selected</div>
            <div className="flex items-center gap-2">
              <Button size="xs" variant="secondary" onClick={clear}>
                Clear
              </Button>
              <Button size="xs" variant="teal" onClick={blockSelected}>
                Block
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-teal-100 border border-teal-200 inline-block" /> Booked
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-stone-100 border border-stone-200 inline-block" /> Blocked
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-amber-50 border border-amber-200 inline-block" /> Holiday price
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-slate-900 border border-slate-900 inline-block" /> Selected
          </div>
        </div>
      </FieldCard>

      <FieldCard title="iCal Notes" action={<Badge variant="default">Calendar</Badge>}>
        <div className="text-sm text-stone-600 leading-relaxed">
          Manual blocks live in <span className="font-bold text-slate-900">Blocked (Manual)</span>. Imported blocks live in{" "}
          <span className="font-bold text-slate-900">Blocked (iCal)</span>. Both are merged for availability checks.
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <LockRow plan={plan} title="iCal Import & Sync" desc="Pro: add channel iCal links + sync to block dates automatically." />
          <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-900">iCal Export</div>
                <div className="mt-1 text-xs text-stone-600">Basic: share your calendar feed to channels.</div>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>
          </div>
        </div>
      </FieldCard>
    </div>
  );
};

const InboxTab = ({ messages, setMessages }: any) => {
  const [sel, setSel] = useState<Message | null>(messages[0] || null);
  const [reply, setReply] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const msgs = useMemo(() => (filter === "unread" ? messages.filter((m: Message) => !m.read) : messages), [messages, filter]);

  useEffect(() => {
    if (!sel && messages.length) setSel(messages[0]);
  }, [messages, sel]);

  const markRead = (id: string) => setMessages((ms: Message[]) => ms.map((m) => (m.id === id ? { ...m, read: true } : m)));

  const sendReply = () => {
    if (!sel) return;
    setMessages((ms: Message[]) =>
      ms.map((m) => (m.id === sel.id ? { ...m, status: "sent", aiHandled: true, read: true } : m))
    );
    setReply("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-5" padding="none">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="text-sm font-black text-slate-900">Inbox</div>
          <div className="flex items-center gap-2">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${
                  filter === f ? "bg-slate-950 text-white" : "text-stone-500 hover:bg-stone-100"
                }`}
              >
                {f === "all" ? "All" : `Unread (${messages.filter((m: Message) => !m.read).length})`}
              </button>
            ))}
          </div>
        </div>

        <div>
          {msgs.map((m: Message) => (
            <button
              key={m.id}
              onClick={() => {
                setSel(m);
                markRead(m.id);
              }}
              className={`w-full text-left p-4 border-b border-stone-50 transition ${
                sel?.id === m.id ? "bg-teal-50" : "hover:bg-stone-50"
              } ${!m.read ? "border-l-2 border-l-teal-500" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-black text-slate-900">{m.guest}</div>
                <Badge variant={m.status === "pending" ? "warning" : "success"} size="xs">
                  {m.status}
                </Badge>
              </div>
              <div className="mt-2 text-sm text-stone-600 line-clamp-2">{m.content}</div>
              <div className="mt-2 text-[10px] text-stone-500">
                {m.aiHandled ? "AI handled" : "Needs review"} · {Math.round(m.confidence)}%
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-7" padding="md">
        {sel ? (
          <>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-black text-slate-900">{sel.guest}</div>
                <div className="text-xs text-stone-500">{sel.email || "-"}</div>
              </div>
              <Badge variant="info">AI Suggestion</Badge>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-stone-100 bg-stone-50">
              <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">Guest message</div>
              <div className="mt-2 text-sm text-stone-700 leading-relaxed">{sel.content}</div>
            </div>

            <div className="mt-4 p-4 rounded-2xl border border-teal-100 bg-teal-50">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black uppercase tracking-widest text-teal-700">AI suggested reply</div>
                <Badge variant="success" size="xs">
                  {Math.round(sel.confidence)}%
                </Badge>
              </div>
              <div className="mt-2 text-sm text-teal-900 whitespace-pre-line">{sel.aiReply}</div>
              <div className="mt-3 flex gap-2">
                <Button size="xs" variant="secondary" onClick={() => setReply(sel.aiReply)} icon={<Sparkles className="w-4 h-4" />}>
                  Use AI
                </Button>
                <Button size="xs" variant="secondary" onClick={() => setReply("")} icon={<X className="w-4 h-4" />}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <TextArea value={reply} onChange={(e: any) => setReply(e.target.value)} rows={3} label="Reply" placeholder="Type reply..." />
              <div className="mt-3 flex justify-end">
                <Button onClick={sendReply} variant="teal" icon={<Send className="w-4 h-4" />} disabled={!reply.trim()}>
                  Send
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-stone-600">No message selected.</div>
        )}
      </Card>
    </div>
  );
};

const GuidebookTab = ({ draft, setDraft }: any) => (
  <div className="space-y-6">
    <FieldCard title="Welcome Message" action={<Badge variant="default">Core</Badge>}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TextArea label="English" rows={4} value={draft.welcome_en || ""} onChange={(e: any) => setDraft({ ...draft, welcome_en: e.target.value })} placeholder="Welcome to Salty Life..." />
        <TextArea label="Arabic" rows={4} value={draft.welcome_ar || ""} onChange={(e: any) => setDraft({ ...draft, welcome_ar: e.target.value })} placeholder="أهلاً بيكم..." />
      </div>
    </FieldCard>

    <FieldCard title="Local Tips" action={<Badge variant="info">Curated</Badge>}>
      <div className="space-y-2">
        {["Moods Restaurant - Best seafood", "Kite Beach - Sunset views", "Downtown - Shopping"].map((tip, i) => (
          <div key={i} className="p-4 rounded-2xl border border-stone-100 bg-stone-50 text-sm font-bold text-stone-700">
            {tip}
          </div>
        ))}
      </div>
    </FieldCard>
  </div>
);

const UpsellsTab = ({ plan, upsells, setUpsells }: any) => {
  const locked = plan !== "pro";
  return (
    <div className="space-y-6">
      <FieldCard
        title="Upsells"
        action={
          <div className="flex items-center gap-2">
            {locked ? <Badge variant="warning">Pro</Badge> : <Badge variant="success">Enabled</Badge>}
            <Button disabled={locked} size="xs" variant="secondary" icon={locked ? <Lock className="w-4 h-4" /> : <Plus className="w-4 h-4" />} title={locked ? "Upgrade to Pro" : ""}>
              Add
            </Button>
          </div>
        }
      >
        <div className={`${locked ? "opacity-60" : ""} space-y-3`}>
          {upsells.map((u: Upsell) => (
            <div key={u.id} className="p-4 rounded-2xl border border-stone-100 bg-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-600">
                  <u.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{u.name}</div>
                  <div className="text-xs text-stone-500">{fmtMoney(u.price)} EGP</div>
                </div>
              </div>
              <Toggle
                disabled={locked}
                checked={u.active}
                onChange={(v: boolean) => setUpsells((arr: Upsell[]) => arr.map((x) => (x.id === u.id ? { ...x, active: v } : x)))}
                label={u.active ? "Active" : "Inactive"}
              />
            </div>
          ))}
        </div>
      </FieldCard>

      <LockRow plan={plan} title="Upsells require Pro" desc="Keep V1 clean. Upsells become monetization in Pro." />
    </div>
  );
};

const AnalyticsTab = ({ bookings }: any) => {
  const revenue = [28500, 32300, 41800, 38200, 52600, 45355];
  const max = Math.max(...revenue);
  const sources = [
    { n: "Direct", v: 45 },
    { n: "Airbnb", v: 30 },
    { n: "Booking", v: 20 },
    { n: "Other", v: 5 },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-stone-500">Revenue</div>
            <Wallet className="w-5 h-5 text-stone-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{fmtMoney(bookings.reduce((s: number, b: Booking) => s + b.total, 0))} EGP</div>
          <div className="mt-2 text-xs text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +12%
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-stone-500">Bookings</div>
            <Calendar className="w-5 h-5 text-stone-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{bookings.length}</div>
          <div className="mt-2 text-xs text-stone-600 font-bold">This quarter</div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-stone-500">Occupancy</div>
            <BarChart3 className="w-5 h-5 text-stone-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">68%</div>
          <div className="mt-2 text-xs text-stone-600 font-bold">Avg</div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div className="text-xs font-black uppercase tracking-widest text-stone-500">Inbox</div>
            <MessageSquare className="w-5 h-5 text-stone-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">2</div>
          <div className="mt-2 text-xs text-amber-700 font-bold">Pending</div>
        </Card>
      </div>

      <FieldCard title="Revenue Trend" action={<Badge variant="default">Mock</Badge>}>
        <div className="grid grid-cols-6 gap-2 items-end h-28">
          {revenue.map((v, i) => (
            <div key={i} className="rounded-2xl bg-stone-100 border border-stone-200 flex items-end overflow-hidden">
              <div className="w-full bg-slate-900" style={{ height: `${Math.round((v / max) * 100)}%` }} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-stone-500 font-bold">
          {["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"].map((m) => (
            <div key={m}>{m}</div>
          ))}
        </div>
      </FieldCard>

      <FieldCard title="Booking Sources" action={<Badge variant="info">Mix</Badge>}>
        <div className="space-y-2">
          {sources.map((s) => (
            <div key={s.n} className="p-4 rounded-2xl border border-stone-100 bg-white flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">{s.n}</div>
              <div className="text-sm font-black text-stone-600">{s.v}%</div>
            </div>
          ))}
        </div>
      </FieldCard>
    </div>
  );
};

const TeamTab = () => (
  <div className="space-y-6">
    <FieldCard title={`Team Members (${TEAM.length})`} action={<Button size="xs" variant="secondary" icon={<Plus className="w-4 h-4" />}>Invite</Button>}>
      <div className="space-y-3">
        {TEAM.map((m) => (
          <div key={m.id} className="p-4 rounded-2xl border border-stone-100 bg-white flex items-center justify-between">
            <div>
              <div className="text-sm font-black text-slate-900">{m.name}</div>
              <div className="text-xs text-stone-500">{m.email}</div>
            </div>
            <div className="text-xs font-black uppercase tracking-widest text-stone-600">
              {m.role}
              {m.commission ? ` · ${m.commission}%` : ""}
            </div>
          </div>
        ))}
      </div>
    </FieldCard>
  </div>
);

const RefreshIcon = () => <Zap className="w-4 h-4" />;

const IntegrationsTab = ({ plan, ical, setIcal, property, setProperty }: any) => {
  const exportUrl = useMemo(() => `https://saltylife.app/ical/${property.id}.ics`, [property.id]);
  const [newUrl, setNewUrl] = useState("");
  const [newPlatform, setNewPlatform] = useState<"Airbnb" | "Booking.com" | "Other">("Other");

  const canImport = plan === "pro";

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {}
  };

  useEffect(() => {
    const allImported = new Set<string>();
    (ical as ICalConnection[]).forEach((c) => c.importedDates.forEach((d) => allImported.add(d)));
    setProperty((p: Property) => ({ ...p, blocked_dates_imported: Array.from(allImported) }));
  }, [ical, setProperty]);

  const syncNow = async (id: string) => {
    if (!canImport) return;

    setIcal((arr: ICalConnection[]) => arr.map((c) => (c.id === id ? { ...c, status: "syncing" } : c)));
    await new Promise((r) => setTimeout(r, 700));

    const seed = id.slice(-2).charCodeAt(0);
    const imported = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(2026, 1, 1);
      d.setDate(d.getDate() + ((seed + i * 3) % 25));
      return toISO(d);
    });

    setIcal((arr: ICalConnection[]) =>
      arr.map((c) => (c.id === id ? { ...c, status: "connected", lastSync: new Date().toISOString(), importedDates: imported } : c))
    );
  };

  const addConnection = () => {
    if (!canImport) return;
    if (!newUrl.trim()) return;
    const c: ICalConnection = {
      id: `ic-${uid()}`,
      platform: newPlatform,
      url: newUrl.trim(),
      status: "connected",
      lastSync: new Date().toISOString(),
      importedDates: [],
    };
    setIcal((arr: ICalConnection[]) => [c, ...arr]);
    setNewUrl("");
  };

  return (
    <div className="space-y-6">
      <FieldCard title="iCal Export" action={<Badge variant="success">Enabled</Badge>}>
        <div className="p-4 rounded-2xl border border-stone-100 bg-stone-50 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-black text-slate-900">Calendar Feed URL</div>
            <div className="mt-1 text-xs text-stone-500">{exportUrl}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="xs" variant="secondary" icon={<Copy className="w-4 h-4" />} onClick={() => copy(exportUrl)}>
              Copy
            </Button>
            <Button size="xs" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={() => downloadTextFile(`saltylife-${property.id}-export.txt`, exportUrl)}>
              Download
            </Button>
          </div>
        </div>
      </FieldCard>

      <FieldCard title="iCal Import" action={plan === "pro" ? <Badge variant="success">Pro</Badge> : <Badge variant="warning">Locked</Badge>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-stone-500 mb-2">Platform</div>
            <select
              disabled={!canImport}
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value as any)}
              className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-stone-50 outline-none focus:border-teal-500 text-sm"
            >
              <option>Airbnb</option>
              <option>Booking.com</option>
              <option>Other</option>
            </select>
          </div>
          <TextInput disabled={!canImport} label="iCal URL" value={newUrl} onChange={(e: any) => setNewUrl(e.target.value)} placeholder="https://... .ics" />
          <Button disabled={!canImport} variant="teal" icon={<Plus className="w-4 h-4" />} onClick={addConnection} title={!canImport ? "Upgrade to Pro" : ""}>
            Add
          </Button>
        </div>

        {!canImport && (
          <div className="mt-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">iCal Import is a Pro feature.</div>
        )}

        <div className={`mt-4 space-y-3 ${!canImport ? "opacity-60" : ""}`}>
          {ical.map((c: ICalConnection) => (
            <div key={c.id} className="p-4 rounded-2xl border border-stone-100 bg-white flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>{c.platform}</span>
                  <Badge variant={c.status === "connected" ? "success" : c.status === "syncing" ? "info" : "danger"} size="xs">
                    {c.status}
                  </Badge>
                </div>
                <div className="mt-1 text-xs text-stone-500 truncate">{c.url}</div>
                <div className="mt-1 text-[11px] text-stone-500">
                  Last sync: {c.lastSync ? new Date(c.lastSync).toLocaleString("en-US") : "—"} · Imported: {c.importedDates.length}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="xs" variant="secondary" disabled={!canImport} loading={c.status === "syncing"} icon={<RefreshIcon />} onClick={() => syncNow(c.id)}>
                  Sync
                </Button>
                <Button size="xs" variant="secondary" disabled={!canImport} icon={<Trash2 className="w-4 h-4" />} onClick={() => setIcal((arr: ICalConnection[]) => arr.filter((x) => x.id !== c.id))}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </FieldCard>

      <FieldCard title="Channel Manager (Phase 2)" action={<Badge variant="warning">Paid</Badge>}>
        <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black text-slate-900">Channel Manager</div>
            <div className="mt-1 text-xs text-stone-600">Push/pull rates + availability across channels (beyond iCal).</div>
          </div>
          <Button disabled variant="secondary" icon={<Lock className="w-4 h-4" />}>
            Locked
          </Button>
        </div>
      </FieldCard>
    </div>
  );
};

const MarketingToolkitTab = ({ plan, property }: any) => {
  const listingUrl = useMemo(() => `https://saltylife.app/p/${property.id}`, [property.id]);

  const [templates, setTemplates] = useState({
    inquiry_en: `Hi! Thanks for reaching out. Please share your dates and number of guests, and I’ll confirm availability.`,
    inquiry_ar: `أهلاً! من فضلك ابعتلي التواريخ وعدد الضيوف، وهأكد لك التوفر.`,
    confirmed_en: `Confirmed ✅ Your dates are available. Would you like to proceed with booking?`,
    confirmed_ar: `متاح ✅ التواريخ متوفرة. تحب نكمل الحجز؟`,
    quote_en: `For your dates, the total estimate is {TOTAL} EGP (including cleaning).`,
    quote_ar: `لتواريخك، التقدير الإجمالي {TOTAL} جنيه (شامل التنظيف).`,
    rules_en: `Friendly reminder: check-in 3PM, checkout 11AM, quiet after 10PM. Thank you 🙏`,
    rules_ar: `تذكير بسيط: الوصول ٣م، المغادرة ١١ص، هدوء بعد ١٠م. شكراً 🙏`,
  });

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {}
  };

  const downloadLite = () => {
    const content = JSON.stringify(
      { listingUrl, templates, note: "Marketing Toolkit Lite (Basic) export - mock file" },
      null,
      2
    );
    downloadTextFile(`saltylife-marketing-lite-${property.id}.json`, content);
  };

  const downloadProPack = () => {
    const pack = {
      listingUrl,
      assets: [
        { type: "instagram_post", title: "IG Post", uses: ["hero_image", "name", "from_price"] },
        { type: "instagram_story", title: "IG Story", uses: ["hero_image", "tagline"] },
        { type: "whatsapp_flyer", title: "WhatsApp Flyer", uses: ["hero_image", "location", "from_price"] },
      ],
      templates,
      note: "Marketing Toolkit Full (Pro) - mock download. Replace with real ZIP later.",
    };
    downloadTextFile(`saltylife-media-kit-${property.id}.json`, JSON.stringify(pack, null, 2));
  };

  const isPro = plan === "pro";

  return (
    <div className="space-y-6">
      <FieldCard title="Marketing Toolkit" action={isPro ? <Badge variant="success">Pro</Badge> : <Badge variant="default">Basic</Badge>}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hover className="md:col-span-1 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">Share Listing</div>
              <Share2 className="w-5 h-5 text-stone-500" />
            </div>
            <div className="mt-3 text-xs text-stone-500 break-all">{listingUrl}</div>
            <div className="mt-4 flex gap-2">
              <Button size="xs" variant="secondary" icon={<Copy className="w-4 h-4" />} onClick={() => copy(listingUrl)}>
                Copy
              </Button>
              <Button size="xs" variant="secondary" icon={<ExternalLink className="w-4 h-4" />} onClick={() => window.open(listingUrl, "_blank")}>
                Open
              </Button>
            </div>
          </Card>

          <Card hover className="md:col-span-2 p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">QR (Placeholder)</div>
              <Badge variant="info" size="xs">
                Lite
              </Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 h-36 flex items-center justify-center">
                <div className="text-[11px] font-black uppercase tracking-widest text-stone-500">QR Placeholder</div>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white h-36 overflow-hidden">
                <img src={property.hero_image} alt="mk" className="w-full h-full object-cover" />
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FieldCard title="WhatsApp Templates (EN)" action={<Badge variant="default">Lite</Badge>}>
            <div className="space-y-3">
              <TextArea label="Inquiry reply" rows={3} value={templates.inquiry_en} onChange={(e: any) => setTemplates({ ...templates, inquiry_en: e.target.value })} />
              <TextArea label="Availability confirmed" rows={2} value={templates.confirmed_en} onChange={(e: any) => setTemplates({ ...templates, confirmed_en: e.target.value })} />
              <TextArea label="Offer / Quote" rows={2} value={templates.quote_en} onChange={(e: any) => setTemplates({ ...templates, quote_en: e.target.value })} />
              <TextArea label="House rules reminder" rows={2} value={templates.rules_en} onChange={(e: any) => setTemplates({ ...templates, rules_en: e.target.value })} />
              <div className="flex justify-end gap-2">
                <Button size="xs" variant="secondary" icon={<Copy className="w-4 h-4" />} onClick={() => copy(templates.inquiry_en)}>
                  Copy sample
                </Button>
                <Button size="xs" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={downloadLite}>
                  Export Lite
                </Button>
              </div>
            </div>
          </FieldCard>

          <FieldCard title="WhatsApp Templates (AR)" action={<Badge variant="default">Lite</Badge>}>
            <div className="space-y-3">
              <TextArea label="رد الاستفسار" rows={3} value={templates.inquiry_ar} onChange={(e: any) => setTemplates({ ...templates, inquiry_ar: e.target.value })} />
              <TextArea label="تأكيد التوفر" rows={2} value={templates.confirmed_ar} onChange={(e: any) => setTemplates({ ...templates, confirmed_ar: e.target.value })} />
              <TextArea label="عرض السعر" rows={2} value={templates.quote_ar} onChange={(e: any) => setTemplates({ ...templates, quote_ar: e.target.value })} />
              <TextArea label="تذكير القواعد" rows={2} value={templates.rules_ar} onChange={(e: any) => setTemplates({ ...templates, rules_ar: e.target.value })} />
              <div className="flex justify-end gap-2">
                <Button size="xs" variant="secondary" icon={<Copy className="w-4 h-4" />} onClick={() => copy(templates.inquiry_ar)}>
                  Copy sample
                </Button>
                <Button size="xs" variant="secondary" icon={<Download className="w-4 h-4" />} onClick={downloadLite}>
                  Export Lite
                </Button>
              </div>
            </div>
          </FieldCard>
        </div>
      </FieldCard>

      <FieldCard title="Media Kit (Pro)" action={isPro ? <Badge variant="success">Unlocked</Badge> : <Badge variant="warning">Locked</Badge>}>
        <div className={`${!isPro ? "opacity-60" : ""} grid grid-cols-1 md:grid-cols-3 gap-4`}>
          <Card className="p-5" hover>
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">Instagram Post</div>
              <Badge variant="info" size="xs">
                Preview
              </Badge>
            </div>
            <div className="mt-4 rounded-2xl overflow-hidden border border-stone-100 h-52 relative">
              <img src={property.hero_image} alt="ig" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-sm font-black">{property.name_en}</div>
                <div className="text-xs font-bold opacity-90">From {fmtMoney(property.base_price)} EGP</div>
              </div>
            </div>
          </Card>

          <Card className="p-5" hover>
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">Instagram Story</div>
              <Badge variant="info" size="xs">
                Preview
              </Badge>
            </div>
            <div className="mt-4 rounded-2xl overflow-hidden border border-stone-100 h-52 relative">
              <img src={property.hero_image} alt="story" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute top-3 left-3 right-3">
                <Badge variant="premium" size="sm">
                  Salty Life
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-lg font-black leading-tight">{property.tagline_en}</div>
              </div>
            </div>
          </Card>

          <Card className="p-5" hover>
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-900">WhatsApp Flyer</div>
              <Badge variant="info" size="xs">
                Preview
              </Badge>
            </div>
            <div className="mt-4 rounded-2xl overflow-hidden border border-stone-100 h-52 relative">
              <img src={property.secondary_image || property.hero_image} alt="flyer" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/10" />
              <div className="absolute top-3 left-3 right-3 text-white">
                <div className="text-sm font-black">{property.location_en}</div>
                <div className="text-xs font-bold opacity-90">From {fmtMoney(property.base_price)} EGP</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-stone-600">
            {isPro ? "Download a mock pack (JSON) now — replace with ZIP later." : "Upgrade to Pro to export the full media kit."}
          </div>
          <Button
            variant="teal"
            size="sm"
            disabled={!isPro}
            icon={!isPro ? <Lock className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            onClick={downloadProPack}
            title={!isPro ? "Upgrade to Pro" : ""}
          >
            {isPro ? "Download Pack" : "Locked"}
          </Button>
        </div>
      </FieldCard>
    </div>
  );
};

const SettingsTab = ({ draft, setDraft }: any) => {
  const isPro = draft.plan === "pro";

  return (
    <div className="space-y-6">
      <FieldCard title="Plan" action={<Badge variant={isPro ? "success" : "default"}>{isPro ? "Pro" : "Basic"}</Badge>}>
        <Segmented
          value={draft.plan}
          onChange={(v: Plan) => setDraft({ ...draft, plan: v })}
          options={[
            { value: "basic", label: "Basic" },
            { value: "pro", label: "Pro" },
          ]}
        />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <LockRow plan={draft.plan} title="iCal Import + Sync" desc="Connect Airbnb/Booking iCal links and sync blocks." />
          <LockRow plan={draft.plan} title="Marketing Toolkit Full" desc="Export media kit pack (mock download in demo)." />
          <LockRow plan={draft.plan} title="Upsells" desc="Offer add-ons (early check-in, transfer, etc.)." />
          <LockRow plan={draft.plan} title="Instant Booking Mode" desc="Enable instant booking flow (hold/confirm options)." />
        </div>
      </FieldCard>

      <FieldCard title="Booking Mode" action={<Badge variant="info" size="sm">Core</Badge>}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-black text-slate-900">Guest booking experience</div>
            <div className="mt-1 text-xs text-stone-600">Default: Check availability. Instant booking is Pro.</div>
          </div>

          <Segmented
            value={draft.booking_mode}
            onChange={(v: BookingMode) => setDraft({ ...draft, booking_mode: v })}
            disabled={!isPro && draft.booking_mode === "check_availability" ? false : !isPro}
            lockedText="Upgrade to Pro to enable instant booking"
            options={[
              { value: "check_availability", label: "Check availability" },
              { value: "instant_booking", label: "Instant booking" },
            ]}
          />
        </div>

        {!isPro && (
          <div className="mt-4 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
            Instant booking is locked on Basic.
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextInput
            label="Hold minutes (Pro)"
            type="number"
            disabled={!isPro}
            value={draft.hold_minutes}
            onChange={(e: any) => setDraft({ ...draft, hold_minutes: +e.target.value })}
            hint="Default 30"
          />
          <div className="md:col-span-2">
            <Toggle
              disabled={!isPro}
              checked={draft.allow_instant_confirm}
              onChange={(v: boolean) => setDraft({ ...draft, allow_instant_confirm: v })}
              label="Allow instant confirm (Pro)"
            />
            <div className="mt-2 text-xs text-stone-600">
              If OFF: instant booking creates a HOLD that expires. If ON: booking can be created as CONFIRMED (demo only).
            </div>
          </div>
        </div>
      </FieldCard>

      <FieldCard title="Cancellation Policy" action={<Badge variant="default">Guest</Badge>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <TextArea label="English" rows={3} value={draft.cancellation_policy_en} onChange={(e: any) => setDraft({ ...draft, cancellation_policy_en: e.target.value })} />
          <TextArea label="Arabic" rows={3} value={draft.cancellation_policy_ar} onChange={(e: any) => setDraft({ ...draft, cancellation_policy_ar: e.target.value })} />
        </div>
      </FieldCard>
    </div>
  );
};

/* ==================== ADMIN DASHBOARD SHELL ==================== */
const AdminDashboard = ({
  property,
  setProperty,
  bookings,
  setBookings,
  messages,
  setMessages,
  inquiries,
  setInquiries,
  plan,
  upsells,
  setUpsells,
  ical,
  setIcal,
  onToggleView,
}: any) => {
  const [tab, setTab] = useState<Tab>("listing");
  const [draft, setDraft] = useState<Property>({ ...property });
  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLang, setPreviewLang] = useState<Lang>("en");

  useEffect(() => setDraft({ ...property }), [property.id]); // eslint-disable-line
  useEffect(() => setDraft((d) => ({ ...d, plan })), [plan]);

  const save = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    setProperty(draft);
    setSaving(false);
  };

  const tabs: { id: Tab; icon: any; label: string; badge?: number }[] = [
    { id: "listing", icon: Layers, label: "Listing" },
    { id: "gallery", icon: ImageIcon, label: "Gallery" },
    { id: "pricing", icon: DollarSign, label: "Pricing" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "inbox", icon: MessageSquare, label: "Inbox", badge: messages.filter((m: Message) => m.status === "pending").length },
    { id: "guidebook", icon: FileText, label: "Guidebook" },
    { id: "marketing", icon: Share2, label: "Marketing" },
    { id: "upsells", icon: Gift, label: "Upsells" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "team", icon: Users, label: "Team" },
    { id: "integrations", icon: Zap, label: "Integrations" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const blockedAll = useMemo(() => new Set<string>([...(draft.blocked_dates_manual || []), ...(draft.blocked_dates_imported || [])]), [
    draft.blocked_dates_manual,
    draft.blocked_dates_imported,
  ]);

  const goLive = () => setDraft((d) => ({ ...d, status: d.status === "published" ? "draft" : "published" }));

  const content = useMemo(() => {
    const props = { draft, setDraft, plan: draft.plan };
    switch (tab) {
      case "listing":
        return <ListingTab {...props} />;
      case "gallery":
        return <GalleryTab {...props} />;
      case "pricing":
        return <PricingTab {...props} />;
      case "calendar":
        return <CalendarTab property={draft} setProperty={setDraft} bookings={bookings} blockedAll={blockedAll} plan={draft.plan} />;
      case "inbox":
        return <InboxTab messages={messages} setMessages={setMessages} />;
      case "guidebook":
        return <GuidebookTab draft={draft} setDraft={setDraft} />;
      case "marketing":
        return <MarketingToolkitTab plan={draft.plan} property={draft} />;
      case "upsells":
        return <UpsellsTab plan={draft.plan} upsells={upsells} setUpsells={setUpsells} />;
      case "analytics":
        return <AnalyticsTab bookings={bookings} />;
      case "team":
        return <TeamTab />;
      case "integrations":
        return <IntegrationsTab plan={draft.plan} ical={ical} setIcal={setIcal} property={draft} setProperty={setDraft} />;
      case "settings":
        return <SettingsTab draft={draft} setDraft={setDraft} />;
      default:
        return null;
    }
  }, [tab, draft, bookings, blockedAll, messages, setMessages, upsells, setUpsells, ical, setIcal]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-white flex items-center justify-center font-black">SL</div>
            <div>
              <div className="text-sm font-black text-slate-900">Salty Life</div>
              <div className="text-[11px] text-stone-500">Owner Portal</div>
            </div>
            <div className="ml-2">
              <Badge variant={draft.plan === "pro" ? "success" : "default"}>{draft.plan}</Badge>
            </div>
            <div className="ml-2">
              <Badge variant={draft.status === "published" ? "success" : "warning"}>{draft.status}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="xs" variant="secondary" onClick={() => setShowPreview((s) => !s)} icon={<Eye className="w-4 h-4" />}>
              Preview
            </Button>
            <Button size="xs" variant="teal" onClick={save} loading={saving}>
              Save
            </Button>
            <Button size="xs" variant="secondary" onClick={goLive} icon={draft.status === "published" ? <X className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}>
              {draft.status === "published" ? "Unpublish" : "Publish"}
            </Button>
            <Button size="xs" variant="secondary" onClick={onToggleView} icon={<Home className="w-4 h-4" />}>
              Guest
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className={`lg:col-span-2 ${collapsed ? "lg:col-span-1" : ""}`}>
          <Card padding="none" className="sticky top-24">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              {!collapsed ? (
                <div className="min-w-0">
                  <div className="text-xs font-black uppercase tracking-widest text-stone-500">Property</div>
                  <div className="mt-1 text-sm font-black text-slate-900 truncate">{draft.name_en || "Untitled"}</div>
                  <div className="mt-1 text-[11px] text-stone-500 truncate">{draft.location_en}</div>
                </div>
              ) : null}
              <button onClick={() => setCollapsed((c) => !c)} className="p-2 rounded-xl text-stone-500 hover:bg-stone-100">
                {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
              </button>
            </div>

            <div className="p-3 space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2 rounded-2xl font-black text-[10px] uppercase tracking-wider transition ${
                    collapsed ? "justify-center p-3" : "px-4 py-2.5"
                  } ${tab === t.id ? "bg-slate-950 text-white" : "text-stone-500 hover:bg-stone-100"}`}
                >
                  <t.icon className="w-4 h-4" />
                  {!collapsed ? (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{t.label}</span>
                      {t.badge ? (
                        <Badge variant="warning" size="xs">
                          {t.badge}
                        </Badge>
                      ) : null}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-stone-100">
              <div className="text-[11px] text-stone-500 font-bold">
                Inquiries: {(inquiries as Inquiry[]).length} · Bookings: {(bookings as Booking[]).length}
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className={`lg:col-span-10 ${collapsed ? "lg:col-span-11" : ""}`}>
          {content}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowPreview(false)} />
          <div className="relative max-w-6xl mx-auto mt-8 mb-8 bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/30">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-sm font-black text-slate-900">Guest Preview</div>
                <Badge variant="info" size="xs">
                  {previewLang.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Segmented
                  value={previewLang}
                  onChange={(v: Lang) => setPreviewLang(v)}
                  options={[
                    { value: "en", label: "EN" },
                    { value: "ar", label: "AR" },
                  ]}
                />
                <Button size="xs" variant="secondary" icon={<X className="w-4 h-4" />} onClick={() => setShowPreview(false)}>
                  Close
                </Button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-auto">
              <GuestView
                property={draft}
                lang={previewLang}
                plan={draft.plan}
                bookings={bookings}
                blockedAll={blockedAll}
                onRequestAvailability={() => {}}
                onInstantBook={() => {}}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== ROOT APP ==================== */
export default function App() {
  const [view, setView] = useState<"guest" | "admin">("guest");
  const [lang, setLang] = useState<Lang>("en");

  const [plan, setPlan] = useState<Plan>("basic");

  const [property, setProperty] = useState<Property>(() => ({
    ...INITIAL_PROPERTY,
    plan: "basic",
    booking_mode: "check_availability",
    hold_minutes: 30,
    allow_instant_confirm: false,
    cancellation_policy_en: "Free cancellation up to 7 days before check-in. After that, 50% applies.",
    cancellation_policy_ar: "إلغاء مجاني حتى ٧ أيام قبل الوصول. بعد ذلك يتم خصم ٥٠٪.",
    welcome_en: "Welcome to Salty Life. We’re happy to host you.",
    welcome_ar: "أهلاً بيكم في سالتي لايف. سعداء باستضافتكم.",
    blocked_dates_manual: [],
    blocked_dates_imported: [],
  }));

  useEffect(() => {
    setProperty((p) => ({ ...p, plan }));
  }, [plan]);

  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [upsells, setUpsells] = useState<Upsell[]>(UPSELLS_SEED);
  const [ical, setIcal] = useState<ICalConnection[]>(INITIAL_ICAL);

  const blockedAll = useMemo(() => new Set<string>([...(property.blocked_dates_manual || []), ...(property.blocked_dates_imported || [])]), [
    property.blocked_dates_manual,
    property.blocked_dates_imported,
  ]);

  const onRequestAvailability = (payload: { checkIn: string; checkOut: string; guests: number }) => {
    const est = estimateTotal(payload.checkIn, payload.checkOut, property.base_price, property.weekend_mult, property.cleaning_fee);
    const inquiry: Inquiry = {
      id: `q-${uid()}`,
      createdAt: new Date().toISOString(),
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      guests: payload.guests,
      estimate: est,
      source: "guest_web",
      status: "new",
    };
    setInquiries((arr) => [inquiry, ...arr]);

    const text = `Availability request:
${property.name_en}
Check-in: ${payload.checkIn}
Check-out: ${payload.checkOut}
Guests: ${payload.guests}
Estimate: ${fmtMoney(est)} EGP`;
    window.open(waLink(property.whatsapp, text), "_blank");
  };

  const onInstantBook = (payload: { checkIn: string; checkOut: string; guests: number; name: string; phone: string; email: string }) => {
    const nights = nightsBetween(payload.checkIn, payload.checkOut);
    const total = estimateTotal(payload.checkIn, payload.checkOut, property.base_price, property.weekend_mult, property.cleaning_fee);

    const isConfirmed = property.allow_instant_confirm;
    const status: BookingStatus = isConfirmed ? "confirmed" : "hold";
    const holdExpiresAt = !isConfirmed ? new Date(Date.now() + property.hold_minutes * 60 * 1000).toISOString() : undefined;

    const booking: Booking = {
      id: `b-${uid()}`,
      guest: payload.name || "Guest",
      phone: payload.phone || undefined,
      email: payload.email || undefined,
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights,
      guests: payload.guests,
      total,
      status,
      source: "direct",
      holdExpiresAt,
    };

    setBookings((arr) => [booking, ...arr]);

    const text = `Instant booking request:
${property.name_en}
Guest: ${booking.guest}
Phone: ${booking.phone || "-"}
Email: ${booking.email || "-"}
Check-in: ${booking.checkIn}
Check-out: ${booking.checkOut}
Guests: ${booking.guests}
Total: ${fmtMoney(booking.total)} EGP
Status: ${booking.status.toUpperCase()}${booking.holdExpiresAt ? ` (expires ${new Date(booking.holdExpiresAt).toLocaleString("en-US")})` : ""}`;
    window.open(waLink(property.whatsapp, text), "_blank");
  };

  return (
    <div>
      <GlobalStyles />

      {/* Minimal top switcher */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-black text-slate-900">Salty Life Demo</div>
            <Badge variant={plan === "pro" ? "success" : "default"} size="sm">
              {plan}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Segmented
              value={plan}
              onChange={(v: Plan) => setPlan(v)}
              options={[
                { value: "basic", label: "Basic" },
                { value: "pro", label: "Pro" },
              ]}
            />
            <Segmented
              value={lang}
              onChange={(v: Lang) => setLang(v)}
              options={[
                { value: "en", label: "EN" },
                { value: "ar", label: "AR" },
              ]}
            />
            <Button size="xs" variant="secondary" onClick={() => setView((v) => (v === "guest" ? "admin" : "guest"))} icon={view === "guest" ? <Settings className="w-4 h-4" /> : <Home className="w-4 h-4" />}>
              {view === "guest" ? "Owner" : "Guest"}
            </Button>
          </div>
        </div>
      </div>

      {view === "guest" ? (
        <GuestView
          property={property}
          lang={lang}
          plan={plan}
          bookings={bookings}
          blockedAll={blockedAll}
          onRequestAvailability={onRequestAvailability}
          onInstantBook={onInstantBook}
        />
      ) : (
        <AdminDashboard
          property={property}
          setProperty={setProperty}
          bookings={bookings}
          setBookings={setBookings}
          messages={messages}
          setMessages={setMessages}
          inquiries={inquiries}
          setInquiries={setInquiries}
          plan={plan}
          upsells={upsells}
          setUpsells={setUpsells}
          ical={ical}
          setIcal={setIcal}
          onToggleView={() => setView("guest")}
        />
      )}
    </div>
  );
}