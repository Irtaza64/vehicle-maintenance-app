import { AntDesign, Ionicons } from '@expo/vector-icons';
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
    const { signUp, signInWithGoogle, isLoading } = useAuth();
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
                <Ionicons name="arrow-back" size={28} color={colors.text} />
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

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={styles.googleButton}
                    onPress={signInWithGoogle}
                    disabled={isLoading}
                >
                    <AntDesign name="google" size={20} color={colors.text} />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
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
        top: Spacing.xl * 1.5,
        left: Spacing.l,
        zIndex: 1,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        // Shadow for visibility
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButtonText: {
        display: 'none',
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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.s,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.border,
    },
    dividerText: {
        ...Typography.caption,
        color: colors.textSecondary,
        marginHorizontal: Spacing.m,
    },
    googleButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        padding: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.s,
    },
    googleButtonText: {
        ...Typography.button,
        color: colors.text,
    },
});
