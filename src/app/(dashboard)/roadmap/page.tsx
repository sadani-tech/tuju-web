"use client";
import { useEffect, useState, useCallback } from "react";
import { roadmapApi } from "@/lib/api";
import type { RoadmapResponse } from "@/types";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "@/components/ui/Toast";
import { showPointsGain } from "@/components/gamification/PointsToast";
import { usePointsStore } from "@/store/pointsStore";
import { LayerSection } from "@/components/roadmap/LayerSection";

const MILESTONE_TYPES = [
  { value: "daftar_kuliah",  label: "Daftar kuliah"   },
  { value: "mulai_karier",   label: "Dapat pekerjaan" },
  { value: "ikut_komunitas", label: "Ikut komunitas"  },
  { value: "mulai_kursus",   label: "Mulai kursus"    },
  { value: "lainnya",        label: "Lainnya"         },
];

export default function RoadmapPage() {
  const [roadmap, setRoadmap]               = useState<RoadmapResponse | null>(null);
  const [loading, setLoading]               = useState(true);
  const [completingId, setCompletingId]     = useState<string | null>(null);
  const [showMilestone, setShowMilestone]   = useState(false);
  const [milestoneType, setMilestoneType]   = useState("");
  const [milestoneDesc, setMilestoneDesc]   = useState("");
  const [savingMilestone, setSavingMilestone] = useState(false);
  const { addPoints } = usePointsStore();

  useEffect(() => {
    roadmapApi.get()
      .then((r) => setRoadmap(r.data))
      .catch(() => toast("Gagal memuat roadmap", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (!roadmap || completingId) return;
    const prev = roadmap;

    setRoadmap((r) => r ? {
      ...r,
      layers: r.layers.map((l) => ({
        ...l,
        tasks: l.tasks.map((t) =>
          t.id === taskId ? { ...t, status: "completed" as const } : t
        ),
      })),
    } : r);
    setCompletingId(taskId);

    try {
      const res = await roadmapApi.completeTask(taskId);
      const { points_awarded, level_changed, new_level, unlocked_tasks } = res.data;
      addPoints(points_awarded);
      toast(`✅ Task selesai! +${points_awarded} poin`, "success");
      showPointsGain(points_awarded, level_changed && new_level ? { level: new_level } : undefined);
      if (unlocked_tasks?.length > 0) {
        toast(`🔓 Layer ${unlocked_tasks[0]?.layer} terbuka!`, "info");
      }
      roadmapApi.get().then((r) => setRoadmap(r.data)).catch(() => {});
    } catch {
      setRoadmap(prev);
      toast("Gagal menyelesaikan task", "error");
    } finally {
      setCompletingId(null);
    }
  }, [roadmap, completingId]);

  const handleSaveMilestone = async () => {
    if (!milestoneType || !milestoneDesc.trim()) return;
    setSavingMilestone(true);
    try {
      const res = await roadmapApi.updateMilestone({
        milestone_type: milestoneType,
        description: milestoneDesc,
      });
      const { points_awarded, level_changed, new_level } = res.data;
      addPoints(points_awarded);
      showPointsGain(points_awarded, level_changed && new_level ? { level: new_level } : undefined);
      toast("🏆 Milestone dicatat! +150 poin", "success");
      setShowMilestone(false);
      setMilestoneType("");
      setMilestoneDesc("");
      roadmapApi.get().then((r) => setRoadmap(r.data)).catch(() => {});
    } catch {
      toast("Gagal menyimpan milestone", "error");
    } finally {
      setSavingMilestone(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalCompleted  = roadmap?.total_progress?.completed ?? 0;
  const totalTasks      = roadmap?.total_progress?.total ?? 15;
  const overallPct      = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;
  const pointsFromRoadmap = roadmap?.layers
    .flatMap((l) => l.tasks)
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.points_reward, 0) ?? 0;

  return (
    <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <h1 className="text-display-lg-mobile md:text-display-lg text-primary">
          Roadmap Masa Depanmu
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Langkah demi langkah, kita bangun jalur karir yang paling sesuai dengan potensi unikmu.
        </p>
        <div className="flex items-center justify-between font-label text-label-sm text-on-surface-variant">
          <span>{totalCompleted} dari {totalTasks} task selesai</span>
          <span className="font-bold text-on-tertiary-container">✨ {pointsFromRoadmap} poin dari roadmap</span>
        </div>
        <ProgressBar value={overallPct} color="bg-tertiary-fixed-dim" height="h-2" />
      </header>

      {/* Phases on the pathway */}
      {!roadmap ? (
        <div className="text-center py-12 text-on-surface-variant">
          Roadmap belum tersedia. Selesaikan onboarding terlebih dahulu.
        </div>
      ) : (
        <div className="relative">
          {/* Continuous pathway line */}
          <div
            aria-hidden
            className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-tertiary-fixed-dim via-secondary/40 to-outline-variant"
          />
          <div className="space-y-12 relative">
            {roadmap.layers.map((layer) => (
              <LayerSection
                key={layer.layer}
                layer={layer}
                onCompleteTask={handleCompleteTask}
                completingId={completingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Milestone */}
      <div className="glass-card accent-strip-teal rounded-lg p-6 space-y-4 shadow-navy-sm">
        <div>
          <h2 className="text-headline-md text-primary">🏆 Update Milestone Nyatamu</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Sudah ambil langkah nyata di dunia luar? Catat di sini
            <span className="font-semibold text-on-tertiary-container"> +150 poin</span>
          </p>
        </div>
        {!showMilestone ? (
          <button
            onClick={() => setShowMilestone(true)}
            className="bg-secondary hover:bg-secondary-container text-on-secondary rounded-md px-5 py-2.5 text-sm font-semibold transition"
          >
            Catat Milestone →
          </button>
        ) : (
          <div className="space-y-3">
            <select
              value={milestoneType}
              onChange={(e) => setMilestoneType(e.target.value)}
              className="input-tuju text-sm"
            >
              <option value="">Pilih jenis milestone...</option>
              {MILESTONE_TYPES.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <textarea
              value={milestoneDesc}
              onChange={(e) => setMilestoneDesc(e.target.value)}
              placeholder="Ceritakan pencapaianmu..."
              rows={3}
              className="input-tuju text-sm resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveMilestone}
                disabled={!milestoneType || !milestoneDesc.trim() || savingMilestone}
                className="flex-1 bg-secondary hover:bg-secondary-container disabled:opacity-50 text-on-secondary rounded-md py-2.5 font-semibold transition text-sm"
              >
                {savingMilestone ? "Menyimpan..." : "Simpan Milestone +150 poin"}
              </button>
              <button
                onClick={() => { setShowMilestone(false); setMilestoneType(""); setMilestoneDesc(""); }}
                className="border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-md px-4 py-2.5 text-sm transition"
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
