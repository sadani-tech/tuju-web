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

const INPUT_CLASS =
  "w-full bg-surface-container-low border border-outline-variant/50 rounded-md px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/60 shadow-navy-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-secondary" : "bg-outline-variant"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white border border-outline/20 shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function SectionCard({
  title,
  accent,
  titleClass = "text-primary",
  children,
}: {
  title: string;
  accent?: string;
  titleClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`glass-card rounded-lg shadow-navy-sm border border-outline-variant/30 p-6 md:p-8 ${accent ?? ""}`}>
      <h2 className={`text-headline-md mb-6 ${titleClass}`}>{title}</h2>
      {children}
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
    <div className="p-4 md:p-10 max-w-container mx-auto">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-display-lg-mobile md:text-display-lg text-primary mb-2">
          Pengaturan Akun
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Kelola informasi pribadi, keamanan, dan preferensimu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column — Profil & Keamanan ──────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Profil Akun" accent="accent-strip-teal">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Email</label>
                  <input
                    type="email"
                    value={data?.profile.email ?? ""}
                    disabled
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-md px-4 py-2.5 text-sm text-outline cursor-not-allowed"
                  />
                  <p className="font-label text-label-sm text-outline mt-1">Email tidak dapat diubah</p>
                </div>
                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Kota</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Segmen</label>
                <select
                  value={segment}
                  onChange={(e) => setSegment(e.target.value)}
                  className={INPUT_CLASS}
                >
                  {Object.entries(SEGMENT_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="bg-secondary hover:bg-primary disabled:opacity-50 text-on-secondary text-button px-6 py-2.5 rounded-md transition-colors shadow-navy-sm"
                >
                  {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Keamanan">
            <div className="space-y-4">
              <div>
                <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Password Saat Ini</label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="Min. 8 karakter"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className={
                      confirmPw && newPw !== confirmPw
                        ? "w-full bg-surface-container-low border border-error rounded-md px-4 py-2.5 text-sm text-on-surface shadow-navy-sm focus:outline-none focus:ring-2 focus:ring-error/30 transition-all"
                        : INPUT_CLASS
                    }
                  />
                  {confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-error mt-1">Password tidak cocok</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={savingPw || !currentPw || !newPw || !confirmPw}
                  className="border-2 border-secondary text-secondary text-button px-6 py-2 rounded-md hover:bg-secondary/10 disabled:opacity-40 transition-colors"
                >
                  {savingPw ? "Mengubah..." : "Ganti Password"}
                </button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right column — Preferensi ────────────────────────────── */}
        <div className="space-y-6">
          {data && (
            <SectionCard title="Notifikasi">
              <div className="space-y-4">
                {[
                  { key: "email_report_ready" as const, label: "Report Siap", desc: "Kirim report via email" },
                  { key: "email_streak_reminder" as const, label: "Pengingat Streak", desc: "Pengingat harian" },
                  { key: "email_weekly_digest" as const, label: "Ringkasan Mingguan", desc: "Insight AI tiap minggu" },
                ].map(({ key, label, desc }, i, arr) => (
                  <div key={key}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-on-surface font-semibold text-sm">{label}</h4>
                        <p className="font-label text-label-sm text-on-surface-variant">{desc}</p>
                      </div>
                      <Toggle
                        checked={data.notifications[key]}
                        onChange={(v) => handleToggleNotif(key, v)}
                      />
                    </div>
                    {i < arr.length - 1 && <hr className="border-outline-variant/30 mt-4" />}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Data & Privasi">
            <p className="text-sm text-on-surface-variant mb-4">
              Semua data profilmu disimpan dengan aman dan tidak dibagikan ke pihak ketiga.
            </p>
            {data && (
              <div className="font-label text-label-sm text-on-surface-variant space-y-1.5 mb-4 bg-surface-container-low rounded-md p-3 border border-outline-variant/20">
                <p>
                  Akun dibuat:{" "}
                  {new Date(data.account.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p>Email terverifikasi: {data.account.email_verified ? "✅ Ya" : "❌ Belum"}</p>
                <p>Total sesi chat: {data.account.total_sessions}</p>
              </div>
            )}
            <button
              disabled
              title="Tersedia di V1.1"
              className="w-full border border-outline-variant/50 text-outline py-2.5 rounded-md text-sm cursor-not-allowed"
            >
              Unduh Data Saya (Segera Hadir)
            </button>
          </SectionCard>

          <SectionCard title="Danger Zone" titleClass="text-error">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-on-surface font-semibold text-sm">Hapus Akun</h4>
                <p className="font-label text-label-sm text-on-surface-variant">
                  Menonaktifkan akunmu secara permanen.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-error-container text-on-error-container hover:bg-error hover:text-on-error px-4 py-2 rounded-md text-button text-sm transition-colors shadow-navy-sm flex-shrink-0"
              >
                Hapus Akun
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm p-4">
          <div className="glass-card rounded-xl p-6 max-w-md w-full shadow-navy-lg space-y-4">
            <h3 className="text-headline-md text-primary text-lg">Konfirmasi Hapus Akun</h3>
            <p className="text-sm text-on-surface-variant">
              Ketik <span className="font-bold text-error">HAPUS AKUN SAYA</span> untuk mengonfirmasi.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="HAPUS AKUN SAYA"
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error transition-all"
            />
            <div>
              <label className="block font-label text-label-sm text-on-surface-variant mb-1.5">Password</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-error/30 focus:border-error transition-all"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); setDeletePassword(""); }}
                className="flex-1 border border-outline-variant text-on-surface-variant hover:bg-surface-container-low py-2.5 rounded-md text-sm font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText !== "HAPUS AKUN SAYA" || !deletePassword}
                className="flex-1 bg-error hover:bg-on-error-container disabled:opacity-50 text-on-error py-2.5 rounded-md text-sm font-semibold transition"
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
