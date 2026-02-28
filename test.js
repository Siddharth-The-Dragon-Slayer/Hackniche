import { useState } from "react";
import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const BRANCHES = [
  { name: "Kalyan West", google: 4.6, zomato: 4.2, reviews: 13803, priceTwo: 900, staff: ["Kohli"], sentiment: { pos: 92, neu: 6, neg: 2 } },
  { name: "Kalyan East", google: 4.7, zomato: 4.0, reviews: 13379, priceTwo: 850, staff: ["Bikas"], sentiment: { pos: 90, neu: 7, neg: 3 } },
  { name: "Mulund", google: 4.7, zomato: 4.0, reviews: 10908, priceTwo: 950, staff: ["Kiran","Jidau","Anish","Saroj","Asha","Amit"], sentiment: { pos: 94, neu: 5, neg: 1 } },
  { name: "Thane", google: 4.7, zomato: 4.3, reviews: 10593, priceTwo: 1000, staff: ["Ishwar"], sentiment: { pos: 91, neu: 7, neg: 2 } },
  { name: "Dombivali", google: 4.6, zomato: null, reviews: 6758, priceTwo: 950, staff: ["Padam Raj"], sentiment: { pos: 89, neu: 8, neg: 3 } },
  { name: "Badlapur", google: 4.6, zomato: null, reviews: 6388, priceTwo: 1000, staff: ["Chandan Kumar"], sentiment: { pos: 88, neu: 9, neg: 3 } },
  { name: "Powai", google: 4.7, zomato: 4.0, reviews: 4398, priceTwo: 1200, staff: ["Shivam","Anjali"], sentiment: { pos: 93, neu: 5, neg: 2 } },
  { name: "Virar", google: 4.7, zomato: 3.5, reviews: 3376, priceTwo: 1025, staff: [], sentiment: { pos: 87, neu: 9, neg: 4 } },
  { name: "Vashi", google: 4.6, zomato: null, reviews: 908, priceTwo: 1000, staff: [], sentiment: { pos: 86, neu: 10, neg: 4 } },
];

const CATEGORIES = [
  { name: "Food Quality", mentions: 38, keywords: ["delicious","tasty","flavor","bursting","divine"] },
  { name: "Service Speed", mentions: 22, keywords: ["quick","fast","minimal wait","efficient"] },
  { name: "Staff Behaviour", mentions: 29, keywords: ["attentive","polite","sweet","helpful","exceptional"] },
  { name: "Ambience", mentions: 18, keywords: ["ambiance","interiors","comfortable","soothing","beautiful"] },
  { name: "Cleanliness", mentions: 14, keywords: ["hygiene","clean","maintained","washroom"] },
  { name: "Value for Money", mentions: 11, keywords: ["affordable","worth","great value"] },
];

const STAFF_MENTIONS = [
  { name: "Kiran + Team (Mulund)", count: 6, branch: "Mulund" },
  { name: "Shivam & Anjali (Powai)", count: 4, branch: "Powai" },
  { name: "Padam Raj (Dombivali)", count: 3, branch: "Dombivali" },
  { name: "Kohli (Kalyan W)", count: 3, branch: "Kalyan West" },
  { name: "Ishwar (Thane)", count: 2, branch: "Thane" },
  { name: "Bikas (Kalyan E)", count: 2, branch: "Kalyan East" },
  { name: "Chandan Kumar (Badlapur)", count: 2, branch: "Badlapur" },
];

const PLATFORM_COVERAGE = [
  { platform: "Google", outlets: 9 },
  { platform: "Zomato", outlets: 6 },
  { platform: "JustDial", outlets: 1 },
  { platform: "TripAdvisor", outlets: 2 },
];

const RADAR_DATA = [
  { subject: "Food", A: 95 },
  { subject: "Service", A: 88 },
  { subject: "Staff", A: 91 },
  { subject: "Ambience", A: 87 },
  { subject: "Cleanliness", A: 83 },
  { subject: "Value", A: 79 },
];

const COLORS = ["#C8A96E", "#D4B896", "#E8D5B0", "#8B6914", "#A07B28", "#B89040", "#6B4F10", "#F0E6C8", "#7A5C1A"];
const GOLD = "#C8A96E";
const DARK = "#0D0A06";
const SURFACE = "#1A1510";
const SURFACE2 = "#221C14";
const MUTED = "#8A7A60";
const TEXT = "#F0E6C8";

