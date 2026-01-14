import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { supabase } from '../src/lib/supabase';
import { Spacing, Typography } from '../src/theme';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { theme, setTheme, colors } = useTheme();

    const [modalVisible, setModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loadingPass, setLoadingPass] = useState(false);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert('Error', 'Please fill in both fields');
            return;
        }

        setLoadingPass(true);

        // 1. Verify current password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user?.email || '',
            password: currentPassword,
        });

        if (signInError) {
            Alert.alert('Verification Failed', 'Current password is incorrect.');
            setLoadingPass(false);
            return;
        }

        // 2. Update to new password
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

        setLoadingPass(false);

        if (updateError) {
            Alert.alert('Error', updateError.message);
        } else {
            Alert.alert('Success', 'Password updated successfully');
            setModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
        }
    };

    const styles = getStyles(colors);

    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <View style={styles.section}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}</Text>
                    </View>
                    <View>
                        <Text style={styles.name}>{user?.user_metadata?.full_name || 'User'}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </View>
                </View>
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.row}>
                    <View style={styles.rowLeft}>
                        <Ionicons name="moon-outline" size={24} color={colors.text} />
                        <Text style={styles.rowLabel}>Dark Mode</Text>
                    </View>
                    <Switch
                        value={theme === 'dark'}
                        onValueChange={toggleTheme}
                        trackColor={{ false: '#767577', true: colors.primary }}
                    />
                </View>
            </View>

            {/* Security Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <TouchableOpacity
                    style={styles.changePassButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
                    <Text style={styles.changePassText}>Change Password</Text>
                </TouchableOpacity>
            </View>

            {/* Sign Out */}
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.version}>v1.0.0</Text>

            {/* Change Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>

                        <Text style={styles.label}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            placeholder="Current Password"
                            placeholderTextColor={colors.textSecondary}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />

                        <Text style={[styles.label, { marginTop: Spacing.m }]}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            secureTextEntry
                            placeholder="New Password"
                            placeholderTextColor={colors.textSecondary}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleChangePassword}
                                style={styles.saveButton}
                                disabled={loadingPass}
                            >
                                <Text style={styles.saveText}>{loadingPass ? 'Updating...' : 'Update'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: Spacing.m,
    },
    section: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: Spacing.m,
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: colors.border,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        ...Typography.h2,
        color: '#FFFFFF',
    },
    name: {
        ...Typography.h2,
        color: colors.text,
        fontSize: 20,
    },
    email: {
        ...Typography.body,
        color: colors.textSecondary,
        fontSize: 14,
    },
    sectionTitle: {
        ...Typography.button,
        color: colors.textSecondary,
        marginBottom: Spacing.m,
        textTransform: 'uppercase',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.s,
    },
    rowLabel: {
        ...Typography.body,
        color: colors.text,
    },
    changePassButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.primary,
        padding: Spacing.m,
        borderRadius: 12,
        gap: Spacing.s,
    },
    changePassText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    signOutButton: {
        backgroundColor: colors.surface,
        padding: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: Spacing.l,
        borderWidth: 1,
        borderColor: colors.danger,
    },
    signOutText: {
        ...Typography.button,
        color: colors.danger,
    },
    version: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: Spacing.xl,
        opacity: 0.5,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: Spacing.l,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: Spacing.l,
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalTitle: {
        ...Typography.h2,
        marginBottom: Spacing.l,
        textAlign: 'center',
        color: colors.text,
    },
    label: {
        ...Typography.button,
        marginBottom: Spacing.xs,
        fontSize: 14,
        color: colors.textSecondary,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: Spacing.m,
        color: colors.text,
        backgroundColor: colors.background,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Spacing.xl,
        gap: Spacing.m,
    },
    cancelButton: {
        padding: Spacing.m,
    },
    cancelText: {
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: colors.primary,
        padding: Spacing.m,
        borderRadius: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
