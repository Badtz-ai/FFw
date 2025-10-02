
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Package } from "lucide-react";

const RANKS = [
  "Feuerwehrmann/-frau",
  "Oberfeuerwehrmann/-frau",
  "Hauptfeuerwehrmann/-frau",
  "Löschmeister",
  "Oberlöschmeister",
  "Hauptlöschmeister",
  "Brandmeister",
  "Oberbrandmeister",
  "Hauptbrandmeister",
  "Gruppenführer",
  "Zugführer",
  "Wehrführer"
];

const QUALIFICATIONS = [
  "Truppmann Ausbildung Teil 1",
  "Truppmann Ausbildung Teil 2",
  "Truppführer",
  "Atemschutzgeräteträger",
  "Sprechfunker",
  "Maschinist",
  "Technische Hilfeleistung",
  "Absturzsicherung",
  "Motorsägenführer",
  "Gefahrgut",
  "ABC-Einsatz",
  "Strahlenschutz",
  "Gruppenführer",
  "Zugführer",
  "Verbandsführer",
  "Ausbilder",
  "Jugendfeuerwehrwart",
  "Gerätewart",
  "Atemschutzgerätewart",
  "Erste Hilfe",
  "Sanitätsausbildung"
];

export default function MemberForm({ member, onSave, onCancel }) {
  const [formData, setFormData] = useState(member || {
    first_name: "",
    last_name: "",
    rank: "Feuerwehrmann/-frau",
    status: "aktiv",
    qualifications: [],
    email: "",
    phone: "",
    entry_date: "",
    birth_date: "",
    address: "",
    last_g26: "",
    g26_validity_years: "",
    last_test_track: ""
  });

  const [selectedQual, setSelectedQual] = useState("");
  const [customQualInput, setCustomQualInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clean up empty string values for number fields and optional date/text fields
    const cleanedData = {
      ...formData,
      g26_validity_years: formData.g26_validity_years ? parseInt(formData.g26_validity_years, 10) : undefined,
      last_g26: formData.last_g26 || undefined,
      last_test_track: formData.last_test_track || undefined,
      entry_date: formData.entry_date || undefined,
      birth_date: formData.birth_date || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined
    };
    
    onSave(cleanedData);
  };

  const addQualificationFromSelect = () => {
    if (selectedQual && !formData.qualifications?.includes(selectedQual)) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), selectedQual]
      }));
      setSelectedQual("");
    }
  };

  const addCustomQualification = () => {
    if (customQualInput.trim() && !formData.qualifications?.includes(customQualInput.trim())) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), customQualInput.trim()]
      }));
      setCustomQualInput("");
    }
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const hasAtemschutz = formData.qualifications?.some(q => 
    q.toLowerCase().includes("atemschutz")
  );

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle>{member ? "Kamerad bearbeiten" : "Neuer Kamerad"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Vorname *</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Nachname *</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rank">Dienstgrad *</Label>
              <Select
                value={formData.rank}
                onValueChange={(value) => setFormData({...formData, rank: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RANKS.map((rank) => (
                    <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="aktiv">Aktiv</SelectItem>
                  <SelectItem value="inaktiv">Inaktiv</SelectItem>
                  <SelectItem value="pensioniert">Pensioniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_date">Eintrittsdatum</Label>
              <Input
                id="entry_date"
                type="date"
                value={formData.entry_date || ""}
                onChange={(e) => setFormData({...formData, entry_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Geburtsdatum</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ""}
                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address || ""}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Qualifikationen</Label>
            
            <div className="flex gap-2">
              <Select value={selectedQual} onValueChange={setSelectedQual}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Qualifikation auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {QUALIFICATIONS.filter(q => !formData.qualifications?.includes(q)).map((qual) => (
                    <SelectItem key={qual} value={qual}>{qual}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addQualificationFromSelect}
                disabled={!selectedQual}
              >
                Hinzufügen
              </Button>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Eigene Qualifikation eingeben..."
                value={customQualInput}
                onChange={(e) => setCustomQualInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomQualification())}
              />
              <Button 
                type="button" 
                onClick={addCustomQualification}
                variant="outline"
                disabled={!customQualInput.trim()}
              >
                Eigene
              </Button>
            </div>

            {formData.qualifications && formData.qualifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.qualifications.map((qual, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <span className="text-sm">{qual}</span>
                    <button
                      type="button"
                      onClick={() => removeQualification(idx)}
                      className="hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasAtemschutz && (
            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-blue-600" />
                </div>
                Atemschutz-Daten
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_g26">Letzte G26</Label>
                  <Input
                    id="last_g26"
                    type="date"
                    value={formData.last_g26 || ""}
                    onChange={(e) => setFormData({...formData, last_g26: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="g26_validity_years">Gültigkeit (Jahre)</Label>
                  <Input
                    id="g26_validity_years"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.g26_validity_years || ""}
                    onChange={(e) => setFormData({...formData, g26_validity_years: e.target.value})}
                    placeholder="z.B. 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_test_track">Letzte Teststrecke</Label>
                  <Input
                    id="last_test_track"
                    type="date"
                    value={formData.last_test_track || ""}
                    onChange={(e) => setFormData({...formData, last_test_track: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
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
