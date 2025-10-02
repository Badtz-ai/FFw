
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Save, Search } from "lucide-react";
import { Member } from "@/api/entities";
import { Vehicle } from "@/api/entities";

const OPERATION_TYPES = [
  "Brandeinsatz",
  "Technische Hilfeleistung",
  "Verkehrsunfall",
  "Rettungsdienst",
  "Gefahrgut",
  "Unwetter",
  "Fehlalarm",
  "Sonstiges"
];

const OPERATION_ROLES = [
  "Gruppenführer",
  "Zugführer",
  "Maschinist",
  "Atemschutzgeräteträger",
  "Nachrücker",
  "Bereitstellung am Gerätehaus",
  "Einsatzkraft"
];

export default function OperationForm({ operation, onSave, onCancel }) {
  const [formData, setFormData] = useState(operation || {
    operation_type: "Brandeinsatz",
    severity: "mittel",
    status: "laufend",
    vehicles: [],
    participants: []
  });

  const [members, setMembers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    loadMembers();
    loadVehicles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = members.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.rank.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchTerm, members]);

  const loadMembers = async () => {
    const data = await Member.filter({ status: "aktiv" });
    setMembers(data);
    setFilteredMembers(data);
  };

  const loadVehicles = async () => {
    const data = await Vehicle.list();
    setVehicles(data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addVehicle = (e) => {
    if (e) {
      e.preventDefault();
    }
    if (selectedVehicle && !formData.vehicles?.includes(selectedVehicle)) {
      setFormData(prev => ({
        ...prev,
        vehicles: [...(prev.vehicles || []), selectedVehicle]
      }));
      setSelectedVehicle("");
    }
  };

  const removeVehicle = (index, e) => {
    if (e) {
      e.preventDefault();
    }
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index)
    }));
  };

  const updateParticipantRole = (member, role) => {
    setFormData(prev => {
      const currentParticipants = prev.participants || [];
      const existingIndex = currentParticipants.findIndex(p => p.member_id === member.id);

      if (existingIndex >= 0) {
        // Update existing participant
        const updated = [...currentParticipants];
        updated[existingIndex] = {
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          role: role
        };
        return {
          ...prev,
          participants: updated
        };
      } else {
        // Add participant with this role
        return {
          ...prev,
          participants: [
            ...currentParticipants,
            {
              member_id: member.id,
              member_name: `${member.first_name} ${member.last_name}`,
              role: role
            }
          ]
        };
      }
    });
  };

  const toggleParticipant = (member, isChecked) => {
    setFormData(prev => {
      const currentParticipants = prev.participants || [];
      const existingIndex = currentParticipants.findIndex(p => p.member_id === member.id);

      if (isChecked) {
        // If checked, add only if not already present.
        // If already present (e.g., added by clicking a role checkbox), do nothing.
        if (existingIndex === -1) {
          return {
            ...prev,
            participants: [
              ...currentParticipants,
              {
                member_id: member.id,
                member_name: `${member.first_name} ${member.last_name}`,
                role: "Einsatzkraft" // Default role when adding via main checkbox
              }
            ]
          };
        }
      } else {
        // If unchecked, remove completely
        if (existingIndex !== -1) {
          return {
            ...prev,
            participants: currentParticipants.filter(p => p.member_id !== member.id)
          };
        }
      }
      return prev; // If no change needed or member already present and checked
    });
  };

  const getParticipantRole = (memberId) => {
    const participant = formData.participants?.find(p => p.member_id === memberId);
    return participant?.role || null;
  };

  const isSelected = (memberId) => {
    return formData.participants?.some(p => p.member_id === memberId);
  };

  const selectAll = () => {
    setFormData({
      ...formData,
      participants: filteredMembers.map(m => ({
        member_id: m.id,
        member_name: `${m.first_name} ${m.last_name}`,
        role: "Einsatzkraft"
      }))
    });
  };

  const deselectAll = () => {
    setFormData({
      ...formData,
      participants: []
    });
  };

  const availableVehicles = vehicles.filter(v => !formData.vehicles?.includes(v.name));

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle>{operation ? "Einsatz bearbeiten" : "Neuer Einsatz"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operation_number">Einsatznummer</Label>
              <Input
                id="operation_number"
                value={formData.operation_number || ""}
                onChange={(e) => setFormData({...formData, operation_number: e.target.value})}
                placeholder="Automatisch generiert"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operation_type">Einsatzart *</Label>
              <Select
                value={formData.operation_type}
                onValueChange={(value) => setFormData({...formData, operation_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum & Uhrzeit *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={formData.date || ""}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Schweregrad</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => setFormData({...formData, severity: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="niedrig">Niedrig</SelectItem>
                  <SelectItem value="mittel">Mittel</SelectItem>
                  <SelectItem value="hoch">Hoch</SelectItem>
                  <SelectItem value="kritisch">Kritisch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Einsatzort *</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Einsatzbeschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={4}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Dauer (Min)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes || ""}
                onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commander">Einsatzleiter</Label>
              <Input
                id="commander"
                value={formData.commander || ""}
                onChange={(e) => setFormData({...formData, commander: e.target.value})}
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
                  <SelectItem value="laufend">Laufend</SelectItem>
                  <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                  <SelectItem value="in Nachbearbeitung">In Nachbearbeitung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eingesetzte Fahrzeuge</Label>
            <div className="flex gap-2">
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Fahrzeug auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.name}>
                      {vehicle.name} ({vehicle.vehicle_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={(e) => addVehicle(e)}
                variant="secondary"
                disabled={!selectedVehicle}
              >
                Hinzufügen
              </Button>
            </div>
            {formData.vehicles && formData.vehicles.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.vehicles.map((vehicle, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="text-sm">{vehicle}</span>
                    <button
                      type="button"
                      onClick={(e) => removeVehicle(idx, e)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Eingesetzte Kräfte ({formData.participants?.length || 0})</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                  Alle auswählen
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                  Alle abwählen
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Kamerad suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-x-auto overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                        <Checkbox
                          checked={filteredMembers.length > 0 && filteredMembers.every(m => isSelected(m.id))}
                          onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">
                        Kamerad
                      </th>
                      {OPERATION_ROLES.map((role) => (
                        <th key={role} className="px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => {
                        const selected = isSelected(member.id);
                        const currentRole = getParticipantRole(member.id);
                        
                        return (
                          <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${selected ? 'bg-blue-50' : ''}`}>
                            <td className="px-4 py-3">
                              <Checkbox
                                checked={selected}
                                onCheckedChange={(checked) => toggleParticipant(member, checked)}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                  {member.first_name[0]}{member.last_name[0]}
                                </div>
                                <span className="font-medium text-gray-900">
                                  {member.first_name} {member.last_name} ({member.rank})
                                </span>
                              </div>
                            </td>
                            {OPERATION_ROLES.map((role) => (
                              <td key={role} className="px-2 py-3 text-center">
                                <Checkbox
                                  checked={currentRole === role}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      // If checked, assign this role
                                      updateParticipantRole(member, role);
                                    } else {
                                      // If unchecked, and this was the current role, revert to "Einsatzkraft"
                                      if (selected && currentRole === role) {
                                          updateParticipantRole(member, 'Einsatzkraft');
                                      }
                                    }
                                  }}
                                />
                              </td>
                            ))}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={2 + OPERATION_ROLES.length} className="px-4 py-8 text-center text-gray-500">
                          Keine Kameraden gefunden
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
