// "use client";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import SectionHeader from "@/components/shared/SectionHeader";
// import {
//   fadeUp,
//   fadeIn,
//   staggerContainer,
//   heroBadge,
//   heroLine,
//   heroCTA,
//   heroStats,
//   scaleIn,
//   slideInLeft,
//   slideInRight,
// } from "@/lib/motion-variants";
// import {
//   Target,
//   CalendarDays,
//   BarChart3,
//   Users,
//   CreditCard,
//   ChefHat,
//   Palette,
//   TrendingUp,
//   MessageSquare,
//   Shield,
//   Zap,
//   Globe,
//   Star,
//   ArrowRight,
//   Check,
//   Sparkles,
// } from "lucide-react";

// // Section 1: Hero
// function Hero() {
//   return (
//     <section
//       style={{
//         position: "relative",
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         overflow: "hidden",
//         background: "var(--gradient-hero)",
//         padding: "120px 32px 80px",
//       }}
//     >
//       <div
//         className="texture-grain"
//         style={{ position: "absolute", inset: 0 }}
//       />
//       <div
//         style={{
//           position: "relative",
//           zIndex: 2,
//           textAlign: "center",
//           maxWidth: 900,
//         }}
//       >
//         <motion.div
//           variants={heroBadge}
//           initial="hidden"
//           animate="visible"
//           className="badge badge-accent"
//           style={{ marginBottom: 24 }}
//         >
//           <Sparkles size={12} /> Powered by Coding Gurus
//         </motion.div>

//         <motion.h1
//           variants={heroLine(0)}
//           initial="hidden"
//           animate="visible"
//           style={{
//             fontFamily: "var(--font-display)",
//             fontSize: "clamp(2.5rem, 7vw, 5rem)",
//             fontWeight: 700,
//             color: "#fff",
//             lineHeight: 1.1,
//             marginBottom: 16,
//             letterSpacing: "-1px",
//           }}
//         >
//           The Complete{" "}
//           <span
//             style={{
//               background: "linear-gradient(135deg, #E8B84B, #F5D07A)",
//               WebkitBackgroundClip: "text",
//               WebkitTextFillColor: "transparent",
//             }}
//           >
//             Banquet Management
//           </span>{" "}
//           Platform
//         </motion.h1>

//         <motion.p
//           variants={heroLine(1)}
//           initial="hidden"
//           animate="visible"
//           style={{
//             fontSize: 18,
//             color: "rgba(255,255,255,0.75)",
//             maxWidth: 600,
//             margin: "0 auto",
//             lineHeight: 1.7,
//             marginBottom: 32,
//           }}
//         >
//           Manage leads, bookings, events, billing, kitchen, and vendors — all
//           from one powerful dashboard. Built for multi-franchise banquet
//           businesses.
//         </motion.p>

//         <motion.div
//           variants={heroCTA}
//           initial="hidden"
//           animate="visible"
//           style={{
//             display: "flex",
//             gap: 16,
//             justifyContent: "center",
//             flexWrap: "wrap",
//           }}
//         >
//           <Link
//             href="/login"
//             className="btn btn-primary btn-lg"
//             style={{ textDecoration: "none" }}
//           >
//             Start Free Trial <ArrowRight size={16} />
//           </Link>
//           <Link
//             href="/features"
//             className="btn btn-ghost btn-lg"
//             style={{ textDecoration: "none" }}
//           >
//             Explore Features
//           </Link>
//         </motion.div>

//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           animate="visible"
//           style={{
//             display: "flex",
//             gap: 48,
//             justifyContent: "center",
//             marginTop: 56,
//             flexWrap: "wrap",
//           }}
//         >
//           {[
//             { val: "500+", label: "Events Managed" },
//             { val: "₹18Cr+", label: "Revenue Tracked" },
//             { val: "98%", label: "Client Satisfaction" },
//             { val: "3", label: "Franchises Live" },
//           ].map((s, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={heroStats(i)}
//               style={{ textAlign: "center" }}
//             >
//               <div
//                 style={{
//                   fontFamily: "var(--font-mono)",
//                   fontSize: 28,
//                   fontWeight: 700,
//                   color: "#E8B84B",
//                 }}
//               >
//                 {s.val}
//               </div>
//               <div
//                 style={{
//                   fontSize: 13,
//                   color: "rgba(255,255,255,0.6)",
//                   marginTop: 4,
//                 }}
//               >
//                 {s.label}
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//       <div className="scroll-indicator">
//         <div className="scroll-mouse">
//           <div className="scroll-dot" />
//         </div>
//       </div>
//     </section>
//   );
// }

// // Section 2: Trusted By Strip
// function TrustedBy() {
//   const brands = [
//     "Prasad Food Divine",
//     "Royal Banquets",
//     "Grand Celebrations",
//     "Hyderabad Caterers",
//     "Star Events",
//     "Wedding Bells",
//     "Prasad Food Divine",
//     "Royal Banquets",
//   ];
//   return (
//     <section
//       style={{
//         padding: "40px 0",
//         background: "var(--color-bg-alt)",
//         overflow: "hidden",
//       }}
//     >
//       <p
//         style={{
//           textAlign: "center",
//           fontSize: 12,
//           fontWeight: 700,
//           letterSpacing: 3,
//           textTransform: "uppercase",
//           color: "var(--color-text-muted)",
//           marginBottom: 20,
//         }}
//       >
//         Trusted by leading banquet businesses
//       </p>
//       <div
//         style={{
//           display: "flex",
//           gap: 48,
//           animation: "ticker 20s linear infinite",
//           whiteSpace: "nowrap",
//         }}
//       >
//         {brands.concat(brands).map((b, i) => (
//           <span
//             key={i}
//             style={{
//               fontSize: 18,
//               fontWeight: 600,
//               color: "var(--color-text-muted)",
//               opacity: 0.5,
//               fontFamily: "var(--font-display)",
//             }}
//           >
//             {b}
//           </span>
//         ))}
//       </div>
//     </section>
//   );
// }

