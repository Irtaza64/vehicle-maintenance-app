import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, Typography } from '../../src/theme';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleLogin = async () => {
        if (email && password) {
            await signIn(email, password); // passing password now
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to manage your vehicle maintenance.</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="john@example.com"
                        placeholderTextColor={colors.textSecondary}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Sign In'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.footerLink}>
                    <Text style={styles.footerText}>Don&apos;t have an account? <Text style={styles.linkText}>Create one</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: Spacing.l,
        justifyContent: 'center',
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        ...Typography.h1,
        color: colors.text,
        marginBottom: Spacing.s,
    },
    subtitle: {
        ...Typography.body,
        color: colors.textSecondary,
    },
    form: {
        gap: Spacing.l,
    },
    inputContainer: {
        gap: Spacing.s,
    },
    label: {
        ...Typography.button,
        color: colors.textSecondary,
        fontSize: 14,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: Spacing.m,
        color: colors.text,
        fontSize: 16,
    },
    button: {
        backgroundColor: colors.primary,
        padding: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: Spacing.s,
    },
    buttonText: {
        ...Typography.button,
        color: '#FFFFFF',
    },
    footerLink: {
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    footerText: {
        ...Typography.body,
        color: colors.text,
        fontSize: 14,
    },
    linkText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});
