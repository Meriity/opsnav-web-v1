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
  ShieldCheck,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Menu,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
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
      "Customized views for different user roles",
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
      "Automated report generation with real-time notifications and customizable alerts.",
    points: [
      "Automated report generation",
      "Real-time notifications",
      "Customizable alerts",
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

export default function Home() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const [currentWhyChooseIndex, setCurrentWhyChooseIndex] = useState(0);

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
      el.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20 hidden sm:block"
      style={{
        width: size,
        height: size,
        top: `${top}%`,
        left: `${left}%`,
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
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ y: -10 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 flex flex-col items-center text-center border border-gray-100 group"
      >
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#2E3D99]/10 to-[#1D97D7]/20 flex items-center justify-center p-3 sm:p-4 group-hover:scale-110 transition-transform duration-300">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-full flex items-center justify-center">
              <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center"
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

  const currentFeatureData = featureSections[currentFeature];

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-br from-white via-[#2E3D99]/5 to-[#1D97D7]/10 overflow-hidden">
        <FloatingElement top={10} left={10} delay={0} />
        <FloatingElement top={20} left={85} delay={1} size={80} />
        <FloatingElement top={70} left={5} delay={2} size={40} />
        <FloatingElement top={80} left={90} delay={1.5} size={100} />

        <div className="absolute inset-0 opacity-[0.06]">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isMobileMenuOpen ? 0 : "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 p-6 md:hidden"
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
          <div className="space-y-4">
            <button
              onClick={handleClientLogin}
              className="w-full px-4 py-3 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:bg-[#2E3D99]/5 font-medium transition-colors"
            >
              Client Portal
            </button>
            <button
              onClick={handleLogin}
              className="w-full px-4 py-3 bg-[#FB4A50] text-white rounded-lg font-medium hover:bg-[#FB4A50]/90"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setShowMobileNav(false);
              }}
              className="w-full py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Sign Up
            </button>
          </div>
        </motion.div>

        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-lg shadow-lg py-3"
              : "bg-transparent py-4 sm:py-6"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClientLogin}
                className="px-4 py-2 text-[#2E3D99] border border-[#2E3D99] rounded-lg hover:bg-[#2E3D99]/5 font-medium transition-colors"
              >
                Client Portal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isPastHero
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
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </motion.header>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 min-h-screen pt-16 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 sm:mb-8 border border-[#2E3D99]/20 max-w-[90%]"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 truncate">
              Trusted by 500+ professionals worldwide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold max-w-6xl leading-tight px-4"
          >
            <span className="bg-gradient-to-r from-[#2E3D99] via-[#1D97D7] to-[#1D97D7] bg-clip-text text-transparent">
              Streamline with Precision.
            </span>
            <br />
            <span className="text-gray-800">
              Scale Your Operations without bottlenecks.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed px-4"
          >
            OpsNav brings clarity and control to your most complex workflows -
            with centralised task tracking, automated processes, and real-time
            insights that keep your team aligned, productive, and moving
            forward.
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
            className="mt-4 sm:mt-6 text-gray-500 text-sm sm:text-base px-4"
          >
            No credit card required • Cancel anytime
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

      {/* Features Section */}
      <div id="features" className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
                streamline operations
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Comprehensive tools designed specifically for operations
              management
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
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                            index === currentFeature
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
                className={`p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl text-center transition-all ${
                  index === currentFeature
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
              description="Automated report generation with real-time notifications and customizable alerts."
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

      {/* Why Choose OpsNav */}
      <div className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
              <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">
                WHY CHOOSE OPSNAV
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
              Built for the modern{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                practice
              </span>
            </h2>
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
                    icon: ShieldCheck,
                    title: "Enterprise Security",
                    description:
                      "End-to-end encryption, role-based access control, and GDPR compliance.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Globe,
                    title: "Global Infrastructure",
                    description:
                      "Hosted on Cloud with multi-region redundancy.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description:
                      "Optimized for performance with sub-second response times.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    description:
                      "Real-time updates, comments, and @mentions for seamless teamwork.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: Building,
                    title: "Expertise",
                    description:
                      "Built by professionals who understand your workflow.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                  {
                    icon: BarChart3,
                    title: "Actionable Insights",
                    description:
                      "Advanced analytics and reporting to drive business decisions.",
                    gradient: "from-[#2E3D99] to-[#1D97D7]",
                  },
                ].map((feature, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-full">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}
                      >
                        <feature.icon className="w-5 h-5 text-white" />
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
                    return 4;
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
                  if (prev === 4) {
                    return 0; // When at slide 5 (index 4), go to slide 1 (index 0)
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
              {[0, 1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentWhyChooseIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentWhyChooseIndex
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
                icon: ShieldCheck,
                title: "Enterprise Security",
                description:
                  "End-to-end encryption, role-based access control, and GDPR compliance.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Globe,
                title: "Global Infrastructure",
                description: "Hosted on Cloud with multi-region redundancy.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Optimized for performance with sub-second response times.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description:
                  "Real-time updates, comments, and @mentions for seamless teamwork.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: Building,
                title: "Expertise",
                description:
                  "Built by professionals who understand your workflow.",
                gradient: "from-[#2E3D99] to-[#1D97D7]",
              },
              {
                icon: BarChart3,
                title: "Actionable Insights",
                description:
                  "Advanced analytics and reporting to drive business decisions.",
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
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100"
              >
                <div
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6`}
                >
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
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
      {/* CTA Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Ready to transform your operations?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto">
              Join thousands of professionals who trust OpsNav to streamline
              their workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/get-started-free")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial - 14 Days
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/book-demo")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-transparent text-white border-2 border-gray-700 font-semibold rounded-xl hover:border-white transition-all"
              >
                Schedule a Demo
              </motion.button>
            </div>
            <p className="mt-4 sm:mt-6 text-gray-400 text-sm sm:text-base">
              No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  OpsNav
                </span>
                <p className="text-gray-400 max-w-md text-sm sm:text-base">
                  Streamline operations with precision and scale without
                  bottlenecks.
                </p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">
                Connect with us
              </h4>

              {/* Social Icons */}
              <div className="flex justify-center md:justify-end gap-3 sm:gap-4">
                {/* Facebook */}
                <motion.a
                  href="https://www.facebook.com/opsnav"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Facebook"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 hover:bg-[#FB4A50]
        transition-colors duration-300 flex items-center justify-center"
                >
                  <FaFacebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.a>

                {/* Instagram */}
                <motion.a
                  href="#"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Instagram"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 hover:bg-[#FB4A50]
        transition-colors duration-300 flex items-center justify-center"
                >
                  <FaInstagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.a>

                {/* X */}
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="X"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 hover:bg-[#FB4A50]
        transition-colors duration-300 flex items-center justify-center"
                >
                  <FaXTwitter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.a>

                {/* LinkedIn */}
                <motion.a
                  href="https://www.linkedin.com/company/opsnav/"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="LinkedIn"
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-800 hover:bg-[#FB4A50]
        transition-colors duration-300 flex items-center justify-center"
                >
                  <FaLinkedin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400">
            <p className="text-sm sm:text-base">
              © {new Date().getFullYear()} OpsNav. All rights reserved.
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
              <Link to="/release-notes" className="hover:text-white transition-colors">
                Release Notes
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
              <Link to="/contact-support" className="hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