// // Section 3: Problem/Solution
// function ProblemSolution() {
//   return (
//     <section className="section" style={{ background: "var(--color-bg)" }}>
//       <div className="container">
//         <div
//           style={{
//             display: "grid",
//             gridTemplateColumns: "1fr 1fr",
//             gap: 64,
//             alignItems: "center",
//           }}
//         >
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={slideInLeft}
//           >
//             <SectionHeader
//               eyebrow="The Problem"
//               title="Managing banquets shouldn't be chaos."
//               align="left"
//               subtitle="Scattered spreadsheets, missed follow-ups, double-bookings, and lost revenue. Sound familiar?"
//             />
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 12,
//                 marginTop: 24,
//               }}
//             >
//               {[
//                 "Leads falling through cracks",
//                 "Double-booked halls",
//                 "No real-time inventory tracking",
//                 "Manual invoice generation",
//                 "Zero analytics on performance",
//               ].map((item, i) => (
//                 <div
//                   key={i}
//                   style={{
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 12,
//                     fontSize: 15,
//                     color: "var(--color-text-body)",
//                   }}
//                 >
//                   <span style={{ color: "var(--color-danger)", fontSize: 16 }}>
//                     ✕
//                   </span>{" "}
//                   {item}
//                 </div>
//               ))}
//             </div>
//           </motion.div>
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={slideInRight}
//           >
//             <div
//               style={{
//                 background: "var(--color-bg-card)",
//                 border: "1px solid var(--color-border)",
//                 borderRadius: 24,
//                 padding: 32,
//                 boxShadow: "var(--shadow-hover)",
//               }}
//             >
//               <div className="badge badge-green" style={{ marginBottom: 16 }}>
//                 The Solution
//               </div>
//               <h3
//                 style={{
//                   fontFamily: "var(--font-display)",
//                   fontSize: 24,
//                   fontWeight: 700,
//                   color: "var(--color-text-h)",
//                   marginBottom: 12,
//                 }}
//               >
//                 One platform, every operation.
//               </h3>
//               <p
//                 style={{
//                   fontSize: 15,
//                   color: "var(--color-text-muted)",
//                   lineHeight: 1.7,
//                   marginBottom: 20,
//                 }}
//               >
//                 BanquetEase unifies your entire business — from first enquiry to
//                 final payment — in a single, beautiful dashboard.
//               </p>
//               <div
//                 style={{ display: "flex", flexDirection: "column", gap: 10 }}
//               >
//                 {[
//                   "AI-powered lead scoring",
//                   "Real-time hall availability",
//                   "Automated inventory alerts",
//                   "One-click PDF invoices",
//                   "Live performance analytics",
//                 ].map((item, i) => (
//                   <div
//                     key={i}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 12,
//                       fontSize: 15,
//                       color: "var(--color-text-body)",
//                     }}
//                   >
//                     <Check
//                       size={16}
//                       style={{ color: "var(--color-success)" }}
//                     />{" "}
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// }

// // Section 4: Features Grid
// const features = [
//   {
//     icon: <Target size={22} />,
//     title: "Lead Management",
//     desc: "Capture from 22+ sources, AI scoring, 12-stage lifecycle tracking.",
//   },
//   {
//     icon: <CalendarDays size={22} />,
//     title: "Booking & Calendar",
//     desc: "Visual hall calendar with conflict prevention and drag-drop rescheduling.",
//   },
//   {
//     icon: <Users size={22} />,
//     title: "Event Management",
//     desc: "Day-of checklists, staff assignments, vendor coordination.",
//   },
//   {
//     icon: <CreditCard size={22} />,
//     title: "Billing & Payments",
//     desc: "Invoice generation, payment tracking, outstanding dues alerts.",
//   },
//   {
//     icon: <ChefHat size={22} />,
//     title: "Kitchen & Inventory",
//     desc: "Raw material stock, purchase orders, low stock alerts.",
//   },
//   {
//     icon: <Palette size={22} />,
//     title: "Decor Choosing",
//     desc: "Visual decor packages with client-facing selection flow.",
//   },
//   {
//     icon: <TrendingUp size={22} />,
//     title: "Dynamic Pricing",
//     desc: "Festival, season, and day-of-week based automatic pricing.",
//   },
//   {
//     icon: <BarChart3 size={22} />,
//     title: "Analytics & Reports",
//     desc: "Revenue, occupancy, lead funnel, and event analytics with export.",
//   },
//   {
//     icon: <MessageSquare size={22} />,
//     title: "Review System",
//     desc: "QR-based collection, AI sentiment analysis, auto-response.",
//   },
// ];

