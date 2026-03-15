import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
const API_URL = import.meta.env.VITE_API_URL;

export function useProfiles() {
    const { isAuthenticated, getToken } = useAuth();
    const [profile, setProfile] = useState<{ displayName: string; } | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setProfile(null);
            return;
        }
        
        const fetchProfiles = async () => {
            const token = getToken();
            if (!token || !API_URL) return;

            try {
                const res = await fetch(`${API_URL}/profile`, {
                    headers: {Authorization: `Bearer ${token}`}
                });
                const data = await res.json();
                setProfile({ displayName: data.displayName});
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        fetchProfiles();
    }, [isAuthenticated]);

    const editDisplayName = useCallback(async (newName: string) => {
        const token = getToken();
        if(!token || !API_URL) return;

        const currentDisplayName = profile?.displayName ?? "";
        console.log("current display name:", currentDisplayName, "new name:", newName);
        if(!currentDisplayName || !newName || currentDisplayName === newName) return;
        console.log("<VALID INPUT> editing display name to", newName);

        setProfile({ displayName: newName });

        try {
            await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ displayName: newName }),
            });
        } catch (err) {
            setProfile({ displayName: currentDisplayName });
            console.error('Failed to update display name:', err);
        }
    }, [profile, getToken]);

    return { profile, editDisplayName };
}



