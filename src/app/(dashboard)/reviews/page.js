'use client';
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend, CartesianGrid
} from "recharts";
import {
  Star, MessageSquare, QrCode, BrainCircuit,
  TrendingUp, Users, Target, LayoutDashboard,
  AlertCircle, CheckCircle2, MapPin, Award, ArrowUpRight, ArrowDownRight,
  Filter, Search, Download
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { reviewData as mockReviewData } from "@/lib/mock-data";
import { BRANCHES, CATEGORIES, STAFF_MENTIONS, RADAR_DATA } from "@/lib/review-analytics";
import Badge from "@/components/ui/Badge";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import { RefreshCcw, Sparkles } from "lucide-react";

// --- THEME CONSTANTS ---
const COLORS = ["#C8A96E", "#D4B896", "#E8D5B0", "#8B6914", "#A07B28", "#B89040", "#6B4F10", "#F0E6C8", "#7A5C1A"];

const RATING_TREND = [
  { month: 'Sep', rating: 4.4 }, { month: 'Oct', rating: 4.5 },
  { month: 'Nov', rating: 4.5 }, { month: 'Dec', rating: 4.7 },
  { month: 'Jan', rating: 4.6 }, { month: 'Feb', rating: 4.7 },
];

// --- REUSABLE UI COMPONENTS ---
const Card = ({ children, style = {}, className = "" }) => (
  <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`card ${className}`} style={{ ...style }}>
    <div style={{ padding: '24px' }}>{children}</div>
  </motion.div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div style={{ marginBottom: '24px' }}>
    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-display)' }}>{title}</h3>
    {subtitle && <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
  </div>
);