// function FeaturesGrid() {
//   return (
//     <section className="section" style={{ background: "var(--color-bg-alt)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="Features"
//           title="Everything you need, nothing you don't."
//           titleHighlight="Everything"
//           subtitle="14 integrated modules designed specifically for banquet operations."
//         />
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: 24,
//           }}
//         >
//           {features.map((f, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={fadeUp}
//               className="card"
//               style={{ padding: 28 }}
//             >
//               <div className="card-icon">{f.icon}</div>
//               <h4
//                 style={{
//                   fontFamily: "var(--font-display)",
//                   fontSize: 18,
//                   fontWeight: 700,
//                   color: "var(--color-text-h)",
//                   marginBottom: 8,
//                 }}
//               >
//                 {f.title}
//               </h4>
//               <p
//                 style={{
//                   fontSize: 14,
//                   color: "var(--color-text-muted)",
//                   lineHeight: 1.6,
//                 }}
//               >
//                 {f.desc}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 5: Lead Pipeline
// const pipelineSteps = [
//   "New",
//   "Contacted",
//   "Site Visit",
//   "Proposal",
//   "Negotiation",
//   "Hot",
//   "Warm",
//   "Cold",
//   "Converted",
// ];
// function LeadPipeline() {
//   return (
//     <section className="section" style={{ background: "var(--color-bg)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="Lead Pipeline"
//           title="End-to-end lifecycle, tracked."
//           titleHighlight="lifecycle,"
//           subtitle="From first call to final feedback — 9 structured stages."
//         />
//         <motion.div
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           variants={staggerContainer}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 0,
//             flexWrap: "wrap",
//             position: "relative",
//           }}
//         >
//           {pipelineSteps.map((s, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={scaleIn}
//               style={{ display: "flex", alignItems: "center" }}
//             >
//               <div
//                 style={{
//                   width: 80,
//                   height: 80,
//                   borderRadius: "50%",
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   fontSize: 11,
//                   fontWeight: 700,
//                   background:
//                     i === 8
//                       ? "var(--gradient-btn)"
//                       : "var(--color-primary-ghost)",
//                   color:
//                     i === 8
//                       ? "var(--color-text-on-gold)"
//                       : "var(--color-primary)",
//                   border: `2px solid ${i === 8 ? "transparent" : "var(--color-border)"}`,
//                   transition: "all 0.3s ease",
//                   cursor: "pointer",
//                 }}
//               >
//                 <span style={{ fontSize: 16, marginBottom: 2 }}>{i + 1}</span>
//                 <span style={{ textAlign: "center", lineHeight: 1.2 }}>
//                   {s}
//                 </span>
//               </div>
//               {i < 8 && (
//                 <div
//                   style={{
//                     width: 32,
//                     height: 2,
//                     background: "var(--gradient-bar)",
//                   }}
//                 />
//               )}
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 6: Analytics Preview
// function AnalyticsPreview() {
//   const kpis = [
//     { label: "Monthly Revenue", value: "₹28.4L", change: "+12.5%" },
//     { label: "Conversion Rate", value: "18.2%", change: "+3.1%" },
//     { label: "Avg Booking Value", value: "₹4.5L", change: "+8.2%" },
//     { label: "Occupancy Rate", value: "78%", change: "+5.4%" },
//   ];
//   return (
//     <section className="section" style={{ background: "var(--color-bg-alt)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="Analytics"
//           title="Data-driven decisions, beautifully presented."
//           titleHighlight="Data-driven"
//           subtitle="7 analytics tabs with export to CSV, Excel, and PDF."
//         />
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 20,
//           }}
//         >
//           {kpis.map((k, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={fadeUp}
//               className="kpi-card"
//             >
//               <div className="kpi-label">{k.label}</div>
//               <div className="kpi-value">{k.value}</div>
//               <div className={`kpi-change positive`}>↑ {k.change}</div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 7: Review System
// function ReviewSystem() {
//   return (
//     <section className="section" style={{ background: "var(--color-bg)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="Reviews"
//           title="Reputation management, automated."
//           titleHighlight="automated."
//           subtitle="QR code collection, AI sentiment analysis, and auto-response — all built in."
//         />
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: 24,
//           }}
//         >
//           {[
//             {
//               icon: "📱",
//               title: "QR Collection",
//               desc: "Generate unique QR codes per event for instant review collection.",
//             },
//             {
//               icon: "🤖",
//               title: "AI Sentiment",
//               desc: "Automatic sentiment analysis with keyword extraction.",
//             },
//             {
//               icon: "⚡",
//               title: "Auto-Response",
//               desc: "Pre-built templates with AI-assisted personalized responses.",
//             },
//           ].map((f, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={fadeUp}
//               className="card"
//               style={{ padding: 28, textAlign: "center" }}
//             >
//               <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
//               <h4
//                 style={{
//                   fontFamily: "var(--font-display)",
//                   fontSize: 18,
//                   fontWeight: 700,
//                   color: "var(--color-text-h)",
//                   marginBottom: 8,
//                 }}
//               >
//                 {f.title}
//               </h4>
//               <p
//                 style={{
//                   fontSize: 14,
//                   color: "var(--color-text-muted)",
//                   lineHeight: 1.6,
//                 }}
//               >
//                 {f.desc}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 8: Bonus Features
// function BonusFeatures() {
//   const bonuses = [
//     {
//       icon: <Shield size={22} />,
//       title: "RBAC Security",
//       desc: "8 roles with granular permissions.",
//     },
//     {
//       icon: <Zap size={22} />,
//       title: "AI Lead Scoring",
//       desc: "Gemini-powered lead prioritization.",
//     },
//     {
//       icon: <Globe size={22} />,
//       title: "Multi-Franchise",
//       desc: "Scale across unlimited franchises.",
//     },
//     {
//       icon: <Users size={22} />,
//       title: "Temp Staff",
//       desc: "24-hour auto-expiring access.",
//     },
//     {
//       icon: <MessageSquare size={22} />,
//       title: "WhatsApp & Email",
//       desc: "Automated notifications via WATI & Resend.",
//     },
//     {
//       icon: <Star size={22} />,
//       title: "PDF Generation",
//       desc: "Client-side invoices & proposals with jsPDF.",
//     },
//   ];
//   return (
//     <section className="section" style={{ background: "var(--color-bg-alt)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="And More"
//           title="Bonus features that set us apart."
//           titleHighlight="apart."
//         />
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: 20,
//           }}
//         >
//           {bonuses.map((b, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={fadeUp}
//               style={{
//                 display: "flex",
//                 gap: 16,
//                 padding: 20,
//                 borderRadius: 16,
//                 border: "1px solid var(--color-border)",
//                 background: "var(--color-bg-card)",
//               }}
//             >
//               <div
//                 style={{
//                   width: 44,
//                   height: 44,
//                   borderRadius: "50%",
//                   background: "var(--color-primary-ghost)",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   color: "var(--color-primary)",
//                   flexShrink: 0,
//                 }}
//               >
//                 {b.icon}
//               </div>
//               <div>
//                 <h4
//                   style={{
//                     fontSize: 15,
//                     fontWeight: 700,
//                     color: "var(--color-text-h)",
//                     marginBottom: 4,
//                   }}
//                 >
//                   {b.title}
//                 </h4>
//                 <p
//                   style={{
//                     fontSize: 13,
//                     color: "var(--color-text-muted)",
//                     lineHeight: 1.5,
//                   }}
//                 >
//                   {b.desc}
//                 </p>
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 9: Testimonials
// function Testimonials() {
//   const testimonials = [
//     {
//       name: "Prasad Rao",
//       role: "Owner, Prasad Food Divine",
//       text: "BanquetEase transformed our operations. We went from spreadsheets to a fully digital system in weeks. Revenue tracking alone saved us lakhs.",
//       rating: 5,
//     },
//     {
//       name: "Arjun Reddy",
//       role: "Branch Manager",
//       text: "The lead management and AI scoring features are incredible. Our conversion rate improved by 30% in the first quarter.",
//       rating: 5,
//     },
//     {
//       name: "Sneha Gupta",
//       role: "Branch Manager, Kukatpally",
//       text: "The calendar and booking system prevents double-bookings completely. Our clients love the decor package selection feature.",
//       rating: 5,
//     },
//   ];
//   return (
//     <section className="section" style={{ background: "var(--color-bg)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="Testimonials"
//           title="What our clients say about us."
//           titleHighlight="clients"
//         />
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: 24,
//           }}
//         >
//           {testimonials.map((t, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={fadeUp}
//               className="testimonial-card"
//             >
//               <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
//                 {[...Array(t.rating)].map((_, j) => (
//                   <Star
//                     key={j}
//                     size={16}
//                     fill="var(--color-star)"
//                     color="var(--color-star)"
//                   />
//                 ))}
//               </div>
//               <p
//                 style={{
//                   fontSize: 15,
//                   color: "var(--color-text-body)",
//                   lineHeight: 1.7,
//                   marginBottom: 20,
//                 }}
//               >
//                 &ldquo;{t.text}&rdquo;
//               </p>
//               <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                 <div
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: "50%",
//                     background: "var(--gradient-btn)",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     fontSize: 16,
//                     fontWeight: 700,
//                     color: "var(--color-text-on-gold)",
//                   }}
//                 >
//                   {t.name[0]}
//                 </div>
//                 <div>
//                   <div
//                     style={{
//                       fontSize: 14,
//                       fontWeight: 600,
//                       color: "var(--color-text-h)",
//                     }}
//                   >
//                     {t.name}
//                   </div>
//                   <div
//                     style={{ fontSize: 12, color: "var(--color-text-muted)" }}
//                   >
//                     {t.role}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 10: Pricing
// function PricingSection() {
//   const plans = [
//     {
//       name: "Starter",
//       price: "₹9,999",
//       period: "/month",
//       features: [
//         "1 Franchise",
//         "2 Branches",
//         "5 Staff accounts",
//         "Lead Management",
//         "Booking Calendar",
//         "Basic Analytics",
//         "Email Support",
//       ],
//       popular: false,
//     },
//     {
//       name: "Professional",
//       price: "₹24,999",
//       period: "/month",
//       features: [
//         "1 Franchise",
//         "5 Branches",
//         "25 Staff accounts",
//         "Everything in Starter",
//         "AI Lead Scoring",
//         "Dynamic Pricing",
//         "Inventory Module",
//         "WhatsApp & Email Notifications",
//         "Priority Support",
//       ],
//       popular: true,
//     },
//     {
//       name: "Enterprise",
//       price: "Custom",
//       period: "",
//       features: [
//         "Unlimited Franchises",
//         "Unlimited Branches",
//         "Unlimited Staff",
//         "Everything in Professional",
//         "Custom Integrations",
//         "Dedicated Account Manager",
//         "SLA Guarantee",
//         "White-label Option",
//       ],
//       popular: false,
//     },
//   ];
//   return (
//     <section className="section" style={{ background: "var(--color-bg-alt)" }}>
//       <div className="container">
//         <SectionHeader
//           eyebrow="Pricing"
//           title="Simple pricing, powerful features."
//           titleHighlight="Simple"
//           subtitle="Start free for 14 days. No credit card required."
//         />
//         <motion.div
//           variants={staggerContainer}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           style={{
//             display: "grid",
//             gridTemplateColumns: "repeat(3, 1fr)",
//             gap: 24,
//             maxWidth: 1000,
//             margin: "0 auto",
//           }}
//         >
//           {plans.map((p, i) => (
//             <motion.div
//               key={i}
//               custom={i}
//               variants={fadeUp}
//               className="card"
//               style={{
//                 padding: 32,
//                 textAlign: "center",
//                 position: "relative",
//                 border: p.popular ? "2px solid var(--color-accent)" : undefined,
//                 transform: p.popular ? "scale(1.05)" : undefined,
//               }}
//             >
//               {p.popular && (
//                 <div
//                   className="badge badge-accent"
//                   style={{
//                     position: "absolute",
//                     top: -12,
//                     left: "50%",
//                     transform: "translateX(-50%)",
//                   }}
//                 >
//                   Most Popular
//                 </div>
//               )}
//               <h3
//                 style={{
//                   fontFamily: "var(--font-display)",
//                   fontSize: 22,
//                   fontWeight: 700,
//                   color: "var(--color-text-h)",
//                   marginBottom: 8,
//                 }}
//               >
//                 {p.name}
//               </h3>
//               <div
//                 style={{
//                   fontSize: 36,
//                   fontWeight: 700,
//                   color: "var(--color-accent)",
//                   fontFamily: "var(--font-mono)",
//                   marginBottom: 4,
//                 }}
//               >
//                 {p.price}
//                 <span
//                   style={{
//                     fontSize: 14,
//                     fontWeight: 400,
//                     color: "var(--color-text-muted)",
//                   }}
//                 >
//                   {p.period}
//                 </span>
//               </div>
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: 10,
//                   margin: "24px 0",
//                   textAlign: "left",
//                 }}
//               >
//                 {p.features.map((f, j) => (
//                   <div
//                     key={j}
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 10,
//                       fontSize: 14,
//                       color: "var(--color-text-body)",
//                     }}
//                   >
//                     <Check
//                       size={14}
//                       style={{ color: "var(--color-success)" }}
//                     />{" "}
//                     {f}
//                   </div>
//                 ))}
//               </div>
//               <button
//                 className={`btn ${p.popular ? "btn-primary" : "btn-outline"}`}
//                 style={{ width: "100%" }}
//               >
//                 {p.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
//               </button>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }

