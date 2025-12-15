import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  Search,
  FileText,
  Shield,
  Lock,
  Globe,
  Download,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Printer,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Menu,
  ArrowUp,
  User,
  DollarSign,
  XCircle,
  Copyright,
  Users,
  RefreshCw,
  Clock,
  Cloud,
  Building,
  BarChart3,
  Target,
  Zap,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  FileCheck,
  Calendar,
  CreditCard,
  Bell,
  Database,
  Cpu,
  Layers,
  Command,
} from "lucide-react";

const TermsOfService = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [tocExpanded, setTocExpanded] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isMac, setIsMac] = useState(true);

  // Refs for section navigation
  const sectionRefs = useRef({});
  const tocRef = useRef(null);
  const tocItemRefs = useRef({});
  const searchBoxRef = useRef(null);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // TOC sections with full content mapping
  const tocSections = [
    { id: "overview", title: "Overview", icon: BookOpen, level: 0 },
    {
      id: "subscription",
      title: "1. Subscription and Access",
      icon: FileText,
      level: 1,
    },
    { id: "accounts", title: "2. User Accounts", icon: User, level: 1 },
    {
      id: "pricing",
      title: "3. Subscription Plans, Pricing and Billing",
      icon: DollarSign,
      level: 1,
    },
    {
      id: "cancellation",
      title: "4. Cancellation and Termination",
      icon: XCircle,
      level: 1,
    },
    {
      id: "usage",
      title: "5. Permitted Use and Restrictions",
      icon: Shield,
      level: 1,
    },
    { id: "data", title: "6. Data and Privacy", icon: Lock, level: 1 },
    { id: "ip", title: "7. Intellectual Property", icon: Copyright, level: 1 },
    {
      id: "availability",
      title: "8. Service Availability and Changes",
      icon: Cloud,
      level: 1,
    },
    {
      id: "warranties",
      title: "9. Warranties and Consumer Rights",
      icon: ShieldCheck,
      level: 1,
    },
    { id: "liability", title: "10. Liability", icon: AlertCircle, level: 1 },
    { id: "indemnity", title: "11. Indemnity", icon: TrendingUp, level: 1 },
    {
      id: "thirdparty",
      title: "12. Third-party Services",
      icon: Globe,
      level: 1,
    },
    {
      id: "changes",
      title: "13. Changes to these Terms",
      icon: RefreshCw,
      level: 1,
    },
    {
      id: "governance",
      title: "14. Governing Law and Jurisdiction",
      icon: Building,
      level: 1,
    },
    { id: "contact", title: "15. Contact Us", icon: MessageSquare, level: 1 },
  ];

  // Handle scroll for sections
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      const scrollPosition = window.scrollY + 120;
      let currentSection = activeSection;

      for (const section of tocSections) {
        const ref = sectionRefs.current[section.id];
        if (!ref) continue;

        if (scrollPosition >= ref.offsetTop) {
          currentSection = section.id;
        } else {
          break;
        }
      }

      // Update ONLY if changed
      if (currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  useEffect(() => {
    const container = tocRef.current;
    const activeItem = tocItemRefs.current[activeSection];

    if (!container || !activeItem) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    const isVisible =
      itemRect.top >= containerRect.top &&
      itemRect.bottom <= containerRect.bottom;

    // Only scroll TOC if item is OUTSIDE visible area
    if (!isVisible) {
      activeItem.scrollIntoView({
        block: "nearest",
        behavior: "auto",
      });
    }
  }, [activeSection]);

  // Detect if Mac for keyboard shortcut display
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMac(userAgent.includes("mac"));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
        setIsFocused(true);
      }
      if (e.key === "Escape" && showDropdown) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showDropdown]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target) &&
        !event.target.closest(".search-dropdown-container")
      ) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality with proper debouncing
  const handleSearch = useCallback((value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing
    searchTimeoutRef.current = setTimeout(() => {
      const searchTerm = value.toLowerCase();
      const results = [];

      // Search through all sections
      tocSections.forEach((section) => {
        const content = sectionContent[section.id]?.content || "";
        const title = section.title.toLowerCase();
        const sectionContentLower = content.toLowerCase();

        // Check if search term is in title or content
        if (
          title.includes(searchTerm) ||
          sectionContentLower.includes(searchTerm)
        ) {
          // Find the context around the search term
          let snippet = "";
          if (sectionContentLower.includes(searchTerm)) {
            const index = sectionContentLower.indexOf(searchTerm);
            const start = Math.max(0, index - 50);
            const end = Math.min(
              content.length,
              index + searchTerm.length + 100
            );
            snippet = content.substring(start, end);
            if (start > 0) snippet = "..." + snippet;
            if (end < content.length) snippet = snippet + "...";
          } else {
            snippet = content.substring(0, 150) + "...";
          }

          results.push({
            id: section.id,
            sectionId: section.id,
            title: section.title,
            snippet: snippet,
            content: content,
            icon: section.icon,
            type: "section",
          });
        }
      });

      setSearchResults(results);
      setLoading(false);
    }, 300);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    inputRef.current?.focus();
  };

  const handleSearchItemClick = (item) => {
    // Close everything immediately
    setShowDropdown(false);
    setIsFocused(false);
    setShowMobileNav(false);
    setSearchQuery("");

    // Clear timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Force expand the section
    setExpandedSections((prev) => ({
      ...prev,
      [item.sectionId]: true,
    }));

    // Set active section
    setActiveSection(item.sectionId);

    setTimeout(() => {
      requestAnimationFrame(() => {
        // Try multiple methods to ensure scrolling works
        const element = document.getElementById(item.sectionId);
        if (!element) return;

        const headerOffset = 120;
        const y =
          element.getBoundingClientRect().top +
          window.pageYOffset -
          headerOffset;

        window.scrollTo({ top: y, behavior: "smooth" });
      });
    }, 0);
  };
  // Animation variants (from your Header component)
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.03, duration: 0.2 },
    }),
  };

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      // Ensure the section is expanded
      setExpandedSections((prev) => ({
        ...prev,
        [sectionId]: true,
      }));

      setShowMobileNav(false);

      // Set active section
      setActiveSection(sectionId);

      setTimeout(() => {
        const headerHeight = 100;
        const y = sectionElement.offsetTop - headerHeight;

        window.scrollTo({
          left: 0,
          top: y,
          behavior: "smooth",
        });
      }, 50);
    }
  };

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Download PDF function
  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    const pdfUrl =
      "https://storage.googleapis.com/opsnav_docs/OpsNav%20Portal-%20Subscription%20Terms%20%26%20Conditions.pdf";
    link.href = pdfUrl;
    link.download = "OpsNav-Terms-and-Conditions.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Terms of Service PDF download started!");
  };

  // Format content with better readability
  const formatContent = (content) => {
    return content.split("\n\n").map((paragraph, index) => {
      if (paragraph.trim().match(/^[a-z]\)/)) {
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="ml-6 mb-4"
          >
            <div className="flex">
              <span className="font-semibold text-[#2E3D99] min-w-[24px]">
                {paragraph.substring(0, 2)}
              </span>
              <p className="text-gray-700">{paragraph.substring(3)}</p>
            </div>
          </motion.div>
        );
      } else if (paragraph.trim().match(/^\s*i\)/)) {
        // Subsubsection with roman numeral
        return (
          <div key={index} className="ml-12 mb-3">
            <div className="flex">
              <span className="font-medium text-gray-600 min-w-[24px]">
                {paragraph.trim().substring(0, 3)}
              </span>
              <p className="text-gray-600 text-sm">{paragraph.substring(3)}</p>
            </div>
          </div>
        );
      } else if (
        paragraph.trim().startsWith("**") &&
        paragraph.trim().endsWith("**")
      ) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold text-gray-800 mt-6 mb-4"
          >
            {paragraph.replace(/\*\*/g, "")}
          </h4>
        );
      } else {
        return (
          <motion.p
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="text-gray-700 mb-6 leading-relaxed"
          >
            {paragraph}
          </motion.p>
        );
      }
    });
  };

  // Content for each section
  const sectionContent = {
    overview: {
      title: "Overview",
      content: `**OpsNav Portal - Subscription Terms and Conditions**

These Terms and Conditions govern your access to and use of the OpsNav online portal available at www.opsnav.com (Portal), operated by **TechAliyan Pty Ltd (ACN 688 247 421) trading as OpsNav** (we, us, our).

By creating an account, subscribing to, or accessing the Portal, you agree to be bound by these Terms and Conditions and our Privacy Policy.`,
      icon: Info,
      color: "from-blue-500 to-cyan-500",
    },
    subscription: {
      title: "1. Subscription and Access",
      content: `a) You may access the Portal only by creating an account and purchasing a subscription (Subscription).

b) Your Subscription type, fees, inclusions and term (e.g. monthly/annual) will be set out on the Portal or in the order/sign-up page at the time you subscribe.

c) Subject to your payment of all applicable fees and compliance with these Terms, we grant you a non-exclusive, non-transferable, limited licence to access and use the Portal for your internal business purposes only.`,
      icon: FileCheck,
      color: "from-purple-500 to-pink-500",
    },
    accounts: {
      title: "2. User Accounts",
      content: `a) You are responsible for keeping your login details and passwords secure and must not share them with any other person.

b) You are responsible for all activity that occurs under your account, whether authorised by you or not.

c) You must notify us immediately if you become aware of any unauthorised use of your account.`,
      icon: Users,
      color: "from-green-500 to-emerald-500",
    },
    pricing: {
      title: "3. Subscription Plans, Pricing and Billing",
      content: `**Subscription Plans**

a) We offer different subscription plans for access to the Portal (for example, Starter, Professional and Enterprise), which may vary by features, user limits and support levels. The details and current pricing for each plan are set out on the Portal or in your order form at the time you subscribe.

**Fees and GST**

b) All Subscription fees are in Australian dollars (AUD) and, unless stated otherwise, are exclusive of GST.

c) If GST is payable on a supply under these Terms, you must pay the applicable GST amount in addition to the Subscription fee.

**Billing Cycle and Payment**

d) Subscriptions are billed in advance on a monthly or annual basis, as selected by you at the time of sign-up.

e) You authorise us (and our third-party payment processor) to automatically charge your nominated payment method (e.g. credit card or direct debit) on or around the start of each billing period for the applicable Subscription fees.

f) If a payment is unsuccessful, we may retry the charge; if payment remains outstanding, we may suspend or restrict access to the Portal until all amounts are paid.

**Auto-renewal and Price Changes**

g) Your Subscription will automatically renew at the end of each billing period for a further period of the same length, unless you cancel it in accordance with clause 4 before the renewal date.

h) We may change our Subscription fees from time to time. Any change will not apply until your next renewal. We will give you reasonable notice (for example, by email or via the Portal) before a fee change takes effect so you can decide whether to continue or cancel.

**Upgrades, Downgrades and Additional Users**

i) You may upgrade your plan or add additional users at any time. Any additional fees will be prorated for the remainder of your current billing period, unless stated otherwise.

j) If you downgrade your plan or reduce users, the change will generally take effect from the next billing period. We do not provide pro-rated refunds for downgrades, except where required by law.

**No Refunds**

k) Except as required under the Australian Consumer Law or expressly stated in these Terms, all Subscription fees are non-refundable, including where you cancel part way through a billing period or do not use the Portal.

**Invoicing (for approved customers)**

l) Where we agree in writing to invoice you directly (for example, Enterprise customers), payment is due within 14 days of the invoice date, unless otherwise specified. If you fail to pay an invoice on time, we may charge interest on overdue amounts at a reasonable commercial rate and/or suspend access to the Portal until payment is received.

**Trial Periods**

m) We may offer a free or discounted trial of certain Subscription plans for a limited period (Trial Period), as described on the Portal or in your sign-up offer.

n) Unless we state otherwise, Trial Periods are available once per organisation and may be withdrawn or modified at any time.

o) At the end of the Trial Period, your Subscription will automatically convert to a paid Subscription on the plan you selected at sign-up (or, if not specified, the then-current entry-level paid plan), and we will begin charging the applicable fees to your nominated payment method, unless you cancel before the Trial Period ends.

p) It is your responsibility to monitor the Trial Period end date and cancel in time if you do not wish to continue with a paid Subscription.

**Customer Support**

q) Support levels, availability and response times may vary depending on your Subscription plan. We will use reasonable endeavours to respond to support requests; however, no response times are guaranteed unless expressly stated.`,
      icon: CreditCard,
      color: "from-amber-500 to-orange-500",
      subsections: [
        "Subscription Plans",
        "Fees and GST",
        "Billing Cycle and Payment",
        "Auto-renewal and Price Changes",
        "Upgrades, Downgrades and Additional Users",
        "No Refunds",
        "Invoicing",
        "Trial Periods",
        "Customer Support",
      ],
    },
    cancellation: {
      title: "4. Cancellation and Termination",
      content: `a) You may cancel your Subscription at any time by contacting us. A registered account holder must make cancellation requests. Cancellation takes effect at the end of your current billing period; we do not provide pro-rata refunds except where required by law.

b) We may suspend or terminate your access to the Portal immediately if:

i) you fail to pay any fees when due;

ii) you breach these Terms and do not remedy the breach within a reasonable time after we ask you to; or

iii) we reasonably suspect fraud, misuse or unauthorised use of the Portal.

c) On termination or expiry, your right to access the Portal ceases, and we may deactivate or delete your account in accordance with our data retention policies.

**Automatic Renewal**

d) Unless cancelled in accordance with these Terms, your Subscription will automatically renew at the end of each billing period for a further period of the same length (for example, monthly to monthly, annual to annual).

e) On renewal, we will charge your nominated payment method for the Subscription fees applicable to your plan at the time of renewal.

f) You can cancel automatic renewal at any time via your account settings or by contacting us. Cancellation will take effect at the end of your current billing period; you will continue to have access to the Portal until then.

g) If we make a material change to your plan or fees for the next renewal period, we will give you reasonable prior notice so you can decide whether to continue or cancel before the renewal takes effect.`,
      icon: XCircle,
      color: "from-red-500 to-rose-500",
    },
    usage: {
      title: "5. Permitted Use and Restrictions",
      content: `a) You must use the Portal only for lawful purposes and in accordance with these Terms.

b) You must not (and must not permit anyone else to):

i) copy, modify, reverse engineer, decompile, or attempt to extract the source code of the Portal, except to the extent permitted by law;

ii) resell, sub-licence, lease, distribute or otherwise make the Portal available to any third party (other than your authorised employees/contractors) without our written consent;

iii) introduce any viruses, malware or harmful code into the Portal;

iv) use the Portal to infringe any third-party rights, or to send spam, offensive or unlawful content; or

v) bypass or attempt to circumvent any security features or access controls.`,
      icon: Shield,
      color: "from-indigo-500 to-blue-500",
    },
    data: {
      title: "6. Data and Privacy",
      content: `a) You retain ownership of all data and content you input or upload into the Portal (Your Data). You grant us a non-exclusive, royalty-free licence to store, use and process Your Data solely for the purpose of providing the Portal and related services to you.

b) Your data will be stored on reputable public cloud platforms (such as Google and Amazon), and will be protected by the security measures those providers implement.

c) It is your sole responsibility to conduct regular back-ups of Your Data. We do not back up Your Data.`,
      icon: Database,
      color: "from-teal-500 to-cyan-500",
    },
    ip: {
      title: "7. Intellectual Property",
      content: `a) All intellectual property rights in the Portal (including software, code, design, text, graphics, logos, and underlying databases) are owned by or licensed to TechAliyan Pty Ltd t/a OpsNav.

b) Except for the limited licence in clause 1(c), nothing in these Terms transfers any intellectual property rights to you.`,
      icon: Copyright,
      color: "from-violet-500 to-purple-500",
    },
    availability: {
      title: "8. Service Availability and Changes",
      content: `a) We aim to keep the Portal available and functioning, but we do not guarantee uninterrupted or error-free operation. The Portal may be unavailable from time to time for maintenance, upgrades or other reasons.

b) We may modify, update or discontinue features of the Portal at any time. Where a change materially reduces the core functionality of your paid Subscription, we will use reasonable endeavours to notify you in advance.`,
      icon: Cloud,
      color: "from-sky-500 to-blue-500",
    },
    warranties: {
      title: "9. Warranties and Consumer Rights",
      content: `a) To the extent permitted by law, the Portal is provided "as is" and "as available", and we exclude all warranties, representations and guarantees not expressly set out in these Terms.

b) Nothing in these Terms excludes, restricts or modifies any consumer guarantees, rights or remedies you may have under the Australian Consumer Law (ACL) or other applicable law that cannot be excluded.

c) Where our liability for breach of a non-excludable guarantee can be limited, our liability is limited (at our option) to resupplying the services or paying the cost of having the services supplied again.`,
      icon: ShieldCheck,
      color: "from-emerald-500 to-green-500",
    },
    liability: {
      title: "10. Liability",
      content: `a) To the maximum extent permitted by law, we are not liable for:

i) any loss of profit, revenue, data, goodwill, or any indirect or consequential loss; or

ii) any loss arising from your misuse of the Portal or failure to comply with these Terms.

b) Our total aggregate liability to you for all claims arising out of or in connection with the Portal or these Terms is limited to the total Subscription fees you paid to us in the 12 months immediately before the event giving rise to the claim.`,
      icon: AlertCircle,
      color: "from-rose-500 to-pink-500",
    },
    indemnity: {
      title: "11. Indemnity",
      content: `You indemnify us (and our officers, employees and contractors) against any loss, damage, liability, cost or expense (including reasonable legal costs) arising from:

i) Your Data;

ii) your breach of these Terms; or

iii) your misuse of the Portal,

except to the extent caused by our own negligence or wrongful act.`,
      icon: TrendingUp,
      color: "from-orange-500 to-amber-500",
    },
    thirdparty: {
      title: "12. Third-party Services",
      content: `The Portal may contain links or integrations to third-party websites or services. We do not control and are not responsible for those third-party services. Your use of them is subject to their own terms and conditions.`,
      icon: Globe,
      color: "from-cyan-500 to-blue-500",
    },
    changes: {
      title: "13. Changes to these Terms",
      content: `We may update these Terms from time to time. If we make material changes, we will notify you by email or via the Portal. Your continued use of the Portal after the effective date of any changes constitutes your acceptance of the updated Terms.`,
      icon: RefreshCw,
      color: "from-blue-500 to-indigo-500",
    },
    governance: {
      title: "14. Governing Law and Jurisdiction",
      content: `These Terms are governed by the laws of Victoria, Australia. Each party submits to the non-exclusive jurisdiction of the courts of Victoria and the courts competent to hear appeals from them.`,
      icon: Building,
      color: "from-gray-600 to-gray-700",
    },
    contact: {
      title: "15. Contact Us",
      content: `If you have any questions about these Terms, please contact:
      
TechAliyan Pty Ltd t/a OpsNav
Email: support@opsnav.com
Tel: 0435 332 279`,
      icon: MessageSquare,
      color: "from-[#2E3D99] to-[#1D97D7]",
    },
  };

  // Render section with enhanced UI
  const renderSection = (sectionId) => {
    const section = sectionContent[sectionId];
    const Icon = section?.icon || FileText;
    const isExpanded = expandedSections[sectionId] !== false;

    return (
      <section
        key={sectionId}
        id={sectionId}
        ref={(el) => (sectionRefs.current[sectionId] = el)}
        className={`mb-8 scroll-mt-24 bg-white rounded-2xl shadow-lg overflow-hidden ${
          activeSection === sectionId
            ? "ring-2 ring-[#2E3D99] ring-opacity-50"
            : ""
        }`}
      >
        {/* Section Header */}
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                  section?.color || "from-gray-500 to-gray-600"
                } flex items-center justify-center`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {section?.title}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activeSection === sectionId
                        ? "bg-[#2E3D99]"
                        : "bg-gray-300"
                    }`}
                  />
                  <span className="text-sm text-gray-500">
                    {tocSections.find((s) => s.id === sectionId)?.level === 0
                      ? "Introduction"
                      : "Section"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </div>
          </div>
        </button>

        {/* Section Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <div className="prose prose-lg max-w-none">
                  <div className="space-y-4">
                    {formatContent(section?.content)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              {onClose && (
                <button
                  onClick={onClose}
                  className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FileText className="w-7 h-7 text-[#2E3D99]" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Terms of Service
                  </h1>
                </div>
              </div>
            </div>

            {/* Actions with integrated search */}
            <div className="flex items-center space-x-4">
              {/* Search Box */}
              <div
                ref={searchBoxRef}
                className={`
                  relative transition-all duration-500 ease-out
                  ${isFocused ? "w-full md:w-[380px]" : "w-full md:w-[280px]"}
                `}
              >
                <div
                  className={`
                    absolute -inset-0.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-2xl opacity-0 transition-opacity duration-300 blur-sm
                    ${isFocused ? "opacity-30" : "opacity-0"}
                  `}
                />

                <div
                  className={`
                    relative flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300 bg-white
                    ${
                      isFocused
                        ? "border-transparent shadow-lg ring-1 ring-[#2E3D99]/10"
                        : "border-gray-200 shadow-sm hover:border-[#2E3D99]/30 hover:shadow-md"
                    }
                  `}
                >
                  <Search
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isFocused ? "text-[#2E3D99]" : "text-gray-400"
                    }`}
                  />

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search terms and conditions..."
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => {
                      if (searchQuery.trim()) {
                        setShowDropdown(true);
                      }
                      setIsFocused(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setIsFocused(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowDropdown(false);
                        setIsFocused(false);
                      }
                    }}
                  />

                  <AnimatePresence>
                    {searchQuery ? (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={clearSearch}
                        className="p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#FB4A50] hover:text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </motion.button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        className="hidden md:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] text-gray-400 font-medium cursor-pointer"
                        onClick={() => inputRef.current?.focus()}
                      >
                        {isMac ? (
                          <Command className="w-3 h-3" />
                        ) : (
                          <span className="text-[10px] font-bold">Ctrl</span>
                        )}
                        <span>K</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileNav(!showMobileNav)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center space-x-3">
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {showMobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setShowMobileNav(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Table of Contents
                  </h3>
                  <button
                    onClick={() => setShowMobileNav(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search terms..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Scrollable TOC */}
              <div
                ref={tocRef}
                className="flex-1 overflow-y-auto p-4"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                <nav className="space-y-1">
                  {tocSections.map((section) => (
                    <button
                      key={section.id}
                      ref={(el) => (tocItemRefs.current[section.id] = el)}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center w-full p-3 rounded-lg transition-all text-left ${
                        activeSection === section.id
                          ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700"
                      } ${section.level === 0 ? "font-semibold" : "ml-4"}`}
                    >
                      <section.icon
                        className={`w-4 h-4 mr-3 flex-shrink-0 ${
                          activeSection === section.id
                            ? "text-white"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-sm font-medium truncate">
                        {section.title}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full py-3 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="w-full mt-3 py-2.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Close Menu
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Dropdown - FIXED: Always shows when search has results */}
      {showDropdown && searchQuery.trim() && (
        <div className="search-dropdown-container">
          {createPortal(
            <AnimatePresence>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed z-[9999] flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden"
                style={{
                  left: "50%",
                  top: "120px",
                  transform: "translateX(-50%)",
                  width: "600px",
                  maxWidth: "90vw",
                  maxHeight: "450px",
                }}
              >
                {/* Dropdown header */}
                <div className="px-4 py-2 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <span>
                    {loading ? "Searching document..." : "Search Results"}
                  </span>
                  {!loading && searchResults.length > 0 && (
                    <span className="bg-[#2E3D99]/10 text-[#2E3D99] px-2 py-0.5 rounded-full">
                      {searchResults.length} found
                    </span>
                  )}
                </div>

                {/* Results list */}
                <div className="overflow-y-auto custom-scrollbar p-2">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
                      <div className="w-6 h-6 border-2 border-[#2E3D99]/20 border-t-[#2E3D99] rounded-full animate-spin" />
                      <span className="text-xs font-medium">
                        Searching terms...
                      </span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        No results found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try searching with different keywords
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {searchResults.map((item, index) => (
                        <motion.li
                          key={`${item.id}-${index}`}
                          custom={index}
                          variants={itemVariants}
                          onMouseDown={(e) => {
                            e.preventDefault(); // prevents input blur
                            handleSearchItemClick(item);
                          }}
                          className="group relative flex items-center justify-between p-3 rounded-xl cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border border-transparent hover:border-blue-100"
                        >
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-[#2E3D99] group-hover:scale-125 transition-transform" />
                              <span className="font-bold text-gray-800 text-sm group-hover:text-[#2E3D99] transition-colors">
                                {item.title}
                              </span>
                            </div>

                            <div className="pl-4">
                              <p className="text-xs text-gray-500 truncate max-w-[500px]">
                                {item.snippet}
                              </p>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <div className="p-1.5 rounded-lg bg-white shadow-sm border border-gray-100 text-[#2E3D99]">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="sticky top-24">
              {/* Desktop Navigation */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200">
                {/* TOC Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-[#2E3D99]" />
                      Table of Contents
                    </h3>
                    <button
                      onClick={() => setTocExpanded(!tocExpanded)}
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      {tocExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    16 sections • Click to navigate
                  </p>
                </div>

                {/* Scrollable TOC */}
                <AnimatePresence>
                  {tocExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        ref={tocRef}
                        className="p-4 overflow-y-auto"
                        style={{ maxHeight: "calc(100vh - 300px)" }}
                      >
                        <nav className="space-y-1">
                          {tocSections.map((section) => (
                            <button
                              key={section.id}
                              ref={(el) =>
                                (tocItemRefs.current[section.id] = el)
                              }
                              onClick={() => scrollToSection(section.id)}
                              className={`flex items-center w-full p-3 rounded-lg transition-all text-left group ${
                                activeSection === section.id
                                  ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-sm"
                                  : "hover:bg-gray-100 text-gray-700"
                              } ${
                                section.level === 0
                                  ? "font-semibold"
                                  : section.level === 1
                                  ? "ml-2"
                                  : "ml-6"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg mr-3 flex items-center justify-center flex-shrink-0 ${
                                  activeSection === section.id
                                    ? "bg-white/20"
                                    : "bg-gray-100 group-hover:bg-gray-200"
                                }`}
                              >
                                <section.icon
                                  className={`w-4 h-4 ${
                                    activeSection === section.id
                                      ? "text-white"
                                      : "text-gray-500"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {section.title}
                                </div>
                              </div>
                            </button>
                          ))}
                        </nav>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Quick Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex flex-col items-center justify-center p-3 bg-white border border-gray-300 rounded-lg hover:border-[#2E3D99] hover:shadow-sm transition-all group"
                    >
                      <Download className="w-5 h-5 text-[#2E3D99] mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium text-gray-700">
                        Download
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1"
          >
            {/* Document Header */}
            <div className="bg-gradient-to-r from-[#2E3D99]/5 via-[#1D97D7]/5 to-[#2E3D99]/5 rounded-2xl p-8 mb-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row items-start justify-between">
                <div className="lg:flex-1">
                  <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full mb-4 shadow-sm">
                    <FileText className="w-3 h-3 text-[#2E3D99]" />
                    <span className="text-xs font-medium text-gray-700">
                      Legal Document
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    OpsNav Portal -
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]">
                      Subscription Terms and Conditions
                    </span>
                  </h1>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                      <span className="text-sm text-gray-700">
                        GDPR Compliant
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        Australian Law
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                      <Lock className="w-3.5 h-3.5 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        Secure & Encrypted
                      </span>
                    </div>
                  </div>
                </div>
                <div className="hidden lg:block mt-6 lg:mt-0">
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                    <div className="text-sm text-gray-500 mb-1">
                      Document ID
                    </div>
                    <div className="font-mono font-bold text-gray-900 text-lg">
                      OpsNav-TC-Ver1
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Version 1.0
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-6">
              {/* Important Notice */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-6 rounded-r-xl mb-6">
                <div className="flex">
                  <AlertCircle className="w-6 h-6 text-amber-600 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">
                      Important Notice
                    </h3>
                    <p className="text-amber-800 text-sm leading-relaxed">
                      By accessing or using the OpsNav Portal, you agree to be
                      bound by these Terms and Conditions. Please read them
                      carefully. These terms contain important information about
                      your rights and obligations, including limitations and
                      exclusions of liability.
                    </p>
                    <button
                      onClick={() => scrollToSection("overview")}
                      className="mt-3 text-amber-700 hover:text-amber-800 font-medium text-sm flex items-center"
                    >
                      Read overview <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Render all sections */}
              {tocSections.map((section) => renderSection(section.id))}

              {/* Acceptance Section */}
              <div className="mt-8 p-8 bg-gradient-to-r from-[#2E3D99]/5 to-[#1D97D7]/5 rounded-2xl border border-[#2E3D99]/20">
                <div className="text-center mb-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Acceptance of Terms
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    By using the OpsNav Portal, you acknowledge that you have
                    read, understood, and agree to be bound by these Terms and
                    Conditions.
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Read Carefully
                    </h4>
                    <p className="text-sm text-gray-600">
                      Review all terms and conditions thoroughly
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Seek Clarification
                    </h4>
                    <p className="text-sm text-gray-600">
                      Contact us if you have any questions
                    </p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Legal Compliance
                    </h4>
                    <p className="text-sm text-gray-600">
                      Ensure compliance with applicable laws
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-8 bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                  <div className="lg:flex-1">
                    <h3 className="text-2xl font-bold mb-4 flex items-center">
                      <MessageSquare className="w-6 h-6 mr-3 text-[#1D97D7]" />
                      Questions or Concerns?
                    </h3>
                    <p className="text-gray-300 mb-6">
                      If you have any questions about these Terms, need
                      clarification on any point, or want to discuss your
                      subscription, our team is here to help.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Building className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-gray-400 text-sm">Company</div>
                          <div className="font-medium">
                            TechAliyan Pty Ltd t/a OpsNav
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <div>
                          <div className="text-gray-400 text-sm">Email</div>
                          <a
                            href="mailto:support@opsnav.com"
                            className="font-medium text-[#1D97D7] hover:underline"
                          >
                            support@opsnav.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-5 h-5 text-gray-400 mr-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <div>
                          <div className="text-gray-400 text-sm">Phone</div>
                          <a
                            href="tel:0435332279"
                            className="font-medium text-[#1D97D7] hover:underline"
                          >
                            0435 332 279
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.main>
        </div>
      </div>

      {/* Scroll to Top */}
      <AnimatePresence>
        {isScrolled && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-40"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold">OpsNav Legal</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Ensuring transparency and trust in every subscription.
              </p>
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cookie Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Security
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>
              Document ID: OpsNav-TC-Ver1 • Version 1.0 • ©{" "}
              {new Date().getFullYear()} OpsNav. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsOfService;