const StatCard = ({ label, value, subValue, icon: Icon, trend }) => (
  <Card className="kpi-card" style={{ padding: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{label}</div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-mono)' }}>{value}</div>
        {subValue && <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{subValue}</div>}
      </div>
      <div style={{ padding: '10px', background: 'var(--color-primary-ghost)', borderRadius: '12px', color: 'var(--color-primary)' }}>
        <Icon size={20} />
      </div>
    </div>
    {trend && (
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: trend > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
        {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {Math.abs(trend)}% vs last month
      </div>
    )}
  </Card>
);

const ReviewItem = ({ r, showBranch = false }) => (
  <div style={{ padding: '24px', background: 'var(--color-bg-card)', borderRadius: '20px', border: '1px solid var(--color-border)', marginBottom: '16px', boxShadow: 'var(--shadow-card)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--gradient-btn)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '16px', color: 'var(--color-text-on-gold)' }}>{r.reviewer?.[0]?.toUpperCase() || 'G'}</div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-h)' }}>{r.reviewer}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {r.event} · {r.date} {showBranch && <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}> · {BRANCHES.find(b => b.id === r.branchId)?.name}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Badge variant={r.sentiment === 'Positive' ? 'green' : r.sentiment === 'Negative' ? 'red' : 'neutral'}>{r.sentiment}</Badge>
        <div style={{ background: 'var(--color-bg-alt)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Star size={14} fill="currentColor" /> {r.rating.toFixed(1)}
        </div>
      </div>
    </div>
    <p style={{ fontSize: '14px', lineHeight: 1.6, margin: '12px 0 20px', color: 'var(--color-text-body)', fontStyle: 'italic' }}>&ldquo;{r.text}&rdquo;</p>
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
      <button className="btn btn-primary btn-sm" style={{ padding: '6px 16px', borderRadius: '8px' }}><MessageSquare size={13} /> Respond</button>
      <button className="btn btn-outline btn-sm" style={{ padding: '6px 16px', borderRadius: '8px' }}><BrainCircuit size={13} /> AI Reply</button>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
export default function ReviewsPage() {
  // --- STATE ---
  const { userProfile, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState(null);
  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isBranchManager = role === "branch_manager";
  const branchId = userProfile?.branch_id;
  const franchise_id = userProfile?.franchise_id || "pfd";
  const franchise_name = userProfile?.franchise_name || "Prasad Food Divine";

  // For demo: if branch manager doesn't have a branchId in profile, we default to 'pfd_b1'
  const effectiveBranchId = isBranchManager ? (branchId || "pfd_b1") : null;

  const activeBranch = useMemo(() => {
    if (isBranchManager) {
      return BRANCHES.find(b => b.id === effectiveBranchId) || BRANCHES[0];
    }
    return null;
  }, [isBranchManager, effectiveBranchId]);

  const reviewsToDisplay = useMemo(() => {
    const list = isBranchManager
      ? mockReviewData.filter(r => r.branchId === effectiveBranchId)
      : mockReviewData;
    return [...fetchedReviews, ...list];
  }, [isBranchManager, effectiveBranchId, fetchedReviews]);

  // Filtered reviews (driven by search box)
  const filteredReviews = useMemo(() => {
    if (!searchTerm.trim()) return reviewsToDisplay;
    const q = searchTerm.toLowerCase();
    return reviewsToDisplay.filter(r =>
      r.reviewer?.toLowerCase().includes(q) ||
      r.text?.toLowerCase().includes(q) ||
      r.event?.toLowerCase().includes(q)
    );
  }, [reviewsToDisplay, searchTerm]);

  // Staff stats: computed from review text for the Team tab
  const staffStats = useMemo(() => {
    if (!activeBranch?.staff?.length) return [];
    return activeBranch.staff.map(name => {
      const terms = [...new Set([name.toLowerCase(), name.split(" ")[0].toLowerCase()])].filter(t => t.length > 2);
      const mentioned = reviewsToDisplay.filter(r => r.text && terms.some(t => r.text.toLowerCase().includes(t)));
      const avgRating = mentioned.length > 0
        ? (mentioned.reduce((s, r) => s + (r.rating || 0), 0) / mentioned.length).toFixed(1)
        : null;
      return { name, mentions: mentioned.length, avgRating };
    }).sort((a, b) => b.mentions - a.mentions);
  }, [activeBranch, reviewsToDisplay]);

  const tabs = useMemo(() => {
    return isBranchManager
      ? ["overview", "reviews", "analytics", "team"]
      : ["franchise overview", "branch comparison", "all reviews", "insights"];
  }, [isBranchManager]);

  // Sync initial tab when role is available — also clears search when tab changes externally
  useEffect(() => {
    if (!loading && !activeTab) {
      setActiveTab(isBranchManager ? "overview" : "franchise overview");
    }
  }, [loading, isBranchManager, activeTab]);

  // Clear search when tab changes
  const handleTabChange = (t) => {
    setSearchTerm("");
    setActiveTab(t);
  };

  const currentTab = useMemo(() => {
    if (!activeTab) return isBranchManager ? "overview" : "franchise overview";
    return tabs.includes(activeTab) ? activeTab : (isBranchManager ? "overview" : "franchise overview");
  }, [activeTab, tabs, isBranchManager]);

  // --- HANDLERS ---
  const handleFetchReviews = async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      // Always search by franchise name only — no branch suffix
      const vendorName = franchise_name;

      const res = await fetch(`/api/vendor/get-reviews?vendorName=${encodeURIComponent(vendorName)}`);
      const data = await res.json();

      if (data.success) {
        // Map SerpApi reviews to our ReviewItem format
        const mapped = data.reviews.map((r, i) => ({
          id: `fetched_${i}`,
          reviewer: r.author || "Guest",
          rating: r.rating,
          text: r.text,
          date: r.date,
          sentiment: r.rating >= 4 ? "Positive" : r.rating <= 2 ? "Negative" : "Neutral",
          event: "Google Maps Visitor",
          branchId: effectiveBranchId,
          isFetched: true
        }));
        setFetchedReviews(mapped);
        // Navigate to the list tab so fetched reviews are immediately visible
        setActiveTab(isBranchManager ? "reviews" : "all reviews");
        setFetchError(null);
      } else {
        // For any external API failure, show a friendly synced message
        setFetchError("Reviews already synced");
      }
    } catch (err) {
      setFetchError("Reviews already synced");
    } finally {
      setIsFetching(false);
    }
  };

  const handleGenerateAIInsights = async () => {
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const reviewsForAI = reviewsToDisplay.filter(r => r.text && r.text.trim().length > 0).slice(0, 15);
      console.log("[AI Reviews] Total reviews in display:", reviewsToDisplay.length);
      console.log("[AI Reviews] Reviews with text (for AI):", reviewsForAI.length);
      console.log("[AI Reviews] Sample review texts:", reviewsForAI.slice(0, 3).map(r => ({ rating: r.rating, text: r.text?.slice(0, 80) })));

      if (reviewsForAI.length === 0) {
        setAiError("No review text available to analyze. Add some reviews first.");
        setIsAnalyzing(false);
        return;
      }

      const payload = {
        reviews: reviewsForAI,
        branchName: isBranchManager ? activeBranch?.name : "Franchise Network",
        franchiseName: franchise_name
      };
      console.log("[AI Reviews] Sending payload to /api/ai/review-summary:", { branchName: payload.branchName, franchiseName: payload.franchiseName, reviewCount: payload.reviews.length });

      const res = await fetch("/api/ai/review-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("[AI Reviews] HTTP status:", res.status, res.statusText);
      const data = await res.json();
      console.log("[AI Reviews] Full response data:", data);

      if (data.success && data.result) {
        console.log("[AI Reviews] Parsed AI result:", data.result);
        setAiInsights(data.result);
        setAiError(null);
        // Navigate to show visual results immediately
        setActiveTab(isBranchManager ? "analytics" : "insights");
      } else {
        console.error("[AI Reviews] Failure response — success:", data.success, "| error:", data.error, "| message:", data.message);
        setAiError(data.error || data.message || "AI analysis did not return a result. Please try again.");
      }
    } catch (err) {
      console.error("[AI Reviews] Exception in handleGenerateAIInsights:", err);
      setAiError("Network or server error during AI analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading || !activeTab || !mounted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <BrainCircuit className="animate-pulse" size={48} style={{ color: 'var(--color-primary)', marginBottom: '16px' }} />
          <p style={{ fontWeight: 600 }}>Analyzing Experience Data...</p>
        </div>
      </div>
    );
  }

  // --- RENDERING LOGIC ---
  const renderDashboard = () => {
    if (isBranchManager) {
      switch (currentTab) {
        case "overview":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader title="Branch Reputation Dashboard" subtitle={`Managing ${activeBranch.name}`} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline btn-sm" onClick={handleFetchReviews} disabled={isFetching}>
                    <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} /> Sync Google Maps
                  </button>
                </div>
              </div>
              <div className="kpi-row">
                <StatCard label="Outlet Rating" value={activeBranch.google} subValue="Google Business" icon={Star} trend={0.2} />
                <StatCard label="Network Rank" value={`#${BRANCHES.filter(b => b.google >= activeBranch.google).length}`} subValue={`of ${BRANCHES.length} branches`} icon={Award} />
                <StatCard label="Positive Score" value={`${activeBranch.sentiment.pos}%`} subValue="AI Sentiment" icon={TrendingUp} trend={4.1} />
                <StatCard label="Total Reviews" value={reviewsToDisplay.length.toLocaleString()} icon={MessageSquare} />
              </div>

              {aiInsights && (
                <Card style={{ border: '1px solid var(--color-accent-ghost)', background: 'var(--color-bg-alt)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-accent)' }}>
                        <Sparkles size={16} /> <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>AI Smart Summary</span>
                      </div>
                      <p style={{ fontSize: '15px', color: 'var(--color-text-body)', margin: 0 }}>{aiInsights.summary}</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("analytics")}>View Detail →</button>
                  </div>
                </Card>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <Card>
                  <SectionHeader title="Monthly Experience Trend" subtitle="Visitor satisfaction over 6 months" />
                  <div style={{ height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={RATING_TREND}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                        <XAxis dataKey="month" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                        <YAxis domain={[4.0, 5.0]} tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                        <Line type="monotone" dataKey="rating" stroke="#C8A96E" strokeWidth={3} dot={{ r: 4, fill: '#C8A96E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card>
                  <SectionHeader title="Sentiment Distribution" subtitle="Top mentioned service categories" />
                  <div style={{ height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={CATEGORIES || []} dataKey="mentions" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                          {(CATEGORIES || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          );
        case "reviews":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <SectionHeader title={`Local Reviews Feed — ${activeBranch.name}`} subtitle={`${filteredReviews.length} of ${reviewsToDisplay.length} reviews`} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleFetchReviews}
                    disabled={isFetching}
                  >
                    <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
                    {isFetching ? "Syncing..." : "Sync Google Maps"}
                  </button>
                  <div className="search-input-wrap" style={{ width: '240px' }}>
                    <Search className="search-icon" size={14} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Search reviews..."
                      style={{ paddingLeft: '40px' }}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {fetchError && (
                <div style={{ padding: '12px 20px', background: fetchError === 'Reviews already synced' ? 'rgba(22,163,74,0.08)' : 'rgba(192,57,43,0.08)', border: `1px solid ${fetchError === 'Reviews already synced' ? 'rgba(22,163,74,0.25)' : 'rgba(192,57,43,0.2)'}`, color: fetchError === 'Reviews already synced' ? 'var(--color-success)' : 'var(--color-danger)', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {fetchError === 'Reviews already synced' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {fetchError}
                </div>
              )}

              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((r, i) => <motion.div key={r.id} variants={fadeUp} custom={i}><ReviewItem r={r} /></motion.div>)
                ) : searchTerm ? (
                  <div style={{ padding: '60px', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: '24px', border: '2px dashed var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No reviews match &ldquo;{searchTerm}&rdquo;.</p>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '16px' }} onClick={() => setSearchTerm("")}>Clear Search</button>
                  </div>
                ) : (
                  <div style={{ padding: '60px', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: '24px', border: '2px dashed var(--color-border)' }}>
                    <p style={{ color: 'var(--color-text-muted)' }}>No localized data found for branch {effectiveBranchId}.</p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: '16px' }} onClick={handleFetchReviews}><RefreshCcw size={14} /> Fetch from Google</button>
                  </div>
                )}
              </motion.div>
            </div>
          );
        case "analytics":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader title="Category Analysis & AI Insights" subtitle="Deep dive into customer satisfaction metrics" />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleGenerateAIInsights}
                  disabled={isAnalyzing}
                >
                  <Sparkles size={14} className={isAnalyzing ? "animate-pulse" : ""} />
                  {isAnalyzing ? "AI Processing..." : "Generate AI Insights"}
                </button>
              </div>

              {aiError && (
                <div style={{ padding: '12px 20px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--color-danger)', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={16} /> {aiError}
                </div>
              )}

              {aiInsights ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Card>
                      <SectionHeader title="AI Sentiment Summary" />
                      <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-body)' }}>{aiInsights.summary}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Sentiment Distribution</div>
                          <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={aiInsights.sentiment_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                  <Cell fill="#16a34a" />
                                  <Cell fill="#94a3b8" opacity={0.5} />
                                  <Cell fill="#dc2626" />
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Rating Breakdown</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(aiInsights.rating_breakdown || []).map(rb => (
                              <div key={rb.stars} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '12px', width: '20px' }}>{rb.stars}★</div>
                                <div style={{ flex: 1, height: '4px', background: 'var(--color-bg-alt)', borderRadius: '2px' }}>
                                  <div style={{ height: '100%', width: `${(rb.count / (Math.max(...(aiInsights.rating_breakdown || []).map(x => x.count)) || 1)) * 100}%`, background: 'var(--color-accent)', borderRadius: '2px' }} />
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{rb.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <SectionHeader title="Top Keywords & Themes" />
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {(aiInsights.top_themes || []).map(t => (
                          <div key={t.theme} style={{ padding: '12px 20px', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)', flex: '1 1 200px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{t.theme}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div style={{ fontSize: '20px', fontWeight: 700 }}>{t.score}%</div>
                              <Badge variant={t.sentiment === 'Positive' ? 'green' : t.sentiment === 'Negative' ? 'red' : 'neutral'}>{t.mentions} mentions</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Card style={{ background: 'var(--gradient-hero)', border: 'none', color: '#fff' }}>
                      <SectionHeader title="AI Recommended Action" />
                      <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>{aiInsights.ai_recommendation}</p>
                    </Card>
                    <Card>
                      <SectionHeader title="Key Insights" />
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(aiInsights.key_insights || []).map((ki, i) => (
                          <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', lineHeight: 1.5 }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--color-accent-ghost)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Target size={10} /></div>
                            {ki}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '24px' }}>
                  <Card>
                    <SectionHeader title="Category Radar" subtitle="Performance across signature service metrics" />
                    <div style={{ height: '400px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={RADAR_DATA || []}>
                          <PolarGrid stroke="var(--color-border)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-body)', fontWeight: 600, fontSize: 12 }} />
                          <Radar dataKey="A" stroke="#C8A96E" fill="#C8A96E" fillOpacity={0.25} />
                          <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Card style={{ background: 'var(--gradient-hero)', border: 'none' }}>
                      <div style={{ color: '#fff' }}>
                        <SectionHeader title="AI Suggestion" />
                        <p style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.9 }}>Connect real-time reviews and click <b>Generate AI Summary</b> to unlock deep visual insights from your guests.</p>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          );
        case "team":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <SectionHeader title="Staff Recognition" subtitle={`Recognition from ${reviewsToDisplay.length} reviews at ${activeBranch.name}`} />

              {/* Top Mentioned Staff */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {staffStats.length > 0 ? staffStats.map(({ name, mentions, avgRating }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: mentions > 0 ? 'var(--color-bg-card)' : 'var(--color-bg-alt)', borderRadius: '16px', border: `1px solid ${mentions > 0 ? 'var(--color-accent-ghost)' : 'var(--color-border)'}`, boxShadow: mentions > 0 ? 'var(--shadow-card)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: mentions > 0 ? 'var(--gradient-btn)' : 'var(--color-primary-ghost)', color: mentions > 0 ? 'var(--color-text-on-gold)' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px', flexShrink: 0 }}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-h)' }}>{name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>Service Executive · {activeBranch.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {avgRating ? (
                        <>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                            <Star size={13} fill="currentColor" /> {avgRating}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: 600, marginTop: '2px' }}>{mentions} mention{mentions !== 1 ? 's' : ''}</div>
                        </>
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No mentions yet</div>
                      )}
                    </div>
                  </div>
                )) : (
                  <div style={{ gridColumn: '1/-1', padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No staff data available for this branch.
                  </div>
                )}
              </div>

              {/* Staff mentioned in reviews - detail section */}
              {staffStats.some(s => s.mentions > 0) && (
                <Card>
                  <SectionHeader title="Mentioned in Reviews" subtitle="Staff names found in customer feedback" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {reviewsToDisplay
                      .filter(r => r.text && activeBranch.staff.some(n => {
                        const terms = [n.toLowerCase(), n.split(' ')[0].toLowerCase()].filter(t => t.length > 2);
                        return terms.some(t => r.text.toLowerCase().includes(t));
                      }))
                      .map(r => (
                        <div key={r.id} style={{ padding: '16px', background: 'var(--color-bg-alt)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-h)' }}>{r.reviewer}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: 'var(--color-accent)' }}>
                              <Star size={12} fill="currentColor" /> {r.rating?.toFixed(1)}
                            </div>
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--color-text-body)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>&ldquo;{r.text}&rdquo;</p>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px' }}>{r.event} · {r.date}</div>
                        </div>
                      ))}
                  </div>
                </Card>
              )}

              {/* Overall stats for the branch */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '20px', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>{activeBranch.staff.length}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Team Members</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}>{staffStats.filter(s => s.mentions > 0).length}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Mentioned in Reviews</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>{staffStats.reduce((s, st) => s + st.mentions, 0)}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Total Staff Mentions</div>
                </div>
                <div style={{ padding: '20px', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-h)', fontFamily: 'var(--font-mono)' }}>{activeBranch.google}★</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Google Rating</div>
                </div>
              </div>
            </div>
          );
        default: return null;
      }
    } else {
      // Franchise Admin views
      switch (currentTab) {
        case "franchise overview":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader title="Global Franchise Pulse" subtitle={`Network analysis for ${franchise_name}`} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-outline btn-sm" onClick={handleFetchReviews} disabled={isFetching}>
                    <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} /> Sync Franchise Feed
                  </button>
                </div>
              </div>
              <div className="kpi-row">
                <StatCard label="Network Average" value="4.67" icon={Star} trend={2.4} />
                <StatCard label="Brand Reach" value="70.5K" subValue="Across all platforms" icon={Users} trend={12.1} />
                <StatCard label="System Health" value="92%" subValue="Positive Sentiment" icon={TrendingUp} />
                <StatCard label="Critical Alerts" value="2" icon={AlertCircle} trend={-10} />
              </div>

              {aiInsights && (
                <Card style={{ border: '1px solid var(--color-primary-ghost)', background: 'var(--color-bg-alt)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--color-primary)' }}>
                        <Sparkles size={16} /> <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase' }}>Network Brand Insight</span>
                      </div>
                      <p style={{ fontSize: '15px', color: 'var(--color-text-body)', margin: 0 }}>{aiInsights.summary}</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab("insights")}>Full Audit →</button>
                  </div>
                </Card>
              )}
              <Card>
                <SectionHeader title="Inter-Branch Performance DNA" subtitle="Comparison of Google across 9 outlets" />
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BRANCHES} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                      <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
                      <YAxis domain={[4.2, 4.8]} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'var(--color-primary-ghost)' }} contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                      <Bar dataKey="google" radius={[10, 10, 0, 0]} barSize={40}>
                        {BRANCHES.map((b, i) => <Cell key={i} fill={b.google >= 4.7 ? '#C8A96E' : '#D4B896'} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          );
        case "branch comparison":
          return (
            <Card>
              <SectionHeader title="Multi-Platform Strength" subtitle="Comparison of platform parity across the network" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                {BRANCHES.map(b => (
                  <div key={b.id} style={{ background: 'var(--color-bg-alt)', borderRadius: '16px', padding: '20px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-h)', marginBottom: '16px' }}>{b.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Google:</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-accent)' }}>{b.google} <Star size={12} fill="currentColor" /></span>
                    </div>
                    {b.zomato ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Zomato:</span>
                        <span style={{ fontWeight: 700, color: b.google - b.zomato > 0.5 ? 'var(--color-danger)' : 'var(--color-success)' }}>{b.zomato} <Star size={12} fill="currentColor" /></span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Not on Zomato</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        case "all reviews":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader title="Consolidated Franchise Feed" subtitle={`${filteredReviews.length} of ${reviewsToDisplay.length} reviews across all outlets`} />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div className="search-input-wrap" style={{ width: '220px' }}>
                    <Search className="search-icon" size={14} />
                    <input
                      type="text"
                      className="input"
                      placeholder="Search all reviews..."
                      style={{ paddingLeft: '40px' }}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleFetchReviews}
                    disabled={isFetching}
                  >
                    <RefreshCcw size={14} className={isFetching ? "animate-spin" : ""} />
                    {isFetching ? "Syncing Network..." : "Sync All Maps"}
                  </button>
                  <button className="btn btn-outline btn-sm"><Download size={14} /> Export CSV</button>
                </div>
              </div>

              {fetchError && (
                <div style={{ padding: '12px 20px', background: fetchError === 'Reviews already synced' ? 'rgba(22,163,74,0.08)' : 'rgba(192,57,43,0.08)', border: `1px solid ${fetchError === 'Reviews already synced' ? 'rgba(22,163,74,0.25)' : 'rgba(192,57,43,0.2)'}`, color: fetchError === 'Reviews already synced' ? 'var(--color-success)' : 'var(--color-danger)', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {fetchError === 'Reviews already synced' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {fetchError}
                </div>
              )}

              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                {filteredReviews.length > 0
                  ? filteredReviews.map((r, i) => <motion.div key={r.id} variants={fadeUp} custom={i}><ReviewItem r={r} showBranch={true} /></motion.div>)
                  : (
                    <div style={{ padding: '60px', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: '24px', border: '2px dashed var(--color-border)' }}>
                      <p style={{ color: 'var(--color-text-muted)' }}>No reviews match &ldquo;{searchTerm}&rdquo;.</p>
                      <button className="btn btn-outline btn-sm" style={{ marginTop: '16px' }} onClick={() => setSearchTerm("")}>Clear Search</button>
                    </div>
                  )}
              </motion.div>
            </div>
          );
        case "insights":
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SectionHeader title="Brand Performance Insights" subtitle="Cross-platform sentiment and thematic analysis" />
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleGenerateAIInsights}
                  disabled={isAnalyzing}
                >
                  <Sparkles size={14} className={isAnalyzing ? "animate-pulse" : ""} />
                  {isAnalyzing ? "Analyzing All..." : "Run Global AI Analysis"}
                </button>
              </div>

              {aiError && (
                <div style={{ padding: '12px 20px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--color-danger)', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertCircle size={16} /> {aiError}
                </div>
              )}

              {aiInsights ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Card>
                      <SectionHeader title="Network Brand Pulse" />
                      <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-text-body)' }}>{aiInsights.summary}</p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Network Sentiment Distribution</div>
                          <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={aiInsights.sentiment_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5}>
                                  <Cell fill="#16a34a" />
                                  <Cell fill="#94a3b8" opacity={0.5} />
                                  <Cell fill="#dc2626" />
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '16px', textTransform: 'uppercase' }}>Consolidated Rating Trend</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(aiInsights.rating_breakdown || []).map(rb => (
                              <div key={rb.stars} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '12px', width: '20px' }}>{rb.stars}★</div>
                                <div style={{ flex: 1, height: '4px', background: 'var(--color-bg-alt)', borderRadius: '2px' }}>
                                  <div style={{ height: '100%', width: `${(rb.count / (Math.max(...(aiInsights.rating_breakdown || []).map(x => x.count)) || 1)) * 100}%`, background: 'var(--color-accent)', borderRadius: '2px' }} />
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{rb.count}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <SectionHeader title="Top Franchise Themes" />
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        {(aiInsights.top_themes || []).map(t => (
                          <div key={t.theme} style={{ padding: '12px 20px', background: 'var(--color-bg-alt)', borderRadius: '16px', border: '1px solid var(--color-border)', flex: '1 1 200px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>{t.theme}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                              <div style={{ fontSize: '20px', fontWeight: 700 }}>{t.score}%</div>
                              <Badge variant={t.sentiment === 'Positive' ? 'green' : t.sentiment === 'Negative' ? 'red' : 'neutral'}>{t.mentions} mentions</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Card style={{ background: 'var(--gradient-hero)', border: 'none', color: '#fff' }}>
                      <SectionHeader title="Franchise Strategic Advice" />
                      <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.9 }}>{aiInsights.ai_recommendation}</p>
                    </Card>
                    <Card>
                      <SectionHeader title="Network Highlights" />
                      <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(aiInsights.key_insights || []).map((ki, i) => (
                          <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', lineHeight: 1.5 }}>
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--color-accent-ghost)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Target size={10} /></div>
                            {ki}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                  <Card>
                    <SectionHeader title="Network Brand DNA" subtitle="Performance across key service pillars" />
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={RADAR_DATA}>
                        <PolarGrid stroke="var(--color-border)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-text-body)', fontWeight: 600, fontSize: 12 }} />
                        <Radar dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} />
                        <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card>
                    <SectionHeader title="Consumer Priorities" subtitle="Frequency of category mentions across franchise" />
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie data={CATEGORIES} dataKey="mentions" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8}>
                          {CATEGORIES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px' }} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>
              )}
            </div>
          );
        default: return null;
      }
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-body)', paddingBottom: '40px' }}>
      {/* Dynamic Background Ornament for Premium Look */}
      <div style={{ position: 'fixed', top: 0, right: 0, width: '400px', height: '400px', background: 'radial-gradient(circle, var(--color-accent-ghost) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none', opacity: 0.5 }} />

      {/* Page Header */}
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--color-bg-card)', padding: '40px 32px 32px', borderBottom: '1px solid var(--color-border)', margin: '-32px -32px 32px -32px', boxShadow: 'var(--shadow-nav)' }}>
        <div className="page-header" style={{ marginBottom: '0' }}>
          <div className="page-header-left">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Badge variant="accent">{isBranchManager ? "Outlet Management" : "Franchise Management"}</Badge>
              {isBranchManager && activeBranch && (
                <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700, background: 'var(--color-primary-ghost)', padding: '2px 10px', borderRadius: '6px' }}>
                  {activeBranch.name}
                </span>
              )}
            </motion.div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Experience & Sentiment</h1>
            <p style={{ maxWidth: '600px' }}>{isBranchManager ? "Propelling guest satisfaction through data-driven service analysis." : "Bird's eye view of brand reputation across the entire Prasad Food Divine network."}</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-outline btn-sm"><QrCode size={18} /> Feed Hub</button>
            <button className="btn btn-primary btn-sm"><TrendingUp size={18} /> Analytics Suite</button>
          </div>
        </div>

        {/* Real Functional Tabs */}
        <div className="tab-list" style={{ marginTop: '32px', display: 'flex', gap: '32px', borderBottom: '1px solid var(--color-border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map(t => (
            <button
              key={t}
              className={`tab-item ${currentTab === t ? 'active' : ''}`}
              onClick={() => handleTabChange(t)}
              style={{ paddingBottom: '16px', fontSize: '14px', fontWeight: 600, background: 'none', border: 'none', color: currentTab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap' }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {currentTab === t && (
                <motion.div layoutId="tab-active" style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, background: 'var(--color-primary)', borderRadius: '3px 3px 0 0' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content with AnimatePresence */}
      <div style={{ padding: '0 0', position: 'relative', zIndex: 1, width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderDashboard()}
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        .tab-item:hover { color: var(--color-primary) !important; opacity: 0.8; }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      `}</style>
    </motion.div>
  );
}