// // Section 11: CTA Banner
// function CTABanner() {
//   return (
//     <section
//       style={{
//         padding: "80px 32px",
//         background: "var(--color-primary)",
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       <div
//         className="texture-grain"
//         style={{ position: "absolute", inset: 0 }}
//       />
//       <motion.div
//         initial="hidden"
//         whileInView="visible"
//         viewport={{ once: true }}
//         variants={fadeUp}
//         style={{ textAlign: "center", position: "relative", zIndex: 1 }}
//       >
//         <h2
//           style={{
//             fontFamily: "var(--font-display)",
//             fontSize: "clamp(2rem, 4vw, 3rem)",
//             fontWeight: 700,
//             color: "#fff",
//             marginBottom: 16,
//             fontStyle: "italic",
//           }}
//         >
//           Ready to transform your banquet business?
//         </h2>
//         <p
//           style={{
//             fontSize: 17,
//             color: "rgba(255,255,255,0.75)",
//             marginBottom: 32,
//             maxWidth: 500,
//             margin: "0 auto 32px",
//           }}
//         >
//           Join hundreds of venues already using BanquetEase to streamline
//           operations and grow revenue.
//         </p>
//         <div
//           style={{
//             display: "flex",
//             gap: 16,
//             justifyContent: "center",
//             flexWrap: "wrap",
//           }}
//         >
//           <Link
//             href="/login"
//             className="btn btn-primary btn-lg"
//             style={{ textDecoration: "none" }}
//           >
//             Get Started Free <ArrowRight size={16} />
//           </Link>
//           <Link
//             href="/contact"
//             className="btn btn-ghost btn-lg"
//             style={{ textDecoration: "none" }}
//           >
//             Schedule a Demo
//           </Link>
//         </div>
//       </motion.div>
//     </section>
//   );
// }

