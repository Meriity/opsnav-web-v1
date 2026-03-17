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
  ArrowUpDown,
  RefreshCw,
  Search,
  Edit,
  FolderOpen,
} from "lucide-react";

export const monthlyReleaseNotes = {
    2026: {
      March: [
        {
          date: "2026-03-17",
          version: "v7.2.0",
          type: "minor",
          category: "feature",
          title: "VOCAT/FAS Search & UI Refinement",
          description: "Introduced advanced search filters and major UI/field optimizations for the VOCAT/FAS module.",
          updates: [
            {
              type: "feature",
              title: "Advanced Search Filters",
              description: "Added dedicated filters for Matter Status and Legal Costs Application Number.",
              details: "Users can now filter VOCAT clients by their current matter status, legal costs application number, or both simultaneously via a consolidated search endpoint.",
              icon: Search,
            },
            {
              type: "improvement",
              title: "VOCAT Field Optimization",
              description: "Renamed and repositioned fields for better data clarity.",
              details: "Updated field titles and layouts across VOCAT stages to improve intuitive data entry and alignment with industry terminology.",
              icon: Sparkles,
            },
            {
              type: "feature",
              title: "New Data Fields",
              description: "Integrated Matter Status and Legal Costs Application Number fields.",
              details: "New fields added to the VOCAT/FAS module to track critical application milestones and reference numbers.",
              icon: Database,
            },
            {
              type: "bugfix",
              title: "Search Results Rendering",
              description: "Fixed data transformation for VOCAT search results.",
              details: "Resolved an issue where filtered search results were not displaying correctly in the main table due to mismatched data keys.",
              icon: Zap,
            },
            {
              type: "feature",
              title: "Client Dashboard Enhancements",
              description: "Integrated Matter Status and Legal Costs fields into the VOCAT Client Dashboard.",
              details: "The VOCAT/FAS Client Dashboard now displays 'Matter Status' and 'Legal Costs Application Number' to keep clients informed of their application progress.",
              icon: Sparkles,
            },
          ],
          module: "VOCAT/FAS",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-03-05",
          version: "v7.1.3",
          type: "patch",
          category: "bugfix",
          title: "Re-open Matters & Payload Refinement",
          description: "Added matter reopening for Wills and refined GCS upload payload alignment.",
          updates: [
            {
              type: "bugfix",
              title: "Wills Matter Reopening",
              description: "Added support for Super Admins to re-open closed/archived Wills matters.",
              details: "Implemented 'Open' option in Stage 3 for Wills with a safety confirmation modal and danger zone UI styling.",
              icon: FolderOpen,
            },
            {
              type: "bugfix",
              title: "GCS Upload Sync",
              description: "Refined GCS metadata synchronization payload.",
              details: "Updated the sync step to use the 'url' key instead of 'publicUrl', ensuring perfect alignment with the backend's expected structure.",
              icon: Server,
            },
          ],
        },
        {
          date: "2026-03-05",
          version: "v7.1.2",
          type: "patch",
          category: "bugfix",
          title: "Calendar & Upload Reliability Fixes",
          description: "Major fixes for Wills/Print Media calendars and performance improvements for direct-to-cloud file uploads.",
          updates: [
            {
              type: "bugfix",
              title: "Wills Calendar Display",
              description: "Fixed missing matter dates in the Wills module calendar.",
              details: "Resolved a data mapping issue where client matter dates were not being correctly extracted from the backend response. Matter dates are now clearly visible in a distinct Amber color.",
              icon: Calendar,
            },
            {
              type: "bugfix",
              title: "Print Media Order Dates",
              description: "Added support for orderDate in Print Media calendar.",
              details: "The calendar now displays both Order Dates (Emerald) and Delivery Dates (Amber) for Print Media, providing a complete view of the production schedule.",
              icon: Calendar,
            },
            {
              type: "improvement",
              title: "Hardened GCS Uploads",
              description: "Enhanced reliability of direct-to-GCS file uploads.",
              details: "Added fileSize validation support and fixed a critical 404 error during the metadata sync step. The system now handles various file response structures more robustly.",
              icon: Server,
            },
            {
              type: "ui_ux",
              title: "Calendar Visibility Boost",
              description: "Improved event visibility in monthly calendar cells.",
              details: "Increased row heights and adjusted event layouts to ensure at least two events are visible per day before collapsing. Standardized full-day durations for all critical dates.",
              icon: Sparkles,
            },
          ],
        },
        {
          date: "2026-03-04",
          version: "v7.1.1",
          type: "minor",
          category: "feature",
          title: "UI Optimization & Data Protection",
          description: "Introduced critical navigation guards and major UI refinements for stage indicators and matter link identification.",
          updates: [
            {
              type: "feature",
              title: "Unsaved Changes Protection",
              description: "Implemented a robust warning system for unsaved user allocations.",
              details: "Users are now prompted with a confirmation modal (and browser-level warning) when attempting to navigate away or close the tab while they have unsaved allocations in the View Clients table.",
              icon: Shield,
            },
            {
              type: "improvement",
              title: "Responsive Stage Layout",
              description: "Optimized stage indicator grid for smaller laptop screens.",
              details: "Stages now automatically arrange into a 3-column grid on smaller screens (below 1280px) to prevent column squeezing, while remaining as a single row on larger monitors.",
              icon: TrendingUp,
            },
            {
              type: "ui_ux",
              title: "Refined Stage Boxes",
              description: "Redesigned stage indicators as perfect squares with centered text.",
              details: "Introduced uniform square dimensions (16px and 24px) with flex centering and subtle hover zoom effects for a premium interactive feel.",
              icon: Sparkles,
            },
            {
              type: "ui_ux",
              title: "Matter Link Visibility",
              description: "Added ExternalLink icon for mobile/tablet matter links.",
              details: "Clickable matter numbers now feature a color-matched 'ExternalLink' icon on smaller screens, making interactivity obvious without cluttering the desktop view.",
              icon: Smartphone,
            },
            {
              type: "feature",
              title: "Bulk Allocation Saving",
              description: "Introduced a staging system for user allocations in Print Media.",
              details: "Allocations are now stored locally and marked with visual indicators (amber highlights) until the user explicitly clicks 'Save'. This prevents accidental API spam and allows for batch updates of production staff.",
              icon: Database,
            },
            {
              type: "improvement",
              title: "Print Media Stage 4 Consolidation",
              description: "Merged Image and PDF uploads into a unified capture field.",
              details: "Simplified the 'Proof of Completion' workflow by consolidating file types and fixing loader display issues during PDF uploads.",
              icon: Zap,
            }
          ],
          module: "View Clients, Print Media Stage 4",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-03-02",
          version: "v7.0.1",
          type: "patch",
          category: "bugfix",
          title: "Archived Clients Action Support",
          description: "Restored and enhanced the Edit functionality for archived clients across all modules and roles.",
          updates: [
            {
              type: "feature",
              title: "Archived Edit Support",
              description: "Enabled 'Edit' (Stage View) button for archived clients.",
              details: "Users with Admin, Superadmin, or authorized User roles can now navigate to the stages layout for archived projects across Conveyancing, Commercial, VOCAT, and Wills modules.",
              icon: Edit,
            },
            {
              type: "improvement",
              title: "Mobile Archive Actions",
              description: "Added Edit button to the mobile card view for archived clients.",
              details: "Ensured feature parity between desktop and mobile by adding the Edit action to the responsive card view in the Archived Clients section.",
              icon: Smartphone,
            },
            {
              type: "bugfix",
              title: "Client Type Visual Fix (Wills)",
              description: "Resolved case-sensitivity issue in Wills client type radio selection.",
              details: "Fixed a bug where the 'Single' or 'Mirror' radio buttons were not being visually selected in the matter details section due to a lowercase/uppercase data mismatch from the backend.",
              icon: Bug,
            }
          ],
          module: "Archived Clients, Core UI",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-03-02",
          version: "v7.0.0",
          type: "major",
          category: "feature",
          title: "Wills Module Overhaul & Field Unification",
          description: "Major updates to the Wills module, tailoring client types, unifying address fields, and resolving critical stage logic and table display issues.",
          updates: [
            {
              type: "feature",
              title: "Wills Client Type Overhaul",
              description: "Introduced specialized 'Single' and 'Mirror' radio buttons for Wills projects.",
              details: "Replaced the generic Seller/Buyer/General dropdown with module-specific radio options, ensuring a more intuitive and tailored experience for Wills creation and matter details.",
              icon: Sparkles,
            },
            {
              type: "improvement",
              title: "Address Field Unification",
              description: "Unified property address handling to 'address' for the Wills module.",
              details: "Standardized the address field across client creation, matter details, and API payloads specifically for Wills, ensuring consistency and reliability across the platform.",
              icon: Database,
            },
            {
              type: "bugfix",
              title: "Google Maps Integration Fix (Wills)",
              description: "Fixed Wills address disappearing after selection.",
              details: "Resolved a bug where selecting an address from Google Maps suggestions in the Wills module would cause the field to clear immediately due to mismatched state keys.",
              icon: Bug,
            },
            {
              type: "bugfix",
              title: "Wills Stage Colors Fix",
              description: "Resolved stage color display in the View Clients table.",
              details: "Fixed a data transformation issue where Wills stage colors were not being rendered correctly in the table due to object/array data structure mismatches.",
              icon: BarChart3,
            },
            {
              type: "bugfix",
              title: "Stage 3 Note Logic Fix",
              description: "Corrected 'Completed' state detection in Wills Stage 3.",
              details: "Updated system note generation to correctly recognize 'Completed' as a finished state, preventing false 'Not Received' warnings when tasks are already finalized.",
              icon: Bug,
            },
            {
              type: "improvement",
              title: "Archived Filter Enhancement",
              description: "Added Single/Mirror options to the Archived Clients filter.",
              details: "Users can now filter archived Wills projects by their specific client types, improving search efficiency.",
              icon: RefreshCw,
            },
            {
              type: "feature",
              title: "Interactive Search Navigation",
              description: "Added 'Enter to scroll', navigation arrows, and accurate match counting to Release Notes search.",
              details: "Users can now navigate through search matches using the Enter key or the new Up/Down arrows in the search bar. The UI now accurately counts all instances (even inside collapsed sections), automatically expands matching updates, and centers the active highlight on screen.",
              icon: Search,
            },
            {
              type: "bugfix",
              title: "Universal Date Formatting",
              description: "Unified date formatting across all modules, including Wills.",
              details: "Fixed an issue where Wills dates were displayed in raw ISO format. All dates now consistently follow the DD-MM-YYYY format across active and archived views.",
              icon: Calendar,
            }
          ],
          module: "Wills, Release Notes",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-03-02",
          version: "v6.6.6",
          type: "patch",
          category: "bugfix",
          title: "Matter URL Redirection & Wills Address Fix",
          description: "Streamlined matter navigation and resolved address synchronization issues in the Wills module.",
          updates: [
            {
              type: "bugfix",
              title: "Matter Number Redirection",
              description: "Integrated Matter URL redirection directly into the reference number.",
              details: "Removed the separate external link icon. Matter numbers / Project numbers now act as direct clickable links to external URLs, simplifying the table interface across all modules.",
              icon: Bug,
            },
            {
              type: "bugfix",
              title: "Wills Address Autofill",
              description: "Fixed Google Maps integration in the Wills module.",
              details: "Resolved a bug where address suggestions, state, and postcode fields were not being populated automatically when creating a new client in the Wills module.",
              icon: Bug,
            }
          ],
          module: "Wills, Commercial, Conveyancing, VOCAT",
          severity: "Medium",
          status: "Released"
        }
      ],
      February: [
        {
          date: "2026-02-27",
          version: "v6.6.5",
          type: "patch",
          category: "feature",
          title: "Matter URL Integration & Payload Hardening",
          description: "Enabled Matter URL tracking across Conveyancing, Commercial, and Wills modules, including direct redirection from client tables and robust payload synchronization.",
          updates: [
            {
              type: "feature",
              title: "Matter URL Field",
              description: "Added dedicated 'Matter URL' input to Create Client and Matter Details sections for streamlined access to external resources.",
              details: "Admins can now store and manage external links for matters across Conveyancing, Commercial, and Wills modules. The field is available in both the creation modal and the matter details layout (desktop and mobile).",
              icon: Sparkles,
            },
            {
              type: "feature",
              title: "One-Click Redirection",
              description: "Integrated an external link icon in the action column for rapid access.",
              details: "A new redirect icon appears for matters with an associated URL, allowing users to open external documents or sites directly from the client list.",
              icon: Zap,
            },
            {
              type: "bugfix",
              title: "Payload Synchronization",
              description: "Resolved issues where matter URLs were not being persisted correctly.",
              details: "Hardened the API payload logic in StagesLayout and CreateClientModal to ensure matter URLs are consistently synced across all active modules during creation and updates.",
              icon: Bug,
            }
          ],
          module: "Conveyancing, Commercial, Wills, VOCAT",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-26",
          version: "v6.6.4",
          type: "patch",
          category: "bugfix",
          title: "VOCAT Client Portal Commentary Fix",
          description: "Fixed commentary display in the VOCAT client portal where system notes and client comments were shown on the same line.",
          updates: [
            {
              type: "bugfix",
              title: "Commentary Display Separation",
              description: "Split system note and client comment into separate, clearly labeled sections.",
              details: "The VOCAT client portal previously displayed both the system note and client comment together on a single line under a generic 'Notes' label. Commentary is now split by the hyphen separator into two distinct UI cards — 'System Note' card and 'Client Comment' card — for improved readability and clarity.",
              icon: Bug,
            }
          ],
          module: "VOCAT, Client Portal",
          severity: "Low",
          status: "Released"
        },
        {
          date: "2026-02-25",
          version: "v6.6.3",
          type: "patch",
          category: "bugfix",
          title: "Critical Payload Fix & API Hardening",
          description: "Resolved 403 Forbidden errors for non-superadmin users by hardening the API layer and implementing triple-layer state sanitization.",
          updates: [
            {
              type: "bugfix",
              title: "Stage 6 403 Forbidden Error",
              description: "Fixed persistent 403 error when saving Stage 6 as Admin/User.",
              details: "Identified and removed a forced status injection in the API client layer and implemented multi-layer scrubbing to ensure sensitive matter states are never sent by unauthorized roles.",
              icon: Shield,
            },
            {
              type: "bugfix",
              title: "API Layer Sanitization",
              description: "Removed automated 'open' status injection in the client API.",
              details: "Ensured the API communication layer respects UI-provided payloads without forcing unauthorized privilege escalations.",
              icon: Server,
            }
          ],
          module: "Commercial, Conveyancing, Vocat",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-02-25",
          version: "v6.6.2",
          type: "patch",
          category: "bugfix",
          title: "Client Portal Personalization",
          description: "Enhanced client dashboard with personalized greetings.",
          updates: [
            {
              type: "bugfix",
              title: "First Name Greeting",
              description: "Resolved issue where the full client name format was displayed in the dashboard greeting.",
              details: "Implemented robust first name extraction to handle various formats like 'LastName, FirstName' or names with titles, providing a more personalized 'Hello [FirstName]' experience.",
              icon: Sparkles,
            }
          ],
          module: "Client Portal",
          severity: "Low",
          status: "Released"
        },
        {
          date: "2026-02-24",
          version: "v6.6.1",
          type: "patch",
          category: "bugfix",
          title: "VOCAT Module Bug Fixes",
          description: "Critical bug fixes for VOCAT stage organization and client portal data display.",
          updates: [
            {
              type: "bugfix",
              title: "Client Portal Commentary Fix",
              description: "Resolved issue where VOCAT stage commentary was missing in the client portal.",
              details: "Updated the client dashboard mapping to correctly read the API's commentary field, ensuring admin notes are visible to clients.",
              icon: Bug,
            },
            {
              type: "bugfix",
              title: "Stage 2 Layout Categorization",
              description: "Reorganized VOCAT Stage 2 fields into logical categories with headers.",
              details: "Fields are now grouped under subtitles like Counselling, Loss of Earnings, and Medical Expenses for better clarity.",
              icon: Sparkles,
            }
          ],
          module: "Vocat",
          severity: "Low",
          status: "Released"
        },
        {
          date: "2026-02-24",
          version: "v6.6.0",
          type: "minor",
          category: "feature",
          title: "Reopen Archived Matters & UI Polishing",
          description: "Superadmins can now reopen archived matters for Conveyancing, Commercial, and VOCAT. Also includes UI layout optimizations.",
          updates: [
            {
              type: "feature",
              title: "Restore Archived Matters",
              description: "Added 'Edit' capability to the Archived Clients table for Superadmins.",
              details: "Authorized users can navigate to the closing stage of a matter and select 'Open' to restore it to an active status.",
              icon: RefreshCw,
            },
            {
              type: "ui_ux",
              title: "Header Layout Optimization",
              description: "Reduced excessive padding and margins in the Archived Clients action bar.",
              details: "Tightened the spacing for better visibility on tablet and laptop screens by optimizing paddings and margins.",
              icon: Sparkles,
            },
            {
              type: "bugfix",
              title: "VOCAT Stage 4 Navigation Fix",
              description: "Fixed the 'Next' button in VOCAT Stage 4 navigating to incorrect stages.",
              details: "The Next button now correctly routes to the Cost page instead of rendering Conveyancing Stage 5 and 6.",
              icon: Bug,
            },
            {
              type: "ui_ux",
              title: "Post Code Field Repositioning",
              description: "Moved the Post Code field to appear alongside the State field in Matter Details.",
              details: "State and Post Code now share the same row for a cleaner, more logical layout across all modules.",
              icon: ArrowUpDown,
            }
          ],
          module: "Commercial, Conveyancing, Vocat",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-24",
          version: "v6.5.0",
          type: "minor",
          category: "feature",
          title: "Send Reminder Feature for Matters",
          description: "Admins and Superadmins can now send email reminders directly to matter holders for pending tasks.",
          updates: [
            {
              type: "feature",
              title: "Send Reminder Button",
              description: "Added a new 'Send Reminder' button with an icon in the Matter Details header.",
              details: "Allows authorized users to trigger an email that lists all incomplete tasks across all stages of a particular matter.",
              icon: Zap,
            },
            {
              type: "improvement",
              title: "Payload Enhancements",
              description: "Included client email in the reminder payload.",
              details: "The backend now receives the matter holder's `clientEmail` along with an aggregated `taskList` array to properly address and format the notification.",
              icon: Info,
            }
          ],
          module: "Commercial, Conveyancing, Wills, Vocat",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-21",
          version: "v6.4.0",
          type: "minor",
          category: "feature",
          title: "Comprehensive VOCAT Stages Overhaul",
          description: "Major expansion of data capture fields and conditional workflows across all VOCAT stages.",
          updates: [
            {
              type: "feature",
              title: "Stage 1 Intake Expansion",
              description: "Added comprehensive client details and new financial assistance categories.",
              details: "Client authority, Evidence of the incident, Evidence of the injury, Reported to Police. If yes → date of report + Police details provided + details of the report (police station, officer, evidence of report). If no → Statutory Declaration for Nil Report. Intake Form/instructions given, Voi, Any other assistance from another scheme. If yes → details provided.",
              icon: Sparkles,
            },
            {
              type: "feature",
              title: "Stage 2 Types of financial assistance",
              description: "Added new fields for specific financial evidence.",
              details: "Counselling: Details of counsellor received, Counsellor Report requested. Loss of Earnings: Evidence of earnings, Letter from Doctor. Medical expenses: Evidence of expenses, Additional evidence. Safety-related expenses: Evidence of expenses, Additional evidence. Loss or damage to clothing: Statutory Declaration, Additional evidence. Recovery expenses: Letter of Support, Evidence of expenses, Additional evidence.",
              icon: Zap,
            },
            {
              type: "feature",
              title: "Stage 3 Interim approval",
              description: "Added new fields for interim application tracking.",
              details: "Application submitted, Application triaged, Additional information requested, Notice of Decision (Interim). If yes → Bank details provided, Authorised future expenses submitted.",
              icon: Database,
            },
            {
              type: "feature",
              title: "Stage 4 Final Decision",
              description: "Added new fields to track end-of-process decisions and transfers.",
              details: "Notice of Final Decision, Letter to Client, Bank details provided, Application transferred to client, Variation (if required). If yes → File transferred back to VK.",
              icon: Database,
            }
          ],
          module: "VOCAT",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-19",
          version: "v6.3.2",
          type: "patch",
          category: "ui_ux",
          title: "Mobile Layout & Responsiveness",
          description: "Refined mobile header alignment, dynamic labels, and address display.",
          updates: [
            {
              type: "feature",
              title: "Mobile Reordering",
              description: "Swappable order ranking for mobile & tablet.",
              details: "Introduced a specialized card view for mobile/tablet that allows users to swap order priorities using a simple dropdown selection.",
              icon: ArrowUpDown,
            },
            {
              type: "improvement",
              title: "Mobile Header Alignment",
              description: "Optimized header layout on mobile devices.",
              details: "Aligned the 'Show entries' dropdown and 'Three dots' menu on the same row, removing duplicate controls for a cleaner interface.",
              icon: Smartphone,
            },
            {
              type: "improvement",
              title: "Dynamic Mobile Labels",
              description: "Context-aware toggle labels for mobile view.",
              details: "The mobile view toggle now dynamically displays 'Order Details', 'Project Details', or 'Matter Details' based on the active module.",
              icon: Sparkles,
            },
            {
              type: "fix",
              title: "Address Text Wrapping",
              description: "Improved address readability on small screens.",
              details: "Fixed address truncation in mobile card view by enabling text wrapping, ensuring full addresses are visible.",
              icon: Info,
            }
          ],
          module: "Print Media, Commercial, Admin",
          severity: "Low",
          status: "Released"
        },
        {
          date: "2026-02-18",
          version: "v6.3.1",
          type: "minor",
          category: "ui_ux",
          title: "Client Portal Redesign & Responsiveness",
          description: "Complete visual overhaul of the Client Portal with enhanced responsiveness for all screen sizes.",
          updates: [
            {
              type: "feature",
              title: "Client Portal Redesign",
              description: "Modern, glassmorphic UI for all client dashboards.",
              details: "Introduced a vibrant new look with glassmorphism effects, refined typography, and consistent branding across the IDG and Standard Client Dashboards.",
              icon: Sparkles,
            },
            {
              type: "improvement",
              title: "Main Pages Responsiveness",
              description: "Optimized layouts for small laptops and tablets.",
              details: "Fixed layout breaking points between 1024px and 1280px. The sidebar and main grid now adapt seamlessly to small laptop screens, eliminating visual clutter.",
              icon: Smartphone,
            },
            {
              type: "fix",
              title: "Sidebar Interaction",
              description: "Resolved sidebar closing and icon issues.",
              details: "Fixed the sidebar behavior to ensure it closes correctly on outside clicks and prevents the 'double icon' glitch on specific resolutions.",
              icon: Bug,
            },
            {
              type: "improvement",
              title: "Role & Notification Polish",
              description: "Cleaned up UI tooltips and notifications.",
              details: "Fixed '[object Object]' tooltips on User Management role pills and removed redundant success toasts in Print Media for a cleaner experience.",
              icon: Zap,
            }
          ],
          module: "Client Portal, Dashboard, Admin",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-16",
          version: "v6.3.0",
          type: "minor",
          category: "feature",
          title: "Reporting Enhancements & Role-Based Access",
          description: "Introduced PDF previewing for reports and enhanced security via role-based UI restrictions.",
          updates: [
            {
              type: "feature",
              title: "Task Allocation PDF Preview",
              description: "Added a 'Preview' option for Task Allocation Reports.",
              details: "Users can now view a high-fidelity PDF preview in-browser before downloading, with automatic priority sorting based on task rank.",
              icon: Sparkles,
            },
            {
              type: "improvement",
              title: "Role-Based UI Restrictions",
              description: "Restricted administrative filters and report selections for non-admin users.",
              details: "Normal users are now automatically locked to their own data in dashboards and reports, ensuring better data privacy and a cleaner interface.",
              icon: Shield,
            },
            {
              type: "improvement",
              title: "Priority Sorting",
              description: "Unified rank-based sorting across UI and Reports.",
              details: "Ensured that the 'rankOrder' defined by admins consistently determines the priority of tasks in both the dashboard views and generated PDF reports.",
              icon: ArrowUpDown,
            }
          ],
          module: "Print Media, Admin",
          severity: "Medium",
          status: "Released"
        },

        {
          date: "2026-02-13",
          version: "v6.2.0",
          type: "minor",
          category: "feature",
          title: "Module Enhancements & Admin Privileges",
          description: "Expanded administrative control across modules and refined VOCAT/Commercial workflows.",
          updates: [
            {
              type: "feature",
              title: "VOCAT Staging Options",
              description: "Added 'N/R' (Not Received) status to stages 1, 2, 3, and 4.",
              details: "Users can now mark stages as Not Received when documentation or responses are pending, with corresponding backend payload support.",
              icon: Sparkles,
            },
            {
              type: "fix",
              title: "Commercial Project Creation",
              description: "Fixed field mapping in the Create Project form.",
              details: "Resolved issue where Property Address and other critical fields were incorrectly mapped or omitted during project initialization.",
              icon: Bug,
            },
            {
              type: "improvement",
              title: "Administrative Privileges",
              description: "Unified admin and superadmin permissions across staged layouts.",
              details: "Ensured both Admin and Super Admin roles have consistent access to editing, reordering, and stage management across all project modules.",
              icon: Shield,
            },
             {
              type: "fix",
              title: "UI Polish",
              description: "Fixed visibility of the Matter Number Badge.",
              details: "Ensured the Matter Number remains clearly visible and properly styled within the Staged Layout header.",
              icon: Bug,
            },
            {
              type: "feature",
              title: "Print Media Reordering",
              description: "Implemented drag-and-drop reordering for View Orders.",
              details: "Admins can now reorder print media orders prioritizing production queues, with full persistence between sessions.",
              icon: Zap,
            }
          ],
          module: "VOCAT, Commercial, Admin",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-12",
          version: "v6.1.2",
          type: "patch",
          category: "bug_fix",
          title: "VOCAT Client Dashboard Fixes",
          description: "Resolved issues with VOCAT Dashboard displaying incorrect stages and missing matter details.",
          updates: [
            {
              type: "fix",
              title: "VOCAT Stage Display",
              description: "Fixed VOCAT clients showing Conveyancing stages.",
              details: "Implemented correct mapping for VOCAT-specific stages (Initialisation, Assessment, etc.) instead of standard Conveyancing workflow.",
              icon: Bug,
            },
             {
              type: "fix",
              title: "VOCAT Matter Overview",
              description: "Added missing details to Matter Overview sidebar.",
              details: "Sidebar now correctly displays Postcode, FAS Number, and Incident Date for VOCAT clients.",
              icon: Info,
            }
          ],
          module: "VOCAT, Dashboard",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-12",
          version: "v6.1.1",
          type: "patch",
          category: "bug_fix",
          title: "Admin & Super Admin Edit Matter Fix",
          description: "Resolved critical permission issues preventing Admins and Super Admins from editing matters.",
          updates: [
            {
              type: "fix",
              title: "Edit Matter Permissions",
              description: "Fixed bug where Admin/Super Admin couldn't key in changes.",
              details: "Addressed an issue where the edit matter functionality was restricted or malfunctioning for Admin and Super Admin roles, ensuring full control over matter details.",
              icon: Shield,
            }
          ],
          module: "Admin, User Management",
          severity: "High",
          status: "Released"
        },
        {
          date: "2026-02-12",
          version: "v6.1.0",
          type: "minor",
          category: "feature",
          title: "Dashboard Modernization & Module Enhancements",
          description: "Major visual updates to dashboards, plus significant enhancements to VOCAT, Print Media, and Admin features.",
          updates: [
            {
              type: "feature",
              title: "Dashboard Modernization",
              description: "Redesigned headers and logo integration for a seamless look.",
              details: "Modernized typography, integrated OpsNav logo, and optimized layout in both IDG and Standard dashboards.",
              icon: Sparkles,
            },
            {
              type: "improvement",
              title: "VOCAT Layout & Search",
              description: "Optimized Client Details layout and improved search capabilities.",
              details: "Grouped reference numbers, added dedicated table columns, enabled search by Ref/FAS numbers with match reason badges.",
              icon: TrendingUp,
            },
            {
              type: "improvement",
              title: "Print Media Order Management",
              description: "Enhanced order editing and search functionality.",
              details: "Added autocomplete dropdown for client selection and 'Match Reason' logic for smarter searching.",
              icon: BarChart3,
            },
            {
              type: "improvement",
              title: "Admin Tools",
              description: "Backend prep for Excel upload and safer filtering.",
              details: "Implemented 'Safe Extraction' for allocated user filtering and prepared backend for Excel uploads.",
              icon: Shield,
            }
          ],
          module: "Dashboard, VOCAT, Print Media, Admin",
          severity: "Medium",
          status: "Released"
        },
        {
          date: "2026-02-06",
          version: "v6.0.2",
          type: "patch",
          category: "bug_fix",
          title: "VOCAT Post Code & Signage and Print Client Dashboard Enhancements",
          description: "Added Post Code field to VOCAT client creation and improved Matter Details layout.",
          updates: [
            {
              type: "feature",
              title: "Create Client Post Code",
              description: "Added Post Code field with auto-fill capabilities.",
              details: "VOCAT Create Client modal now includes a Post Code field that auto-fills from the Google Maps address selection.",
              icon: Sparkles,
            },
            {
              type: "improvement",
              title: "Matter Details Layout",
              description: "Optimized Matter Details layout for better readability.",
              details: "Post Code is now visible in Matter Details and positioned side-by-side with Data Entry By (1:2 ratio).",
              icon: TrendingUp,
            },
            {
              type: "improvement",
              title: "Print Media Dashboard",
              description: "Enhanced UI responsiveness and visual distinctiveness.",
              details: "Improved tablet responsiveness and added distinct status colors to timeline steps for better clarity.",
              icon: BarChart3,
            }
          ],
          module: "VOCAT, Print Media",
          severity: "Medium",
          status: "Released"
        }
      ],
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
          category: "infrastructure",
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
