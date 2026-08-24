import type { City, Industry, LandingPageData } from '@/types/landing-pages';
import { landingPagesData } from './landing-pages-data';

/**
 * Traducciones al ingles de las landings ciudad + industria.
 *
 * GENERADO por scripts/translate-landings.mjs. Para reescribir un texto a mano, editalo
 * aqui y anade la misma correccion a scripts/.landing-translations.json, que es la cache
 * que usa el script para no volver a traducir lo ya hecho.
 *
 * Mientras una combinacion no este aqui, /en/<ciudad>/<industria> canonicaliza a /es y
 * se cae del sitemap en ingles.
 */
export const landingPagesDataEn: Partial<Record<City, Partial<Record<Industry, LandingPageData>>>> =
{
  "guadalajara": {
    "software-para-inmobiliarias": {
      "seoTitle": "Real Estate Software in Guadalajara | Custom Development - imSoft",
      "seoDescription": "We build digital platforms for real estate firms in Guadalajara. Property management systems, web portals and mobile apps that drive your sales.",
      "h1": "Specialized Software for Real Estate Firms in Guadalajara",
      "heroSubtitle": "We transform real estate operations with modern websites, native mobile apps, real-time data analytics and specialized technology consulting, all designed to increase your sales and streamline how your company runs in the Guadalajara metro area.",
      "problems": {
        "title": "Is your real estate business facing these challenges?",
        "items": [
          "Manual property management scattered across Excel, email and WhatsApp",
          "No real-time visibility into available inventory",
          "Clients struggle to schedule showings or request information",
          "Outdated websites that don't reflect your current listings or generate quality leads",
          "Slow follow-up with prospects and clients, with no data analytics to improve conversion",
          "Inability to integrate with external real estate portals"
        ]
      },
      "solutions": {
        "title": "Technology solutions that transform your business",
        "items": [
          {
            "title": "Custom Real Estate Portal",
            "description": "A modern web platform with advanced search by area, price and features. Google Maps integration for locations in Guadalajara, Zapopan and Tlaquepaque."
          },
          {
            "title": "Custom Real Estate CRM",
            "description": "Manage properties, clients, appointment scheduling, automated follow-up, performance reports and executive dashboards."
          },
          {
            "title": "Mobile App for Agents",
            "description": "A native iOS/Android app so your agents can update listings, share information and close deals from anywhere."
          },
          {
            "title": "Virtual Tour System",
            "description": "Integration of 360° tours, HD video and digital property documentation so clients can view listings from home."
          }
        ]
      },
      "imSoftServices": {
        "title": "Enterprise technology for real estate firms",
        "description": "At imSoft we develop robust, scalable digital solutions that drive growth for real estate companies in Guadalajara. We offer modern websites, mobile apps, data analytics, online stores and specialized technology consulting.",
        "services": [
          {
            "title": "Custom Websites and Platforms",
            "description": "Modern websites and real estate portals with scalable architecture, SEO optimization, external API integration and a full admin panel.",
            "icon": "🌐"
          },
          {
            "title": "Native Mobile Apps",
            "description": "iOS and Android mobile apps with a smooth experience, push notifications, geolocation, and real-time syncing for agents and clients.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Executive dashboards with real-time data analytics, performance reports, conversion metrics, and business intelligence so you can make informed decisions.",
            "icon": "📊"
          },
          {
            "title": "Online Stores and E-commerce",
            "description": "E-commerce platforms to sell real estate services, premium memberships, advisory packages, and other products tied to your agency.",
            "icon": "🛒"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: audits of your current systems, solution architecture, data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Ready to modernize your real estate business?",
        "description": "Schedule a free technology consultation. We review your current operation using data analytics and design a complete solution that can include websites, mobile apps, online stores, and custom systems to drive your sales.",
        "buttonText": "Schedule a Free Consultation"
      }
    },
    "software-para-constructoras": {
      "seoTitle": "Software for Construction Firms in Guadalajara | imSoft",
      "seoDescription": "Digital platforms for construction firms in Guadalajara. Project management, jobsite control, specialized ERP, and mobile apps for construction.",
      "h1": "Management Systems for Construction Firms in Guadalajara",
      "heroSubtitle": "We digitize construction operations with corporate websites, mobile apps for the field, real-time data analytics, specialized ERP systems, and technology consulting that cut costs and boost productivity.",
      "problems": {
        "title": "Common challenges in the construction industry",
        "items": [
          "Manually tracking multiple concurrent jobsites with fragmented information",
          "Difficulty tracking materials, budgets, and progress in real time",
          "Poor communication between the office, supervisors, and field crews",
          "Late or incomplete progress reports for clients and investors, with no data analytics to support strategic decisions",
          "No traceability in purchasing, inventory, and material logistics",
          "Manual processes that lead to errors and costly delays"
        ]
      },
      "solutions": {
        "title": "Technology that streamlines your construction operation",
        "items": [
          {
            "title": "ERP for Construction",
            "description": "An all-in-one system that connects projects, finance, purchasing, inventory, HR, and jobsite control on a single centralized platform."
          },
          {
            "title": "Digital Jobsite Control",
            "description": "Electronic logbook, progress checklists, geotagged photo records, automated reports, and deviation alerts."
          },
          {
            "title": "Client Portal",
            "description": "A web platform where clients and investors review progress, photos, budget spend, and updated schedules."
          },
          {
            "title": "Mobile App for the Field",
            "description": "An app for supervisors and contractors: report progress, log issues, approve deliveries, and communicate instantly."
          }
        ]
      },
      "imSoftServices": {
        "title": "Software development for construction companies",
        "description": "We build enterprise solutions that connect the entire construction value chain, from planning to final handover. We offer corporate websites, mobile apps, data analytics, online stores for materials, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Portals",
            "description": "Modern websites and client portals with scalable architecture, SEO optimization, ERP integration, and real-time dashboards.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for the Field",
            "description": "Native iOS and Android mobile apps that work offline, with automatic sync, photo capture, geolocation, and digital signatures.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, executive dashboards, progress reports, productivity metrics, and business intelligence to optimize projects.",
            "icon": "📊"
          },
          {
            "title": "Online Stores for Materials",
            "description": "E-commerce platforms for selling construction materials, with inventory management, online ordering, and integrated electronic invoicing.",
            "icon": "🛒"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: systems audits, solution architecture, data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Modernize how you run your construction business",
        "description": "Let's talk about how our technology solutions - websites, mobile apps, data analytics, and consulting - can cut operating costs and improve control over your construction projects.",
        "buttonText": "Request a Custom Demo"
      }
    },
    "software-para-restaurantes": {
      "seoTitle": "Restaurant Software in Guadalajara | POS & Ordering - imSoft",
      "seoDescription": "Digital solutions for restaurants in Guadalajara. POS systems, ordering apps, kitchen management, and delivery integrations.",
      "h1": "Digital Platforms for Restaurants in Guadalajara",
      "heroSubtitle": "We help restaurants and restaurant groups grow with modern websites, mobile ordering apps, online stores, sales data analytics, and technology consulting that increase sales and operating efficiency.",
      "problems": {
        "title": "Challenges in the restaurant industry",
        "items": [
          "Outdated or third-party POS systems with high commissions",
          "No integration between point of sale, kitchen, and delivery",
          "Difficulty managing multiple locations from a single place",
          "Online orders scattered across several third-party platforms, with no online store of your own and no data analytics on customer behavior",
          "Manual inventory and waste tracking that leads to losses",
          "No loyalty programs or automated promotions"
        ]
      },
      "solutions": {
        "title": "Technology that drives your restaurant forward",
        "items": [
          {
            "title": "Custom POS System",
            "description": "A modern point of sale with digital order tickets, check splitting, tips, sales reports and staff shift management."
          },
          {
            "title": "Your Own Ordering App",
            "description": "A branded mobile app for delivery and in-store pickup orders. No third-party commissions, payments built in."
          },
          {
            "title": "Digital Kitchen Management",
            "description": "KDS (Kitchen Display System) screens that sync dine-in, delivery and app orders in real time for your kitchen team."
          },
          {
            "title": "Centralized Admin Panel",
            "description": "A dashboard with real-time sales, inventory control, best-selling dish analysis and multi-location management."
          }
        ]
      },
      "imSoftServices": {
        "title": "Software development for restaurants",
        "description": "We build complete digital ecosystems that connect every customer touchpoint and streamline your operation. We offer modern websites, mobile apps, online stores, data analytics and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Online Stores",
            "description": "Modern websites and online stores for delivery orders, with responsive design, SEO optimization and integration with POS systems and payment gateways.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Ordering Apps",
            "description": "Native iOS and Android mobile apps with your brand identity, push notifications, rewards programs, geolocation and built-in payment gateways.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, dashboards with sales metrics, best-selling dish analysis, customer behavior insights and executive reports.",
            "icon": "📊"
          },
          {
            "title": "POS and Management Systems",
            "description": "Responsive web platforms for tablets and terminals, with integration for thermal printers and card readers, inventory control and multi-location management.",
            "icon": "🍽️"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: audits of your current systems, digital transformation strategy, enterprise integrations and process optimization.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Take your restaurant to the next level",
        "description": "Let's talk about how our solutions - websites, mobile apps, online stores, data analytics and technology consulting - can reduce your reliance on third-party platforms and grow your direct sales with technology of your own.",
        "buttonText": "Schedule a Consultation"
      }
    },
    "software-para-clinicas": {
      "seoTitle": "Clinic Software in Guadalajara | Medical Systems - imSoft",
      "seoDescription": "Management systems for clinics and medical practices in Guadalajara. Electronic health records, scheduling, billing and telemedicine.",
      "h1": "Medical Software for Clinics in Guadalajara",
      "heroSubtitle": "We digitize clinics and medical practices with corporate websites, mobile apps for patients, medical data analytics, electronic health records and technology consulting that improve patient care.",
      "problems": {
        "title": "Challenges facing clinics and medical practices",
        "items": [
          "Paper records that are hard to look up and easy to lose",
          "Manual appointment scheduling with conflicts and late confirmations",
          "No traceability in treatments, tests and patient follow-up, with no data analytics to help optimize care",
          "Slow billing that delays the collection cycle with insurers",
          "No way to offer remote consultations or telemedicine",
          "Poor communication with patients about results and reminders"
        ]
      },
      "solutions": {
        "title": "Digital solutions for the healthcare sector",
        "items": [
          {
            "title": "Electronic Health Records",
            "description": "HIPAA-compliant system with medical history, prescriptions, lab tests, imaging and full patient traceability."
          },
          {
            "title": "Smart Scheduling System",
            "description": "Web and mobile platform to book appointments, with automatic SMS/email reminders, confirmation and rescheduling."
          },
          {
            "title": "Telemedicine Platform",
            "description": "Secure video consultations, virtual waiting room, e-prescribing and integrated online payments."
          },
          {
            "title": "Billing and Administration",
            "description": "CFDI 4.0 billing module, insurer integration, payment tracking, cash management and financial reports."
          }
        ]
      },
      "imSoftServices": {
        "title": "Technology built for healthcare",
        "description": "We develop medical solutions that meet healthcare security, privacy and regulatory standards. We offer corporate websites, mobile apps, medical data analytics and specialized technology consulting.",
        "services": [
          {
            "title": "Corporate Websites",
            "description": "Modern websites for clinics with secure architecture, SEO optimization, service information, online scheduling and regulatory compliance.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for Patients",
            "description": "Native iOS and Android mobile apps for booking appointments, viewing results, video visits, reminders, and direct communication with physicians.",
            "icon": "📱"
          },
          {
            "title": "Medical Data Analytics",
            "description": "Real-time data analytics, dashboards with care metrics, efficiency reports, treatment analysis, and business intelligence for clinics.",
            "icon": "📊"
          },
          {
            "title": "Custom Medical Systems",
            "description": "Web platforms with secure architecture, data encryption, automatic backups, electronic health records, and HIPAA compliance.",
            "icon": "⚕️"
          },
          {
            "title": "Technology Consulting",
            "description": "Technology consulting focused on healthcare: system audits, regulatory compliance, data migration, and digital transformation strategy.",
            "icon": "💡"
          },
          {
            "title": "Migration and Training",
            "description": "Conversion of paper records to digital, training for medical staff, and specialized technical support.",
            "icon": "🎓"
          }
        ]
      },
      "cta": {
        "title": "Digitize your clinic or practice",
        "description": "Schedule a meeting to see how our technology solutions - corporate websites, mobile apps, medical data analytics, and technology consulting - can improve patient care and your clinic's efficiency.",
        "buttonText": "Talk to a Specialist"
      }
    },
    "software-para-logistica": {
      "seoTitle": "Logistics Software in Guadalajara | TMS & Tracking - imSoft",
      "seoDescription": "Logistics management platforms in Guadalajara. TMS, GPS tracking, fleet management, warehousing, and distribution for companies.",
      "h1": "Logistics Management Systems in Guadalajara",
      "heroSubtitle": "We optimize logistics operations with corporate websites, mobile apps for drivers, real-time data analytics, TMS platforms, and technology consulting that cut costs and improve delivery times.",
      "problems": {
        "title": "Challenges in the logistics industry",
        "items": [
          "No real-time visibility into the location of vehicles and freight",
          "Unoptimized delivery routes that drive up fuel costs",
          "Manual warehouse management with errors in inventory and picking",
          "Poor communication between the warehouse, distribution, and end customers",
          "Difficulty scaling operations or adding new routes",
          "Delayed reports that prevent quick decisions, with no data analytics to optimize routes and operations"
        ]
      },
      "solutions": {
        "title": "Technology that transforms your logistics operation",
        "items": [
          {
            "title": "TMS - Transportation Management System",
            "description": "An all-in-one platform to plan routes, assign units, track shipments in real time and generate shipping documentation."
          },
          {
            "title": "GPS Tracking and Telematics",
            "description": "Integration with GPS devices for real-time monitoring, geofencing, route deviation alerts and driver behavior analysis."
          },
          {
            "title": "WMS - Warehouse Management",
            "description": "Real-time inventory control, optimized picking, barcode/RFID scanning, and automated inbound and outbound processes."
          },
          {
            "title": "Client Portal",
            "description": "A web platform where customers check shipment status, track deliveries on a live map and download documentation."
          }
        ]
      },
      "imSoftServices": {
        "title": "Technology solutions for logistics",
        "description": "We build digital ecosystems that connect warehouses, transportation, drivers and customers on a single centralized platform. We offer corporate websites, mobile apps, data analytics, online stores for services and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Portals",
            "description": "Modern websites and customer portals with scalable architecture, SEO optimization, real-time tracking, dashboards and document management.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for Drivers",
            "description": "Native iOS and Android apps for field drivers, with GPS tracking, signature capture, delivery photos and real-time syncing.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, executive dashboards, efficiency metrics, route optimization, cost analysis and business intelligence.",
            "icon": "📊"
          },
          {
            "title": "TMS/WMS Platforms",
            "description": "Robust web systems with scalable architecture, APIs for external integrations and executive dashboards with logistics KPIs.",
            "icon": "🚚"
          },
          {
            "title": "Mobile Apps for Drivers",
            "description": "Native iOS and Android apps for drivers and warehouse staff, with offline mode, proof-of-delivery capture, geolocation and digital signatures.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, advanced reporting, predictive route analysis, cost optimization, logistics data visualization and business intelligence.",
            "icon": "📊"
          },
          {
            "title": "Online Stores for Services",
            "description": "E-commerce platforms to sell logistics services, with online quoting, shipment tracking and integrated electronic invoicing.",
            "icon": "🛒"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: logistics systems audits, solution architecture, enterprise integrations and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Optimize your logistics operation",
        "description": "Let's talk about how our technology solutions - corporate websites, mobile apps, data analytics, online stores and consulting - can cut operating costs and improve delivery times with technology built for logistics.",
        "buttonText": "Request an Operations Analysis"
      }
    }
  },
  "cdmx": {
    "software-para-inmobiliarias": {
      "seoTitle": "Real Estate Software in Mexico City | Custom Development - imSoft",
      "seoDescription": "We build digital platforms for real estate firms in Mexico City. Property management systems, web portals and mobile apps.",
      "h1": "Specialized Software for Real Estate Firms in Mexico City",
      "heroSubtitle": "We transform property management in Mexico City with modern websites, native mobile apps, real-time data analytics, and specialized technology consulting that drive sales and streamline your company's operations.",
      "problems": {
        "title": "Is your real estate business facing these challenges?",
        "items": [
          "Manual property management across scattered neighborhoods and boroughs in Mexico City",
          "No real-time visibility into available inventory",
          "Websites that don't stand out in the capital's competitive real estate market or generate quality leads",
          "Difficulty managing rental and for-sale properties at the same time",
          "Poor follow-up with prospects in premium areas like Polanco, Santa Fe, and Roma",
          "Inability to integrate with external listing portals and appraisal systems"
        ]
      },
      "solutions": {
        "title": "Technology solutions for Mexico City's real estate market",
        "items": [
          {
            "title": "Advanced Real Estate Portal",
            "description": "Web platform with search by borough, neighborhood, and property type. Interactive maps showing public transit, amenities, and points of interest."
          },
          {
            "title": "Enterprise Real Estate CRM",
            "description": "A complete system to manage properties, clients, rental and sales contracts, legal documentation, and sales follow-up."
          },
          {
            "title": "Mobile App for Agents and Clients",
            "description": "iOS and Android app for agents in the field and clients searching for properties. Notifications for new listings and showing alerts."
          },
          {
            "title": "Automated Appraisals",
            "description": "Integration with real estate market databases for property appraisals based on location, features, and market trends."
          }
        ]
      },
      "imSoftServices": {
        "title": "Enterprise technology for real estate firms in Mexico City",
        "description": "We build robust digital solutions for real estate companies operating in Mexico City's competitive market. We offer modern websites, mobile apps, data analytics, online stores, and specialized technology consulting.",
        "services": [
          {
            "title": "Custom Websites and Platforms",
            "description": "Modern websites and real estate portals with scalable architecture, local SEO optimization, geolocation API integration, and a full admin panel.",
            "icon": "🌐"
          },
          {
            "title": "Native Mobile Apps",
            "description": "iOS and Android mobile apps with a premium experience, smart push notifications, augmented reality, geolocation, and real-time syncing.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, executive dashboards with conversion metrics, real estate market analysis, and business intelligence for better decisions.",
            "icon": "📊"
          },
          {
            "title": "Online Stores and E-commerce",
            "description": "E-commerce platforms to sell real estate services, premium memberships, advisory packages, and other products tied to your agency.",
            "icon": "🛒"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: system audits, solution architecture, legacy data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Ready to modernize your real estate firm in Mexico City?",
        "description": "Schedule a free technology consultation. We review your current operations using data analytics and design a complete solution that can include websites, mobile apps, online stores, and custom systems to drive sales in the capital.",
        "buttonText": "Schedule a Free Consultation"
      }
    },
    "software-para-constructoras": {
      "seoTitle": "Software for Construction Firms in Mexico City | ERP - imSoft",
      "seoDescription": "Digital platforms for construction firms in Mexico City. Project management, jobsite control, specialized ERP, and mobile apps.",
      "h1": "Management Systems for Construction Firms in Mexico City",
      "heroSubtitle": "We digitize construction operations in Mexico City with corporate websites, mobile apps for the field, real-time data analytics, specialized ERP systems, and technology consulting that cut costs.",
      "problems": {
        "title": "Challenges facing construction firms in the capital",
        "items": [
          "Managing multiple concurrent projects across different boroughs of Mexico City",
          "Complying with local zoning rules and construction permits",
          "Complex coordination between the office, supervisors, and field crews",
          "Progress reporting for developers and institutional investors",
          "Budget control on large-scale projects",
          "Integration with suppliers and specialized subcontractors"
        ]
      },
      "solutions": {
        "title": "Technology for enterprise construction firms",
        "items": [
          {
            "title": "ERP for Enterprise Construction",
            "description": "An all-in-one system that connects projects, corporate finance, purchasing, HR, job-site control, and regulatory compliance on a single platform."
          },
          {
            "title": "Digital Jobsite Control",
            "description": "Electronic job log with digital signature, phase-by-phase progress checklists, geotagged photo records, and executive reports."
          },
          {
            "title": "Corporate Portal for Investors",
            "description": "A web platform where investors and developers review financial progress, schedules, budget spend, and documentation."
          },
          {
            "title": "Enterprise Mobile App",
            "description": "An app for supervisors, contractors, and executives: digital approvals, real-time reporting, and instant communication."
          }
        ]
      },
      "imSoftServices": {
        "title": "Software development for construction firms in Mexico City",
        "description": "We build enterprise solutions that connect the entire construction value chain, from planning through delivery of complex projects. We offer corporate websites, mobile apps, data analytics, online stores for materials, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Portals",
            "description": "Modern websites and client portals with scalable architecture, SEO optimization, ERP integration, and real-time dashboards.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for the Field",
            "description": "Native iOS and Android mobile apps that work offline, with automatic syncing, photo capture, geolocation, and certified digital signatures.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, executive dashboards, progress reports, productivity metrics, business intelligence, and project optimization.",
            "icon": "📊"
          },
          {
            "title": "Specialized ERP Systems",
            "description": "Modular enterprise architecture, integration with corporate accounting systems, business intelligence, and regulatory reporting.",
            "icon": "🏗️"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: systems audits, solution architecture, data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Modernize how you run your construction firm in Mexico City",
        "description": "Let's talk about how our technology solutions - websites, mobile apps, data analytics, and consulting - can lower operating costs and improve control over your construction projects in the capital.",
        "buttonText": "Request a Custom Demo"
      }
    },
    "software-para-restaurantes": {
      "seoTitle": "Restaurant Software in Mexico City | POS & Apps - imSoft",
      "seoDescription": "Digital solutions for restaurants in Mexico City. POS systems, ordering apps, kitchen management, and multi-location control.",
      "h1": "Digital Platforms for Restaurants in Mexico City",
      "heroSubtitle": "We help restaurants and restaurant groups in Mexico City grow with modern websites, mobile ordering apps, online stores, sales data analytics, and technology consulting that increase sales and efficiency.",
      "problems": {
        "title": "Challenges facing restaurants in the capital",
        "items": [
          "High delivery platform commissions that eat into margins",
          "Complex management of multiple locations across different neighborhoods",
          "Fierce competition in premium areas like Condesa, Polanco, and Santa Fe",
          "No centralized control over inventory and waste",
          "Difficulty building customer loyalty without relying on third parties",
          "No sales analysis by location, time of day, or customer type"
        ]
      },
      "solutions": {
        "title": "Technology that drives restaurant groups forward",
        "items": [
          {
            "title": "Multi-Location POS System",
            "description": "A centralized point of sale to manage every location. Consolidated reporting, inventory control, and real-time syncing."
          },
          {
            "title": "Ordering App with Your Brand",
            "description": "Your own mobile app for delivery and pickup orders. No third-party commissions, built-in loyalty program, and direct payments."
          },
          {
            "title": "Kitchen and Delivery Management",
            "description": "KDS screens for the kitchen, driver assignment, GPS delivery tracking, and service time analysis."
          },
          {
            "title": "Restaurant Business Intelligence",
            "description": "Executive dashboards with sales by location, menu item analysis, customer behavior, and demand forecasting."
          }
        ]
      },
      "imSoftServices": {
        "title": "Restaurant software development in Mexico City",
        "description": "We build complete digital ecosystems for restaurant groups seeking technological independence and scalable growth. We offer modern websites, mobile apps, online stores, data analytics, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Online Stores",
            "description": "Modern websites and online stores for delivery orders, with responsive design, SEO optimization and integration with POS systems and payment gateways.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Ordering Apps",
            "description": "Native iOS and Android mobile apps with your brand, push notifications, points programs, geolocation, coupons, and Mexican payment gateways.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, dashboards with sales metrics, best-selling dish analysis, customer behavior insights and executive reports.",
            "icon": "📊"
          },
          {
            "title": "POS and Management Systems",
            "description": "Responsive web platforms for tablets and terminals, integration with specialized hardware, CFDI 4.0 electronic invoicing, and multi-location management.",
            "icon": "🍽️"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: audits of your current systems, digital transformation strategy, enterprise integrations and process optimization.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Take your restaurant to the next level in Mexico City",
        "description": "Let's talk about how our solutions - websites, mobile apps, online stores, data analytics and technology consulting - can reduce your reliance on third-party platforms and grow your direct sales with technology of your own.",
        "buttonText": "Schedule a Consultation"
      }
    },
    "software-para-clinicas": {
      "seoTitle": "Clinic Software in Mexico City | Medical Systems - imSoft",
      "seoDescription": "Practice management systems for clinics in Mexico City. Electronic health records, scheduling, billing, telemedicine and NOM-024 compliance.",
      "h1": "Medical Software for Clinics in Mexico City",
      "heroSubtitle": "We digitize clinics and medical practices in Mexico City with corporate websites, mobile apps for patients, medical data analytics, NOM-024 electronic health records and technology consulting that improve patient care.",
      "problems": {
        "title": "Challenges facing clinics in the capital",
        "items": [
          "NOM-024 compliance for electronic health records",
          "Managing multiple offices or locations across different areas",
          "Integration with labs, imaging centers and pharmacies",
          "Billing insurance carriers and major medical expense plans",
          "No platform to offer telemedicine professionally",
          "Reporting for medical quality certifications (ISO, CANACEM)"
        ]
      },
      "solutions": {
        "title": "Digital solutions for the healthcare sector in Mexico City",
        "items": [
          {
            "title": "NOM-024 Electronic Health Records",
            "description": "A system that complies with Mexico's NOM-024 standard for electronic health records. Medical history, prescriptions, lab work and full traceability."
          },
          {
            "title": "Enterprise Scheduling System",
            "description": "Web and mobile platform for multiple locations. Scheduling by physician, specialty and location. Automatic reminders and appointment confirmations."
          },
          {
            "title": "Professional Telemedicine Platform",
            "description": "Secure video visits with a virtual waiting room, integrated medical history, e-prescribing and online payments."
          },
          {
            "title": "Billing and Administration",
            "description": "CFDI 4.0 billing module, integration with insurance carriers (GNP, AXA, Metlife), cash control and financial reporting."
          }
        ]
      },
      "imSoftServices": {
        "title": "Specialized healthcare technology in Mexico City",
        "description": "We develop medical solutions that meet Mexican regulations and the healthcare sector's security and privacy standards. We offer corporate websites, mobile apps, medical data analytics and specialized technology consulting.",
        "services": [
          {
            "title": "Corporate Websites",
            "description": "Modern websites for clinics with secure architecture, SEO optimization, service information, online scheduling and regulatory compliance.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for Patients",
            "description": "Native iOS and Android mobile apps for booking appointments, viewing results, video visits, reminders, and direct communication with physicians.",
            "icon": "📱"
          },
          {
            "title": "Medical Data Analytics",
            "description": "Real-time data analytics, dashboards with care metrics, efficiency reports, treatment analysis, and business intelligence for clinics.",
            "icon": "📊"
          },
          {
            "title": "Certified Medical Systems",
            "description": "Web platforms with secure architecture, medical data encryption, automatic backups and NOM-024/HIPAA compliance.",
            "icon": "⚕️"
          },
          {
            "title": "Patient Apps",
            "description": "Mobile apps to book appointments, view test results, hold video visits and communicate securely with physicians.",
            "icon": "📱"
          },
          {
            "title": "Custom Medical Systems",
            "description": "Web platforms with secure architecture, medical data encryption, automatic backups, electronic health records, and NOM-024/HIPAA compliance.",
            "icon": "⚕️"
          },
          {
            "title": "Technology Consulting",
            "description": "Technology consulting focused on healthcare: system audits, regulatory compliance, data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Digitize your Mexico City clinic",
        "description": "Schedule a meeting to see how our technology solutions - corporate websites, mobile apps, medical data analytics, and technology consulting - can improve patient care and meet healthcare regulations.",
        "buttonText": "Talk to a Specialist"
      }
    },
    "software-para-logistica": {
      "seoTitle": "Logistics Software in Mexico City | TMS & Tracking - imSoft",
      "seoDescription": "Logistics management platforms in Mexico City. TMS, GPS tracking, fleet management, warehousing, and urban distribution.",
      "h1": "Logistics Management Systems in Mexico City",
      "heroSubtitle": "We optimize logistics operations in Mexico City with corporate websites, mobile apps for drivers, real-time data analytics, TMS platforms, and technology consulting that cut costs and improve delivery times.",
      "problems": {
        "title": "Logistics challenges in the capital",
        "items": [
          "Complex urban distribution with heavy traffic and driving restrictions",
          "Managing large fleets across multiple routes and delivery schedules",
          "No real-time visibility of goods in transit",
          "Meeting delivery windows in zones affected by Hoy No Circula",
          "Coordination between warehouses, distribution centers, and delivery points",
          "High operating costs from unoptimized routes and idle time"
        ]
      },
      "solutions": {
        "title": "Logistics technology for the capital",
        "items": [
          {
            "title": "TMS - Transportation Management System",
            "description": "An all-in-one platform to plan optimized routes, assign units based on driving restrictions, and handle GPS tracking and documentation."
          },
          {
            "title": "Urban Route Optimization",
            "description": "Smart algorithms that factor in real-time traffic, driving restrictions, delivery windows, and customer priorities."
          },
          {
            "title": "WMS - Warehouse Management",
            "description": "Multi-location inventory control, optimized picking, barcode/RFID, cross-docking, and full goods traceability."
          },
          {
            "title": "Portal for Business Customers",
            "description": "A web platform where customers check shipment status, track in real time, schedule deliveries, and download shipping documentation."
          }
        ]
      },
      "imSoftServices": {
        "title": "Technology solutions for logistics in Mexico City",
        "description": "We build digital ecosystems that connect warehouses, transportation, drivers, and customers for efficient logistics operations in the capital. We offer corporate websites, mobile apps, data analytics, online stores for services, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Portals",
            "description": "Modern websites and customer portals with scalable architecture, SEO optimization, real-time tracking, dashboards and document management.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for Drivers",
            "description": "Native iOS and Android mobile apps for drivers with GPS navigation, offline mode, photo evidence capture, geolocation, and digital delivery signatures.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, advanced reporting, predictive demand analysis, cost optimization, logistics data visualization, and business intelligence.",
            "icon": "📊"
          },
          {
            "title": "Enterprise TMS/WMS Platforms",
            "description": "Robust web systems with scalable architecture, RESTful APIs for integrations, and executive dashboards with real-time logistics KPIs.",
            "icon": "🚚"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: logistics systems audits, solution architecture, enterprise integrations and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Optimize your logistics operation in Mexico City",
        "description": "Let's talk about how our technology solutions - corporate websites, mobile apps, data analytics, online stores and consulting - can cut operating costs and improve delivery times in Mexico City with specialized technology.",
        "buttonText": "Request an Operations Analysis"
      }
    }
  },
  "monterrey": {
    "software-para-inmobiliarias": {
      "seoTitle": "Real Estate Software in Monterrey | Custom Development - imSoft",
      "seoDescription": "We build digital platforms for real estate firms in Monterrey. Property management systems, web portals and mobile apps for growing companies.",
      "h1": "Specialized Software for Real Estate Firms in Monterrey",
      "heroSubtitle": "We transform real estate management in Monterrey and its metro area with modern websites, native mobile apps, real-time data analytics and specialized technology consulting that drive sales and streamline business operations.",
      "problems": {
        "title": "Is your real estate business facing these challenges?",
        "items": [
          "Property management in San Pedro, Santa Catarina, Escobedo and other municipalities",
          "Websites that can't compete in the industrial and corporate real estate market or generate quality leads",
          "Lack of integration with regional developers and construction firms",
          "Difficulty managing industrial, corporate and residential properties",
          "Poor follow-up with corporate clients and investors",
          "No tools for appraising properties in high-growth areas"
        ]
      },
      "solutions": {
        "title": "Technology solutions for Monterrey's real estate market",
        "items": [
          {
            "title": "Corporate Real Estate Portal",
            "description": "Web platform with advanced search by municipality and property type (industrial, corporate, residential). Maps showing industrial and corporate zones."
          },
          {
            "title": "Enterprise Real Estate CRM",
            "description": "A complete system to manage properties, corporate clients, investors, contracts and legal sales documentation."
          },
          {
            "title": "Mobile App for Corporate Agents",
            "description": "iOS/Android app for real estate agents with complete property information, virtual tours and closing tools."
          },
          {
            "title": "Integration with Developers",
            "description": "APIs to connect with local developers' systems, import new properties, update inventory and sync sales."
          }
        ]
      },
      "imSoftServices": {
        "title": "Enterprise technology for real estate firms in Monterrey",
        "description": "We build robust digital solutions for real estate companies operating in the fast-moving Monterrey market and its metro area. We offer modern websites, mobile apps, data analytics, online stores and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Platforms",
            "description": "Modern websites and real estate portals with enterprise architecture, SEO optimization, third-party system integrations and an advanced admin panel.",
            "icon": "🌐"
          },
          {
            "title": "Enterprise Mobile Apps",
            "description": "iOS and Android mobile apps with a premium user experience, smart notifications, augmented reality, geolocation and real-time syncing.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, executive dashboards with conversion metrics, real estate market analysis, and business intelligence for better decisions.",
            "icon": "📊"
          },
          {
            "title": "Online Stores and E-commerce",
            "description": "E-commerce platforms to sell real estate services, premium memberships, advisory packages, and other products tied to your agency.",
            "icon": "🛒"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: system audits, solution architecture design, data migration and enterprise digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Ready to modernize your real estate business in Monterrey?",
        "description": "Book a free technology consultation. We review your current operation using data analytics and design a complete solution that may include websites, mobile apps, online stores and custom systems to drive your sales in the Monterrey market.",
        "buttonText": "Schedule a Free Consultation"
      }
    },
    "software-para-constructoras": {
      "seoTitle": "Construction Software in Monterrey | ERP Systems - imSoft",
      "seoDescription": "Digital platforms for construction firms in Monterrey. Industrial project management, jobsite control, specialized ERP and mobile apps.",
      "h1": "Management Systems for Construction Firms in Monterrey",
      "heroSubtitle": "We digitize operations for construction firms in Monterrey with corporate websites, mobile apps for the field, real-time data analytics, specialized ERP systems and technology consulting for industrial and corporate projects.",
      "problems": {
        "title": "Challenges construction firms face in the industrial sector",
        "items": [
          "Managing industrial, corporate and residential projects at the same time",
          "Cost control on large-scale projects for multinational companies",
          "Coordinating multiple specialized subcontractors",
          "Executive reporting for developers and corporate clients",
          "Meeting international quality standards",
          "Integration with procurement systems and specialized suppliers"
        ]
      },
      "solutions": {
        "title": "Technology for enterprise construction firms",
        "items": [
          {
            "title": "ERP for Industrial Construction",
            "description": "An all-in-one system connecting projects, finance, purchasing, HR, jobsite control and international standards compliance on one robust platform."
          },
          {
            "title": "Enterprise Jobsite Control",
            "description": "Electronic logbook with digital signature, quality control, progress checklists, high-resolution photo records and executive reports."
          },
          {
            "title": "Corporate Client Portal",
            "description": "A secure web platform where corporate clients review financial progress, schedules, executed budgets and technical documentation."
          },
          {
            "title": "Enterprise Mobile App",
            "description": "An app for supervisors, contractors and executives with digital approvals, real-time reporting and secure communication."
          }
        ]
      },
      "imSoftServices": {
        "title": "Software development for construction firms in Monterrey",
        "description": "We build enterprise solutions that connect the entire value chain of industrial and corporate construction. We offer corporate websites, mobile apps, data analytics, online stores for materials, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Portals",
            "description": "Modern websites and client portals with scalable architecture, SEO optimization, ERP integration, and real-time dashboards.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for the Field",
            "description": "Native iOS and Android mobile apps with offline mode, automatic syncing, professional media capture, geolocation, and certified digital signatures.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, executive dashboards, progress reports, productivity metrics, business intelligence, and project optimization.",
            "icon": "📊"
          },
          {
            "title": "Specialized ERP Systems",
            "description": "Modular enterprise architecture, integration with corporate ERPs (SAP, Oracle), business intelligence, and reporting for certifications.",
            "icon": "🏗️"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: systems audits, solution architecture, data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Modernize how you run your construction firm in Monterrey",
        "description": "Let's talk about how our technology solutions - websites, mobile apps, data analytics, and consulting - can cut operating costs and give you better control over your industrial construction projects.",
        "buttonText": "Request a Custom Demo"
      }
    },
    "software-para-restaurantes": {
      "seoTitle": "Restaurant Software in Monterrey | POS Systems - imSoft",
      "seoDescription": "Digital solutions for restaurants in Monterrey. POS systems, ordering apps, kitchen management, and multi-location support for chains.",
      "h1": "Digital Platforms for Restaurants in Monterrey",
      "heroSubtitle": "We help restaurants and restaurant groups in Monterrey grow with modern websites, mobile ordering apps, online stores, sales analytics, and technology consulting that drive sales and operational efficiency.",
      "problems": {
        "title": "Challenges facing restaurants in Monterrey",
        "items": [
          "High delivery platform commissions that eat into margins",
          "Managing multiple locations across San Pedro, Valle, Cumbres, and other areas",
          "Intense competition in the high-end dining segment",
          "No tools built for franchising or expansion models",
          "Difficulty building loyalty among corporate and high-income customers",
          "No visibility into sales figures or customer behavior"
        ]
      },
      "solutions": {
        "title": "Technology that drives restaurant groups forward",
        "items": [
          {
            "title": "Multi-Location POS System",
            "description": "Centralized point of sale to manage all your locations. Consolidated reporting, multi-location inventory control, and real-time syncing."
          },
          {
            "title": "Ordering App with Your Brand",
            "description": "Your own mobile app for delivery and pickup orders. No commissions, a premium loyalty program, and built-in payments."
          },
          {
            "title": "Kitchen and Delivery Management",
            "description": "KDS screens for the kitchen, driver assignment, GPS delivery tracking, and service time analysis by location."
          },
          {
            "title": "Restaurant Business Intelligence",
            "description": "Executive dashboards with sales by location, menu item analysis, corporate customer behavior, and demand forecasting."
          }
        ]
      },
      "imSoftServices": {
        "title": "Restaurant software development in Monterrey",
        "description": "We build complete digital ecosystems for restaurant groups seeking technological independence and scalable growth. We offer modern websites, mobile apps, online stores, data analytics, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Online Stores",
            "description": "Modern websites and online stores for delivery orders, with responsive design, SEO optimization and integration with POS systems and payment gateways.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Ordering Apps",
            "description": "Native iOS and Android mobile apps under your brand, with push notifications, a premium points program, geolocation, coupons, and Mexican payment gateways.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, dashboards with sales metrics, best-selling dish analysis, customer behavior insights and executive reports.",
            "icon": "📊"
          },
          {
            "title": "POS and Management Systems",
            "description": "Responsive web platforms for tablets and terminals, integration with specialized hardware, electronic invoicing, and franchise management.",
            "icon": "🍽️"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: audits of your current systems, digital transformation strategy, enterprise integrations and process optimization.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Take your Monterrey restaurant to the next level",
        "description": "Let's talk about how our solutions - websites, mobile apps, online stores, data analytics and technology consulting - can reduce your reliance on third-party platforms and grow your direct sales with technology of your own.",
        "buttonText": "Schedule a Consultation"
      }
    },
    "software-para-clinicas": {
      "seoTitle": "Clinic Software in Monterrey | Medical Systems - imSoft",
      "seoDescription": "Management systems for clinics in Monterrey. NOM-024 electronic health records, scheduling, billing, telemedicine and international standards.",
      "h1": "Medical Software for Clinics in Monterrey",
      "heroSubtitle": "We help clinics and hospitals in Monterrey go digital with corporate websites, patient mobile apps, medical data analytics, NOM-024 electronic health records and technology consulting that improve patient care.",
      "problems": {
        "title": "Challenges facing clinics in Monterrey",
        "items": [
          "Compliance with NOM-024 and international quality standards",
          "Managing multiple medical specialties and diagnostic services",
          "Integration with labs, imaging centers and pharmacies",
          "Billing international insurers and major medical expense plans",
          "No professional, enterprise-grade telemedicine platform",
          "Reporting for international medical certifications (JCI, ISO)"
        ]
      },
      "solutions": {
        "title": "Digital solutions for the healthcare sector in Monterrey",
        "items": [
          {
            "title": "Certified Electronic Health Records",
            "description": "A system that meets NOM-024 and international standards. Complete medical history, e-prescribing, lab studies and full traceability."
          },
          {
            "title": "Enterprise Scheduling System",
            "description": "Web and mobile platform for multiple locations and specialties. Scheduling by physician, exam room and location. Multichannel reminders."
          },
          {
            "title": "Professional Telemedicine Platform",
            "description": "Secure, high-quality video consultations, virtual waiting room, integrated medical history, e-prescribing and online payments."
          },
          {
            "title": "Corporate Billing and Administration",
            "description": "CFDI 4.0 billing module, integration with domestic and international insurers, financial controls and executive reporting."
          }
        ]
      },
      "imSoftServices": {
        "title": "Specialized healthcare technology in Monterrey",
        "description": "We build medical solutions that meet Mexican and international regulations, along with healthcare security and privacy standards. We offer corporate websites, mobile apps, medical data analytics and specialized technology consulting.",
        "services": [
          {
            "title": "Corporate Websites",
            "description": "Modern websites for clinics with secure architecture, SEO optimization, service information, online scheduling and regulatory compliance.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for Patients",
            "description": "Premium native iOS and Android mobile apps for booking appointments, viewing test results, high-quality video consultations and secure messaging.",
            "icon": "📱"
          },
          {
            "title": "Medical Data Analytics",
            "description": "Real-time data analytics, dashboards with care metrics, efficiency reports, treatment analysis, and business intelligence for clinics.",
            "icon": "📊"
          },
          {
            "title": "Certified Medical Systems",
            "description": "Web platforms with enterprise-grade secure architecture, medical data encryption, automatic backups, electronic health records and NOM-024/HIPAA compliance.",
            "icon": "⚕️"
          },
          {
            "title": "Technology Consulting",
            "description": "Technology consulting focused on healthcare: system audits, regulatory compliance, data migration, and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Take your Monterrey clinic digital",
        "description": "Schedule a meeting to see how our technology solutions - corporate websites, mobile apps, medical data analytics and technology consulting - can improve patient care and meet national and international healthcare regulations.",
        "buttonText": "Talk to a Specialist"
      }
    },
    "software-para-logistica": {
      "seoTitle": "Logistics Software in Monterrey | TMS Systems - imSoft",
      "seoDescription": "Logistics management platforms in Monterrey. TMS, GPS tracking, fleet management, warehousing and distribution for industrial companies.",
      "h1": "Logistics Management Systems in Monterrey",
      "heroSubtitle": "We streamline logistics operations in Monterrey with corporate websites, mobile apps for drivers, real-time data analytics, TMS platforms, and technology consulting for industrial companies.",
      "problems": {
        "title": "Logistics challenges in the industrial sector",
        "items": [
          "Fleet management for industrial and cross-border distribution",
          "Coordination with industrial parks and distribution centers",
          "No real-time visibility of high-value cargo",
          "Meeting security and tracking standards for corporate clients",
          "Integration with multinational clients' systems (EDI, APIs)",
          "High operating costs on regional distribution routes"
        ]
      },
      "solutions": {
        "title": "Logistics technology for industrial companies",
        "items": [
          {
            "title": "TMS - Transportation Management System",
            "description": "An all-in-one platform to plan routes, assign units, track by GPS in real time, document shipments, and analyze costs."
          },
          {
            "title": "GPS Tracking and Advanced Telematics",
            "description": "Integration with enterprise GPS devices, real-time monitoring, geofencing, security alerts, and driver behavior analytics."
          },
          {
            "title": "WMS - Warehouse Management",
            "description": "Multi-location inventory control, optimized picking, barcode/RFID, cross-docking, full traceability, and audit reports."
          },
          {
            "title": "Corporate Client Portal",
            "description": "A web platform where clients check shipment status, track in real time against SLAs, schedule deliveries, and download documentation."
          }
        ]
      },
      "imSoftServices": {
        "title": "Technology solutions for logistics in Monterrey",
        "description": "We build digital ecosystems that connect warehouses, transportation, drivers, and clients for efficient, industrial-grade logistics operations. We offer corporate websites, mobile apps, data analytics, online stores for services, and specialized technology consulting.",
        "services": [
          {
            "title": "Websites and Corporate Portals",
            "description": "Modern websites and customer portals with scalable architecture, SEO optimization, real-time tracking, dashboards and document management.",
            "icon": "🌐"
          },
          {
            "title": "Mobile Apps for Drivers",
            "description": "Native iOS and Android mobile apps for drivers with GPS navigation, offline mode, multimedia proof of delivery, geolocation, and certified digital signatures.",
            "icon": "📱"
          },
          {
            "title": "Data Analytics and Business Intelligence",
            "description": "Real-time data analytics, advanced reporting, predictive demand analysis, cost optimization, logistics data visualization, and business intelligence.",
            "icon": "📊"
          },
          {
            "title": "Enterprise TMS/WMS Platforms",
            "description": "Robust web systems with scalable architecture, RESTful APIs for EDI integrations, and executive dashboards with real-time logistics KPIs.",
            "icon": "🚚"
          },
          {
            "title": "Technology Consulting",
            "description": "Specialized technology consulting: logistics systems audits, solution architecture, enterprise integrations and digital transformation strategy.",
            "icon": "💡"
          }
        ]
      },
      "cta": {
        "title": "Optimize your logistics operation in Monterrey",
        "description": "Let's talk about how our technology solutions - corporate websites, mobile apps, data analytics, online stores, and consulting - can cut operating costs and improve delivery times in Monterrey with technology built for industrial companies.",
        "buttonText": "Request an Operations Analysis"
      }
    }
  }
};


export interface ResolvedLanding {
  data: LandingPageData;
  /** false cuando se pidio /en pero solo existe el contenido en español. */
  isTranslated: boolean;
  /** Idioma real del contenido que se va a renderizar. */
  contentLang: 'es' | 'en';
}

export function resolveLandingContent(
  lang: string,
  city: City,
  industry: Industry,
): ResolvedLanding | null {
  const es = landingPagesData[city]?.[industry];
  if (!es) return null;

  if (lang !== 'en') {
    return { data: es, isTranslated: true, contentLang: 'es' };
  }

  const en = landingPagesDataEn[city]?.[industry];
  return en
    ? { data: en, isTranslated: true, contentLang: 'en' }
    : { data: es, isTranslated: false, contentLang: 'es' };
}

export function hasEnglishLanding(city: City, industry: Industry): boolean {
  return Boolean(landingPagesDataEn[city]?.[industry]);
}