// // Full Page
// export default function HomePage() {
//   return (
//     <>
//       <Hero />
//       <TrustedBy />
//       <ProblemSolution />
//       <FeaturesGrid />
//       <LeadPipeline />
//       <AnalyticsPreview />
//       <ReviewSystem />
//       <BonusFeatures />
//       <Testimonials />
//       <PricingSection />
//       <CTABanner />
//     </>
//   );
// }


'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import SectionHeader from '@/components/shared/SectionHeader';
import GsapReveal from '@/components/ui/GsapReveal';
import {
  fadeUp, fadeIn, staggerContainer, heroBadge, heroLine, heroCTA,
  heroStats, scaleIn, slideInLeft, slideInRight
} from '@/lib/motion-variants';
import {
  Target, CalendarDays, BarChart3, Users, CreditCard, ChefHat,
  Palette, TrendingUp, MessageSquare, Shield, Zap, Globe,
  Star, ArrowRight, Check, Sparkles
} from 'lucide-react';

/* ── Section 1: Hero ─────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{
      position: 'relative', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: 'var(--gradient-hero)',
      padding: 'clamp(80px, 12vw, 140px) clamp(12px, 4vw, 48px) clamp(40px, 6vw, 80px)',
    }}>
      <div className="texture-grain" style={{ position: 'absolute', inset: 0 }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 900, width: '100%' }}>
        <motion.div variants={heroBadge} initial="hidden" animate="visible" className="badge badge-accent" style={{ marginBottom: 24 }}>
          <Sparkles size={12} /> Powered by Coding Gurus
        </motion.div>

        <motion.h1 variants={heroLine(0)} initial="hidden" animate="visible"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 7vw, 5rem)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1px' }}>
          The Complete{' '}
          <span style={{ background: 'linear-gradient(135deg, #E8B84B, #F5D07A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Banquet Management
          </span>{' '}Platform
        </motion.h1>

        <motion.p variants={heroLine(1)} initial="hidden" animate="visible"
          style={{ fontSize: 'clamp(15px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.75)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7, marginBottom: 32 }}>
          Manage leads, bookings, events, billing, kitchen, and vendors — all from one powerful dashboard.
        </motion.p>

        <motion.div variants={heroCTA} initial="hidden" animate="visible"
          style={{ display: 'flex', gap: 'clamp(8px, 2vw, 16px)', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '100%' }}>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ textDecoration: 'none', minWidth: 'clamp(150px, 45vw, 200px)' }}>Start Free Trial <ArrowRight size={14} /></Link>
          <Link href="/features" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none', minWidth: 'clamp(140px, 40vw, 190px)' }}>Explore Features</Link>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'clamp(16px, 4vw, 32px)', justifyContent: 'center', marginTop: 'clamp(36px, 6vw, 56px)', width: '100%', maxWidth: 500, margin: 'clamp(36px, 6vw, 56px) auto 0' }}>
          {[{ val: '500+', label: 'Events Managed' }, { val: '₹18Cr+', label: 'Revenue Tracked' }, { val: '98%', label: 'Client Satisfaction' }, { val: '3', label: 'Franchises Live' }].map((s, i) => (
            <motion.div key={i} custom={i} variants={heroStats(i)} style={{ textAlign: 'center', minWidth: 'min(120px, 22vw)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, color: '#E8B84B', marginBottom: 4 }}>{s.val}</div>
              <div style={{ fontSize: 'clamp(10px, 2vw, 13px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="scroll-indicator"><div className="scroll-mouse"><div className="scroll-dot" /></div></div>
    </section>
  );
}

/* ── Section 2: Trusted By Strip ─────────────────────────────── */
function TrustedBy() {
  const brands = ['Prasad Food Divine', 'Royal Banquets', 'Grand Celebrations', 'Hyderabad Caterers', 'Star Events', 'Wedding Bells'];
  return (
    <section style={{ padding: 'clamp(20px, 4vw, 36px) 0', background: 'var(--color-bg-alt)', overflow: 'hidden' }}>
      <p className="trusted-by-label" style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 18, padding: '0 16px' }}>
        Trusted by leading banquet businesses
      </p>
      <div className="trusted-ticker" style={{ display: 'flex', gap: 48, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
        {brands.concat(brands).map((b, i) => (
          <span key={i} style={{ fontSize: 'clamp(13px, 2vw, 16px)', fontWeight: 600, color: 'var(--color-text-muted)', opacity: 0.5, fontFamily: 'var(--font-display)', flexShrink: 0 }}>{b}</span>
        ))}
      </div>
    </section>
  );
}

