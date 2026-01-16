import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Typography } from '../theme';

export type AlertType = 'success' | 'danger' | 'info';

type CustomAlertProps = {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: AlertType;
};

export default function CustomAlert({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'info',
}: CustomAlertProps) {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    if (!visible) return null;

    const getConfirmButtonStyle = () => {
        switch (type) {
            case 'danger':
                return { backgroundColor: colors.danger };
            case 'success':
                return { backgroundColor: colors.accent };
            default:
                return { backgroundColor: colors.primary };
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel || onConfirm}
        >
            <View style={styles.overlay}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <View style={styles.buttonContainer}>
                        {onCancel && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onCancel}
                            >
                                <Text style={styles.cancelText}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.button, getConfirmButtonStyle()]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmText}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.l,
    },
    alertBox: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: Spacing.xl,
        width: '100%',
        maxWidth: 340,
        borderWidth: 1,
        borderColor: colors.border,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    title: {
        ...Typography.h2,
        color: colors.text,
        marginBottom: Spacing.s,
        textAlign: 'center',
    },
    message: {
        ...Typography.body,
        color: colors.textSecondary,
        marginBottom: Spacing.l,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: Spacing.m,
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        paddingVertical: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: 'transparent',
    },
    cancelText: {
        ...Typography.button,
        color: colors.textSecondary,
    },
    confirmText: {
        ...Typography.button,
        color: '#FFFFFF',
    },
});
