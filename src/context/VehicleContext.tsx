import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type VehicleType = 'Car' | 'Motorcycle';

export type Trip = {
    id: string;
    date: string; // ISO String
    distance: number; // in km
    name?: string;
};

export type Vehicle = {
    id: string;
    type: VehicleType;
    plateNumber: string;
    trips: Trip[];
    totalDistance: number;
    lastOilService: number;
    lastMaintenanceService: number;
};

export type ServiceType = 'Oil' | 'Maintenance';

type VehicleContextType = {
    vehicles: Vehicle[];
    addVehicle: (type: VehicleType, plateNumber: string) => Promise<boolean>;
    updateVehicle: (id: string, type: VehicleType, plateNumber: string) => Promise<boolean>;
    deleteVehicle: (id: string) => Promise<boolean>;
    addTrip: (vehicleId: string, trip: Omit<Trip, 'id'>) => Promise<void>;
    deleteTrip: (tripId: string) => Promise<boolean>;
    performService: (vehicleId: string, serviceType: ServiceType) => Promise<boolean>;
    getVehicle: (id: string) => Vehicle | undefined;
    isLoading: boolean;
};

const VehicleContext = createContext<VehicleContextType>({
    vehicles: [],
    addVehicle: async () => false,
    updateVehicle: async () => false,
    deleteVehicle: async () => false,
    addTrip: async () => { },
    deleteTrip: async () => false,
    performService: async () => false,
    getVehicle: () => undefined,
    isLoading: false,
});

export function useVehicles() {
    return useContext(VehicleContext);
}

export function VehicleProvider({ children }: { children: React.ReactNode }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth(); // We need the user to know when to fetch

    useEffect(() => {
        if (user) {
            loadVehicles();
        } else {
            setVehicles([]);
            setIsLoading(false);
        }
    }, [user]);

    const loadVehicles = async () => {
        setIsLoading(true);
        try {
            // Fetch vehicles with trips
            const { data: fullData, error: joinError } = await supabase
                .from('vehicles')
                .select('*, trips(*)');

            if (joinError) throw joinError;

            const parsedVehicles: Vehicle[] = fullData.map((v: any) => ({
                id: v.id,
                type: v.type,
                plateNumber: v.plate_number,
                totalDistance: parseFloat(v.total_distance) || 0,
                lastOilService: parseFloat(v.last_oil_service_km) || 0,
                lastMaintenanceService: parseFloat(v.last_maintenance_service_km) || 0,
                trips: v.trips ? v.trips.map((t: any) => ({
                    id: t.id,
                    date: t.date,
                    distance: parseFloat(t.distance),
                    name: t.name
                })) : []
            }));

            setVehicles(parsedVehicles);
        } catch (e: any) {
            console.error('Failed to load vehicles', e);
            Alert.alert('Error', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const addVehicle = async (type: VehicleType, plateNumber: string): Promise<boolean> => {
        if (!user) return false;

        // Supabase enforces Uniqueness via the database constraint we added
        try {
            const { error } = await supabase
                .from('vehicles')
                .insert({
                    user_id: user.id,
                    type,
                    plate_number: plateNumber,
                    total_distance: 0
                });

            if (error) {
                if (error.code === '23505') { // Unique violation code
                    return false;
                }
                throw error;
            }

            await loadVehicles(); // Refresh list
            return true;
        } catch (e: any) {
            Alert.alert('Error adding vehicle', e.message);
            return false;
        }
    };

    const updateVehicle = async (id: string, type: VehicleType, plateNumber: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .update({ type, plate_number: plateNumber })
                .eq('id', id);

            if (error) throw error;
            await loadVehicles();
            return true;
        } catch (e: any) {
            Alert.alert('Error updating vehicle', e.message);
            return false;
        }
    };

    const deleteVehicle = async (id: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await loadVehicles();
            return true;
        } catch (e: any) {
            Alert.alert('Error deleting vehicle', e.message);
            return false;
        }
    };

    const performService = async (vehicleId: string, serviceType: ServiceType): Promise<boolean> => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return false;

        const updates: any = {};
        // When checking 'Oil', update oil service km
        if (serviceType === 'Oil') {
            updates.last_oil_service_km = vehicle.totalDistance;
        }
        // When checking 'Maintenance' (which usually acts as a major service), 
        // it might cover oil too depending on real world, but based on user prompt separate icons:
        // "oil icon ... and prompt an oil and a maintenance icon"
        // so we treat them as individual resets.
        if (serviceType === 'Maintenance') {
            updates.last_maintenance_service_km = vehicle.totalDistance;
        }

        try {
            const { error } = await supabase
                .from('vehicles')
                .update(updates)
                .eq('id', vehicleId);

            if (error) throw error;
            await loadVehicles();
            return true;
        } catch (e: any) {
            Alert.alert('Error performing service', e.message);
            return false;
        }
    };

    const addTrip = async (vehicleId: string, tripData: Omit<Trip, 'id'>) => {
        try {
            // Insert trip
            const { error: tripError } = await supabase
                .from('trips')
                .insert({
                    vehicle_id: vehicleId,
                    date: tripData.date,
                    distance: tripData.distance,
                    name: tripData.name
                });

            if (tripError) throw tripError;

            // Recalculate total distance
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if (vehicle) {
                const newTotal = vehicle.totalDistance + tripData.distance;
                const { error: updateError } = await supabase
                    .from('vehicles')
                    .update({ total_distance: newTotal })
                    .eq('id', vehicleId);

                if (updateError) throw updateError;
            }

            await loadVehicles(); // Refresh list
        } catch (e: any) {
            Alert.alert('Error adding trip', e.message);
        }
    };

    const deleteTrip = async (tripId: string): Promise<boolean> => {
        try {
            let tripToDelete: Trip | undefined;
            let vehicleId: string | undefined;

            for (const v of vehicles) {
                const t = v.trips.find(t => t.id === tripId);
                if (t) {
                    tripToDelete = t;
                    vehicleId = v.id;
                    break;
                }
            }

            if (!tripToDelete || !vehicleId) return false;

            const { error } = await supabase
                .from('trips')
                .delete()
                .eq('id', tripId);

            if (error) throw error;

            // Update total distance
            const vehicle = vehicles.find(v => v.id === vehicleId);
            if (vehicle) {
                const newTotal = Math.max(0, vehicle.totalDistance - tripToDelete.distance);
                await supabase
                    .from('vehicles')
                    .update({ total_distance: newTotal })
                    .eq('id', vehicleId);
            }

            await loadVehicles();
            return true;
        } catch (e: any) {
            Alert.alert('Error deleting trip', e.message);
            return false;
        }
    };

    const getVehicle = (id: string) => vehicles.find(v => v.id === id);

    return (
        <VehicleContext.Provider value={{ vehicles, addVehicle, updateVehicle, deleteVehicle, addTrip, deleteTrip, performService, getVehicle, isLoading }}>
            {children}
        </VehicleContext.Provider>
    );
}
