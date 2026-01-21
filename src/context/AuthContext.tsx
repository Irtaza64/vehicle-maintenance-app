import { Session, User } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import { useRouter, useSegments } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthType = {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => void;
};

const AuthContext = createContext<AuthType>({
    user: null,
    session: null,
    isLoading: false,
    signIn: async () => { },
    signUp: async () => { },
    signInWithGoogle: async () => { },
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
        const fetchSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error fetching session:', error);
                supabase.auth.signOut();
            }
            setSession(session);
            setUser(session ? session.user : null);
            setIsLoading(false);
        };

        fetchSession();

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

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            const redirectUri = makeRedirectUri({
                path: 'auth/callback',
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUri,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

            if (res.type === 'success') {
                const { url } = res;
                if (url) {
                    const params = new URLSearchParams(url.split('#')[1]);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });
                        if (error) throw error;
                    }
                }
            }
        } catch (error: any) {
            Alert.alert('Google Sign-In Failed', error.message);
        } finally {
            setIsLoading(false);
        }
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
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}



