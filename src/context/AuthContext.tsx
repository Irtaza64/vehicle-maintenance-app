import { Session, User } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => void;
};

const AuthContext = createContext<AuthType>({
    user: null,
    session: null,
    isLoading: false,
    signIn: async () => { },
    signUp: async () => { },
    signOut: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const rootSegment = useSegments()[0];
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session ? session.user : null);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session ? session.user : null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = rootSegment === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, rootSegment, isLoading, router]);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
            setIsLoading(false);
        }
    };

    const signUp = async (email: string, password: string, name: string) => {
        setIsLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });

        if (error) {
            Alert.alert('Registration Failed', error.message);
        } else if (!data.session) {
            Alert.alert('Registration Successful', 'Please check your email to verify your account.');
        }
        setIsLoading(false);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoading,
                signIn,
                signUp,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

import { Alert } from 'react-native';

