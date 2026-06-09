"use client";
import { useEffect, useState } from "react";
import { settingsApi, profileApi } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

type SettingsData = {
  profile: { name: string; email: string; city: string | null; birth_date: string | null; segment: string | null };
  notifications: { email_report_ready: boolean; email_streak_reminder: boolean; email_weekly_digest: boolean };
  account: { created_at: string; email_verified: boolean; total_sessions: number };
};

const SEGMENT_LABELS: Record<string, string> = {
  smp:             "Pelajar SMP",
  sma:             "Pelajar SMA",
  mahasiswa:       "Mahasiswa",
  fresh_grad:      "Fresh Graduate",
  career_switcher: "Career Switcher",
  orang_tua:       "Orang Tua",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [data, setData]             = useState<SettingsData | null>(null);
  const [loading, setLoading]       = useState(true);

  // Profile form state
  const [name, setName]             = useState("");
  const [city, setCity]             = useState("");
  const [birthDate, setBirthDate]   = useState("");
  const [segment, setSegment]       = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [savingPw, setSavingPw]     = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deletePassword, setDeletePassword]   = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((res) => {
        setData(res.data);
        setName(res.data.profile.name ?? "");
        setCity(res.data.profile.city ?? "");
        setBirthDate(res.data.profile.birth_date ?? "");
        setSegment(res.data.profile.segment ?? "");
      })
      .catch(() => toast("Gagal memuat pengaturan", "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const profilePayload: Record<string, string> = { name };
      if (city) profilePayload.city = city;
      if (birthDate) profilePayload.birth_date = birthDate;

      await settingsApi.updateProfile(profilePayload);

      if (segment && segment !== data?.profile.segment) {
        await profileApi.updateSegment({ segment });
      }

      setData((prev) => prev ? { ...prev, profile: { ...prev.profile, name, city: city || null, birth_date: birthDate || null, segment } } : prev);
      toast("Profil berhasil diperbarui", "success");
    } catch {
      toast("Gagal menyimpan profil", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPw.length < 8) { toast("Password baru minimal 8 karakter", "error"); return; }
    if (newPw !== confirmPw) { toast("Konfirmasi password tidak cocok", "error"); return; }
    setSavingPw(true);
    try {
      await settingsApi.updatePassword({ current_password: currentPw, new_password: newPw });
      toast("Password berhasil diubah", "success");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast(msg ?? "Gagal mengubah password", "error");
    } finally {
      setSavingPw(false);
    }
  };

  const handleToggleNotif = async (key: keyof SettingsData["notifications"], value: boolean) => {
    if (!data) return;
    const updated = { ...data.notifications, [key]: value };
    setData({ ...data, notifications: updated });
    try {
      await settingsApi.updateNotifications({ [key]: value });
    } catch {
      setData({ ...data, notifications: data.notifications });
      toast("Gagal menyimpan preferensi notifikasi", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "HAPUS AKUN SAYA") {
      toast('Ketik "HAPUS AKUN SAYA" untuk konfirmasi', "error"); return;
    }
    setDeletingAccount(true);
    try {
      await settingsApi.deleteAccount({ password: deletePassword, confirmation: deleteConfirmText });
      localStorage.removeItem("tuju_token");
      window.location.href = "/";
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast(msg ?? "Gagal menghapus akun", "error");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan ⚙️</h1>
        <p className="text-slate-500 mt-1 text-sm">Kelola akun dan preferensimu</p>
      </div>

      {/* Section 1 — Profil Akun */}
      <SectionCard title="👤 Profil Akun">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              value={data?.profile.email ?? ""}
              disabled
              className="w-full border border-slate-100 rounded-xl px-3 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Kota</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Contoh: Jakarta"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal Lahir</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Segmen</label>
            <select
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition bg-white"
            >
              {Object.entries(SEGMENT_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl text-sm transition"
          >
            {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </SectionCard>

      {/* Section 2 — Keamanan */}
      <SectionCard title="🔒 Keamanan">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Saat Ini</label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="Min. 8 karakter"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${
                confirmPw && newPw !== confirmPw
                  ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                  : "border-slate-200 focus:ring-blue-200 focus:border-blue-400"
              }`}
            />
            {confirmPw && newPw !== confirmPw && (
              <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
            )}
          </div>
          <button
            onClick={handleChangePassword}
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl text-sm transition"
          >
            {savingPw ? "Mengubah..." : "Ganti Password"}
          </button>
        </div>
      </SectionCard>

      {/* Section 3 — Notifikasi */}
      {data && (
        <SectionCard title="🔔 Notifikasi">
          <div className="space-y-4">
            {[
              { key: "email_report_ready" as const, icon: "📧", label: "Report siap dikirim via email" },
              { key: "email_streak_reminder" as const, icon: "🔥", label: "Pengingat streak harian" },
              { key: "email_weekly_digest" as const, icon: "📰", label: "Ringkasan mingguan via email" },
            ].map(({ key, icon, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm text-slate-700">{label}</span>
                </div>
                <Toggle
                  checked={data.notifications[key]}
                  onChange={(v) => handleToggleNotif(key, v)}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Section 4 — Data & Privasi */}
      <SectionCard title="🛡️ Data & Privasi">
        <p className="text-sm text-slate-500 mb-4">
          Semua data profilmu disimpan dengan aman dan tidak dibagikan ke pihak ketiga.
        </p>
        {data && (
          <div className="text-xs text-slate-400 space-y-1 mb-4">
            <p>Akun dibuat: {new Date(data.account.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p>Email terverifikasi: {data.account.email_verified ? "✅ Ya" : "❌ Belum"}</p>
            <p>Total sesi chat: {data.account.total_sessions}</p>
          </div>
        )}
        <button
          disabled
          title="Tersedia di V1.1"
          className="w-full border border-slate-200 text-slate-400 py-2.5 rounded-xl text-sm cursor-not-allowed"
        >
          📥 Unduh Data Saya (Segera Hadir)
        </button>
      </SectionCard>

      {/* Section 5 — Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h2 className="font-bold text-red-700">⚠️ Hapus Akun</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Aksi ini akan menonaktifkan akunmu secara permanen. Data tidak akan langsung dihapus.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition"
          >
            Hapus Akun
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Konfirmasi Hapus Akun</h3>
            <p className="text-sm text-slate-500">
              Ketik <span className="font-bold text-red-600">HAPUS AKUN SAYA</span> untuk mengonfirmasi.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="HAPUS AKUN SAYA"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); setDeletePassword(""); }}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText !== "HAPUS AKUN SAYA" || !deletePassword}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-red-300 text-white py-2.5 rounded-xl text-sm font-semibold transition"
              >
                {deletingAccount ? "Menghapus..." : "Konfirmasi Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
