import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useVehicles, Vehicle } from '../../src/context/VehicleContext';
import { Spacing, Typography } from '../../src/theme';

export default function HomeScreen() {
  const { vehicles, isLoading } = useVehicles();
  const { user } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/vehicle-details', params: { id: item.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.type === 'Car' ? 'car-sport' : 'bicycle'} size={24} color={colors.primary} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.plateNumber}>{item.plateNumber}</Text>
          <Text style={styles.vehicleType}>{item.type}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.divider} />
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.totalDistance.toLocaleString()} km</Text>
          <Text style={styles.statLabel}>Total Distance</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{item.trips.length}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="car-outline" size={64} color={colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No Vehicles Yet</Text>
      <Text style={styles.emptySubtitle}>Add your first vehicle to start tracking maintenance and trips.</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/add-vehicle')}
      >
        <Text style={styles.addButtonText}>Add Your First Vehicle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.user_metadata?.full_name || 'Driver'}</Text>
          <Text style={styles.headerTitle}>Your Garage</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/settings')}>
          <Ionicons name="person-circle-outline" size={32} color={colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.listContent, vehicles.length === 0 && styles.listEmpty]}
        ListEmptyComponent={!isLoading ? EmptyState : null}
      />

      {vehicles.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-vehicle')}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.l,
    paddingTop: Spacing.xl, // Extra top padding for SafeArea
  },
  greeting: {
    ...Typography.body,
    fontSize: 14,
    color: colors.textSecondary,
  },
  headerTitle: {
    ...Typography.h1,
    color: colors.text,
    fontSize: 28,
  },
  profileButton: {
    padding: Spacing.s,
  },
  listContent: {
    padding: Spacing.l,
    paddingBottom: 100, // Space for FAB
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: Spacing.m,
    marginBottom: Spacing.m,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.m,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(46, 103, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.m,
  },
  vehicleInfo: {
    flex: 1,
  },
  plateNumber: {
    ...Typography.h2,
    color: colors.text,
    fontSize: 18,
  },
  vehicleType: {
    ...Typography.body,
    color: colors.textSecondary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: Spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
  },
  statValue: {
    ...Typography.h2,
    color: colors.text,
    fontSize: 16,
  },
  statLabel: {
    ...Typography.body,
    color: colors.textSecondary,
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: Spacing.l,
    opacity: 0.5,
  },
  emptyTitle: {
    ...Typography.h2,
    color: colors.text,
    marginBottom: Spacing.s,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: Spacing.m,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
  },
  addButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
