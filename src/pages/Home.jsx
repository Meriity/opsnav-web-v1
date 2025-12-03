import {
  Lock,
  User,
  RefreshCw,
  BadgeCheck,
  Facebook,
  Instagram,
  Twitter,
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";

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
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%202025-10-18%20113423.png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/dashboard-tablet.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/dashboards-mobile.png",
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
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png",
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
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png",
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
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png",
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
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "rose",
  },
  {
    id: 6,
    title: "Fully Cloud Hosted on GCP",
    description:
      "Enterprise-grade security on Google Cloud Platform with 99.9% uptime guarantee.",
    points: [
      "Google Cloud Platform hosting",
      "Enterprise-grade security",
      "99.9% uptime SLA",
    ],
    image: {
      desktop:
        "https://storage.googleapis.com/opsnav_web_image/Screenshot%20(946).png",
      tablet:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-tablet.png",
      mobile:
        "https://storage.googleapis.com/opsnav_web_image/view-clients-mobile.png",
    },
    gradient: "from-[#2E3D99]/20 to-[#1D97D7]/30",
    color: "slate",
  },
];

const BrowserTopBar = () => {
  // top bar sits *above* the image but below floating badges (badges will be z-40)
  return (
    <div className="absolute top-0 left-0 w-full z-20 pointer-events-none">
      <div
        className="
          h-10
          bg-[#1E1E1E]
          flex items-center gap-3 px-4
          rounded-t-2xl
          shadow-sm
        "
      >
        <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
        <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
        <span className="w-3 h-3 rounded-full bg-[#28C840]" />
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % featureSections.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector(".min-h-screen");

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If hero section is OUT of view → change button color
        setIsPastHero(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const handleLogin = () => {
    navigate("/admin/login");
  };

  const handleClientLogin = () => {
    navigate("/client/login");
  };

  const handleScrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  // Floating background elements
  const FloatingElement = ({ top, left, delay, size = 60 }) => (
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/20 opacity-20"
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
        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center border border-gray-100 group"
      >
        <div className="relative">
          <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-[#2E3D99]/10 to-[#1D97D7]/20 flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Star className="w-3 h-3 text-white" />
          </motion.div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        <motion.div
          className="mt-4 text-[#2E3D99] font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          whileHover={{ x: 5 }}
        >
          Learn more <ChevronRight className="w-4 h-4" />
        </motion.div>
      </motion.div>
    );
  };

  // const StatsCounter = ({ end, suffix, label, id }) => {
  //   const [ref, inView] = useInView({
  //     triggerOnce: true,
  //     threshold: 0.5,
  //   });
  //   const [count, setCount] = useState(0);
  //   const [hasAnimated, setHasAnimated] = useState(false);

  //   useEffect(() => {
  //     if (inView && !hasAnimated) {
  //       setHasAnimated(true);
  //       const startTime = Date.now();
  //       const duration = 1500; // 1.5 seconds

  //       const updateCount = () => {
  //         const elapsed = Date.now() - startTime;
  //         const progress = Math.min(elapsed / duration, 1);
  //         const currentCount = Math.floor(progress * end);

  //         setCount(currentCount);

  //         if (progress < 1) {
  //           requestAnimationFrame(updateCount);
  //         }
  //       };

  //       requestAnimationFrame(updateCount);
  //     }
  //   }, [inView, end, hasAnimated]);

  //   return (
  //     <div ref={ref} className="text-center">
  //       <div className="text-4xl md:text-5xl font-bold text-[#2E3D99] mb-2">
  //         {count}
  //         {suffix}
  //       </div>
  //       <div className="text-gray-600 text-sm">{label}</div>
  //     </div>
  //   );
  // };

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
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled
              ? "bg-white/95 backdrop-blur-lg shadow-lg py-3"
              : "bg-transparent py-6"
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <img src="/Logo.png" alt="OpsNav" className="h-12 w-auto" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-[#2E3D99] rounded-full"
                />
              </div>
            </motion.div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
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
                      : "text-[#2E3D99] border border-[#2E3D99] hover:bg-[#2E3D99]/5"
                  }`}
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg font-medium transition-all"
                >
                  Sign up
                </motion.button>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-8 border border-[#2E3D99]/20"
          >
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              Trusted by 500+ legal professionals worldwide
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-4xl lg:text-6xl font-bold max-w-6xl leading-tight"
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
            className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed"
          >
            Opsnav brings clarity and control to your most complex workflows -
            with centralized task tracking, automated processes, and real-time
            insights that keep your team aligned, productive, and moving
            forward.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col sm:flex-row gap-4 items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-200 font-semibold rounded-xl hover:border-[#2E3D99] hover:text-[#2E3D99] transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Book A Demo
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl"
          >
            {/* <StatsCounter end={500} suffix="+" label="Legal Professionals" />
            <StatsCounter end={99} suffix="%" label="Uptime SLA" />
            <StatsCounter end={24} suffix="/7" label="Support" />
            <StatsCounter end={50} suffix="+" label="Countries" /> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={handleScrollToFeatures}
              className="w-12 h-20 border-2 border-[#2E3D99]/20 rounded-full flex justify-center cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-[#2E3D99] rounded-full mt-3"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">POWERFUL FEATURES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                streamline operations
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for legal operations
              management
            </p>
          </motion.div>

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            <button
              onClick={prevFeature}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={nextFeature}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>

            <div className="grid lg:grid-cols-2 gap-8 p-8">
              <motion.div
                key={currentFeatureData.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col justify-center"
              >
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-3 py-1 rounded-full text-sm font-medium">
                    Feature {currentFeature + 1} of {featureSections.length}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  {currentFeatureData.title}
                </h3>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {currentFeatureData.description}
                </p>

                <div className="space-y-4">
                  {currentFeatureData.points.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{point}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex gap-2">
                    {featureSections.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToFeature(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentFeature
                            ? "bg-[#2E3D99] scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                        aria-label={`Go to feature ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div
                key={`image-${currentFeatureData.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl"
              >
                {/* Desktop: allow floating badges to overflow outside image by using overflow-visible */}
                <div className="hidden lg:block relative h-[400px] rounded-2xl overflow-visible">
                  <div className="relative rounded-2xl w-full h-full bg-white">
                    <BrowserTopBar />
                    <img
                      src={currentFeatureData.image.desktop}
                      alt={`${currentFeatureData.title} Screenshot`}
                      className="w-full h-full object-contain rounded-b-2xl"
                    />
                  </div>

                  {/* Floating UI badges (desktop) - z-40 so they sit ABOVE top bar */}
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute -left-6 bottom-6 z-40"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-green-500/95 flex items-center justify-center shadow-2xl transform hover:scale-105">
                      <svg
                        className="w-7 h-7 text-white"
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
                    className="absolute -right-6 top-6 z-40"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2E3D99] to-[#1D97D7] flex items-center justify-center shadow-2xl transform rotate-3">
                      <CheckCircle className="w-7 h-7 text-white" />
                    </div>
                  </motion.div>
                </div>

                {/* Tablet */}
                <div className="hidden md:block lg:hidden relative h-[300px] rounded-2xl overflow-visible">
                  <div className="relative rounded-2xl w-full h-full bg-white">
                    <BrowserTopBar />
                    <img
                      src={currentFeatureData.image.tablet}
                      alt={`${currentFeatureData.title} Tablet Screenshot`}
                      className="w-full h-full object-contain rounded-b-2xl"
                    />
                  </div>

                  {/* tablet floating badge (above top bar) */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute -left-4 bottom-4 z-40"
                  >
                    <div className="w-12 h-12 rounded-xl bg-green-500/95 flex items-center justify-center shadow-2xl">
                      <svg
                        className="w-5 h-5 text-white"
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
                <div className="md:hidden relative h-[250px] rounded-2xl overflow-visible">
                  <div className="relative rounded-2xl w-full h-full bg-white">
                    <BrowserTopBar />
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

          <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featureSections.map((feature, index) => (
              <button
                key={feature.id}
                onClick={() => goToFeature(index)}
                className={`p-4 rounded-xl text-center transition-all ${
                  index === currentFeature
                    ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-lg transform -translate-y-1"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <div className="font-medium text-sm">
                  {feature.title.split(" ")[0]}
                </div>
                <div className="text-xs opacity-80 mt-1">
                  {feature.title.split(" ").slice(1).join(" ")}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* rest of the page unchanged... (features, footer etc.) */}
      <div className="py-20 bg-gradient-to-br from-[#2E3D99]/5 to-[#1D97D7]/10">
        <div className="max-w-7xl mx-auto px-6">
          {/* All Features at a Glance section (unchanged) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              All Features at a Glance
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our complete suite of tools designed for legal operations
              excellence
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
              title="Cloud Hosted on GCP"
              description="Enterprise-grade security on Google Cloud Platform with 99.9% uptime guarantee."
              index={5}
            />
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#2E3D99]/10 text-[#2E3D99] px-4 py-2 rounded-full mb-4">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">WHY CHOOSE OPSNAV</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Built for the modern{" "}
              <span className="bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] bg-clip-text text-transparent">
                legal practice
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  "Hosted on Google Cloud Platform with multi-region redundancy.",
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
                title: "Legal Expertise",
                description:
                  "Built by legal professionals who understand your workflow.",
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
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to transform your legal operations?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of legal professionals who trust OpsNav to
              streamline their workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                className="px-8 py-4 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial - 14 Days
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent text-white border-2 border-gray-700 font-semibold rounded-xl hover:border-white transition-all"
              >
                Schedule a Demo
              </motion.button>
            </div>
            <p className="mt-6 text-gray-400 text-sm">
              No credit card required • Cancel anytime • 24/7 support
            </p>
          </motion.div>
        </div>
      </div>

      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* OpsNav Text */}
            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-3xl font-bold text-white mb-2">
                  OpsNav
                </span>
                <p className="text-gray-400 max-w-md">
                  Streamline legal operations with precision and scale without
                  bottlenecks.
                </p>
              </div>
            </div>

            {/* Connect with us section */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-4 text-lg">Connect with us</h4>
              <div className="flex justify-center md:justify-end gap-4">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Twitter, label: "Twitter" },
                  { Icon: Linkedin, label: "LinkedIn" },
                ].map(({ Icon, label }, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-gray-800 hover:bg-[#2E3D99]
                    transition-colors duration-300 flex items-center justify-center cursor-pointer"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} OpsNav. All rights reserved.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
