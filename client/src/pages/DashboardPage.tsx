import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SthavyaBrandLogo from "../components/SthavyaBrandLogo";
import { getCurrentUser, signOutUser, type SthavyaUser } from "../services/auth";
import { housePlanApi } from "../services/api";
import { downloadBlueprintAsPdf, getBlueprintPdfFilename } from "../services/blueprintPdfService";
import { HOUSE_PLANS_DATA, type HousePlan } from "../data/housePlansData";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SthavyaUser | null>(getCurrentUser());
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await housePlanApi.getAll();
      if (res?.success && Array.isArray(res.plans)) {
        // If user has saved plans in MongoDB, use them
        setPlans(res.plans);
      } else {
        // If brand new user with no MongoDB plans, fallback to starter catalog sample
        setPlans([HOUSE_PLANS_DATA[0]]);
      }
    } catch (err) {
      console.error("Failed to load user plans from MongoDB:", err);
      // Fallback
      setPlans([HOUSE_PLANS_DATA[0]]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchPlans();
  }, []);

  const handleLogout = async () => {
    await signOutUser();
    navigate("/login", { replace: true });
  };

  const handleDeletePlan = async (planId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(planId);
    try {
      await housePlanApi.delete(planId);
      setPlans((prev) => prev.filter((p) => (p._id || p.id || p.planId) !== planId));
      showToast(`Plan "${title}" deleted.`);
    } catch (err: any) {
      console.error("Delete plan error:", err);
      // If error (or sample demo plan), remove from local view
      setPlans((prev) => prev.filter((p) => (p._id || p.id || p.planId) !== planId));
      showToast(`Removed "${title}".`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async (plan: any) => {
    const id = plan._id || plan.id || plan.planId;
    setDownloadingId(id);
    showToast(`Generating A3 vector PDF for "${plan.title || plan.name}"...`);

    try {
      await downloadBlueprintAsPdf({ plan, theme: "vellum" });
      const filename = getBlueprintPdfFilename(plan);
      showToast(`✓ Downloaded ${filename}`);
    } catch (err) {
      console.error("PDF generation error:", err);
      showToast("⚠ Failed to generate PDF blueprint.");
    } finally {
      setDownloadingId(null);
    }
  };

  const userName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "Architect");

  return (
    <div className="min-h-screen bg-[#F6F3ED] text-[#181614] selection:bg-[#B88555] selection:text-white flex flex-col">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-[#181614] text-white text-xs font-semibold shadow-2xl flex items-center gap-2 border border-white/20 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[rgba(24,22,20,0.08)] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            <SthavyaBrandLogo size="md" showTagline={true} />
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-[#181614]">{userName}</span>
              <span className="text-[10px] font-mono text-[#8C827A]">{user?.email || user?.mobile}</span>
            </div>

            <Link
              to="/plan/new"
              className="px-4 py-2 rounded-full bg-[#B88555] hover:bg-[#A07144] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              + Create New Plan
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#EFECE6] text-[#181614] text-xs font-semibold border border-[#181614]/15 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#181614] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#C9A675] text-xs font-mono uppercase tracking-widest">
              <span>✦</span>
              <span>Client Architecture Workspace</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Hello, {userName}
            </h1>
            <p className="text-sm text-white/70 font-sans leading-relaxed">
              Welcome to your STHAVYA planning dashboard. Manage your saved architectural blueprints, review AI audits, or initiate a new 1–4 BHK custom home design tailored to your plot.
            </p>
            <div className="pt-2">
              <Link
                to="/plan/new"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#B88555] hover:bg-[#A07144] text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
              >
                <span>Create New Plan</span>
                <span>➔</span>
              </Link>
            </div>
          </div>

          <div className="absolute right-6 -bottom-8 opacity-10 hidden lg:block pointer-events-none">
            <img src="/sthavya-logo.png" alt="" className="w-80 h-80 object-contain" />
          </div>
        </div>

        {/* Saved Plans Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#181614]">
                Your Saved Blueprints
              </h2>
              <p className="text-xs text-[#7A7268] font-sans">
                Review 2D CAD layouts, 3D views, and vector PDF exports
              </p>
            </div>

            <Link
              to="/plan/new"
              className="self-start sm:self-auto text-xs font-mono font-bold uppercase tracking-wider text-[#B88555] hover:underline"
            >
              + Launch Requirements Wizard
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-64 rounded-2xl bg-white border border-[#181614]/8 animate-pulse p-6 space-y-4"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-28 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#181614]/10 shadow-sm space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FAF8F5] border border-[#181614]/10 flex items-center justify-center text-3xl">
                📐
              </div>
              <h3 className="font-serif font-bold text-xl text-[#181614]">
                No Plans Created Yet
              </h3>
              <p className="text-xs text-[#575149] leading-relaxed">
                You haven't generated any floor plans yet. Use our 5-step Requirements Wizard to generate your first custom blueprint in under a minute.
              </p>
              <Link
                to="/plan/new"
                className="inline-block px-6 py-3 rounded-full bg-[#181614] hover:bg-[#B88555] text-white text-xs font-bold uppercase tracking-widest transition-all"
              >
                Create Your First Plan ➔
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const planId = plan._id || plan.id || plan.planId || "default";
                const title = plan.title || plan.name || "Architectural Floor Plan";
                const bhk = plan.inputs?.bhk || plan.bhk || "3 BHK";
                const width = plan.inputs?.width || plan.plotDimensions?.widthFt || 30;
                const depth = plan.inputs?.depth || plan.plotDimensions?.lengthFt || 45;
                const facing = plan.inputs?.facing || plan.facing || "East";
                const style = plan.inputs?.style || plan.designStyle || "Modern";
                const sqFt = plan.totalSqFt || plan.plotSizeSqFt || width * depth;

                return (
                  <div
                    key={planId}
                    className="bg-white rounded-2xl border border-[#181614]/10 hover:border-[#B88555]/50 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                  >
                    {/* Header */}
                    <div className="p-5 pb-3 border-b border-[#181614]/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#EAE5DC] text-[#8C6239] text-[10px] font-mono font-bold uppercase">
                          {bhk}
                        </span>
                        <span className="text-[11px] font-mono text-[#7A7268]">
                          {facing} Facing
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#181614] line-clamp-1 group-hover:text-[#B88555] transition-colors">
                        {title}
                      </h3>
                      <p className="text-xs text-[#575149] font-mono">
                        {width}' × {depth}' • {sqFt} Sq Ft • {style}
                      </p>
                    </div>

                    {/* Quick Specs */}
                    <div className="p-5 flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#181614]/5">
                          <p className="text-[10px] text-[#7A7268] font-mono">EN-SUITE</p>
                          <p className="font-bold text-[#181614]">100% Private</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#181614]/5">
                          <p className="text-[10px] text-[#7A7268] font-mono">CAD FORMAT</p>
                          <p className="font-bold text-[#181614]">A3 Vector PDF</p>
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-[#8C827A] flex items-center justify-between font-mono">
                        <span>Created: {new Date(plan.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="text-emerald-700 font-semibold">Ready for Build</span>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-4 bg-[#FAF8F5] border-t border-[#181614]/5 grid grid-cols-3 gap-2 text-xs font-semibold">
                      <Link
                        to={`/plan/${planId}`}
                        className="py-2.5 text-center rounded-xl bg-[#181614] hover:bg-[#B88555] text-white transition-colors"
                      >
                        Open
                      </Link>

                      <button
                        onClick={() => handleDownloadPdf(plan)}
                        disabled={downloadingId === planId}
                        className="py-2.5 rounded-xl bg-white hover:bg-[#EFECE6] text-[#181614] border border-[#181614]/15 transition-colors disabled:opacity-50"
                      >
                        {downloadingId === planId ? "Exporting..." : "PDF"}
                      </button>

                      <button
                        onClick={() => handleDeletePlan(planId, title)}
                        disabled={deletingId === planId}
                        className="py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 transition-colors disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