/* ── Section 3: Problem / Solution ───────────────────────────── */
function ProblemSolution() {
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <div className="two-col" style={{ gap: 'clamp(24px, 5vw, 64px)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInLeft}>
            <SectionHeader eyebrow="The Problem" title="Managing banquets shouldn't be chaos." align="left"
              subtitle="Scattered spreadsheets, missed follow-ups, double-bookings, and lost revenue. Sound familiar?" />
            <GsapReveal animation="stagger" className="flex flex-col gap-3 mt-6">
              {['Leads falling through cracks', 'Double-booked halls', 'No real-time inventory tracking', 'Manual invoice generation', 'Zero analytics on performance'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'var(--color-text-body)' }}>
                  <span style={{ color: 'var(--color-danger)', fontSize: 16, flexShrink: 0 }}>✕</span> {item}
                </div>
              ))}
            </GsapReveal>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={slideInRight}>
            <div className="card" style={{ padding: 'clamp(20px, 4vw, 32px)', boxShadow: 'var(--shadow-hover)' }}>
              <div className="badge badge-green" style={{ marginBottom: 16 }}>The Solution</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 12 }}>One platform, every operation.</h3>
              <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 20 }}>BanquetEase unifies your entire business — from first enquiry to final payment — in a single, beautiful dashboard.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['AI-powered lead scoring', 'Real-time hall availability', 'Automated inventory alerts', 'One-click PDF invoices', 'Live performance analytics'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, color: 'var(--color-text-body)' }}>
                    <Check size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Section 4: Features Grid ─────────────────────────────────── */
