
import React, { useState, useEffect } from "react";
import { Member, Operation, Vehicle, Equipment } from "@/api/entities";
import { Users, Siren, Truck, Package, AlertTriangle } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import RecentOperations from "../components/dashboard/RecentOperations";
import MemberHoursTable from "../components/dashboard/MemberHoursTable";
import MemberOverview from "../components/dashboard/MemberOverview"; // Added import
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [stats, setStats] = useState({
    members: 0,
    operations: 0,
    vehicles: 0,
    equipment: 0
  });
  const [recentOperations, setRecentOperations] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [members, operations, vehicles, equipment] = await Promise.all([
      Member.list(),
      Operation.list("-date", 10),
      Vehicle.list(),
      Equipment.list()
    ]);

    setStats({
      members: members.length,
      operations: operations.length,
      vehicles: vehicles.length,
      equipment: equipment.length
    });

    setRecentOperations(operations);
    setVehicleStatus(vehicles);
    setLoading(false);
  };

  const getVehiclesInMaintenance = () => {
    return vehicleStatus.filter(v => v.status === "in Wartung").length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Übersicht über alle wichtigen Kennzahlen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Kameraden"
            value={stats.members}
            icon={Users}
            bgColor="bg-red-600"
            trend="up"
            trendValue="+3"
          />
          <StatCard
            title="Einsätze (Gesamt)"
            value={stats.operations}
            icon={Siren}
            bgColor="bg-orange-600"
            trend="down"
            trendValue="-2"
          />
          <StatCard
            title="Fahrzeuge"
            value={stats.vehicles}
            icon={Truck}
            bgColor="bg-blue-600"
          />
          <StatCard
            title="Ausrüstung"
            value={stats.equipment}
            icon={Package}
            bgColor="bg-green-600"
          />
        </div>

        <div className="mb-8">
          <MemberHoursTable />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentOperations operations={recentOperations} />
          </div>

          <div className="space-y-6">
            {/* Added MemberOverview component */}
            <MemberOverview /> 

            <Card className="shadow-md border-0">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-xl font-bold">Fahrzeugstatus</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {vehicleStatus.length > 0 ? (
                  <div className="space-y-4">
                    {vehicleStatus.slice(0, 5).map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{vehicle.name}</p>
                            <p className="text-xs text-gray-500">{vehicle.vehicle_type}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={
                            vehicle.status === "einsatzbereit" 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : vehicle.status === "in Wartung"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Keine Fahrzeuge erfasst
                  </div>
                )}
              </CardContent>
            </Card>

            {getVehiclesInMaintenance() > 0 && (
              <Card className="shadow-md border-0 border-l-4 border-l-yellow-500">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Wartung erforderlich</h4>
                      <p className="text-sm text-gray-600">
                        {getVehiclesInMaintenance()} Fahrzeug(e) befinden sich aktuell in Wartung
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
