import { useState, useEffect, useCallback } from 'react';
const API_URL = import.meta.env.VITE_API_URL;
import { useAuth } from '../context/AuthContext';
import type { ProfileProps } from '../types/profile';

export function useProfiles(userId: string) {
    const [profile, setProfile] = useState<ProfileProps | null>(null);
    const [loadingDynamo, setLoadingDynamo] = useState(true);
    const { getToken } = useAuth();
    
    const fetchProfiles = async () => {
        if (!API_URL) return;
        setLoadingDynamo(true);
        try {
            const res = await fetch(`${API_URL}/profile/${userId}`);
            if(res.status === 404) {
                console.error('Status 404: Profile not found');
                setProfile(null);
                return;
            }   
            const data = await res.json();
            setProfile({
                userId: data.userId,
                displayName: data.displayName,
                memberSince: data.memberSince ?? "",
                favoriteStops: data.favoriteStops ?? [],
                email: data.email, // TODO delete me, emails are not on public endpoints
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        } finally { 
            setLoadingDynamo(false);
        }
    };
    
    useEffect(() => {
        fetchProfiles();
    }, [userId]);
    
    const updateDisplayName = useCallback(async (newName: string) => {
        const token = getToken();
        if (!token || !API_URL) return;

        const currentDisplayName = profile?.displayName ?? "";
        if(!newName || currentDisplayName === newName) return;

        // optimistic update
        setProfile(prev => prev ? { ...prev, 
            displayName: newName,
            // TODO add more things that can be changed... 
        } : prev);

        try {
            await fetch(`${API_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ updatedDisplayName: newName }),
            });
        } catch (err) {
            // revert on error
            setProfile(prev => prev ? { ...prev, 
                displayName: currentDisplayName,
                // TODO add more things that can be changed... (when reverting) 
            } : prev);
            console.error('Failed to update display name:', err);
        }
    }, [profile]);

    return { profile, updateDisplayName, loadingDynamo };
}



