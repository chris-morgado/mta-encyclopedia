import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useProfiles } from "../hooks/useProfiles";
import { loadStopById } from "../data/stops";
import type { StopProps } from "../types/stop";

export default function Profile() {
    const { userId } = useParams<{ userId: string }>();
    const { isAuthenticated, userEmail, getToken, updatePreferredUsername } = useAuth();
    const { profile, updateDisplayName } = useProfiles(userId!);

    const [favoriteStops, setFavoriteStops] = useState<(StopProps | null)[]>([]);
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const token = getToken();
    const myUserId = token
        ? JSON.parse(atob(token.split('.')[1])).sub
        : null;
    const isOwnProfile = isAuthenticated && myUserId === userId;

    useEffect(() => {
        if (!profile?.favoriteStops?.length) {
            setFavoriteStops([]);
            return;
        }
        let cancelled = false;
        Promise.all(profile.favoriteStops.map((id: string) => loadStopById(id))).then(
            (stops) => { if (!cancelled) setFavoriteStops(stops); }
        );
        return () => { cancelled = true; };
    }, [profile?.favoriteStops]);

    const handleEdit = () => {
        setEditName(profile?.displayName ?? '');
        setSaveError(null);
        setEditing(true);
    };

    const handleSave = async () => {
        if (!editName.trim()) return;
        setSaving(true);
        setSaveError(null);
        try {
            await updateDisplayName(editName.trim());
            await updatePreferredUsername(editName.trim());
            setEditing(false);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditing(false);
        setSaveError(null);
    };

    if (!profile) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg font-semibold mb-2">Profile not found</p>
                    <Link to="/map" className="text-sm underline text-sky-400">
                        ← Back to map
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <header className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        {editing ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        maxLength={30}
                                        autoFocus
                                        className="bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-1.5 text-slate-100 text-2xl font-semibold focus:outline-none focus:border-sky-400 transition-colors"
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !editName.trim()}
                                        className="text-xs px-3 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {saving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {saveError && (
                                    <p className="text-xs text-red-400">{saveError}</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
                                {isOwnProfile && (
                                    <button
                                        onClick={handleEdit}
                                        title="Edit display name"
                                        className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none mt-0.5"
                                    >
                                        ✎
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <Link
                        to="/map"
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-700 hover:bg-slate-800 transition-colors flex-shrink-0"
                    >
                        Back to map
                    </Link>
                </header>

                {/* Info card */}
                <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 mb-4">
                    <div className="flex flex-col gap-2.5 text-sm">
                        {isOwnProfile && userEmail && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Email</span>
                                <span className="text-slate-100">{userEmail}</span>
                            </div>
                        )}
                        {profile.memberSince && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Member since</span>
                                <span className="text-slate-100">
                                    {new Date(profile.memberSince).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Favorite stops</span>
                            <span className="text-slate-100">
                                {profile.favoriteStops?.length ?? 0} / 5
                            </span>
                        </div>
                    </div>
                </section>

                {/* Favorite stops */}
                {profile.favoriteStops?.length > 0 && (
                    <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
                        <h2 className="text-sm font-semibold mb-3">Favorite Stops</h2>
                        <ul className="flex flex-col gap-2">
                            {profile.favoriteStops.map((stopId: string, i: number) => {
                                const stop = favoriteStops[i];
                                return (
                                    <li key={stopId}>
                                        {stop ? (
                                            <Link
                                                to={`/stop/${stop.stop_id}`}
                                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                                            >
                                                <span className="text-sm">{stop.stop_name}</span>
                                                <span className="text-xs text-slate-400">{stop.stop_id}</span>
                                            </Link>
                                        ) : (
                                            <div className="px-3 py-2 rounded-lg bg-slate-800/50 text-slate-500 text-sm animate-pulse">
                                                {stopId}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                )}

            </div>
        </div>
    );
}