const features = [
  { icon: <Target size={22} />, title: 'Lead Management', desc: 'Capture from 22+ sources, AI scoring, 12-stage lifecycle tracking.' },
  { icon: <CalendarDays size={22} />, title: 'Booking & Calendar', desc: 'Visual hall calendar with conflict prevention and drag-drop rescheduling.' },
  { icon: <Users size={22} />, title: 'Event Management', desc: 'Day-of checklists, staff assignments, vendor coordination.' },
  { icon: <CreditCard size={22} />, title: 'Billing & Payments', desc: 'Invoice generation, payment tracking, outstanding dues alerts.' },
  { icon: <ChefHat size={22} />, title: 'Kitchen & Inventory', desc: 'Raw material stock, purchase orders, low stock alerts.' },
  { icon: <Palette size={22} />, title: 'Decor Choosing', desc: 'Visual decor packages with client-facing selection flow.' },
  { icon: <TrendingUp size={22} />, title: 'Dynamic Pricing', desc: 'Festival, season, and day-of-week based automatic pricing.' },
  { icon: <BarChart3 size={22} />, title: 'Analytics & Reports', desc: 'Revenue, occupancy, lead funnel, and event analytics with export.' },
  { icon: <MessageSquare size={22} />, title: 'Review System', desc: 'QR-based collection, AI sentiment analysis, auto-response.' },
];