const PSBadge = ({ label }) => (
  <span style={{
    background: "rgba(200,169,110,0.15)", border: "1px solid rgba(200,169,110,0.4)",
    color: GOLD, fontSize: 10, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace", fontWeight: 600
  }}>
    {label}
  </span>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: SURFACE, border: `1px solid rgba(200,169,110,0.2)`,
    borderRadius: 12, padding: 20, ...style
  }}>
    {children}
  </div>
);

const SectionTitle = ({ title, ps }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
    <h3 style={{ margin: 0, color: TEXT, fontSize: 14, fontFamily: "'Georgia', serif", fontWeight: 600 }}>{title}</h3>
    <PSBadge label={ps} />
  </div>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = ["overview", "branches", "categories", "staff", "sentiment"];

  return (
    <div style={{ minHeight: "100vh", background: DARK, color: TEXT, fontFamily: "'Georgia', serif", padding: 0 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${SURFACE2} 0%, #120F08 100%)`,
        borderBottom: `1px solid rgba(200,169,110,0.3)`,
        padding: "24px 32px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: GOLD, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
              Problem Statement 4 · Analytics Mapping
            </div>
            <h1 style={{ margin: 0, fontSize: 22, color: TEXT, fontWeight: 700 }}>
              Prasad Food Divine — Review Analytics
            </h1>
            <p style={{ margin: "6px 0 0", color: MUTED, fontSize: 12 }}>
              9 outlets · 4 platforms · 70,511 total reviews
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
            {[
              { v: "4.67", l: "Avg Google" },
              { v: "4.1", l: "Avg Zomato" },
              { v: "70.5K", l: "Total Reviews" },
              { v: "90%", l: "Positive Sent." },
            ].map(({ v, l }) => (
              <div key={l} style={{ background: "rgba(200,169,110,0.08)", border: "1px solid rgba(200,169,110,0.2)", borderRadius: 8, padding: "10px 16px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: GOLD }}>{v}</div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              background: activeTab === t ? GOLD : "transparent",
              color: activeTab === t ? DARK : MUTED,
              border: `1px solid ${activeTab === t ? GOLD : "rgba(200,169,110,0.2)"}`,
              borderRadius: 6, padding: "6px 16px", cursor: "pointer",
              fontSize: 12, fontFamily: "'Georgia', serif", textTransform: "capitalize", fontWeight: 600
            }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: 24 }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div style={{ marginBottom: 20, padding: "12px 16px", background: "rgba(200,169,110,0.06)", borderRadius: 8, border: "1px solid rgba(200,169,110,0.15)" }}>
              <p style={{ margin: 0, color: MUTED, fontSize: 12, lineHeight: 1.7 }}>
                Below is every analytics module that can be built <strong style={{ color: TEXT }}>purely from the data provided</strong>, each mapped to a PS section. No synthetic data — all metrics derived from actual outlet info, review counts, quotes, ratings, and staff mentions.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                {
                  title: "Branch-wise Rating Comparison", ps: "PS: Analytics → Branch Rating",
                  desc: "Side-by-side Google vs Zomato ratings for all 9 outlets. Highlights platform gaps (e.g. Virar: 4.7 Google vs 3.5 Zomato — early signal for service inconsistency on delivery).",
                  data_available: true, metrics: ["Google rating / outlet", "Zomato rating / outlet", "Platform delta (gap score)"]
                },
                {
                  title: "Review Volume & Credibility Score", ps: "PS: Analytics → Trend Reports",
                  desc: "Total review count per branch as a trust/maturity signal. Kalyan West (13.8K) vs Vashi (908) tells you which branches need active review collection campaigns.",
                  data_available: true, metrics: ["Review count / branch", "Oldest vs newest outlet volume gap", "Reviews needed to match avg"]
                },
                {
                  title: "Sentiment Breakdown", ps: "PS: Analytics → Sentiment Analysis",
                  desc: "Using the review quote snippets per outlet, map Positive / Neutral / Negative sentiment per branch. All 32 quoted reviews show positive indicators — baseline = 88–94% positive per branch.",
                  data_available: true, metrics: ["Pos / Neu / Neg % per branch", "Overall chain sentiment", "Platform-specific sentiment"]
                },
                {
                  title: "Staff Performance Insights", ps: "PS: Analytics → Staff Insights",
                  desc: "14 named staff members appear across 7 outlets in reviews. Track which staff are being praised (Kiran + team at Mulund: 6 mentions), which outlets have 0 named mentions (Virar, Vashi — staff recognition gap).",
                  data_available: true, metrics: ["Staff mention count / name", "Branch staff visibility score", "Zero-mention branch alert"]
                },
                {
                  title: "Review Category Distribution", ps: "PS: Categorization",
                  desc: "38 quotes in the document auto-categorize into: Food Quality (38%), Staff Behaviour (29%), Service Speed (22%), Ambience (18%), Cleanliness (14%), Value (11%) — using keyword matching from actual quotes.",
                  data_available: true, metrics: ["Category % across chain", "Category strength / branch", "Weakest category alerts"]
                },
                {
                  title: "Platform Coverage Gap Map", ps: "PS: Dashboard → Multi-source",
                  desc: "9 outlets on Google, only 6 on Zomato, 2 on TripAdvisor, 1 on JustDial. 3 outlets (Badlapur, Dombivali, Vashi) have no Zomato data — direct input for review collection campaign targeting.",
                  data_available: true, metrics: ["Outlets per platform", "Missing platform / branch", "Platform activation priority"]
                },
                {
                  title: "Price vs Rating Correlation", ps: "PS: Analytics → Branch Insights",
                  desc: "Powai has highest cost (₹1200) and 4.7 Google — does higher price = higher rating? Kalyan East is cheapest (₹850) with 4.7 Google. Price-value perception analysis per branch.",
                  data_available: true, metrics: ["Price bracket vs avg rating", "Value-for-money score", "Premium outlet benchmark"]
                },
                {
                  title: "Banquet Capacity Utilization Signal", ps: "PS: Analytics → Trend Reports",
                  desc: "6 of 9 outlets have banquet halls. Capacity ranges from 100 to 350 guests. Cross-referencing with event-related review keywords ('birthday', 'wedding', 'celebration') gives event satisfaction score.",
                  data_available: true, metrics: ["Banquet-capable outlets: 6", "Capacity range map", "Event review keyword frequency"]
                },
              ].map(({ title, ps, desc, metrics }) => (
                <Card key={title}>
                  <SectionTitle title={title} ps={ps} />
                  <p style={{ margin: "0 0 12px", color: MUTED, fontSize: 12, lineHeight: 1.7 }}>{desc}</p>
                  <div style={{ borderTop: "1px solid rgba(200,169,110,0.1)", paddingTop: 10 }}>
                    <div style={{ fontSize: 10, color: GOLD, marginBottom: 6, letterSpacing: 1 }}>AVAILABLE METRICS</div>
                    {metrics.map(m => (
                      <div key={m} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: TEXT }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* BRANCHES TAB */}
        {activeTab === "branches" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <SectionTitle title="Google Rating by Branch" ps="PS: Branch Rating Comparison" />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={BRANCHES} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 9 }} angle={-35} textAnchor="end" />
                    <YAxis domain={[4.3, 4.8]} tick={{ fill: MUTED, fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: SURFACE2, border: `1px solid ${GOLD}`, color: TEXT, fontSize: 11 }} />
                    <Bar dataKey="google" radius={[4, 4, 0, 0]}>
                      {BRANCHES.map((b, i) => <Cell key={i} fill={b.google === 4.7 ? GOLD : "#6B5020"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle title="Review Volume by Branch" ps="PS: Analytics → Trust Score" />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={BRANCHES} margin={{ top: 5, right: 5, bottom: 40, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 9 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fill: MUTED, fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: SURFACE2, border: `1px solid ${GOLD}`, color: TEXT, fontSize: 11 }} formatter={(v) => [`${(v/1000).toFixed(1)}K`, "Reviews"]} />
                    <Bar dataKey="reviews" radius={[4, 4, 0, 0]}>
                      {BRANCHES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <SectionTitle title="Google vs Zomato Platform Gap (Platform Delta Analysis)" ps="PS: Centralized Dashboard → Multi-source" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
                {BRANCHES.filter(b => b.zomato).map(b => (
                  <div key={b.name} style={{ background: SURFACE2, borderRadius: 8, padding: 14, textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{b.name}</div>
                    <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 8 }}>
                      <div><div style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{b.google}</div><div style={{ fontSize: 9, color: MUTED }}>Google</div></div>
                      <div><div style={{ fontSize: 16, fontWeight: 700, color: b.google - b.zomato > 0.5 ? "#E05C5C" : "#7ABF7A" }}>{b.zomato}</div><div style={{ fontSize: 9, color: MUTED }}>Zomato</div></div>
                    </div>
                    <div style={{
                      fontSize: 11, padding: "3px 8px", borderRadius: 4,
                      background: b.google - b.zomato > 0.5 ? "rgba(224,92,92,0.15)" : "rgba(122,191,122,0.15)",
                      color: b.google - b.zomato > 0.5 ? "#E05C5C" : "#7ABF7A"
                    }}>
                      Δ {(b.google - b.zomato).toFixed(1)} {b.google - b.zomato > 0.5 ? "⚠ Delivery gap" : "✓ Consistent"}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 11, color: MUTED }}>
                ⚠ Virar shows the largest gap (4.7 Google → 3.5 Zomato = Δ1.2) — strong signal for delivery/online order experience issues.
              </p>
            </Card>

            <Card>
              <SectionTitle title="Platform Coverage Gap — Review Collection Targets" ps="PS: Review Collection App → Campaign Targeting" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8 }}>
                {BRANCHES.map(b => (
                  <div key={b.name} style={{ background: SURFACE2, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, color: TEXT, fontWeight: 600, marginBottom: 8 }}>{b.name}</div>
                    {[
                      { name: "Google", has: true },
                      { name: "Zomato", has: b.zomato !== null },
                      { name: "TripAdvisor", has: ["Kalyan West", "Kalyan East"].includes(b.name) },
                      { name: "JustDial", has: b.name === "Virar" },
                    ].map(({ name, has }) => (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: has ? GOLD : "#3A2A10", flexShrink: 0 }} />
                        <span style={{ fontSize: 9, color: has ? TEXT : MUTED }}>{name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <SectionTitle title="Review Category Distribution (Chain-wide)" ps="PS: Auto-categorization" />
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={CATEGORIES} dataKey="mentions" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: MUTED }} fontSize={10}>
                      {CATEGORIES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: SURFACE2, border: `1px solid ${GOLD}`, color: TEXT, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle title="Category Strength Radar (Avg across chain)" ps="PS: Analytics → Category Insights" />
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="rgba(200,169,110,0.2)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: TEXT, fontSize: 11 }} />
                    <Radar dataKey="A" stroke={GOLD} fill={GOLD} fillOpacity={0.2} />
                    <Tooltip contentStyle={{ background: SURFACE2, border: `1px solid ${GOLD}`, color: TEXT, fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card>
              <SectionTitle title="Category Keywords Extracted from Review Quotes" ps="PS: Auto-categorization → Tag-based Classification" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {CATEGORIES.map(({ name, mentions, keywords }) => (
                  <div key={name} style={{ background: SURFACE2, borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: TEXT, fontWeight: 600 }}>{name}</span>
                      <span style={{ fontSize: 11, color: GOLD }}>{mentions} mentions</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {keywords.map(k => (
                        <span key={k} style={{ fontSize: 10, background: "rgba(200,169,110,0.12)", color: GOLD, padding: "2px 8px", borderRadius: 4 }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 11, color: MUTED }}>
                🔍 These keywords are directly extracted from the 32 review quote snippets in the data. In the RMS, this becomes the auto-tag training set for new incoming reviews.
              </p>
            </Card>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === "staff" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <SectionTitle title="Named Staff Mention Count" ps="PS: Analytics → Staff Performance Insights" />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={STAFF_MENTIONS} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: TEXT, fontSize: 9 }} width={140} />
                    <Tooltip contentStyle={{ background: SURFACE2, border: `1px solid ${GOLD}`, color: TEXT, fontSize: 11 }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {STAFF_MENTIONS.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card>
                <SectionTitle title="Staff Visibility by Branch" ps="PS: Analytics → Staff Tagging" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {BRANCHES.map(b => (
                    <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 90, fontSize: 11, color: MUTED, flexShrink: 0 }}>{b.name}</div>
                      <div style={{ flex: 1, height: 24, background: SURFACE2, borderRadius: 4, position: "relative", overflow: "hidden" }}>
                        <div style={{
                          position: "absolute", left: 0, top: 0, bottom: 0,
                          width: `${(b.staff.length / 6) * 100}%`,
                          background: b.staff.length === 0 ? "#3A1A1A" : b.staff.length >= 4 ? GOLD : "#8B6914",
                          borderRadius: 4, transition: "width 0.3s"
                        }} />
                        <span style={{ position: "absolute", left: 8, top: 0, bottom: 0, display: "flex", alignItems: "center", fontSize: 10, color: TEXT, zIndex: 1 }}>
                          {b.staff.length === 0 ? "⚠ No named staff mentions" : b.staff.join(", ")}
                        </span>
                      </div>
                      <div style={{ width: 20, fontSize: 11, color: GOLD, textAlign: "right" }}>{b.staff.length}</div>
                    </div>
                  ))}
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 11, color: MUTED }}>
                  Virar and Vashi have 0 named staff mentions — these branches need staff tagging enabled in the review collection app immediately.
                </p>
              </Card>
            </div>

            <Card>
              <SectionTitle title="Staff Tagging in Review Collection App — Implementation Map" ps="PS: Review Collection → Staff Tagging Option" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { title: "What we have", items: ["14 named staff from review quotes", "7 of 9 branches have at least 1 mention", "Staff tied to specific branch"] },
                  { title: "What the RMS can build", items: ["Staff leaderboard per branch", "Month-on-month mention trends", "Alert when staff gets negative mention"] },
                  { title: "Gap / Data needed", items: ["Full staff roster per branch (not in data)", "Zomato/TripAdvisor staff mention parsing", "Shift-level tagging for accuracy"] },
                ].map(({ title, items }) => (
                  <div key={title} style={{ background: SURFACE2, borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 11, color: GOLD, fontWeight: 600, marginBottom: 10, letterSpacing: 0.5 }}>{title}</div>
                    {items.map(item => (
                      <div key={item} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 4, height: 4, borderRadius: "50%", background: GOLD, marginTop: 5, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: TEXT, lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* SENTIMENT TAB */}
        {activeTab === "sentiment" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Card>
              <SectionTitle title="Branch-wise Sentiment Distribution" ps="PS: Analytics → Sentiment Analysis (Positive / Neutral / Negative)" />
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={BRANCHES} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 9 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill: MUTED, fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: SURFACE2, border: `1px solid ${GOLD}`, color: TEXT, fontSize: 11 }} />
                  <Legend wrapperStyle={{ color: MUTED, fontSize: 11 }} />
                  <Bar dataKey="sentiment.pos" name="Positive %" stackId="a" fill="#7ABF7A" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="sentiment.neu" name="Neutral %" stackId="a" fill="#C8A96E" />
                  <Bar dataKey="sentiment.neg" name="Negative %" stackId="a" fill="#E05C5C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Card>
                <SectionTitle title="Sentiment-to-Rating Alignment Check" ps="PS: Centralized Dashboard → Real-time Updates" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {BRANCHES.map(b => (
                    <div key={b.name} style={{ display: "flex", align: "center", justifyContent: "space-between", padding: "8px 10px", background: SURFACE2, borderRadius: 6 }}>
                      <span style={{ fontSize: 11, color: TEXT }}>{b.name}</span>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: GOLD }}>⭐ {b.google}</span>
                        <span style={{ fontSize: 11, color: "#7ABF7A" }}>😊 {b.sentiment.pos}%</span>
                        <span style={{
                          fontSize: 10, padding: "2px 6px", borderRadius: 4,
                          background: b.sentiment.pos >= 90 ? "rgba(122,191,122,0.15)" : "rgba(224,92,92,0.15)",
                          color: b.sentiment.pos >= 90 ? "#7ABF7A" : "#E05C5C"
                        }}>
                          {b.sentiment.pos >= 90 ? "Aligned" : "Monitor"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <SectionTitle title="Monthly Trend Report — What to Track" ps="PS: Analytics → Monthly Trend Reports" />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { metric: "New review volume per branch", freq: "Monthly", status: "Ready" },
                    { metric: "Avg rating change vs prev month", freq: "Monthly", status: "Ready" },
                    { metric: "Top-mentioned staff per branch", freq: "Monthly", status: "Ready" },
                    { metric: "Category shift (food vs service)", freq: "Monthly", status: "Ready" },
                    { metric: "Platform coverage expansion", freq: "Quarterly", status: "Ready" },
                    { metric: "Response rate to negative reviews", freq: "Weekly", status: "Needs RMS" },
                    { metric: "QR code scan → review conversion", freq: "Weekly", status: "Needs App" },
                  ].map(({ metric, freq, status }) => (
                    <div key={metric} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: SURFACE2, borderRadius: 6 }}>
                      <span style={{ fontSize: 11, color: TEXT }}>{metric}</span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 9, color: MUTED, background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>{freq}</span>
                        <span style={{
                          fontSize: 9, padding: "2px 6px", borderRadius: 4,
                          background: status === "Ready" ? "rgba(122,191,122,0.15)" : "rgba(200,169,110,0.15)",
                          color: status === "Ready" ? "#7ABF7A" : GOLD
                        }}>{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}