import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import { VehicleType, useVehicles } from '../src/context/VehicleContext';
import { Spacing, Typography } from '../src/theme';

export default function AddVehicleScreen() {
    const [step, setStep] = useState(1);
    const [type, setType] = useState<VehicleType | null>(null);
    const [plateNumber, setPlateNumber] = useState('');
    const { addVehicle } = useVehicles();
    const router = useRouter();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const handleNext = async () => {
        if (step === 1 && type) {
            setStep(2);
        } else if (step === 2 && plateNumber) {
            const success = await addVehicle(type!, plateNumber);
            if (success) {
                router.back();
            } else {
                Alert.alert('Error', 'Vehicle with this plate number already exists.');
            }
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.stepText}>Step {step} of 2</Text>
                <Text style={styles.title}>
                    {step === 1 ? 'Select Vehicle Type' : 'Enter Plate Number'}
                </Text>
            </View>

            <View style={styles.content}>
                {step === 1 ? (
                    <View style={styles.typeContainer}>
                        <TouchableOpacity
                            style={[styles.typeOption, type === 'Car' && styles.selectedOption]}
                            onPress={() => setType('Car')}
                        >
                            <Ionicons name="car-sport" size={48} color={type === 'Car' ? colors.primary : colors.textSecondary} />
                            <Text style={[styles.typeText, type === 'Car' && styles.selectedText]}>Car</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.typeOption, type === 'Motorcycle' && styles.selectedOption]}
                            onPress={() => setType('Motorcycle')}
                        >
                            <Ionicons name="bicycle" size={48} color={type === 'Motorcycle' ? colors.primary : colors.textSecondary} />
                            <Text style={[styles.typeText, type === 'Motorcycle' && styles.selectedText]}>Motorcycle</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.label}>Vehicle Plate Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. ABC-123"
                            placeholderTextColor={colors.textSecondary}
                            value={plateNumber}
                            onChangeText={setPlateNumber}
                            autoCapitalize="characters"
                        />
                        <Text style={styles.hint}>This will be used as a unique identifier.</Text>
                    </View>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, (!type && step === 1) || (!plateNumber && step === 2) ? styles.disabledButton : null]}
                    onPress={handleNext}
                    disabled={(step === 1 && !type) || (step === 2 && !plateNumber)}
                >
                    <Text style={styles.buttonText}>{step === 1 ? 'Next' : 'Add Vehicle'}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
                    <Text style={styles.cancelText}>Cancel</Text>
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
    },
    header: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    stepText: {
        color: colors.primary,
        fontWeight: 'bold',
        marginBottom: Spacing.s,
    },
    title: {
        ...Typography.h1,
        color: colors.text,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    typeContainer: {
        flexDirection: 'row',
        gap: Spacing.m,
    },
    typeOption: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: Spacing.l, // Reduced from xl to l
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.border,
    },
    selectedOption: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(46, 103, 248, 0.05)',
    },
    typeText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: Spacing.s,
        color: colors.textSecondary,
    },
    selectedText: {
        color: colors.text,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: Spacing.m,
        color: colors.text,
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    label: {
        ...Typography.body,
        marginBottom: Spacing.s,
        textAlign: 'center',
        color: colors.text,
    },
    hint: {
        ...Typography.body,
        fontSize: 12,
        textAlign: 'center',
        marginTop: Spacing.m,
        opacity: 0.7,
        color: colors.textSecondary,
    },
    footer: {
        marginBottom: Spacing.xl,
    },
    button: {
        backgroundColor: colors.primary,
        padding: Spacing.m,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    disabledButton: {
        opacity: 0.5,
    },
    buttonText: {
        ...Typography.button,
        color: '#FFFFFF',
    },
    cancelButton: {
        alignItems: 'center',
        padding: Spacing.s,
    },
    cancelText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
});