function FeaturesGrid() {
  return (
    <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="container">
        <SectionHeader eyebrow="Features" title="Everything you need, nothing you don't."
          titleHighlight="Everything" subtitle="14 integrated modules designed specifically for banquet operations." />
        <GsapReveal animation="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="card hover-lift" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
              <div className="card-icon">{f.icon}</div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{f.title}</h4>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

/* ── Section 5: Lead Pipeline ─────────────────────────────────── */
const pipelineSteps = ['New', 'Contacted', 'Site Visit', 'Proposal', 'Negotiation', 'Hot', 'Warm', 'Cold', 'Converted'];

function LeadPipeline() {
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <SectionHeader eyebrow="Lead Pipeline" title="End-to-end lifecycle, tracked."
          titleHighlight="lifecycle," subtitle="From first call to final feedback — 9 structured stages." />
        <div className="lead-pipeline-wrap" style={{ overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch' }}>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0, minWidth: 'max-content', margin: '0 auto', padding: '8px 4px' }}>
            {pipelineSteps.map((s, i) => (
              <motion.div key={i} custom={i} variants={scaleIn} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: 'clamp(60px, 8vw, 80px)', height: 'clamp(60px, 8vw, 80px)',
                  borderRadius: '50%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 'clamp(9px, 1.2vw, 11px)', fontWeight: 700,
                  background: i === 8 ? 'var(--gradient-btn)' : 'var(--color-primary-ghost)',
                  color: i === 8 ? 'var(--color-text-on-gold)' : 'var(--color-primary)',
                  border: `2px solid ${i === 8 ? 'transparent' : 'var(--color-border)'}`,
                  transition: 'all 0.3s ease', cursor: 'pointer', flexShrink: 0,
                }}>
                  <span style={{ fontSize: 'clamp(11px, 1.8vw, 16px)', marginBottom: 2 }}>{i + 1}</span>
                  <span style={{ textAlign: 'center', lineHeight: 1.2, padding: '0 4px' }}>{s}</span>
                </div>
                {i < 8 && <div style={{ width: 'clamp(12px, 2vw, 32px)', height: 2, background: 'var(--gradient-bar)', flexShrink: 0 }} />}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Section 6: Analytics Preview ────────────────────────────── */
function AnalyticsPreview() {
  const kpis = [
    { label: 'Monthly Revenue', value: '₹28.4L', change: '+12.5%' },
    { label: 'Conversion Rate', value: '18.2%', change: '+3.1%' },
    { label: 'Avg Booking Value', value: '₹4.5L', change: '+8.2%' },
    { label: 'Occupancy Rate', value: '78%', change: '+5.4%' },
  ];
  return (
    <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="container">
        <SectionHeader eyebrow="Analytics" title="Data-driven decisions, beautifully presented."
          titleHighlight="Data-driven" subtitle="7 analytics tabs with export to CSV, Excel, and PDF." />
        <GsapReveal animation="stagger" className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="kpi-card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-change positive">↑ {k.change}</div>
            </motion.div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

/* ── Section 7: Review System ────────────────────────────────── */
function ReviewSystem() {
  const items = [
    { icon: '📱', title: 'QR Collection', desc: 'Generate unique QR codes per event for instant review collection.' },
    { icon: '🤖', title: 'AI Sentiment', desc: 'Automatic sentiment analysis with keyword extraction.' },
    { icon: '⚡', title: 'Auto-Response', desc: 'Pre-built templates with AI-assisted personalized responses.' },
  ];
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <SectionHeader eyebrow="Reviews" title="Reputation management, automated."
          titleHighlight="automated." subtitle="QR code collection, AI sentiment analysis, and auto-response — all built in." />
        <GsapReveal animation="stagger" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {items.map((f, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="card hover-lift" style={{ padding: 'clamp(20px, 3vw, 28px)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{f.title}</h4>
              <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

/* ── Section 8: Bonus Features ───────────────────────────────── */
function BonusFeatures() {
  const bonuses = [
    { icon: <Shield size={20} />, title: 'RBAC Security', desc: '8 roles with granular permissions.' },
    { icon: <Zap size={20} />, title: 'AI Lead Scoring', desc: 'Gemini-powered lead prioritization.' },
    { icon: <Globe size={20} />, title: 'Multi-Franchise', desc: 'Scale across unlimited franchises.' },
    { icon: <Users size={20} />, title: 'Temp Staff', desc: '24-hour auto-expiring access.' },
    { icon: <MessageSquare size={20} />, title: 'WhatsApp & Email', desc: 'Automated notifications via WATI & Resend.' },
    { icon: <Star size={20} />, title: 'PDF Generation', desc: 'Client-side invoices & proposals with jsPDF.' },
  ];
  return (
    <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="container">
        <SectionHeader eyebrow="And More" title="Bonus features that set us apart." titleHighlight="apart." />
        <GsapReveal animation="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {bonuses.map((b, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ display: 'flex', gap: 14, padding: 'clamp(14px, 2.5vw, 20px)', borderRadius: 16, border: '1px solid var(--color-border)', background: 'var(--color-bg-card)', transition: 'box-shadow 0.25s, transform 0.25s' }}
              whileHover={{ y: -3, boxShadow: 'var(--shadow-hover)' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--color-primary-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)', flexShrink: 0 }}>{b.icon}</div>
              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 4 }}>{b.title}</h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

/* ── Section 9: Testimonials ──────────────────────────────────── */
function Testimonials() {
  const testimonials = [
    { name: 'Prasad Rao', role: 'Owner, Prasad Food Divine', text: 'BanquetEase transformed our operations. We went from spreadsheets to a fully digital system in weeks. Revenue tracking alone saved us lakhs.', rating: 5 },
    { name: 'Arjun Reddy', role: 'Branch Manager', text: 'The lead management and AI scoring features are incredible. Our conversion rate improved by 30% in the first quarter.', rating: 5 },
    { name: 'Sneha Gupta', role: 'Branch Manager, Kukatpally', text: 'The calendar and booking system prevents double-bookings completely. Our clients love the decor package selection feature.', rating: 5 },
  ];
  return (
    <section className="section" style={{ background: 'var(--color-bg)' }}>
      <div className="container">
        <SectionHeader eyebrow="Testimonials" title="What our clients say about us." titleHighlight="clients" />
        <GsapReveal animation="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="testimonial-card">
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="var(--color-star)" color="var(--color-star)" />)}
              </div>
              <p style={{ fontSize: 15, color: 'var(--color-text-body)', lineHeight: 1.7, marginBottom: 20 }}>&ldquo;{t.text}&rdquo;</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--color-text-on-gold)', flexShrink: 0 }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </GsapReveal>
      </div>
    </section>
  );
}

/* ── Section 10: Pricing ──────────────────────────────────────── */
function PricingSection() {
  const plans = [
    { name: 'Starter', price: '₹9,999', period: '/month', features: ['1 Franchise', '2 Branches', '5 Staff accounts', 'Lead Management', 'Booking Calendar', 'Basic Analytics', 'Email Support'], popular: false },
    { name: 'Professional', price: '₹24,999', period: '/month', features: ['1 Franchise', '5 Branches', '25 Staff accounts', 'Everything in Starter', 'AI Lead Scoring', 'Dynamic Pricing', 'Inventory Module', 'WhatsApp & Email Notifications', 'Priority Support'], popular: true },
    { name: 'Enterprise', price: 'Custom', period: '', features: ['Unlimited Franchises', 'Unlimited Branches', 'Unlimited Staff', 'Everything in Professional', 'Custom Integrations', 'Dedicated Account Manager', 'SLA Guarantee', 'White-label Option'], popular: false },
  ];
  return (
    <section className="section" style={{ background: 'var(--color-bg-alt)' }}>
      <div className="container">
        <SectionHeader eyebrow="Pricing" title="Simple pricing, powerful features."
          titleHighlight="Simple" subtitle="Start free for 14 days. No credit card required." />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {plans.map((p, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="card"
              style={{
                padding: 'clamp(22px, 3vw, 32px)', textAlign: 'center', position: 'relative',
                border: p.popular ? '2px solid var(--color-accent)' : undefined,
                zIndex: p.popular ? 1 : 0,
              }}>
              {p.popular && (
                <div className="badge badge-accent" style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>{p.name}</h3>
              <div style={{ fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>
                {p.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--color-text-muted)' }}>{p.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '24px 0', textAlign: 'left' }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-text-body)' }}>
                    <Check size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <button className={`btn ${p.popular ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%' }}>
                {p.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 11: CTA Banner ────────────────────────────────────── */
function CTABanner() {
  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 48px)', background: 'var(--color-primary)', position: 'relative', overflow: 'hidden' }}>
      <div className="texture-grain" style={{ position: 'absolute', inset: 0 }} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: 16, fontStyle: 'italic', lineHeight: 1.2 }}>
          Ready to transform your banquet business?
        </h2>
        <p style={{ fontSize: 'clamp(14px, 2vw, 17px)', color: 'rgba(255,255,255,0.75)', marginBottom: 32, lineHeight: 1.7 }}>
          Join hundreds of venues already using BanquetEase to streamline operations and grow revenue.
        </p>
        <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', justifyContent: 'center', flexWrap: 'wrap', padding: '0 8px' }}>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ textDecoration: 'none', flex: '1 1 auto', maxWidth: 240, justifyContent: 'center' }}>Get Started Free <ArrowRight size={16} /></Link>
          <Link href="/contact" className="btn btn-ghost btn-lg" style={{ textDecoration: 'none', flex: '1 1 auto', maxWidth: 240, justifyContent: 'center' }}>Schedule a Demo</Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ── Full Page ─────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedBy />
      <ProblemSolution />
      <FeaturesGrid />
      <LeadPipeline />
      <AnalyticsPreview />
      <ReviewSystem />
      <BonusFeatures />
      <Testimonials />
      <PricingSection />
      <CTABanner />
    </>
  );
}
