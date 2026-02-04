import {
  Bug,
  Shield,
  Cpu,
  Trash2,
  Database,
  Sparkles,
  Zap,
  Server,
  TrendingUp,
  Info,
  BookOpen,
  Calendar,
  Smartphone,
  BarChart3,
} from "lucide-react";

export const monthlyReleaseNotes = {
    2026: {
      January: [
        {
          date: "2026-01-29",
          version: "v6.0.1",
          type: "patch",
          category: "bug_fix",
          title: "Critical Fixes",
          description: "Addressed logout filter persistence and mobile menu issues.",
          updates: [
            {
              type: "fix",
              title: "Logout Filter Persistence",
              description: "Fixed date filters persisting after logout.",
              details: "Ensured that all date range filters are properly cleared from local storage upon user logout to prevent data persistence across sessions.",
              icon: Bug,
            },
            {
              type: "fix",
              title: "Print Media Mobile Menu",
              description: "Corrected mobile action menu options for Print Media.",
              details: "Fixed the 3-dot menu on mobile/tablet to show correct 'Print Media' actions instead of default options.",
              icon: Smartphone,
            },
          ],
        },
        {
          date: "2026-01-29",
          version: "v6.0.0",
          type: "major",
          category: "feature",
          title: "VOCAT/FAS Module Launch",
          description: "Released the complete VOCAT/FAS module with specialized staging, costing, and client management.",
          updates: [
            {
              type: "feature",
              title: "Complete VOCAT/FAS Implementation",
              description: "Launched dedicated VOCAT/FAS module with 4-stage workflow.",
              details: "Implemented end-to-end management for VOCAT/FAS clients including Stages 1-4, tailored specifically for criminal incident victims.",
              icon: Sparkles,
            },
            {
              type: "feature",
              title: "Specialized Costing",
              description: "Custom costing interface including VOI and specialized fee structures.",
              details: "Added specific financial fields like VOI (Verification of Identity) and custom fee categories unique to the VOCAT/FAS process.",
              icon: Database,
            },
            {
              type: "improvement",
              title: "Archived Clients View",
              description: "Enhanced filtering and date formatting for VOCAT archives.",
              details: "Updated the Archived Clients table to display matter dates correctly and support VOCAT-specific filtering.",
              icon: Database,
            },
            {
              type: "improvement",
              title: "UI/UX Refinements",
              description: "Optimized layout for Client Type and Incident Date.",
              details: "Implemented a 1.5:1 responsive layout ratio for critical client information fields to improve readability and data entry speed.",
              icon: TrendingUp,
            }
          ],
          module: "VOCAT",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-01-27",
          version: "v5.2.1",
          type: "patch",
          category: "bugfix",
          title: "Print Media & Dashboard Fixes",
          description: "Fixed unnecessary date fields in Print Media Create Order and corrected dashboard order count.",
          updates: [
            {
              type: "fix",
              title: "Print Media Create Order",
              description: "Removed incorrect Matter Date and Settlement Date fields.",
              details: "Fixed an issue where Conveyancing/Commercial specific date fields were appearing in the Print Media Create Order modal.",
              icon: Bug,
            },
            {
              type: "fix",
              title: "Dashboard Order Count",
              description: "Corrected the order count displayed on the dashboard.",
              details: "Resolved a backend calculation issue that caused the top box order count on the dashboard to display incorrect values.",
              icon: BarChart3,
            }
          ],
          module: "Multiple Modules",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-01-22",
          version: "v5.2.0",
          type: "feature",
          category: "feature",
          title: "Release Notes Page",
          description: "Introduced a dedicated page to track application updates and improvements.",
          updates: [
            {
              type: "feature",
              title: "Release Notes Page",
              description: "New Release Notes page with filtering and search capabilities.",
              details: "Users can now browse all application updates, filter by category, and search for specific changes.",
              icon: BookOpen,
            },
            {
              type: "improvement",
              title: "Centralized Version Management",
              description: "Implemented centralized version control across the application.",
              details: "Streamlined version updates by referencing a single configuration source, ensuring consistency everywhere.",
              icon: Server,
            }
          ],
          module: "OpsNav",
          severity: "Low",
          status: "Released"
        },
        {
          date: "2026-01-22",
          version: "v5.1.3",
          type: "patch",
          category: "bugfix",
          title: "Mobile Experience Improvements",
          description: "Optimized the calendar view and dashboard layout for mobile devices.",
          updates: [
            {
              type: "fix",
              title: "Hybrid Calendar View",
              description: "Implemented a hybrid calendar view for mobile and tablet screens.",
              details: "Mobile devices now show colored dots, and tablets show identifier bars in the calendar grid for better usability.",
              icon: Calendar,
            },
            {
              type: "fix",
              title: "Small Screen Layout",
              description: "Fixed layout issues on ultra-small screens (320px).",
              details: "Adjusted stats cards stacking and chart axis rotation to prevent overlap on small devices.",
              icon: Smartphone,
            }
          ],
          module: "Dashboard",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-01-21",
          version: "v5.1.2",
          type: "patch",
          category: "bugfix",
          title: "Signage & Print Image Upload Fix",
          description: "Fixed image removal problem in IDG when uploading large images.",
          updates: [
            {
              type: "fix",
              title: "Large Image Handling",
              description: "Fixed Image Removing Problem in IDG - When uploading larger size of images the image will be removed from stage 4 IDG.",
              details: "Resolved memory management issue that caused large image files to be incorrectly removed during the upload process.",
              icon: Database,
            }
          ],
          module: "Signage and Print",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-01-20",
          version: "v5.1.1",
          type: "patch",
          category: "bugfix",
          title: "Signage & Print Order Details Fix",
          description: "Fixed order date and order type display issues in Signage & Print.",
          updates: [
            {
              type: "fix",
              title: "Order Data Display",
              description: "Fixed Order details - Order date and Order type not showing updated data.",
              details: "Resolved data synchronization issue that prevented updated order information from displaying correctly in the UI.",
              icon: Database,
            }
          ],
          module: "Signage and Print",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-01-19",
          version: "v5.1.0",
          type: "feature",
          category: "feature",
          title: "Order Deletion",
          description: "Added delete option view orders in Signage and Print.",
          updates: [
            {
              type: "feature",
              title: "Delete Orders",
              description: "Delete option for view orders in Signage and Print.",
              details: "Users can now permanently delete orders from the View Orders table in the Signage and Print module.",
              icon: Trash2,
            }
          ],
          module: "Signage and Print",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-01-13",
          version: "v5.0.3",
          type: "patch",
          category: "bugfix",
          title: "Conveyancing Client Creation Fix",
          description: "Fixed client creation issue in Conveyancing module due to Wills & Estates conflict.",
          updates: [
            {
              type: "fix",
              title: "Client Creation Conflict",
              description: "Fixed Create client not working issue in Conveyancing because of Wills & Estates conflict.",
              details: "Resolved module dependency conflict between Conveyancing and Wills & Estates that prevented new client creation.",
              icon: Bug,
            }
          ],
          module: "Conveyancing",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-01-12",
          version: "v5.0.2",
          type: "patch",
          category: "bugfix",
          title: "Signage & Print Dropdown Fix",
          description: "Fixed dropdown functionality issues in Signage & Print module.",
          updates: [
            {
              type: "fix",
              title: "Dropdown Functionality",
              description: "Fixed dropdowns are not working in Signage & Print.",
              details: "Resolved JavaScript compatibility issue affecting dropdown menu functionality in Signage & Print forms.",
              icon: Bug,
            }
          ],
          module: "Signage & Print",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-01-10",
          version: "v5.0.1",
          type: "patch",
          category: "bugfix",
          title: "Signage & Print Fixes",
          description: "Fixed critical issues in Signage & Print module affecting cost button and super admin visibility.",
          updates: [
            {
              type: "fix",
              title: "Cost Button Visibility",
              description: "Fixed cost button not showing up in Signage & Print.",
              details: "Resolved UI rendering issue that prevented cost calculation button from displaying in Signage & Print interface.",
              icon: Bug,
            },
            {
              type: "fix",
              title: "Super Admin Access",
              description: "Fixed super admin not showing up in Signage & Print.",
              details: "Corrected permission mapping issue that restricted super admin access to Signage & Print module.",
              icon: Shield,
            },
            {
              type: "fix",
              title: "Production Cache Issue",
              description: "Fixed cache problem happening in production which caused data misinterpretation.",
              details: "Resolved caching mechanism bug that led to incorrect data display and processing in production environment.",
              icon: Cpu,
            }
          ],
          module: "Signage & Print, OpsNav",
          severity: "High",
          status: "Released"
        }
      ],
    },
  };
