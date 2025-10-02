
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Keep Checkbox as it might be used elsewhere or planned for future
import { Badge } from "@/components/ui/badge"; // New import
import { Save, X, Search } from "lucide-react";
import { Member } from "@/api/entities";

const SERVICE_TYPES = [
  "Übungsdienst",
  "Ausbildung",
  "Einsatzübung",
  "Gerätewartung",
  "Besprechung",
  "Jugendfeuerwehr",
  "Öffentlichkeitsarbeit",
  "Sonstiges"
];

export default function ServiceForm({ service, onSave, onCancel }) {
  const [formData, setFormData] = useState(service || {
    title: "",
    service_type: "Übungsdienst",
    participants: []
  });

  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    loadMembers();
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const getParticipantStatus = (memberId) => {
    const participant = formData.participants?.find(p => p.member_id === memberId);
    return participant?.status || null;
  };

  const updateParticipantStatus = (member, status) => {
    const currentParticipants = formData.participants || [];
    const existingIndex = currentParticipants.findIndex(p => p.member_id === member.id);

    if (status === null) {
      // Remove participant
      setFormData({
        ...formData,
        participants: currentParticipants.filter(p => p.member_id !== member.id)
      });
    } else if (existingIndex >= 0) {
      // Update existing participant
      const updated = [...currentParticipants];
      updated[existingIndex] = {
        member_id: member.id,
        member_name: `${member.first_name} ${member.last_name}`,
        status: status
      };
      setFormData({
        ...formData,
        participants: updated
      });
    } else {
      // Add new participant
      setFormData({
        ...formData,
        participants: [
          ...currentParticipants,
          {
            member_id: member.id,
            member_name: `${member.first_name} ${member.last_name}`,
            status: status
          }
        ]
      });
    }
  };

  const selectAllAttended = () => {
    setFormData({
      ...formData,
      participants: filteredMembers.map(m => ({
        member_id: m.id,
        member_name: `${m.first_name} ${m.last_name}`,
        status: "teilgenommen"
      }))
    });
  };

  const deselectAll = () => {
    setFormData({
      ...formData,
      participants: []
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "teilgenommen": return "bg-green-100 text-green-800 border-green-200";
      case "entschuldigt": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "unentschuldigt": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const participantCount = formData.participants?.length || 0;
  const attendedCount = formData.participants?.filter(p => p.status === "teilgenommen").length || 0;
  const excusedCount = formData.participants?.filter(p => p.status === "entschuldigt").length || 0;
  const unexcusedCount = formData.participants?.filter(p => p.status === "unentschuldigt").length || 0;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle>{service ? "Dienst bearbeiten" : "Neuer Dienst"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Bezeichnung *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service_type">Art des Dienstes *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({...formData, service_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
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
              <Label htmlFor="duration_minutes">Dauer (Min)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes || ""}
                onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructor">Ausbilder/Leiter</Label>
              <Input
                id="instructor"
                value={formData.instructor || ""}
                onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between"> {/* Changed items-center to items-start for badge alignment */}
              <div>
                <Label>Teilnehmer ({participantCount})</Label>
                <div className="flex gap-2 mt-1 flex-wrap"> {/* Added flex-wrap for smaller screens */}
                  <Badge className={getStatusColor("teilgenommen")}>
                    {attendedCount} Teilgenommen
                  </Badge>
                  <Badge className={getStatusColor("entschuldigt")}>
                    {excusedCount} Entschuldigt
                  </Badge>
                  <Badge className={getStatusColor("unentschuldigt")}>
                    {unexcusedCount} Unentschuldigt
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={selectAllAttended}>
                  Alle teilgenommen
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                  Alle entfernen
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

            <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
              {filteredMembers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredMembers.map((member) => {
                    const currentStatus = getParticipantStatus(member.id);
                    return (
                      <div
                        key={member.id}
                        className="p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {member.first_name[0]}{member.last_name[0]}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{member.rank}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-13 flex-wrap"> {/* Added flex-wrap for smaller screens */}
                          <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === "teilgenommen" ? "default" : "outline"}
                            className={currentStatus === "teilgenommen" ? "bg-green-600 hover:bg-green-700" : ""}
                            onClick={() => updateParticipantStatus(member, currentStatus === "teilgenommen" ? null : "teilgenommen")}
                          >
                            Teilgenommen
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === "entschuldigt" ? "default" : "outline"}
                            className={currentStatus === "entschuldigt" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                            onClick={() => updateParticipantStatus(member, currentStatus === "entschuldigt" ? null : "entschuldigt")}
                          >
                            Entschuldigt
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={currentStatus === "unentschuldigt" ? "default" : "outline"}
                            className={currentStatus === "unentschuldigt" ? "bg-red-600 hover:bg-red-700" : ""}
                            onClick={() => updateParticipantStatus(member, currentStatus === "unentschuldigt" ? null : "unentschuldigt")}
                          >
                            Unentschuldigt
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Keine Kameraden gefunden
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={2}
            />
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
