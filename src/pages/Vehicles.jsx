
import React, { useState, useEffect } from "react";
import { Vehicle } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2 } from "lucide-react"; // Added Trash2 import
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Edit, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

const statusColors = {
  "einsatzbereit": "bg-green-100 text-green-800 border-green-200",
  "in Wartung": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "außer Dienst": "bg-red-100 text-red-800 border-red-200"
};

const VEHICLE_TYPES = ["LF 8", "LF 10", "LF 20", "HLF 10", "HLF 20", "DLK", "TLF", "RW", "ELW", "MTW", "GW", "Sonstiges"];

function VehicleForm({ vehicle, onSave, onCancel }) {
  const [formData, setFormData] = useState(vehicle || {
    name: "",
    vehicle_type: "LF 10",
    status: "einsatzbereit"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle>{vehicle ? "Fahrzeug bearbeiten" : "Neues Fahrzeug"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Funkrufname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Fahrzeugtyp *</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => setFormData({...formData, vehicle_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_plate">Kennzeichen</Label>
              <Input
                id="license_plate"
                value={formData.license_plate || ""}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="einsatzbereit">Einsatzbereit</SelectItem>
                  <SelectItem value="in Wartung">In Wartung</SelectItem>
                  <SelectItem value="außer Dienst">Außer Dienst</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Hersteller</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer || ""}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Baujahr</Label>
              <Input
                id="year"
                type="number"
                value={formData.year || ""}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Kilometerstand</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage || ""}
                onChange={(e) => setFormData({...formData, mileage: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_inspection">Letzte Prüfung</Label>
              <Input
                id="last_inspection"
                type="date"
                value={formData.last_inspection || ""}
                onChange={(e) => setFormData({...formData, last_inspection: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_inspection">Nächste Prüfung</Label>
              <Input
                id="next_inspection"
                type="date"
                value={formData.next_inspection || ""}
                onChange={(e) => setFormData({...formData, next_inspection: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>
        </CardContent>
        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicles.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.vehicle_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.license_plate?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [searchTerm, vehicles]);

  const loadVehicles = async () => {
    setLoading(true);
    const data = await Vehicle.list("-created_date");
    setVehicles(data);
    setFilteredVehicles(data);
    setLoading(false);
  };

  const handleSave = async (vehicleData) => {
    if (editingVehicle) {
      await Vehicle.update(editingVehicle.id, vehicleData);
    } else {
      await Vehicle.create(vehicleData);
    }
    setShowForm(false);
    setEditingVehicle(null);
    loadVehicles();
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (vehicle) => {
    if (window.confirm(`Möchten Sie das Fahrzeug "${vehicle.name}" wirklich löschen?`)) {
      await Vehicle.delete(vehicle.id);
      loadVehicles();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Fahrzeuge</h1>
            <p className="text-gray-600">Verwaltung der Feuerwehrfahrzeuge</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neues Fahrzeug
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <VehicleForm
                vehicle={editingVehicle}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingVehicle(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Fahrzeug suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredVehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Truck className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {vehicle.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{vehicle.vehicle_type}</p>
                            <Badge className={`${statusColors[vehicle.status]} border`}>
                              {vehicle.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1"> {/* Added div to group buttons */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(vehicle)}
                            className="hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(vehicle)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {vehicle.license_plate && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kennzeichen:</span>
                            <span className="font-medium">{vehicle.license_plate}</span>
                          </div>
                        )}
                        {vehicle.manufacturer && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hersteller:</span>
                            <span className="font-medium">{vehicle.manufacturer}</span>
                          </div>
                        )}
                        {vehicle.year && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Baujahr:</span>
                            <span className="font-medium">{vehicle.year}</span>
                          </div>
                        )}
                        {vehicle.mileage && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kilometerstand:</span>
                            <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>

                      {vehicle.next_inspection && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Nächste Prüfung: {format(new Date(vehicle.next_inspection), "dd.MM.yyyy", { locale: de })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? "Keine Fahrzeuge gefunden" : "Noch keine Fahrzeuge erfasst"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
