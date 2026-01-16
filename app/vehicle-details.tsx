import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomAlert, { AlertType } from '../src/components/CustomAlert';
import { useTheme } from '../src/context/ThemeContext';
import { MaintenanceLog, ServiceType, Trip, useVehicles, VehicleType } from '../src/context/VehicleContext';
import { Spacing, Typography } from '../src/theme';

export default function VehicleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { getVehicle, addTrip, deleteTrip, deleteVehicle, updateVehicle, performService } = useVehicles();
    const router = useRouter();
    const vehicle = getVehicle(id);
    const { colors } = useTheme();
    const styles = getStyles(colors);

    // Trip Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [distance, setDistance] = useState('');
    const [tripName, setTripName] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'trips' | 'maintenance'>('trips');

    // Edit Vehicle Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newPlate, setNewPlate] = useState('');
    const [newType, setNewType] = useState<VehicleType>('Car');

    // Menu State
    const [menuVisible, setMenuVisible] = useState(false);

    // Custom Alert State
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertTitle, setAlertTitle] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [alertType, setAlertType] = useState<AlertType>('info');
    const [onConfirm, setOnConfirm] = useState<() => void>(() => { });
    const [onCancel, setOnCancel] = useState<(() => void) | undefined>(undefined);
    const [confirmText, setConfirmText] = useState('Confirm');
    const [cancelText, setCancelText] = useState('Cancel');

    const showAlert = (
        title: string,
        message: string,
        confirmAction: () => void,
        type: AlertType = 'info',
        cancelAction?: () => void,
        confirmLabel: string = 'Confirm',
        cancelLabel: string = 'Cancel'
    ) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setOnConfirm(() => () => {
            confirmAction();
            setAlertVisible(false);
        });
        if (cancelAction) {
            setOnCancel(() => () => {
                cancelAction();
                setAlertVisible(false);
            });
        } else {
            setOnCancel(undefined);
        }
        setAlertType(type);
        setConfirmText(confirmLabel);
        setCancelText(cancelLabel);
        setAlertVisible(true);
    };

    if (!vehicle) {
        return (
            <View style={styles.container}>
                <Text style={{ color: colors.text }}>Vehicle not found</Text>
            </View>
        );
    }

    // Maintenance Logic
    const isOilDue = () => {
        const threshold = vehicle.type === 'Motorcycle' ? 500 : 5000;
        return (vehicle.totalDistance - vehicle.lastOilService) >= threshold;
    };

    const isMaintenanceDue = () => {
        const threshold = vehicle.type === 'Motorcycle' ? 1000 : 5000;
        return (vehicle.totalDistance - vehicle.lastMaintenanceService) >= threshold;
    };

    const handleServiceAction = (serviceType: ServiceType) => {
        showAlert(
            `Perform ${serviceType} Service?`,
            `This will reset the ${serviceType.toLowerCase()} service counter.`,
            async () => {
                const success = await performService(vehicle.id, serviceType);
                if (success) {
                    // Show success alert
                    setTimeout(() => {
                        showAlert('Success', `${serviceType} service recorded!`, () => { }, 'success', undefined, 'OK');
                    }, 500);
                }
            },
            'info',
            () => { },
            'Confirm'
        );
    };

    const openEditModal = () => {
        setNewPlate(vehicle.plateNumber);
        setNewType(vehicle.type);
        setEditModalVisible(true);
        setMenuVisible(false);
    };

    const handleUpdate = async () => {
        if (!newPlate) return;
        const success = await updateVehicle(vehicle.id, newType, newPlate);
        if (success) {
            setEditModalVisible(false);
        } else {
            showAlert('Error', 'Failed to update vehicle.', () => { }, 'danger', undefined, 'OK');
        }
    };

    const handleDeleteVehicle = () => {
        setMenuVisible(false);
        showAlert(
            'Delete Vehicle',
            'Are you sure you want to delete this vehicle and all its trips? This cannot be undone.',
            async () => {
                const success = await deleteVehicle(vehicle.id);
                if (success) {
                    router.back();
                }
            },
            'danger',
            () => { },
            'Delete'
        );
    };

    const handleAddTrip = async () => {
        if (!distance) return;

        const distNum = Number.parseFloat(distance);
        if (Number.isNaN(distNum)) {
            showAlert('Invalid Distance', 'Please enter a valid number', () => { }, 'danger', undefined, 'OK');
            return;
        }

        const formattedDate = date.toISOString().split('T')[0];

        await addTrip(vehicle.id, {
            date: formattedDate,
            distance: distNum, // Use distNum directly
            name: tripName || 'Daily Commute'
        });

        setModalVisible(false);
        setDistance('');
        setTripName('');
    };

    const handleDeleteTrip = (tripId: string) => {
        showAlert(
            'Delete Trip',
            'Are you sure?',
            async () => {
                await deleteTrip(tripId);
            },
            'danger',
            () => { },
            'Delete'
        );
    };

    const renderRightActions = (tripId: string) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteTrip(tripId)}
            >
                <Ionicons name="trash-outline" size={24} color="#FFF" />
            </TouchableOpacity>
        );
    };

    const renderTrip = ({ item }: { item: Trip }) => (
        <Swipeable renderRightActions={() => renderRightActions(item.id)} renderLeftActions={() => renderRightActions(item.id)}>
            <View style={styles.tripItem}>
                <View style={styles.tripLeft}>
                    <Ionicons name="navigate-circle-outline" size={32} color={colors.primary} />
                    <View style={styles.tripInfo}>
                        <Text style={styles.tripDate}>{item.date}</Text>
                        <Text style={styles.tripName}>{item.name}</Text>
                    </View>
                </View>
                <Text style={styles.tripDistance}>{item.distance} km</Text>
            </View>
        </Swipeable>
    );

    const renderMaintenanceLog = ({ item }: { item: MaintenanceLog }) => (
        <View style={styles.logItem}>
            <View style={styles.logLeft}>
                <Ionicons
                    name={item.serviceType === 'Oil' ? 'water' : 'settings'}
                    size={24}
                    color={colors.textSecondary}
                />
                <View style={styles.logInfo}>
                    <Text style={styles.logDate}>{new Date(item.date).toLocaleDateString()}</Text>
                    <Text style={styles.logType}>{item.serviceType} Service</Text>
                </View>
            </View>
            <Text style={styles.logDistance}>{item.mileageAtService.toLocaleString()} km</Text>
        </View>
    );

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
    };

    const statusBarStyle = colors.background === '#000000' ? 'light' : 'dark';

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style={statusBarStyle} />
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{vehicle.plateNumber}</Text>
                    <Text style={styles.headerSubtitle}>{vehicle.type}</Text>
                </View>

                <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(!menuVisible)}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>

                {/* Context Menu Dropdown */}
                {menuVisible && (
                    <View style={styles.menuDropdown}>
                        <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
                            <Ionicons name="create-outline" size={20} color={colors.text} />
                            <Text style={styles.menuText}>Edit Vehicle</Text>
                        </TouchableOpacity>
                        <View style={styles.menuDivider} />
                        <TouchableOpacity style={styles.menuItem} onPress={handleDeleteVehicle}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                            <Text style={[styles.menuText, { color: colors.danger }]}>Delete Vehicle</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={styles.statsCard}>
                <Text style={styles.totalLabel}>Total Mileage</Text>
                <Text style={styles.totalValue}>{vehicle.totalDistance.toLocaleString()} <Text style={styles.unit}>km</Text></Text>

                {/* Maintenance Icons */}
                <View style={styles.maintenanceContainer}>
                    {isOilDue() && (
                        <TouchableOpacity style={styles.maintenanceIcon} onPress={() => handleServiceAction('Oil')}>
                            <Ionicons name="water" size={28} color={colors.danger} />
                            <Text style={[styles.maintenanceText, { color: colors.danger }]}>Oil</Text>
                        </TouchableOpacity>
                    )}
                    {isMaintenanceDue() && (
                        <TouchableOpacity style={styles.maintenanceIcon} onPress={() => handleServiceAction('Maintenance')}>
                            <Ionicons name="settings" size={28} color={colors.danger} />
                            <Text style={[styles.maintenanceText, { color: colors.danger }]}>Service</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'trips' && styles.activeTab]}
                    onPress={() => setActiveTab('trips')}
                >
                    <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>Recent Trips</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'maintenance' && styles.activeTab]}
                    onPress={() => setActiveTab('maintenance')}
                >
                    <Text style={[styles.tabText, activeTab === 'maintenance' && styles.activeTabText]}>Maintenance</Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View style={styles.contentArea}>
                {activeTab === 'maintenance' ? (
                    <View style={styles.listContainer}>
                        {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                            <FlatList
                                data={[...vehicle.maintenanceHistory].reverse()}
                                renderItem={renderMaintenanceLog}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContent}
                                ListEmptyComponent={
                                    <Text style={styles.emptyText}>No maintenance records yet.</Text>
                                }
                            />
                        ) : (
                            <Text style={styles.emptyText}>No maintenance records yet.</Text>
                        )}
                    </View>
                ) : (
                    <View style={styles.listContainer}>
                        <Text style={styles.swipeHint}>Swipe to delete</Text>
                        <FlatList
                            data={[...vehicle.trips].reverse()}
                            renderItem={renderTrip}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No trips recorded yet.</Text>
                            }
                        />
                    </View>
                )}
            </View>



            {/* FAB only for Trips tab */}
            {activeTab === 'trips' && (
                <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                    <Ionicons name="add" size={32} color="#FFFFFF" />
                </TouchableOpacity>
            )}

            {/* Add Trip Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add Trip</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateButtonText}>{date.toLocaleDateString()}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={date}
                                    mode="date"
                                    is24Hour={true}
                                    onChange={onDateChange}
                                />
                            )}
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Distance (km)</Text>
                            <TextInput
                                style={styles.input}
                                value={distance}
                                onChangeText={setDistance}
                                placeholder="0"
                                keyboardType="numeric"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Trip Name</Text>
                            <TextInput
                                style={styles.input}
                                value={tripName}
                                onChangeText={setTripName}
                                placeholder="Daily Commute"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddTrip} style={styles.saveButton}>
                                <Text style={styles.saveText}>Save Trip</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Vehicle Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Vehicle</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Plate Number</Text>
                            <TextInput
                                style={styles.input}
                                value={newPlate}
                                onChangeText={setNewPlate}
                                placeholder="Plate Number"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="characters"
                            />
                        </View>
                        <View style={styles.typeSelector}>
                            <TouchableOpacity
                                style={[styles.typeOption, newType === 'Car' && styles.selectedTypeOption]}
                                onPress={() => setNewType('Car')}
                            >
                                <Text style={[styles.typeOptionText, newType === 'Car' && styles.selectedTypeOptionText]}>Car</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeOption, newType === 'Motorcycle' && styles.selectedTypeOption]}
                                onPress={() => setNewType('Motorcycle')}
                            >
                                <Text style={[styles.typeOptionText, newType === 'Motorcycle' && styles.selectedTypeOptionText]}>Motorcycle</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleUpdate} style={styles.saveButton}>
                                <Text style={styles.saveText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>



            <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onConfirm={onConfirm}
                onCancel={onCancel}
                confirmText={confirmText}
                cancelText={cancelText}
                type={alertType}
            />

        </SafeAreaView >
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        zIndex: 10, // For menu dropdown
    },
    backButton: {
        padding: Spacing.s,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        ...Typography.h2,
        color: colors.text,
        fontSize: 20,
    },
    headerSubtitle: {
        ...Typography.body,
        color: colors.textSecondary,
        fontSize: 12,
    },
    menuButton: {
        padding: Spacing.s,
    },
    menuDropdown: {
        position: 'absolute',
        top: 60,
        right: Spacing.m,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: Spacing.s,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: colors.border,
        width: 180,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.m,
        gap: Spacing.s,
    },
    menuText: {
        ...Typography.body,
        color: colors.text,
        fontSize: 14,
    },
    menuDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginHorizontal: Spacing.s,
    },
    statsCard: {
        backgroundColor: colors.surface,
        margin: Spacing.l,
        padding: Spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    totalLabel: {
        ...Typography.body,
        color: colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    totalValue: {
        ...Typography.h1,
        fontSize: 48,
        color: colors.text,
    },
    unit: {
        fontSize: 24,
        color: colors.textSecondary,
        fontWeight: '400',
    },
    maintenanceContainer: {
        flexDirection: 'row',
        gap: Spacing.xl,
        marginTop: Spacing.m,
    },
    maintenanceIcon: {
        alignItems: 'center',
        gap: 4,
    },
    maintenanceText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
        backgroundColor: colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: Spacing.l,
    },
    sectionTitle: {
        ...Typography.h2,
        marginBottom: Spacing.xs,
        color: colors.text,
    },
    swipeHint: {
        ...Typography.body,
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: Spacing.m,
    },
    listContent: {
        paddingBottom: 100,
    },
    tripItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.m,
        paddingHorizontal: Spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.surface, // Important for swipeable to cover background
    },
    deleteAction: {
        backgroundColor: colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    tripLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    tripInfo: {},
    tripDate: {
        ...Typography.body,
        fontSize: 12,
        color: colors.textSecondary,
    },
    tripName: {
        ...Typography.button,
        color: colors.text,
    },
    tripDistance: {
        ...Typography.h2,
        fontSize: 18,
        color: colors.accent,
    },
    emptyText: {
        ...Typography.body,
        textAlign: 'center',
        marginTop: Spacing.xl,
        opacity: 0.5,
        color: colors.textSecondary,
    },
    fab: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
    },
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
    inputGroup: {
        marginBottom: Spacing.m,
    },
    label: {
        ...Typography.button,
        marginBottom: Spacing.xs,
        fontSize: 14,
        color: colors.textSecondary,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: Spacing.m,
        color: colors.text,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: Spacing.m,
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
    },
    saveText: {
        color: 'white',
        fontWeight: 'bold',
    },
    // Type Selector in Modal
    typeSelector: {
        flexDirection: 'row',
        gap: Spacing.m,
        marginBottom: Spacing.m,
    },
    typeOption: {
        flex: 1,
        padding: Spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    selectedTypeOption: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(46, 103, 248, 0.1)',
    },
    typeOptionText: {
        ...Typography.button,
        color: colors.textSecondary,
    },
    selectedTypeOptionText: {
        color: colors.primary,
    },
    historyContainer: {
        marginHorizontal: Spacing.l,
        marginBottom: Spacing.m,
    },
    historyList: {
        gap: Spacing.s,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.m,
        backgroundColor: colors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    logLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.m,
    },
    logInfo: {
        gap: 2,
    },
    logDate: {
        ...Typography.body,
        fontSize: 12,
        color: colors.textSecondary,
    },
    logType: {
        ...Typography.button,
        color: colors.text,
        fontSize: 14,
    },
    logDistance: {
        ...Typography.body,
        fontWeight: 'bold',
        color: colors.text,
    },
    dateButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: Spacing.m,
    },
    dateButtonText: {
        color: colors.text,
        fontSize: 16,
    },
    // Tabs
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.l,
        marginBottom: Spacing.m,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.s,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        ...Typography.button,
        color: colors.textSecondary,
        fontSize: 14,
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    contentArea: {
        flex: 1,
    }
});
