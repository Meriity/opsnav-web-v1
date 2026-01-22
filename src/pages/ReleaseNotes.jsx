import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Filter,
  Search,
  Tag,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Bug,
  Wrench,
  Globe,
  Users,
  BarChart3,
  Cloud,
  Target,
  HomeIcon,
  X,
  Menu,
  ArrowUp,
  CheckCircle,
  AlertCircle,
  Info,
  BookOpen,
  Star,
  TrendingUp,
  RefreshCw,
  MessageSquare,
  Building,
  Award,
  Bell,
  Eye,
  EyeOff,
  FileText,
  Database,
  Layout,
  Code,
  Lock,
  Server,
  Smartphone,
  Mail,
  GitBranch,
  Cpu,
  ZapOff,
  UsersIcon,
  ShieldAlert,
  AlertTriangle,
  Trash2,
} from "lucide-react";

import { monthlyReleaseNotes } from "../data/releaseNotesData";

const ReleaseNotes = () => {
  const navigate = useNavigate();
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [expandedUpdates, setExpandedUpdates] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isFocused, setIsFocused] = useState(false);



  // monthlyReleaseNotes imported from ../data/releaseNotesData

  // Available years from release notes
  const availableYears = useMemo(() => {
    return Object.keys(monthlyReleaseNotes).sort((a, b) => b - a);
  }, []);

  // Available months for selected year
  const availableMonths = useMemo(() => {
    if (!selectedYear || !monthlyReleaseNotes[selectedYear]) return [];
    return Object.keys(monthlyReleaseNotes[selectedYear]).reverse();
  }, [selectedYear]);

  // All categories from updates
  const categories = [
    {
      id: "all",
      label: "All Updates",
      icon: BookOpen,
      color: "from-[#2E3D99] to-[#1D97D7]",
      count: 0,
    },
    {
      id: "feature",
      label: "New Features",
      icon: Sparkles,
      color: "from-purple-500 to-pink-500",
      count: 0,
    },
    {
      id: "performance",
      label: "Performance",
      icon: Zap,
      color: "from-amber-500 to-orange-500",
      count: 0,
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      color: "from-red-500 to-rose-500",
      count: 0,
    },
    {
      id: "bugfix",
      label: "Bug Fixes",
      icon: Bug,
      color: "from-green-500 to-emerald-500",
      count: 0,
    },
    {
      id: "infrastructure",
      label: "Infrastructure",
      icon: Server,
      color: "from-blue-500 to-cyan-500",
      count: 0,
    },
  ];

  // Month names in order
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Filter and sort data
  const filteredData = useMemo(() => {
    let allUpdates = [];

    // Get data for selected year or all years
    const yearsToShow =
      selectedYear === "all" ? availableYears : [selectedYear];

    yearsToShow.forEach((year) => {
      if (monthlyReleaseNotes[year]) {
        Object.entries(monthlyReleaseNotes[year]).forEach(
          ([month, updates]) => {
            updates.forEach((update) => {
              // Filter by category
              if (
                selectedCategory === "all" ||
                update.category === selectedCategory
              ) {
                // Filter by search query
                const matchesSearch =
                  searchQuery === "" ||
                  update.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  update.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  update.version
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  (update.module && 
                    update.module.toLowerCase().includes(searchQuery.toLowerCase())) ||
                  update.updates.some(
                    (u) =>
                      u.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      u.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  );

                if (matchesSearch) {
                  allUpdates.push({
                    ...update,
                    year,
                    month,
                    monthIndex: monthOrder.indexOf(month),
                  });
                }
              }
            });
          }
        );
      }
    });

    // Sort by date (newest first)
    return allUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedYear, selectedCategory, searchQuery]);

  // Toggle update expansion
  const toggleUpdate = (date) => {
    setExpandedUpdates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get type badge color
  const getTypeColor = (type) => {
    switch (type) {
      case "major":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "minor":
        return "bg-gradient-to-r from-amber-500 to-orange-500";
      case "patch":
        return "bg-gradient-to-r from-green-500 to-emerald-500";
      case "security":
        return "bg-gradient-to-r from-red-500 to-rose-500";
      default:
        return "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7]";
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.icon : BookOpen;
  };

  // Get update type icon
  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case "feature":
        return Sparkles;
      case "performance":
        return Zap;
      case "security":
        return Shield;
      case "fix":
      case "bugfix":
        return Bug;
      case "infrastructure":
        return Server;
      case "improvement":
        return TrendingUp;
      default:
        return Info;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get month abbreviation
  const getMonthAbbr = (month) => {
    return month.substring(0, 3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
      >
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate("/")}
                className="mr-2 md:mr-4 p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 rotate-180" />
              </button>
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="relative">
                  <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-[#2E3D99]" />
                </div>
                <div>
                  <h1 className="text-base md:text-lg font-semibold text-gray-900">
                    Release Notes
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Track every update and improvement
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search Box */}
              <div className="hidden sm:block relative transition-all duration-500 ease-out">
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl opacity-0 transition-opacity duration-300 blur-sm ${
                    isFocused ? "opacity-30" : "opacity-0"
                  }`}
                />

                <div
                  className={`relative flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl border transition-all duration-300 bg-white ${
                    isFocused
                      ? "border-transparent shadow-lg ring-1 ring-[#2E3D99]/10"
                      : "border-gray-200 shadow-sm hover:border-[#2E3D99]/30 hover:shadow-md"
                  }`}
                >
                  <Search
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-300 ${
                      isFocused ? "text-[#2E3D99]" : "text-gray-400"
                    }`}
                  />

                  <input
                    type="text"
                    placeholder="Search release notes..."
                    className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />

                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="p-0.5 md:p-1 rounded-full bg-gray-100 text-gray-500 hover:bg-[#FB4A50] hover:text-white transition-colors"
                    >
                      <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileNav(true)}
                className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Back to Home */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="px-2.5 py-1 md:px-3.5 md:py-1.5 text-[#2E3D99] border border-[#2E3D99] rounded-lg
                hover:text-white hover:border-[#FB4A50] hover:bg-[#FB4A50]
                font-medium transition-all duration-300 text-xs md:text-sm
                flex items-center gap-1 md:gap-2"
              >
                <HomeIcon className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Home</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {showMobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowMobileNav(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileNav(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search release notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2E3D99] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Mobile Filters */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Category Filters */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-[#2E3D99]" />
                      Category
                    </h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setShowMobileNav(false);
                          }}
                          className={`flex items-center w-full p-3 rounded-lg transition-all text-left ${
                            selectedCategory === category.id
                              ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <category.icon className="w-4 h-4 mr-3" />
                          <span className="text-sm font-medium">
                            {category.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year Filters */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#2E3D99]" />
                      Year
                    </h4>
                    <div className="space-y-2">
                      {availableYears.map((year) => (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYear(year);
                            setShowMobileNav(false);
                          }}
                          className={`flex items-center w-full p-3 rounded-lg transition-all text-left ${
                            selectedYear === year
                              ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-md"
                              : "hover:bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span className="text-sm font-medium">{year}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="w-full py-3 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Close Menu
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 py-6 md:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block lg:w-64 xl:w-72 2xl:w-80 flex-shrink-0"
          >
            <div className="sticky top-20 xl:top-24">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-gray-200">
                  <div className="flex items-center mb-2">
                    <Filter className="w-4 h-4 md:w-5 md:h-5 mr-2 text-[#2E3D99]" />
                    <h3 className="font-semibold text-gray-900 text-base md:text-lg">
                      Filters
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500">
                    Filter by category and year
                  </p>
                </div>

                {/* Category Filters */}
                <div className="p-4 md:p-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-[#2E3D99]" />
                    Category
                  </h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center w-full p-3 rounded-lg transition-all text-left group ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-sm"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 md:w-8 md:h-8 rounded-lg mr-2 md:mr-3 flex items-center justify-center flex-shrink-0 ${
                            selectedCategory === category.id
                              ? "bg-white/20"
                              : "bg-gray-100 group-hover:bg-gray-200"
                          }`}
                        >
                          <category.icon
                            className={`w-3 h-3 md:w-4 md:h-4 ${
                              selectedCategory === category.id
                                ? "text-white"
                                : "text-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs md:text-sm font-medium truncate">
                            {category.label}
                          </div>
                        </div>
                        {selectedCategory === category.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year Filters */}
                <div className="p-4 md:p-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#2E3D99]" />
                    Year
                  </h4>
                  <div className="space-y-2">
                    {availableYears.map((year) => (
                      <button
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`flex items-center w-full p-3 rounded-lg transition-all text-left ${
                          selectedYear === year
                            ? "bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white shadow-sm"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <span className="text-xs md:text-sm font-medium">
                          {year}
                        </span>
                        {selectedYear === year && (
                          <CheckCircle className="w-4 h-4 text-white ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline View */}
                <div className="p-4 md:p-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#2E3D99]" />
                    Timeline
                  </h4>
                  <div className="space-y-1">
                    {selectedYear && monthlyReleaseNotes[selectedYear] && (
                      <div className="space-y-1">
                        {availableMonths.map((month) => {
                          const updates =
                            monthlyReleaseNotes[selectedYear][month];
                          const count = updates ? updates.length : 0;
                          return (
                            <button
                              key={month}
                              onClick={() => {
                                setSelectedMonth(
                                  selectedMonth === month ? null : month
                                );
                                // Scroll to the month section
                                const element = document.getElementById(
                                  `month-${month}-${selectedYear}`
                                );
                                if (element) {
                                  element.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }}
                              className={`flex items-center justify-between w-full p-2 rounded-lg transition-all text-left ${
                                selectedMonth === month
                                  ? "bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 text-[#2E3D99] border border-[#2E3D99]/20"
                                  : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              <span className="text-xs md:text-sm font-medium">
                                {getMonthAbbr(month)}
                              </span>
                              {count > 0 && (
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    selectedMonth === month
                                      ? "bg-[#2E3D99] text-white"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {filteredData.length}
                    </div>
                    <div className="text-xs text-gray-600">
                      {filteredData.length === 1
                        ? "Update Found"
                        : "Updates Found"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.main
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex-1 min-w-0"
          >
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#2E3D99]/5 via-[#1D97D7]/5 to-[#2E3D99]/5 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 border border-gray-200">
              <div className="lg:flex items-start justify-between">
                <div className="lg:flex-1">
                  <div className="inline-flex items-center gap-2 bg-white px-2 py-1 md:px-3 md:py-1 rounded-full mb-3 md:mb-4 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#2E3D99]" />
                    <span className="text-xs font-medium text-gray-700">
                      Release Timeline
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight">
                    OpsNav Release Notes
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-lg md:text-2xl lg:text-3xl">
                      Monthly Updates & Improvements
                    </span>
                  </h1>
                  <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                    Track every feature, improvement, and fix we ship. We're
                    committed to making OpsNav better with regular updates based
                    on your feedback.
                  </p>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    <div className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-3 md:py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                      <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5 text-blue-600" />
                      <span className="text-xs md:text-sm text-gray-700">
                        {availableYears.length} Years
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-3 md:py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                      <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-green-600" />
                      <span className="text-xs md:text-sm text-gray-700">
                        Monthly Updates
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 px-2 py-1 md:px-3 md:py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                      <Star className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-600" />
                      <span className="text-xs md:text-sm text-gray-700">
                        User-Driven Features
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowMobileNav(true)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-[#2E3D99] mr-3" />
                  <span className="font-medium text-gray-900">
                    Filter Updates
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCategory !== "all" && (
                    <span className="px-2 py-1 text-xs font-medium bg-[#2E3D99]/10 text-[#2E3D99] rounded-full">
                      {categories.find((c) => c.id === selectedCategory)?.label}
                    </span>
                  )}
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {selectedYear}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>

            {/* Results Info */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">
                    Release Timeline
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    {filteredData.length === 0
                      ? "No updates match your filters"
                      : `Showing ${filteredData.length} update${
                          filteredData.length === 1 ? "" : "s"
                        }`}
                  </p>
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    Clear search
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Release Timeline */}
            <div className="space-y-8 md:space-y-12">
              {filteredData.length === 0 ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-gray-200">
                  <Search className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                    No matching updates
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Try adjusting your filters or search term to find what
                    you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedYear(availableYears[0]);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                // Group by year and month
                (() => {
                  const groupedByYear = {};
                  filteredData.forEach((update) => {
                    if (!groupedByYear[update.year]) {
                      groupedByYear[update.year] = {};
                    }
                    if (!groupedByYear[update.year][update.month]) {
                      groupedByYear[update.year][update.month] = [];
                    }
                    groupedByYear[update.year][update.month].push(update);
                  });

                  return Object.entries(groupedByYear)
                    .sort(([a], [b]) => b - a)
                    .map(([year, monthsData]) => (
                      <div key={year} className="relative">
                        {/* Year Header */}
                        <div className="sticky top-16 md:top-20 bg-white/95 backdrop-blur-sm z-30 py-4 mb-6 border-b border-gray-200">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] mr-3"></div>
                            <h3
                              id={`year-${year}`}
                              className="text-xl md:text-2xl font-bold text-gray-900"
                            >
                              {year}
                            </h3>
                            <div className="ml-4 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                              {Object.values(monthsData).flat().length} updates
                            </div>
                          </div>
                        </div>

                        {/* Months Timeline */}
                        <div className="relative">
                          {/* Vertical Timeline Line */}
                          <div className="absolute left-3 md:left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#2E3D99]/20 to-[#1D97D7]/20"></div>

                          {/* Months */}
                          {Object.entries(monthsData)
                            .sort(
                              ([a], [b]) =>
                                monthOrder.indexOf(b) - monthOrder.indexOf(a)
                            )
                            .map(([month, updates]) => (
                              <div
                                key={`${year}-${month}`}
                                id={`month-${month}-${year}`}
                                className="relative mb-8 md:mb-12"
                              >
                                {/* Month Header */}
                                <div className="flex items-center mb-6">
                                  <div className="absolute left-0 w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] flex items-center justify-center z-10">
                                    <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"></div>
                                  </div>
                                  <div className="ml-10 md:ml-12">
                                    <h4 className="text-lg md:text-xl font-bold text-gray-900">
                                      {month} {year}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                      {updates.length} update
                                      {updates.length === 1 ? "" : "s"}
                                    </p>
                                  </div>
                                </div>

                                {/* Updates for this month */}
                                <div className="ml-6 md:ml-8 space-y-4">
                                  {updates.map((release, index) => {
                                    const isExpanded =
                                      expandedUpdates[release.date];
                                    const CategoryIcon = getCategoryIcon(
                                      release.category
                                    );

                                    return (
                                      <motion.div
                                        key={`${release.date}-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${
                                          isExpanded
                                            ? "ring-1 ring-[#2E3D99]/20"
                                            : ""
                                        }`}
                                      >
                                        {/* Update Header */}
                                        <button
                                          onClick={() =>
                                            toggleUpdate(release.date)
                                          }
                                          className="w-full p-4 md:p-6 text-left hover:bg-gray-50/50 transition-colors"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              {/* Version and Date */}
                                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                                <div
                                                  className={`px-3 py-1 rounded-full ${getTypeColor(
                                                    release.type
                                                  )} text-white font-semibold text-sm inline-flex items-center gap-2`}
                                                >
                                                  <CategoryIcon className="w-3 h-3" />
                                                  {release.version}
                                                </div>
                                                <div className="flex items-center text-gray-600 text-sm">
                                                  <Calendar className="w-3 h-3 mr-1" />
                                                  {formatDate(release.date)}
                                                </div>
                                                <div className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                                  {release.category.toUpperCase()}
                                                </div>
                                              </div>

                                              {/* Title and Description */}
                                              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                                                {release.title}
                                              </h3>

                                              <p className="text-gray-600 mb-4 text-sm md:text-base">
                                                {release.description}
                                              </p>

                                              {/* Update Pills */}
                                              <div className="flex flex-wrap gap-2 mb-4">
                                                {release.updates.map(
                                                  (update, idx) => (
                                                    <div
                                                      key={idx}
                                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 text-xs font-medium"
                                                    >
                                                      <update.icon className="w-3 h-3" />
                                                      {update.type
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        update.type.slice(1)}
                                                    </div>
                                                  )
                                                )}
                                              </div>

                                              {/* Update Count */}
                                              <div className="text-sm text-gray-500">
                                                {release.updates.length} update
                                                {release.updates.length === 1
                                                  ? ""
                                                  : "s"}{" "}
                                                included
                                              </div>
                                            </div>

                                            <div className="ml-4 flex-shrink-0">
                                              {isExpanded ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                              ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                              )}
                                            </div>
                                          </div>
                                        </button>

                                        {/* Expanded Details */}
                                        <AnimatePresence>
                                          {isExpanded && (
                                            <motion.div
                                              initial={{
                                                height: 0,
                                                opacity: 0,
                                              }}
                                              animate={{
                                                height: "auto",
                                                opacity: 1,
                                              }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="overflow-hidden border-t border-gray-200"
                                            >
                                              <div className="p-4 md:p-6 bg-gray-50/50">
                                                <div className="space-y-4">
                                                  {release.updates.map(
                                                    (update, idx) => (
                                                      <div
                                                        key={idx}
                                                        className="bg-white rounded-lg p-4 border border-gray-200"
                                                      >
                                                        <div className="flex items-start mb-3">
                                                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#2E3D99]/10 to-[#1D97D7]/10 flex items-center justify-center mr-3 flex-shrink-0">
                                                            <update.icon className="w-4 h-4 text-[#2E3D99]" />
                                                          </div>
                                                          <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                              <h4 className="font-bold text-gray-900">
                                                                {update.title}
                                                              </h4>
                                                              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                                                                {update.type.toUpperCase()}
                                                              </span>
                                                            </div>
                                                            <p className="text-gray-700 mb-2 text-sm">
                                                              {
                                                                update.description
                                                              }
                                                            </p>
                                                            {update.details && (
                                                              <div className="bg-gray-50 rounded p-3 text-xs text-gray-600">
                                                                <strong className="font-semibold">
                                                                  Details:
                                                                </strong>{" "}
                                                                {update.details}
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>




                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ));
                })()
              )}
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 md:mt-12 p-6 md:p-8 lg:p-10 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] rounded-xl md:rounded-2xl text-white">
              <div className="text-center">
                <Bell className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">
                  Stay Updated
                </h3>
                <p className="text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
                  Subscribe to our newsletter to get notified about new
                  features, updates, and important announcements directly in
                  your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button className="px-6 py-3 bg-white text-[#2E3D99] font-semibold rounded-lg hover:bg-[#FB4A50] hover:text-white transition-colors">
                    Subscribe
                  </button>
                </div>
                <p className="text-blue-200 text-xs mt-4">
                  We respect your privacy. Unsubscribe at any time.
                </p>
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
            className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#2E3D99] to-[#1D97D7] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 z-40"
          >
            <ArrowUp className="w-4 h-4 md:w-5 md:h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-8 md:mt-12 bg-gray-900 text-white py-6 md:py-8">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-white" />
                </div>
                <span className="text-base md:text-lg font-semibold">
                  OpsNav Release Notes
                </span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">
                Monthly updates tracking every improvement.
              </p>
            </div>
            <div className="flex space-x-4 md:space-x-6">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/contact-support"
                className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
          <div className="mt-4 md:mt-6 text-center text-gray-500 text-xs">
            <p>
              © {new Date().getFullYear()} TechAliyan Pty Ltd t/a OpsNav. All
              rights reserved.
            </p>
            <p className="mt-1">Latest: v5.1.2 • Updated monthly</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReleaseNotes;
