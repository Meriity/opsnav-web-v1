import {
  Lock,
  User,
  RefreshCw,
  BadgeCheck,
  Facebook,
  Instagram,
  Linkedin,
  Zap,
  Users,
  Shield,
  Cloud,
  Building,
  Rocket,
  CheckCircle,
  ChevronRight,
  Star,
  Globe,
  BarChart3,
  Target,
  Clock,
  Download,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Activity,
  Layers,
  ShieldCheck,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
  CreditCard,
  BookOpen,
  MessageSquareQuote,
  ChevronDown,
  Phone,
  Mail,
  Check,
  MapPin,
  Flag,
  ArrowUp,
  Info,
  EyeOff,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef, useState } from "react";
import {
  FaFacebook,
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { APP_VERSION } from "../config/version";

const ScrollIndicator = "/down-arrow.png";

// Feature data for carousel
const featureSections = [
  {
    id: 1,
    title: "Role-Based Dashboards",
    description:
      "Tailored views and permissions for Super Admins, Staff, and Clients.",
    points: [
      "Customised views for different user roles",
      "Granular permission controls",
      "Role-specific workflows",
    ],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(1131).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-20-57-496.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-48-36-32_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "sky",
  },
  {
    id: 2,
    title: "Matter Management",
    description:
      "Track every case and its 5-Stage progress with visual indicators.",
    points: [
      "5-stage progress tracking",
      "Visual progress indicators",
      "Real-time status updates",
    ],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(1130).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_20251229-142543.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-48-55-40_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "green",
  },
  {
    id: 3,
    title: "Shareable Client Status",
    description:
      "Secure client portals with real-time status sharing and automated updates.",
    points: [
      "Real-time status sharing",
      "Secure client portals",
      "Automated status updates",
    ],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(1130).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_20251229-142543.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-48-55-40_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "purple",
  },
  {
    id: 4,
    title: "Wills Module",
    description:
      "Specialized tracking for wills with document management and beneficiary tracking.",
    points: [
      "Specialized will tracking",
      "Document management",
      "Beneficiary tracking",
    ],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(1130).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_20251229-142543.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-48-55-40_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "amber",
  },
  {
    id: 5,
    title: "Automated Reporting & Notifications",
    description:
      "Automated report generation with real-time notifications and customisable alerts.",
    points: [
      "Automated report generation",
      "Real-time notifications",
      "Customisable alerts",
    ],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(1130).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_20251229-142543.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-48-55-40_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "rose",
  },
  {
    id: 6,
    title: "Scalable Cloud Hosted",
    description:
      "Enterprise-grade security on Cloud with 99.9% uptime guarantee.",
    points: ["Cloud hosting", "Enterprise-grade security", "99.9% uptime SLA"],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(1130).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_20251229-142543.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot_2025-12-29-14-48-55-40_40deb401b9ffe8e1df2f1cc5ba480b12.jpg",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "slate",
  },
];

// Industry Data for scroll
const industries = [
  "Conveyancing",
  "Wills & Estates",
  "Victims of Crime",
  "Commercial Law",
  "Print & Signage",
  "Manufacturing",
  "Logistics",
  "Construction",
  "Property & Real Estate",
  "Legal & Compliance",
  "Field Services",
  "Installations",
  "Project Operations",
  "Marketing & Agencies",
  "Trades & Services",
  "NDIS Providers",
  "Financial Services",
  "Consulting & Professional Services",
];

// Pricing plans
const plans = [
  {
    name: "Starter Plan",
    tagline: "Get started with a basic workflow setup",
    price: "$0",
    period: "/month",
    cta: "Start Free",
    highlight: false,
    icon: "rocket",
    features: [
      "Access to a basic workflow",
      "Task-level tracking across stages",
      "Status updates and progress tracking",
      "Basic operational visibility",
      "No client dashboard",
    ],
  },
  {
    name: "Growth Plan",
    tagline: "Scale your operations with flexible workflows",
    price: "$66",
    period: "/month per workflow",
    cta: "Start 1-Month Free Trial",
    highlight: true,
    icon: "chart",
    features: [
      "Create and manage multiple workflows",
      "Industry-aligned workflow templates",
      "Task-level tracking with stages and status",
      "AI-powered insights and reminders",
      "Client dashboard with real-time updates",
      "Custom branding with your logo",
      "Email notifications using your business email",
      "Team collaboration and activity tracking",
    ],
  },
  {
    name: "Enterprise Plan",
    tagline: "Custom solutions for complex operations",
    price: "Custom Pricing",
    period: "",
    cta: "Contact Us",
    highlight: false,
    icon: "building",
    features: [
      "Everything in Growth Plan",
      "Advanced workflow customisation",
      "Multi-team / multi-department support",
      "Priority onboarding and support",
      "Tailored setup for your business needs",
    ],
  },
];

// Testimonial
const testimonials = [
  {
    name: "Sarah Jenkins",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    text: "OpsNav brought complete structure to our workflows. Everything is now clear, trackable, and on time.",
  },
  {
    name: "Mark Thompson",
    avatar: "https://randomuser.me/api/portraits/men/33.jpg",
    text: "We customised OpsNav to fit our exact process, and it just works. Accountability and visibility improved instantly.",
  },
  {
    name: "Chloe Davies",
    avatar: "https://randomuser.me/api/portraits/women/69.jpg",
    text: "No more missed steps or constant follow-ups. Our team always knows what to do next.",
  },
  {
    name: "James Wilson",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    text: "The onboarding was seamless and the support team is incredibly responsive. Highly recommended.",
  },
  {
    name: "Emily Brown",
    avatar: "https://randomuser.me/api/portraits/women/13.jpg",
    text: "OpsNav gave us the visibility we were missing. Our clients notice the difference in how we operate.",
  },
  {
    name: "Liam Smith",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    text: "Switching to OpsNav was the best operational decision we made this year. Clarity at every level.",
  },
  {
    name: "Olivia Taylor",
    avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    text: "Tasks no longer fall through the cracks. The whole team is aligned and moving in the same direction.",
  },
  {
    name: "Noah Miller",
    avatar: "https://randomuser.me/api/portraits/men/19.jpg",
    text: "OpsNav simplified what used to be a chaotic process. We scaled our operations without adding headcount.",
  },
  {
    name: "Mia Williams",
    avatar: "https://randomuser.me/api/portraits/women/56.jpg",
    text: "The reporting features alone are worth it. Our leadership team finally has real-time visibility.",
  },
];

// FAQ Section
const faqData = {
  "Getting Started": [
    {
      q: "What is OpsNav and how does it work?",
      a: "OpsNav (Operations Navigator) is a workflow management platform designed to run structured operations. It brings together stages, tasks, and updates into one system using industry-aligned workflows, giving your team full visibility and control.",
    },
    {
      q: "How quickly can I get started with OpsNav?",
      a: "You can get started in minutes using ready-to-go workflows. There’s no need to build processes from scratch - simply use or customise workflows based on your operations.",
    },
    {
      q: "Do I need technical knowledge to use OpsNav?",
      a: "No. OpsNav is built for operational teams, not developers. It’s intuitive and easy to use, with structured stages and task tracking designed for real business workflows.",
    },
    {
      q: "Is there a free trial available?",
      a: "Yes. OpsNav offers a 1-month free trial with no credit card required, so you can explore the platform risk-free.",
    },
  ],
  "Workflows & Features": [
    {
      q: "What makes OpsNav different from other workflow tools?",
      a: "OpsNav provides industry-aligned workflows with built-in structure, unlike generic tools. It's designed for real operations - helping teams manage stages, tasks, and updates with clarity, not just track tasks.",
    },
    {
      q: "Can I customise workflows for my business?",
      a: "Yes. You can customise workflows to match your processes, including stages, tasks, and updates - while still benefiting from pre-built structures.",
    },
    {
      q: "Does OpsNav support task-level tracking?",
      a: "Yes. OpsNav offers detailed task-level tracking within structured stages, ensuring progress is clear and nothing gets missed.",
    },
    {
      q: "How does OpsNav improve productivity?",
      a: "OpsNav helps teams achieve up to 5x productivity improvement by reducing manual follow-ups, structuring workflows, and providing real-time operational visibility",
    },
  ],
  "Client & Team Management": [
    {
      q: "What is the client dashboard in OpsNav?",
      a: "OpsNav includes a client dashboard that allows your clients to view real-time updates on their work, reducing back-and-forth communication and improving transparency.",
    },
    {
      q: "How does OpsNav keep teams aligned?",
      a: "OpsNav keeps teams aligned through shared workflows, real-time updates, and complete visibility across stages and tasks - so everyone knows what's happening and what's next.",
    },
    {
      q: "Does OpsNav send notifications and updates?",
      a: "Yes. OpsNav supports email notifications using your business email, keeping both your team and clients informed in real time.",
    },
  ],
  "Pricing & Plans": [
    {
      q: "How does OpsNav pricing work?",
      a: "OpsNav uses a workflow-based pricing model, where you only pay for the workflows you use. This keeps pricing simple and scalable as your operations grow.",
    },
    {
      q: "What is included in the Starter plan?",
      a: "The Starter plan includes access to a basic workflow setup, task tracking, and operational visibility - ideal for getting started.",
    },
    {
      q: "What do I get with the Growth plan?",
      a: "The Growth plan includes multiple workflows, client dashboards, AI-powered insights, custom branding, email notifications, and full operational visibility.",
    },
    {
      q: "Do you offer enterprise or custom plans?",
      a: "Yes. OpsNav offers custom enterprise solutions for businesses with complex workflows, multi-team operations, and advanced requirements.",
    },
  ],
  "Data Privacy & Security": [
    {
      q: "How does OpsNav handle sensitive data?",
      a: "OpsNav is built for industries that manage sensitive information. Data is handled with strict access controls, structured permissions, and secure workflows - ensuring only authorised users can access and manage critical information.",
    },
    {
      q: "Where is my data hosted?",
      a: "Your data is securely hosted on enterprise-grade cloud infrastructure located in Australia, ensuring local data residency, reliability, and compliance with Australian standards.",
    },
    {
      q: "How is my data protected in OpsNav?",
      a: "OpsNav uses secure cloud infrastructure, controlled access, and industry-standard security practices to protect your data and maintain system integrity.",
    },
    {
      q: "Does OpsNav comply with Australian data privacy laws?",
      a: "Yes. OpsNav is designed to handle and protect data in alignment with Australian data privacy laws and principles, ensuring responsible collection, use, and management of personal and business information.",
    },
     {
      q: "Who owns the data stored in OpsNav?",
      a: "You retain full ownership of your data at all times. OpsNav provides the platform to manage and operate your workflows - your data always belongs to your business.",
    },
    {
      q: "Can I control access to data within my team?",
      a: "Yes. OpsNav includes role-based access controls, allowing you to define who can view, edit, and manage workflows and data across your organisation.",
    },
    {
      q: "Does OpsNav share or sell my data?",
      a: "No. OpsNav does not sell, share, or use your data beyond what is required to provide and improve the platform.",
    },
  ],
};

const BrowserTopBar = () => {
  return (
    <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
      <div
        className="
          h-8 sm:h-10
          bg-[#1E1E1E]
          flex items-center gap-2 sm:gap-3 px-3 sm:px-4
          rounded-t-lg sm:rounded-t-2xl
          shadow-sm
        "
      >
        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#28C840]" />
        <div className="flex-1" />
      </div>
    </div>
  );
};
const FloatingElement = ({ top, left, delay, size = 60 }) => (
  <motion.div
    className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block"
    style={{
      width: size,
      height: size,
      top: `${top}%`,
      left: `${left}%`,
      willChange: "transform",
    }}
    animate={{
      y: [0, -20, 0],
      x: [0, 10, 0],
    }}
    transition={{
      duration: 3 + delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const FeatureCard = ({ icon: Icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 flex flex-col items-center text-center border border-gray-100 group"
    >
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#2E3D99]/10 to-[#1D97D7]/20 flex items-center justify-center p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden relative">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-full flex items-center justify-center relative z-10">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          {/* Glossy Shimmer Overlay (Tailwind Native) */}
          <div 
            className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[400%] transition-transform duration-700 ease-in-out"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
            }}
          />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center"
          style={{ willChange: "transform" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        </motion.div>
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
        {title}
      </h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
        {description}
      </p>
      <motion.div
        className="mt-3 sm:mt-4 text-[#2E3D99] font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        whileHover={{ x: 5 }}
      >
        Learn more <ChevronRight className="w-4 h-4" />
      </motion.div>
    </motion.div>
  );
};

const CheckIcon = ({ highlight }) => (
  <div
    className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${highlight ? "bg-[#2E3D99]" : "bg-[#2E3D99]/15"
      }`}
  >
    <svg
      className={`w-3 h-3 ${highlight ? "text-white" : "text-[#2E3D99]"}`}
      fill="none"
      viewBox="0 0 12 12"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
    </svg>
  </div>
);

const QuoteIcon = () => (
  <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
    <path
      d="M0 22V13.4C0 9.8 0.9 6.867 2.7 4.6 4.567 2.333 7.133 0.8 10.4 0L11.8 2.6C9.267 3.4 7.367 4.667 6.1 6.4 4.9 8.133 4.333 10.133 4.4 12.4H8.8V22H0ZM16.2 22V13.4C16.2 9.8 17.1 6.867 18.9 4.6 20.767 2.333 23.333 0.8 26.6 0L28 2.6C25.467 3.4 23.567 4.667 22.3 6.4 21.1 8.133 20.533 10.133 20.6 12.4H25V22H16.2Z"
      fill="#2E3D99"
      opacity="0.5"
    />
  </svg>
);

const mockupSlides = [
  { id: "laptop", src: "/opsnav-laptop-mock.png", alt: "Laptop Mockup" },
];

const TestimonialCard = ({ person }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -8 }}
      className={`p-6 sm:p-8 rounded-2xl bg-white transition-all duration-300 relative border ${hovered ? "border-[#1D97D7] shadow-xl" : "border-gray-100 shadow-lg"
        }`}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div
            className="w-14 h-14 rounded-full overflow-hidden border-4 border-white"
            style={{
              boxShadow: hovered
                ? "0 0 0 2px #1D97D7, 0 4px 12px rgba(29,151,215,0.3)"
                : "0 2px 8px rgba(0,0,0,0.12)",
              transition: "box-shadow 0.3s ease",
            }}
          >
            <img src={person.avatar} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="mb-4 mt-2"><QuoteIcon /></div>
      </div>

      <p className="text-gray-600 mb-6 group-hover:text-gray-900 transition-colors duration-300">
        "{person.text}"
      </p>

      <div className="h-px w-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mb-4" />

      <p className="text-sm sm:text-base font-medium italic" style={{ color: "#2E3D99" }}>
        ~{person.name}
      </p>
    </motion.div>
  );
};

const FAQItem = ({ item, index, isOpen, onToggle }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      animate={{
        scale: hovered && !isOpen ? 1.012 : 1,
        boxShadow: isOpen
          ? "0 4px 24px rgba(46,61,153,0.13), 0 1px 4px rgba(0,0,0,0.04)"
          : hovered
            ? "0 6px 28px rgba(46,61,153,0.13), 0 2px 8px rgba(0,0,0,0.05)"
            : "0 1px 6px rgba(46,61,153,0.06), 0 1px 2px rgba(0,0,0,0.03)",
      }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="bg-white rounded-xl overflow-hidden cursor-pointer"
      onClick={onToggle}
    >
      {/* Question row */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 gap-4">
        <span
          className="text-sm sm:text-base font-semibold text-gray-800 leading-snug transition-colors duration-200"
          style={{ color: isOpen ? "#2E3D99" : undefined }}
        >
          {item.q}
        </span>

        {/* Chevron button */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: isOpen
              ? "linear-gradient(135deg, #2E3D99, #1D97D7)"
              : "linear-gradient(135deg, #2E3D99, #1D97D7)",
          }}
        >
          <ChevronDown className="w-4 h-4 text-white" />
        </motion.div>
      </div>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 sm:px-6 pb-5 pt-1">
              <div className="h-px bg-gray-100 mb-4" />
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                {item.a}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -60 : 60, transition: { duration: 0.35, ease: "easeIn" } }),
};

const desktopSlides = [
  testimonials.slice(0, 3),
  testimonials.slice(3, 6),
  testimonials.slice(6, 9),
];

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [currentWhyChooseIndex, setCurrentWhyChooseIndex] = useState(0);
  const [currentMockupIndex, setCurrentMockupIndex] = useState(0);

  // Auto-play mockups
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMockupIndex((prev) => (prev + 1) % mockupSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  // Navbar active link
  const [activeLink, setActiveLink] = useState("Home");
  // Price plan card
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  // Testimonial
  // Desktop slider state (3 slides of 3)
  const [deskCurrent, setDeskCurrent] = useState(0);
  const [deskDir, setDeskDir] = useState(1);

  // Mobile slider state (9 individual cards)
  const [mobCurrent, setMobCurrent] = useState(0);
  const [mobDir, setMobDir] = useState(1);

  // Desktop auto-scroll
  useEffect(() => {
    const t = setInterval(() => {
      setDeskDir(1);
      setDeskCurrent((p) => (p + 1) % desktopSlides.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Mobile auto-scroll
  useEffect(() => {
    const t = setInterval(() => {
      setMobDir(1);
      setMobCurrent((p) => (p + 1) % testimonials.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const gotoDesk = (i) => {
    setDeskDir(i > deskCurrent ? 1 : -1);
    setDeskCurrent(i);
  };


  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Detect if past hero section
  useEffect(() => {
    const hero = document.querySelector(".min-h-screen");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPastHero(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % featureSections.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = () => {
    navigate("/admin/login");
    setIsMobileMenuOpen(false);
  };

  const handleClientLogin = () => {
    navigate("/client/login");
    setIsMobileMenuOpen(false);
  };

  const handleScrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behaviour: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (item) => {
    setActiveLink(item);
    if (item === "Home") {
      window.scrollTo({ top: 0, behaviour: "smooth" });
    } else {
      const id = item.toLowerCase().replace(/\s+/g, "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behaviour: "smooth", block: "start" });
      }
    }
    setIsMobileMenuOpen(false);
  };

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % featureSections.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const prevFeature = () => {
    setCurrentFeature(
      (prev) => (prev - 1 + featureSections.length) % featureSections.length
    );
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const goToFeature = (index) => {
    setCurrentFeature(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };



  const currentFeatureData = featureSections[currentFeature];


  // Price plan cards



  // OpsNav Story

  // Testimonial Card




  // FAQ Section
  const tabs = Object.keys(faqData);



  // FAQ
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [openIndex, setOpenIndex] = useState(null);

  // Pricing tab for mobile/tablet
  const [activePlanTab, setActivePlanTab] = useState(1); // Default to Growth Plan (index 1)

  const handleTab = (tab) => {
    setActiveTab(tab);
    setOpenIndex(null);
  };

  const handleToggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 overflow-hidden">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        <div className="absolute inset-0 opacity-[0.11]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(to right, #000 1px, transparent 1px),
                            linear-gradient(to bottom, #000 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isMobileMenuOpen ? 0 : "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 p-6 lg:hidden"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="relative flex flex-col items-end">
              <img
                src="/Logo.png"
                alt="OpsNav"
                className="h-10 sm:h-12 w-auto"
              />
              <span className="text-[10px] text-gray-400 font-medium mt-2 leading-none">{APP_VERSION}</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Nav Links */}
          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-5 mb-8">
            {["Home", "Pricing", "About Us", "Contact Us"].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className={`relative w-fit text-left font-medium text-[16px] transition-all duration-300
      after:absolute after:left-0 after:-bottom-1 after:h-[3px] after:rounded-full
      after:w-0 after:bg-gradient-to-r after:from-[#2E3D99] after:to-[#1D97D7]
      after:transition-all after:duration-300 hover:after:w-full
      ${activeLink === item ? "after:w-full text-[#2E3D99]" : "text-gray-800"}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleClientLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent text-[#2E3D99] border border-[#2E3D99]/20 rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all"
            >
              <User size={18} />
              Client Portal
            </button>
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 rounded-lg font-medium transition-colors bg-[#FB4A50] text-white border border-[#FB4A50] hover:bg-[#FB4A50]/90 shadow-md"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              Sign Up
            </button>
          </div>
        </motion.div>

        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg py-3"
            : "bg-transparent py-4 sm:py-6"
            }`}
        >
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex flex-col items-end">
                <img
                  src="/Logo.png"
                  alt="OpsNav"
                  className="h-10 sm:h-12 w-auto"
                />
                <span className="text-[10px] text-gray-400 font-medium leading-none">{APP_VERSION}</span>
              </div>
            </motion.div>

            {/* Nav link */}
            <div className="hidden lg:flex items-center gap-8">
              {["Home", "Pricing", "About Us", "Contact Us"].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`relative font-medium text-gray-800 after:absolute after:left-0 after:-bottom-1
      after:h-[3px] after:rounded-full after:w-0 after:bg-gradient-to-r after:from-[#2E3D99]
      after:to-[#1D97D7] after:transition-all after:duration-300 hover:after:w-full
      ${activeLink === item ? "after:w-full text-[#2E3D99]" : ""}`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClientLogin}
                className="flex items-center gap-2 px-4 py-2.5 bg-transparent text-[#2E3D99] border border-[#2E3D99]/20 rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
              >
                <User size={18} />
                Client Portal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isPastHero
                  ? "bg-[#FB4A50] text-white border border-[#FB4A50] hover:bg-[#FB4A50]/90 shadow-md"
                  : "text-[#2E3D99] border border-[#2E3D99] hover:bg-[#FB4A50] hover:text-white hover:border-[#FB4A50]"
                  }`}
              >
                Login
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg font-medium transition-all"
              >
                Sign up
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </motion.header>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-24 pb-8 sm:pt-36 sm:pb-16 lg:pt-28 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 sm:mb-8 border border-[#2E3D99]/20 max-w-[90%]"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 truncate">
              Your Workflow. Your Rules.
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold max-w-5xl leading-tight px-4 mx-auto"
          >
            <span className="bg-gradient-to-r from-[#2E3D99] via-[#1D97D7] to-[#1D97D7] bg-clip-text text-transparent">
              Ready-to-Go, Industry-Aligned Workflows Built for Real Operations
            </span>
            <br className="hidden lg:block" />
            <span className="text-gray-800 mt-2 block">
              Structured Execution Without the Chaos
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4"
          >
            OpsNav (Operations Navigator) is a purpose-built, industry-aligned platform that combines task-level tracking, AI-powered insights, and complete operational visibility - so you can run your operations with structure, clarity, and confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/get-started-free")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/book-demo")}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-700 border-2 border-gray-200 font-semibold rounded-xl hover:border-[#2E3D99] hover:text-[#2E3D99] transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Book A Demo</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base px-4"
          >
            No credit card required • No lock-ins • Cancel anytime
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="
              /* Mobile: Hidden */
              hidden
              
              /* Tablet: Right side (relative to parent) */
              sm:block
              sm:absolute
              sm:right-4
              sm:bottom-12
              sm:z-40
              
              /* Laptop: Center below text */
              lg:relative
              lg:right-auto
              lg:mt-12 
              lg:mx-auto
              
            "
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={handleScrollToFeatures}
              className="
                w-10 
                h-16 
                border-2 
                border-[#2E3D99]/20 
                rounded-full 
                flex 
                justify-center 
                cursor-pointer
                hover:border-[#2E3D99]/40
                transition-colors
                duration-300
                
                /* Responsive sizing */
                sm:w-9 sm:h-14
                lg:w-10 lg:h-16
              "
              aria-label="Scroll to features"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: 0.2,
                }}
                className="
                  w-1.5 
                  h-1.5 
                  bg-gradient-to-b 
                  from-[#2E3D99] 
                  to-[#1D97D7]
                  rounded-full 
                  
                  /* Responsive positioning */
                  sm:mt-2.5
                  lg:mt-3
                "
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Hero Dashboard Mockup Section */}
      <section className="w-full pt-10 pb-10 sm:pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
          {/* Intense linear bloom spread entirely across the top border area */}
          <div className="absolute -top-16 w-full h-48 bg-gradient-to-r from-transparent via-[#4cb3f8]/50 to-transparent blur-[120px] opacity-100 z-0 pointer-events-none" />
          <div className="absolute top-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-white/90 to-transparent blur-[6px] opacity-100 z-0 pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="w-full relative px-2"
            style={{
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)'
            }}
          >
            {/* Perfect Ethereal Blend Frame */}
            <div className="relative p-3 sm:p-5 bg-gradient-to-r from-[#2F3C98]/40 to-[#15BBEF]/20 rounded-t-[2rem] sm:rounded-t-[3rem] rounded-b-[1.5rem] shadow-2xl backdrop-blur-sm">
              <div className="bg-white rounded-t-[1.2rem] sm:rounded-t-[2.2rem] rounded-b-[1rem] overflow-hidden border border-[#15BBEF]/30 shadow-inner">
                <img
                  src="/dashboard.png"
                  alt="OpsNav Dashboard Mockup"
                  className="w-full h-auto block object-contain mx-auto"
                  draggable="false"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Built for Teams Across Industries */}
      <section className="w-full py-10 sm:py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
            Built for Teams Across{" "}
            <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
              Industries
            </span>
          </h2>
        </div>

        {/* Marquee CSS */}
        <style>{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .marquee-track-left {
            display: flex;
            width: max-content;
            animation: marquee-left 25s linear infinite;
          }
          .marquee-track-right {
            display: flex;
            width: max-content;
            animation: marquee-right 28s linear infinite;
          }
          .marquee-track-left:hover,
          .marquee-track-right:hover {
            animation-play-state: paused;
          }
          @media (max-width: 768px) {
            .marquee-track-left {
              animation-duration: 25s;
            }
            .marquee-track-right {
              animation-duration: 28s;
            }
          }
        `}</style>

        {/* Row 1 - scrolls left */}
        <div className="relative w-full overflow-hidden mb-4 sm:mb-6" style={{ touchAction: "pan-x" }}>
          <div className="absolute left-0 top-0 h-full w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="marquee-track-left">
            {[...industries, ...industries].map((industry, i) => {
              const colors = [
                "#2E3D99", "#1D97D7", "#22c55e", "#6366f1",
                "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4",
                "#16a34a", "#1D4ED8"
              ];
              return (
                <div key={`row1-${i}`} className="flex-shrink-0 mx-3 sm:mx-5">
                  <span
                    style={{ 
                      background: `linear-gradient(135deg, ${colors[i % colors.length]}15, ${colors[i % colors.length]}08)`,
                      borderColor: `${colors[i % colors.length]}30`,
                      color: colors[i % colors.length]
                    }}
                    className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border text-sm sm:text-base font-semibold whitespace-nowrap hover:shadow-md transition-all duration-300 cursor-default"
                  >
                    {industry}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2 - scrolls right (reverse) */}
        <div className="relative w-full overflow-hidden" style={{ touchAction: "pan-x" }}>
          <div className="absolute left-0 top-0 h-full w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          <div className="marquee-track-right">
            {[...industries.slice().reverse(), ...industries.slice().reverse()].map((industry, i) => {
              const colors = [
                "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b",
                "#6366f1", "#22c55e", "#1D97D7", "#2E3D99",
                "#16a34a", "#1D4ED8"
              ];
              return (
                <div key={`row2-${i}`} className="flex-shrink-0 mx-3 sm:mx-5">
                  <span
                    style={{ 
                      background: `linear-gradient(135deg, ${colors[i % colors.length]}15, ${colors[i % colors.length]}08)`,
                      borderColor: `${colors[i % colors.length]}30`,
                      color: colors[i % colors.length]
                    }}
                    className="inline-block px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border text-sm sm:text-base font-semibold whitespace-nowrap hover:shadow-md transition-all duration-300 cursor-default"
                  >
                    {industry}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                POWERFUL FEATURES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                streamline your operations
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Purpose-built features designed to manage every stage, task, and update in one place 
            </p>
          </motion.div>

          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden">
            <button
              onClick={prevFeature}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full shadow-md sm:shadow-lg flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </button>

            <button
              onClick={nextFeature}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white rounded-full shadow-md sm:shadow-lg flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-700" />
            </button>

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 p-4 sm:p-6 md:p-8">
              <motion.div
                key={currentFeatureData.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center"
              >
                <div className="mb-4 sm:mb-6">
                  <span className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Feature {currentFeature + 1} of {featureSections.length}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
                  {currentFeatureData.title}
                </h3>

                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  {currentFeatureData.description}
                </p>

                <div className="space-y-3 sm:space-y-4">
                  {currentFeatureData.points.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-2 sm:gap-3"
                    >
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700 text-sm sm:text-base">
                        {point}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 sm:mt-8">
                  <div className="flex justify-center sm:justify-start">
                    <div className="flex gap-1.5 sm:gap-2">
                      {featureSections.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToFeature(index)}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${index === currentFeature
                            ? "bg-[#2E3D99] scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          aria-label={`Go to feature ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                key={`image-${currentFeatureData.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl"
              >
                {/* Desktop */}
                <div className="hidden lg:block relative h-[300px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-visible">
                  <div className="relative rounded-2xl w-full h-full bg-white">
                    <BrowserTopBar />
                    <img
                      src={currentFeatureData.image.desktop}
                      alt={`${currentFeatureData.title} Screenshot`}
                      className="w-full h-full object-contain rounded-b-2xl"
                      loading="lazy"
                    />
                  </div>

                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute -left-4 sm:-left-6 bottom-4 sm:bottom-6 z-40"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-green-500/95 flex items-center justify-center shadow-xl sm:shadow-2xl transform hover:scale-105">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M3 12h3l2 8 4-16 3 12 4-6"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    className="absolute -right-4 sm:-right-6 top-4 sm:top-6 z-40"
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center shadow-xl sm:shadow-2xl transform rotate-3">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </motion.div>
                </div>

                {/* Tablet */}
                <div className="hidden md:block lg:hidden relative h-[250px] sm:h-[300px] rounded-2xl overflow-visible">
                  <div className="relative rounded-2xl w-full h-full bg-white">
                    {/* <BrowserTopBar /> */}
                    <img
                      src={currentFeatureData.image.tablet}
                      alt={`${currentFeatureData.title} Tablet Screenshot`}
                      className="w-full h-full object-cover rounded-b-2xl"
                      loading="lazy"
                    />
                  </div>

                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute -left-3 sm:-left-4 bottom-3 sm:bottom-4 z-40"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/95 flex items-center justify-center shadow-xl">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M4 6h16M4 12h16M4 18h16"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </div>

                {/* Mobile */}
                <div className="md:hidden relative h-[200px] sm:h-[250px] rounded-2xl overflow-visible">
                  <div className="relative rounded-2xl w-full h-full bg-white">
                    {/* <BrowserTopBar /> */}
                    <img
                      src={currentFeatureData.image.mobile}
                      alt={`${currentFeatureData.title} Mobile Screenshot`}
                      className="w-full h-full object-contain rounded-b-2xl"
                      loading="lazy"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 md:mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {featureSections.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => goToFeature(index)}
                className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center transition-all ${index === currentFeature
                  ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md sm:shadow-lg transform -translate-y-0.5 sm:-translate-y-1"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <div className="font-medium text-xs sm:text-sm truncate">
                  {feature.title.split(" ")[0]}
                </div>
                <div className="text-[10px] sm:text-xs opacity-80 mt-0.5 sm:mt-1 truncate">
                  {feature.title.split(" ").slice(1).join(" ")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* All Features at a Glance */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#2E3D99]/5 to-[#1D97D7]/10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              All Features at a Glance
            </h3>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Explore our complete suite of tools designed for operations
              excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <FeatureCard
              icon={Users}
              title="Role-Based Dashboards"
              description="Tailored views and permissions for Super Admins, Staff, and Clients with granular controls."
              index={0}
            />
            <FeatureCard
              icon={BarChart3}
              title="Matter Management"
              description="Track every case with 5-Stage progress tracking and visual indicators in real-time."
              index={1}
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Client Collaboration"
              description="Secure client portals with real-time status sharing and automated updates."
              index={2}
            />
            <FeatureCard
              icon={Target}
              title="Wills Module"
              description="Specialized tracking for wills with document management and beneficiary tracking."
              index={3}
            />
            <FeatureCard
              icon={Clock}
              title="Automated Reporting"
              description="Automated report generation with real-time notifications and customisable alerts."
              index={4}
            />
            <FeatureCard
              icon={Cloud}
              title="Cloud Hosted"
              description="Enterprise-grade security on Cloud with 99.9% uptime guarantee."
              index={5}
            />
          </div>
        </div>
      </div>

      {/* Price Plan Card */}

      <section id="pricing" ref={ref} className="w-full py-12 sm:py-20 md:py-28 bg-gray-50/60">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 py-1.5 rounded-full mb-3">
              <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                PLANS & PRICING
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Plan
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto px-4">
              Flexible pricing options to support your business at every stage of growth.
            </p>
          </motion.div>

          {/* Desktop Laptop Grid (lg screens only) */}
          <div className="relative hidden lg:block max-w-6xl mx-auto">
            
            <div className="relative grid grid-cols-3 gap-8 items-start">
              {plans.map((plan) => (
                <div key={plan.name} className="relative flex flex-col">
                  {plan.highlight ? (
                    /* ── Most Popular Card (gradient border) ── */
                    <div className="relative z-10">
                      {/* Centered "Most Popular" badge overlapping the top edge */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md whitespace-nowrap">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            style={{ display: "inline-block" }}
                          >⭐</motion.span>
                          Most Popular
                        </span>
                      </div>
                      {/* Gradient border wrapper */}
                      <div style={{ padding: "2px", borderRadius: "1rem", background: "linear-gradient(160deg, #2E3D99 0%, #1D97D7 55%, #a8e4f7 100%)" }}>
                        <div className="bg-white rounded-[0.9rem] p-8 flex flex-col gap-1">
                          <h3 className="text-2xl font-bold text-gray-900 mt-2">{plan.name}</h3>
                          <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                          <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                            <span className="text-sm text-gray-400">{plan.period}</span>
                          </div>
                          <button className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
                            {plan.cta}
                          </button>
                          <ul className="flex flex-col gap-3">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded mt-0.5 bg-[#2E3D99] flex items-center justify-center flex-shrink-0">
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                                <span className="text-sm text-gray-600 leading-snug">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Side Cards ── */
                    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] p-8 flex flex-col gap-1 h-full">
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className={`font-bold text-gray-900 ${plan.price === "Custom Pricing" ? "text-3xl" : "text-5xl"}`}>{plan.price}</span>
                        {plan.period && <span className="text-sm text-gray-400">{plan.period}</span>}
                      </div>
                      <button className="w-full py-3 rounded-xl font-semibold text-[#2E3D99] border-2 border-[#2E3D99]/20 hover:bg-[#2E3D99]/5 transition-all duration-300 mb-6">
                        {plan.cta}
                      </button>
                      <ul className="flex flex-col gap-3">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded mt-0.5 bg-[#1D97D7]/15 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-[#1D97D7]" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-gray-600 leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tablet Grid View (md screens only) */}
          <div className="hidden md:block lg:hidden">
            {/* Top row: 2 side cards */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {plans.filter((p) => !p.highlight).map((plan) => (
                <div key={plan.name} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-md flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{plan.tagline}</p>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className={`font-bold text-gray-900 ${plan.price === "Custom Pricing" ? "text-2xl" : "text-4xl"}`}>{plan.price}</span>
                    {plan.period && <span className="text-xs text-gray-400">{plan.period}</span>}
                  </div>
                  <button className="w-full py-3 rounded-xl font-semibold text-[#2E3D99] border-2 border-[#2E3D99]/20 hover:bg-[#2E3D99]/5 transition-all mb-5">{plan.cta}</button>
                  <ul className="flex flex-col gap-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-2.5 h-2.5 text-gray-400" /></div>
                        <span className="text-xs text-gray-500 leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom row: Featured 'Most Popular' card centered */}
            <div className="flex justify-center">
              <div className="w-full max-w-[520px]">
                {plans.filter((p) => p.highlight).map((plan) => (
                  <div key={plan.name} className="relative pt-6">
                    <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-xs font-bold px-6 py-2 rounded-full shadow-md whitespace-nowrap">
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          style={{ display: "inline-block" }}
                        >⭐</motion.span>
                        Most Popular
                      </span>
                    </div>
                    <div style={{ padding: "2px", borderRadius: "1rem", background: "linear-gradient(160deg, #2E3D99 0%, #1D97D7 55%, #a8e4f7 100%)" }}>
                      <div className="bg-white rounded-[0.9rem] p-7 flex flex-col">
                        <h3 className="text-2xl font-bold text-gray-900 mt-2 mb-1">{plan.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                        <div className="flex items-baseline gap-1 mb-5">
                          <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                          <span className="text-sm text-gray-400">{plan.period}</span>
                        </div>
                        <button className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] shadow-lg mb-5">{plan.cta}</button>
                        <ul className="grid grid-cols-2 gap-2.5">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-4 h-4 rounded bg-[#2E3D99] flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="w-2.5 h-2.5 text-white" /></div>
                              <span className="text-xs text-gray-600 leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Tab View */}
          <div className="md:hidden space-y-6">
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                {plans.map((plan, idx) => (
                  <button key={plan.name} onClick={() => setActivePlanTab(idx)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activePlanTab === idx ? "bg-white text-[#2E3D99] shadow-sm" : "text-gray-500"}`}>{plan.name.split(" ")[0]}</button>
                ))}
              </div>
            </div>

            {plans.map((plan, idx) => (
              <motion.div
                key={plan.name}
                initial={false}
                animate={{ 
                  opacity: activePlanTab === idx ? 1 : 0,
                  display: activePlanTab === idx ? "block" : "none"
                }}
              >
                {plan.highlight ? (
                  <div className="p-0.5 rounded-2xl bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]">
                    <div className="bg-white rounded-[0.9rem] p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                         <div className="w-10 h-10 rounded-xl bg-[#2E3D99]/10 flex items-center justify-center">
                           <BarChart3 className="w-5 h-5 text-[#2E3D99]" />
                         </div>
                         <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm">
                           <motion.span
                             animate={{ rotate: 360 }}
                             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                             style={{ display: "inline-block" }}
                           >⭐</motion.span>
                           MOST POPULAR
                         </span>
                      </div>
                      <h3 className="text-xl font-bold bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">{plan.name}</h3>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-bold bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">{plan.price}</span>
                        <span className="text-xs text-gray-400 mb-1">{plan.period}</span>
                      </div>
                      <button className="w-full py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] shadow-lg">{plan.cta}</button>
                      <ul className="flex flex-col gap-2 mt-2">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckIcon highlight={true} />
                            <span className="text-xs text-gray-600">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 shadow-md rounded-2xl p-6 flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#2E3D99]/10 flex items-center justify-center">
                      {plan.icon === "rocket" && <Rocket className="w-5 h-5 text-[#2E3D99]" />}
                      {plan.icon === "building" && <Building className="w-5 h-5 text-[#2E3D99]" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className={`font-bold text-gray-900 ${plan.price === "Custom Pricing" ? "text-2xl" : "text-4xl"}`}>{plan.price}</span>
                      {plan.period && <span className="text-xs text-gray-400 mb-1">{plan.period}</span>}
                    </div>
                    <button className="w-full py-2.5 rounded-xl font-semibold text-[#2E3D99] border-2 border-[#2E3D99]/20">{plan.cta}</button>
                    <ul className="flex flex-col gap-2 mt-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckIcon highlight={false} />
                          <span className="text-xs text-gray-600">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Trust signals bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-md border border-gray-100 p-6 md:p-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
              <div className="flex items-center gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#2E3D99]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">1-Month Free Trial</p>
                  <p className="text-xs text-gray-500">Explore all features risk-free</p>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-start sm:justify-center">
                <div className="w-10 h-10 rounded-full bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-[#2E3D99]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">No Credit Card Required</p>
                  <p className="text-xs text-gray-500">Get started in seconds</p>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-start sm:justify-end">
                <div className="w-10 h-10 rounded-full bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-[#2E3D99]" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">Cancel Anytime</p>
                  <p className="text-xs text-gray-500">No lock-ins. No hassle.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AUD footnote */}
          <p className="text-center font-semibold
             text-xs sm:text-sm text-gray-400 mt-6">
            
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/5 text-gray-500 px-4 py-2 rounded-full border border-[#2E3D99]/10">
              <Info className="w-4 h-4 text-[#2E3D99]" />
              <span className="text-xs sm:text-sm font-medium">
                Prices are in AUD and exclude GST.
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Mid-Page Responsive Mockup Section */}
      <section className="w-full pt-8 sm:pt-10 pb-0 sm:pb-0 px-4 sm:px-6 lg:px-8 relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
          
          <div className="text-center mb-0 sm:mb-2 flex flex-col items-center">
            <div className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-[#2E3D99] px-4 py-1.5 rounded-full mb-6">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-semibold tracking-wide uppercase">
                Seamless Access
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              One View.<span className="bg-gradient-to-r from-[#2F3C98] to-[#15BBEF] bg-clip-text text-transparent"> Total Clarity!</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4 z-20 relative">
              Eliminate clutter and confusion. Experience total visibility and control across every device-from desktop to mobile.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 100, 
              damping: 15, 
              mass: 1,
              duration: 1.2 
            }}
            viewport={{ once: true, amount: 0.3 }}
            className="w-full relative px-2 flex justify-center items-center"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[80%] h-[70%] bg-[#2F3C98]/20 blur-[100px] sm:blur-[140px] rounded-[100%] pointer-events-none z-0" style={{ willChange: "transform" }} />
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] sm:w-[60%] h-[50%] bg-[#15BBEF]/60 blur-[70px] sm:blur-[100px] rounded-[100%] pointer-events-none z-0" style={{ willChange: "transform" }} />
            
            <div className="relative z-10 w-full max-w-5xl mt-12 sm:mt-16 md:mt-24 lg:-mt-[100px] mb-12 sm:mb-16 md:mb-24 lg:-mb-[100px]">
              
              {/* Floating Wrapper: Creates the "gravity-free" effect */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                style={{ willChange: "transform" }}
              >
                {/* Laptop View: Auto-transitioning carousel */}
                <div className="hidden lg:block w-full h-auto relative">
                  
                  {/* --- LEFT SIDE: THE NAVIGATION HUB (HUD Style) --- */}
                  <div className="absolute -left-24 top-1/2 -translate-y-1/2 z-20 hidden xl:block">
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      {/* Rotating Outer Ring */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-[1.5px] border-dashed border-indigo-500/30 rounded-full"
                      />
                      {/* Pulsing Middle Ring */}
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-8 border-[1px] border-sky-400/40 rounded-full"
                      />
                      {/* Scanning Light Segment */}
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-2 border-indigo-500/60 blur-[1px]"
                      />
                      
                      {/* Small HUD Nodes */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-2 h-2 bg-[#2E3D99] rounded-full shadow-[0_0_10px_#2E3D99]" />
                        <div className="text-[9px] font-black text-[#2E3D99] mt-1 uppercase tracking-widest">Operations Hub</div>
                      </div>
                      
                      <div className="absolute bottom-10 -left-10 flex items-center gap-2">
                        <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#2E3D99]/50" />
                        <div className="text-[8px] font-bold text-gray-400 font-mono tracking-tighter">SECURE_SYSTEM_SYNC</div>
                      </div>

                      {/* Floating Orbiting Icon */}
                      <motion.div
                        animate={{ 
                          x: [0, 80, 0, -80, 0],
                          y: [-80, 0, 80, 0, -80]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-[#2E3D99]/30 flex items-center justify-center text-[#2E3D99] shadow-xl"
                      >
                        <Zap size={24} />
                      </motion.div>
                    </div>
                  </div>

                  {/* --- RIGHT SIDE: THE WORKFLOW ARCHITECTURE --- */}
                  <div className="absolute -right-32 top-0 h-full z-20 hidden xl:flex flex-col justify-center gap-16">
                    {/* Glowing Vertical Connector */}
                    <div className="absolute left-[138px] top-1/4 bottom-1/4 w-[1.5px] bg-gradient-to-b from-transparent via-[#1D97D7]/40 to-transparent" />
                    
                    {[
                      { icon: Layers, label: "Workflow Design", text: "text-[#2E3D99]", bg: "bg-[#2E3D99]", border: "border-[#2E3D99]/20" },
                      { icon: TrendingUp, label: "Smart Analytics", text: "text-[#B45309]", bg: "bg-[#B45309]", border: "border-[#B45309]/20" },
                      { icon: Users, label: "Client Portal", text: "text-[#1D97D7]", bg: "bg-[#1D97D7]", border: "border-[#1D97D7]/20" }
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.3 }}
                        className="relative flex items-center group"
                      >
                        {/* Fixed-width Label Container for perfect vertical alignment */}
                        <div className="w-32 flex flex-col items-end pr-4">
                          <div className={`text-[10px] font-black ${node.text} uppercase tracking-tighter text-right`}>
                            {node.label}
                          </div>
                          <div className="text-[8px] text-gray-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            VERIFIED & SECURED
                          </div>
                        </div>

                        {/* Icon Node */}
                        <div className="relative">
                          <div className={`absolute inset-0 ${node.bg} blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />
                          <div className={`w-12 h-12 bg-white rounded-2xl border ${node.border} shadow-2xl flex items-center justify-center ${node.text} z-10 relative`}>
                            <node.icon size={20} />
                          </div>
                        </div>

                        {/* Connecting Line to mockup */}
                        <div className="w-16 h-[1px] bg-gradient-to-l from-transparent via-gray-300 to-transparent ml-2" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Background Connection "Beams" (SVGs) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 800 500">
                    <defs>
                      <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0" />
                        <stop offset="50%" stopColor="#4f46e5" stopOpacity="1" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Animated Beam Effect */}
                    <motion.path
                      d="M 100 250 Q 200 100 400 250"
                      stroke="url(#beamGradient)"
                      strokeWidth="0.5"
                      fill="none"
                      animate={{ strokeDasharray: ["0,1000", "1000,0"], opacity: [0, 1, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </svg>

                  <AnimatePresence mode="wait">
                    <motion.img
                      key={mockupSlides[currentMockupIndex].id}
                      src={mockupSlides[currentMockupIndex].src}
                      alt={mockupSlides[currentMockupIndex].alt}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="w-full h-auto block object-contain mx-auto drop-shadow-2xl z-10 relative"
                      draggable="false"
                    />
                  </AnimatePresence>
                </div>

                {/* Tablet & Mobile View: Orientation-aware responsive mockups */}
                <div className="lg:hidden w-full h-auto flex justify-center">
                  <picture className="block w-full max-w-[90vw] h-auto drop-shadow-2xl">
                    {/* Tablet Landscape */}
                    <source media="(min-width: 768px) and (orientation: landscape)" srcSet="/opsnav-landscape-mock.png" />
                    {/* Tablet Portrait */}
                    <source media="(min-width: 768px) and (orientation: portrait)" srcSet="/opsnav-portrait-tablet-mock.png" />
                    {/* Mobile Landscape */}
                    <source media="(max-width: 767px) and (orientation: landscape)" srcSet="/opsnav-mobile-landscape-mock.png" />
                    {/* Mobile Portrait (Default) */}
                    <img
                      src="/opsnav-mobile-portrait-mock.png"
                      alt="OpsNav Dashboard Responsive Mockup"
                      className="w-full h-auto block object-contain mx-auto"
                      draggable="false"
                    />
                  </picture>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose OpsNav */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#2E3D99]/5 to-[#1D97D7]/10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wide">
                WHY CHOOSE OPSNAV
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              Built for <span className="text-[#2E3D99]">Real Operations,</span> Not Just Tasks
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Designed to bring structure, visibility, and control to your workflows - so your team can execute with clarity and confidence.
            </p>
          </motion.div>

          {/* Mobile Carousel Container */}
          <div className="relative md:hidden">
            <div className="relative overflow-hidden rounded-xl">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentWhyChooseIndex * 100}%)`,
                }}
              >
                {[
                  {
                    icon: Layers,
                    title: "Industry-Aligned Workflows",
                    description:
                      "Purpose-built workflows designed around how your industry actually operates - ready to use from day one.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Target,
                    title: "Structured Task Management",
                    description:
                      "Organize every task into clear stages with defined progress, so nothing gets missed or delayed.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Activity,
                    title: "Complete Operational Visibility",
                    description:
                      "Track every stage, task, and update in one place with full visibility across your operations.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: BarChart3,
                    title: "Client Dashboard",
                    description:
                      "Give your clients real-time access to updates, reducing back-and-forth and improving transparency.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Sparkles,
                    title: "AI-Powered Insights",
                    description:
                      "Get real-time insights, reminders, and visibility into bottlenecks - without chasing your team.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: RefreshCw,
                    title: "Connected Operations",
                    description:
                      "Seamlessly connect your workflows, tools, and updates - so everything works together in one place.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                ].map((feature, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full group hover:shadow-xl transition-all duration-300">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 overflow-hidden relative`}
                      >
                        <feature.icon className="w-5 h-5 text-white relative z-10" />
                        {/* Glossy Shimmer Overlay (Tailwind Native) */}
                        <div 
                          className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[400%] transition-transform duration-700 ease-in-out"
                          style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
                          }}
                        />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Side Buttons with Correct Infinite Loop (1-5-1) */}
            <button
              onClick={() => {
                setCurrentWhyChooseIndex((prev) => {
                  if (prev === 0) {
                    return 5;
                  } else {
                    return prev - 1;
                  }
                });
              }}
              className="absolute left-1 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 border border-gray-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>

            <button
              onClick={() => {
                setCurrentWhyChooseIndex((prev) => {
                  if (prev === 5) {
                    return 0; // When at slide 6 (index 5), go to slide 1 (index 0)
                  } else {
                    return prev + 1; // Go to next slide
                  }
                });
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 border border-gray-200"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-700" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-1.5 mt-4">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentWhyChooseIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentWhyChooseIndex
                    ? "bg-[#2E3D99] scale-125"
                    : "bg-gray-300"
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Default Grid Layout for Tablet and Desktop */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Layers,
                title: "Industry-Aligned Workflows",
                description:
                  "Purpose-built workflows designed around how your industry actually operates - ready to use from day one.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Target,
                title: "Structured Task Management",
                description:
                  "Organize every task into clear stages with defined progress, so nothing gets missed or delayed.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Activity,
                title: "Complete Operational Visibility",
                description:
                  "Track every stage, task, and update in one place with full visibility across your operations.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: BarChart3,
                title: "Client Dashboard",
                description:
                  "Give your clients real-time access to updates, reducing back-and-forth and improving transparency.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Insights",
                description:
                  "Get real-time insights, reminders, and visibility into bottlenecks - without chasing your team.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: RefreshCw,
                title: "Connected Operations",
                description:
                  "Seamlessly connect your workflows, tools, and updates - so everything works together in one place.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 group"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 overflow-hidden relative`}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white relative z-10" />
                  {/* Glossy Shimmer Overlay (Tailwind Native) */}
                  <div 
                    className="absolute top-0 -inset-full h-full w-1/2 z-20 block transform -skew-x-12 -translate-x-[200%] group-hover:translate-x-[400%] transition-transform duration-700 ease-in-out"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)"
                    }}
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* The OpsNav Story */}
      <section id="aboutus" ref={ref} className="w-full py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                OUR JOURNEY
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              The OpsNav{" "}
              <span className="text-[#2E3D99]">
                Story So Far
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our journey of helping teams bring structure to their operations, one workflow at a time.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-6"
          >
            {[
              {
                value: "75K+",
                label: "Tasks & Workflow Actions Managed",
                subLabel: "Workflows executed and tasks completed across teams.",
                highlight: true,
                icon: (
                  <motion.svg
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 sm:w-16 sm:h-16"
                  >
                    <defs>
                      <linearGradient id="docG" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2E3D99" />
                        <stop offset="1" stopColor="#1D97D7" />
                      </linearGradient>
                      <linearGradient id="scanG" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1D97D7" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#1D97D7" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M20 12 H34 L42 20 V44 H20 V12Z"
                      stroke="url(#docG)"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <path d="M34 12 V20 H42" stroke="url(#docG)" strokeWidth="2" strokeLinejoin="round" />
                    {[26, 31, 36].map((y, i) => (
                      <motion.line
                        key={i}
                        x1="25" y1={y} x2="37" y2={y}
                        stroke="url(#docG)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                      />
                    ))}
                    <motion.rect
                      x="20" y="0" width="22" height="4"
                      fill="url(#scanG)"
                      animate={{ y: [12, 40] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </motion.svg>
                ),
              },
              {
                value: "Up to 5X",
                label: "Productivity Improvement",
                subLabel: "Teams achieve up to 5x more output with structured workflows and automation.",
                highlight: true,
                icon: (
                  <motion.svg
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 sm:w-16 sm:h-16"
                  >
                    <defs>
                      <linearGradient id="simpleGradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2E3D99" />
                        <stop offset="1" stopColor="#1D97D7" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M18 18 L30 28 L18 38"
                      stroke="url(#simpleGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        scale: [0.95, 1.05, 0.95],
                        filter: ["drop-shadow(0 0 0px #1D97D7)", "drop-shadow(0 0 8px #1D97D7)", "drop-shadow(0 0 0px #1D97D7)"]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M30 18 L42 28 L30 38"
                      stroke="url(#simpleGradient)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ 
                        opacity: [0.3, 1, 0.3],
                        scale: [0.95, 1.05, 0.95],
                        filter: ["drop-shadow(0 0 0px #1D97D7)", "drop-shadow(0 0 8px #1D97D7)", "drop-shadow(0 0 0px #1D97D7)"]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
                    />
                  </motion.svg>
                ),
              },
              {
                value: "60%",
                label: "Less Manual Follow-Ups",
                subLabel: "Reduced back-and-forth with clients through transparency and real-time updates.",
                highlight: true,
                icon: (
                  <motion.svg
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 sm:w-16 sm:h-16"
                  >
                    <defs>
                      <linearGradient id="starGradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFD700" />
                        <stop offset="1" stopColor="#FF8C00" />
                      </linearGradient>
                    </defs>
                    <motion.circle
                      cx="28" cy="28" r="22"
                      stroke="#1D97D7" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.path
                      d="M28 12 L31.5 22.5 L43 22.5 L34 29 L37.5 40 L28 33.5 L18.5 40 L22 29 L13 22.5 L24.5 22.5 Z"
                      fill="url(#starGradient)"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                        filter: ["drop-shadow(0 0 2px #FFD700)", "drop-shadow(0 0 8px #FFD700)", "drop-shadow(0 0 2px #FFD700)"]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {[
                      { x: 15, y: 15, delay: 0 },
                      { x: 41, y: 15, delay: 1 },
                      { x: 41, y: 41, delay: 2 },
                      { x: 15, y: 41, delay: 3 }
                    ].map((sp, i) => (
                      <motion.path
                        key={i}
                        d={`M${sp.x} ${sp.y-4} L${sp.x+1} ${sp.y-1} L${sp.x+4} ${sp.y} L${sp.x+1} ${sp.y+1} L${sp.x} ${sp.y+4} L${sp.x-1} ${sp.y+1} L${sp.x-4} ${sp.y} L${sp.x-1} ${sp.y-1} Z`}
                        fill="#FFD700"
                        animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: sp.delay }}
                      />
                    ))}
                  </motion.svg>
                ),
              },
              {
                value: "150+",
                label: "Teams Using OpsNav",
                subLabel: "Growing community of operations-focused teams trusting OpsNav.",
                highlight: true,
                icon: (
                  <motion.svg
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 sm:w-16 sm:h-16"
                  >
                    <defs>
                      <linearGradient id="sealG" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#2E3D99" />
                        <stop offset="1" stopColor="#1D97D7" />
                      </linearGradient>
                      <linearGradient id="sealShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="50%" stopColor="white" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Seal Frame */}
                    <circle cx="28" cy="28" r="24" stroke="url(#sealG)" strokeWidth="1.5" />
                    <circle cx="28" cy="28" r="21" stroke="url(#sealG)" strokeWidth="0.5" opacity="0.4" />
                    
                    {/* User Silhouette */}
                    <motion.g
                      animate={{ 
                        y: [0, -2, 0],
                        scale: [1, 1.03, 1],
                        rotate: [-1, 1, -1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }}
                    >
                      <circle cx="28" cy="22" r="5" stroke="url(#sealG)" strokeWidth="2.5" />
                      <path d="M18 38 C18 32 22 29 28 29 C34 29 38 32 38 38" stroke="url(#sealG)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </motion.g>

                    {/* Glossy Shimmer Effect */}
                    <motion.rect
                      x="-20" y="-20" width="100" height="100"
                      fill="url(#sealShimmer)"
                      style={{ rotate: 45 }}
                      animate={{ 
                        x: [-120, 120], 
                        y: [-120, 120],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ 
                        duration: 2.5, 
                        repeat: Infinity, 
                        ease: "linear",
                        repeatDelay: 0.5
                      }}
                      mask="url(#sealMask)"
                    />
                    <mask id="sealMask">
                      <circle cx="28" cy="28" r="24" fill="white" />
                    </mask>
                  </motion.svg>
                ),
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col items-center text-center gap-4"
              >
                <div className="flex items-center justify-center">
                  {stat.icon}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
                    {stat.value}
                  </span>
                  <span className={`text-sm font-medium leading-snug ${stat.highlight ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                    {stat.label}
                  </span>
                  {stat.subLabel && (
                    <span className="text-[11px] text-gray-500 font-medium mt-1 leading-tight max-w-[160px]">
                      {stat.subLabel}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Footnote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/5 text-gray-500 px-4 py-2 rounded-full border border-[#2E3D99]/10">
              <ShieldCheck className="w-4 h-4 text-[#2E3D99]" />
              <span className="text-xs sm:text-sm font-medium">
                Metrics based on internal data and customer feedback as of May 2025.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial */}
      <section ref={ref} className="w-full py-16 sm:py-24 bg-gradient-to-br from-[#2E3D99]/5 to-[#1D97D7]/10">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <MessageSquareQuote className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                WHAT OUR CUSTOMERS SAYS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              Customers{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Testimonials
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              See how teams are bringing structure, visibility, and control to their operations with OpsNav.
            </p>
          </motion.div>

          {/* ── MOBILE & TABLET: Swipeable Carousel ── */}
          <div className="block lg:hidden">
            <div className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {testimonials.map((person, i) => (
                <div key={i} className="flex-shrink-0 w-[85vw] sm:w-[350px] md:w-[400px] snap-center">
                  <TestimonialCard person={person} />
                </div>
              ))}
            </div>
          </div>

          {/* ── DESKTOP: 3 cards with dots ── */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden">
              <AnimatePresence custom={deskDir} mode="wait">
                <motion.div
                  key={deskCurrent}
                  custom={deskDir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="grid grid-cols-3 gap-8 pt-8 pb-8"
                >
                  {desktopSlides[deskCurrent].map((person) => (
                    <TestimonialCard key={person.name} person={person} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots - desktop only */}
            <div className="flex items-center justify-center gap-3 mt-10">
              {desktopSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => gotoDesk(i)}
                  className="rounded-full transition-all duration-300 focus:outline-none"
                  style={{
                    width: i === deskCurrent ? "28px" : "10px",
                    height: "10px",
                    background: i === deskCurrent
                      ? "linear-gradient(90deg, #2E3D99, #1D97D7)"
                      : "#CBD5E1",
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      <section ref={ref} className="w-full py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <MessageSquareQuote className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                FREQUENTLY ASKED QUESTIONS
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                Know About OpsNav
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Find answers about workflows, pricing, features, and how OpsNav helps you run structured operations with clarity and control.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="relative mb-8 sm:mb-10"
          >
            {/* Full-width gray baseline */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-200 rounded-full" />

            <div className="flex items-center gap-0 overflow-x-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTab(tab)}
                  className="relative pb-3 px-3 sm:px-6 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none whitespace-nowrap"
                  style={{
                    color: activeTab === tab ? "#2E3D99" : "#9CA3AF",
                  }}
                >
                  {tab}
                  {/* Gradient underline slides over the gray baseline */}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full z-10"
                      style={{
                        background: "linear-gradient(90deg, #2E3D99, #1D97D7)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* FAQ Items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col gap-3 sm:gap-4"
            >
              {faqData[activeTab].map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => handleToggle(i)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

        </div>
      </section>

      {/* CTA & Footer Container */}
      <div className="w-full relative bg-white overflow-hidden">
        {/* CTA Section */}
        <section className="relative z-20 w-full pt-16 sm:pt-24 pb-12 sm:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative w-full rounded-3xl bg-gradient-to-br from-[#2E3D99]/[0.02] to-[#1D97D7]/[0.05] overflow-hidden shadow-sm border border-[#2E3D99]/10 px-6 py-16 sm:px-12 sm:py-20 lg:py-24 text-center z-10"
            >
              {/* Background pattern - left dots */}
              <motion.div 
                initial={{ opacity: 0, x: -20, y: "-50%" }}
                whileInView={{ opacity: 0.50, x: 0, y: "-50%" }}
                animate={{ 
                  y: ["-50%", "-52%", "-50%"],
                }}
                transition={{
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 1 },
                  x: { duration: 1 }
                }}
                viewport={{ once: false }}
                className="hidden lg:block absolute left-0 top-1/2 -translate-x-[10%] w-[350px] h-[350px] pointer-events-none"
                style={{ 
                  backgroundImage: 'radial-gradient(#2E3D99 2px, transparent 2px)', 
                  backgroundSize: '24px 24px', 
                  WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)',
                  maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 20%, rgba(0,0,0,0) 70%)'
                }} 
              />

              {/* Background pattern - right concentric circles */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                viewport={{ once: false }}
                className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[600px] h-[600px] rounded-full border-[60px] border-[#1D97D7]/[0.05] pointer-events-none" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                viewport={{ once: false }}
                className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[450px] h-[450px] rounded-full border-[60px] border-[#1D97D7]/[0.1] pointer-events-none" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                viewport={{ once: false }}
                className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[300px] h-[300px] rounded-full bg-[#1D97D7]/[0.15] pointer-events-none" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
                viewport={{ once: false }}
                className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-[150px] h-[150px] rounded-full bg-[#1D97D7]/[0.25] pointer-events-none" 
              />

              <div className="relative z-20 flex flex-col items-center">
                <h2 className="text-3xl sm:text-4xl md:text-[44px] font-bold text-gray-900 mb-6 tracking-tight leading-tight max-w-3xl">
                  Ready to Transform How You <br className="hidden sm:block" />
                  Run <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">Operations?</span>
                </h2>

                <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl font-medium">
                  Move from scattered tools to structured workflows 
                  <br className="hidden sm:block" />
                  with complete visibility and control.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/get-started-free")}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 h-[52px] rounded-xl bg-[linear-gradient(90deg,#303D98,#24A5E4)] text-white font-semibold text-sm sm:text-[15px] shadow-md shadow-[#24A5E4]/20 whitespace-nowrap"
                  >
                    Start 1-Month Free Trial
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/book-demo")}
                    className="w-full sm:w-[240px] h-[52px] rounded-xl border-2 border-[#24A5E4] text-[#303D98] font-semibold text-[15px] bg-white shadow-sm hover:bg-[#24A5E4]/5 transition-colors"
                  >
                    Book a Demo
                  </motion.button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-sm text-gray-600 font-medium">
                  <span>No Credit Card Required</span>
                  <span className="hidden sm:inline mx-2">|</span>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer id="contactus" className="relative z-10 w-full pb-6 pt-12 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">

            {/* Top Row: Flex */}
            <div className="flex flex-col lg:flex-row justify-between w-full mb-10 gap-8 lg:gap-0 items-start">
              
              {/* Col 1: Logo & Text */}
              <div className="flex flex-col items-start lg:pl-6">
                <img src="/Logo.png" alt="OpsNav" className="w-[140px] mb-6" />
                <div className="text-gray-600 font-medium space-y-1">
                  <p>Structured operations.</p>
                  <p>Clear visibility.</p>
                  <p>Better execution.</p>
                </div>
              </div>

              {/* Col 2: Get in touch */}
              <div className="flex flex-col lg:items-center lg:pl-12">
                <div className="flex flex-col w-full lg:w-fit">
                  <h4 className="text-lg font-bold text-gray-900 mb-6">Get in touch</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-gray-600 font-medium">
                      <div className="w-10 h-10 rounded-lg bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-[#2E3D99]" />
                      </div>
                      <span>(03) 9111 5776 / 0435 332 279</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 font-medium">
                      <div className="w-10 h-10 rounded-lg bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                        <Mail size={18} className="text-[#2E3D99]" />
                      </div>
                      <span>support@opsnav.com</span>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600 font-medium">
                      <div className="w-10 h-10 rounded-lg bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} className="text-[#2E3D99]" />
                      </div>
                      <span>Australia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 3: Follow us */}
              <div className="flex flex-col lg:items-end">
                <div className="flex flex-col w-full lg:w-fit">
                  <h4 className="text-lg font-bold text-gray-900 mb-6 lg:text-right">Follow us</h4>
                  <div className="flex gap-4 lg:justify-end">
                    {[
                      { Icon: FaFacebookF, href: "https://www.facebook.com/opsnav", color: "text-[#1877F2]" },
                      { Icon: FaXTwitter, href: "#", color: "text-gray-900" },
                      { Icon: FaLinkedinIn, href: "https://www.linkedin.com/company/opsnav/posts/?feedView=all", color: "text-[#0A66C2]" },
                      { Icon: FaInstagram, href: "#", color: "text-[#E4405F]" },
                      { Icon: FaYoutube, href: "#", color: "text-[#FF0000]" }
                    ].map(({ Icon, href, color }, i) => (
                      <motion.a
                        key={i}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-11 h-11 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 hover:shadow-md bg-white"
                      >
                        <Icon className={`text-lg ${color}`} />
                      </motion.a>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Middle Row: Divider line */}
            <div className="h-px bg-gray-200 mb-8" />

            {/* Middle Row: Security Features Flex */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-0 mb-8">
              
              <div className="flex items-center gap-4 justify-start">
                <div className="w-12 h-12 rounded-xl bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <Lock size={20} className="text-[#2E3D99]" />
                </div>
                <span className="text-gray-700 font-medium text-sm leading-snug">Securely hosted<br/>in Australia</span>
              </div>
              
              <div className="hidden lg:block w-px h-12 bg-gray-200" />
              
              <div className="flex items-center gap-4 justify-center">
                <div className="w-12 h-12 rounded-xl bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} className="text-[#2E3D99]" />
                </div>
                <span className="text-gray-700 font-medium text-sm leading-snug">Aligned with Australian<br/>data privacy laws</span>
              </div>
              
              <div className="hidden lg:block w-px h-12 bg-gray-200" />
              
              <div className="flex items-center gap-4 justify-center">
                <div className="w-12 h-12 rounded-xl bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-[#2E3D99]" />
                </div>
                <span className="text-gray-700 font-medium text-sm leading-snug">You retain complete<br/>control of your data</span>
              </div>
              
              <div className="hidden lg:block w-px h-12 bg-gray-200" />
              
              <div className="flex items-center gap-4 justify-end">
                <div className="w-12 h-12 rounded-xl bg-[#2E3D99]/10 flex items-center justify-center flex-shrink-0">
                  <EyeOff size={20} className="text-[#2E3D99]" />
                </div>
                <span className="text-gray-700 font-medium text-sm leading-snug">No third-party<br/>data sharing</span>
              </div>
              
            </div>

            {/* Bottom Row: Divider line */}
            <div className="h-px bg-gray-200 mb-6" />

            {/* Bottom Row: Links, Flag, Copyright */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4 text-sm font-medium text-gray-500 pb-4">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                <Link to="/terms" className="hover:text-gray-800 transition-colors">Terms of Service</Link>
                {/* <span className="hidden lg:block text-gray-300">|</span>
                <Link to="/privacy-policy" className="hover:text-gray-800 transition-colors">Privacy Policy</Link> */}
                {/* <span className="hidden lg:block text-gray-300">|</span>
                <Link to="/cookie-policy" className="hover:text-gray-800 transition-colors">Cookie Policy</Link> */}
                <span className="hidden lg:block text-gray-300">|</span>
                <Link to="/release-notes" className="hover:text-gray-800 transition-colors">Release Notes</Link>
              </div>
              
              <div className="flex items-center gap-2">
                <span>Proudly built and hosted in Australia</span>
                <img src="https://flagcdn.com/au.svg" alt="Australia Flag" className="w-6 h-auto rounded-sm shadow-sm" />
              </div>

              <div>
                © 2026 OpsNav. All rights reserved.
              </div>
            </div>

          </div>
        </footer>

        {/* Scroll to Top */}
        <AnimatePresence>
          {scrolled && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-40"
            >
              <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
            </motion.button>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
