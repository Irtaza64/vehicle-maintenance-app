import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Spacing, Typography } from '../../src/theme';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signUp, isLoading } = useAuth();
    const router = useRouter();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleRegister = async () => {
        if (email && password && name) {
            await signUp(email, password, name);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Start tracking your vehicles today.</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="John Doe"
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

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
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    <Text style={styles.buttonText}>{isLoading ? 'Creating Account...' : 'Create Account'}</Text>
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
    backButton: {
        position: 'absolute',
        top: Spacing.xl * 2,
        left: Spacing.l,
        zIndex: 1,
    },
    backButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
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
});
