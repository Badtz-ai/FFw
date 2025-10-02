
import React, { useState, useEffect } from "react";
import { Equipment } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, MapPin, Calendar, Trash2 } from "lucide-react"; // Added Trash2
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Save } from "lucide-react";

const statusColors = {
  "verfügbar": "bg-green-100 text-green-800 border-green-200",
  "in Verwendung": "bg-blue-100 text-blue-800 border-blue-200",
  "defekt": "bg-red-100 text-red-800 border-red-200",
  "in Prüfung": "bg-yellow-100 text-yellow-800 border-yellow-200"
};

const CATEGORIES = [
  "Atemschutz",
  "Schläuche",
  "Armaturen",
  "Rettungsgeräte",
  "Pumpen",
  "Werkzeug",
  "Schutzkleidung",
  "Kommunikation",
  "Sonstiges"
];

function EquipmentForm({ equipment, onSave, onCancel }) {
  const [formData, setFormData] = useState(equipment || {
    name: "",
    category: "Atemschutz",
    status: "verfügbar",
    quantity: 1
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle>{equipment ? "Ausrüstung bearbeiten" : "Neue Ausrüstung"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bezeichnung *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({...formData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inventory_number">Inventarnummer</Label>
              <Input
                id="inventory_number"
                value={formData.inventory_number || ""}
                onChange={(e) => setFormData({...formData, inventory_number: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Anzahl</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
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
                  <SelectItem value="verfügbar">Verfügbar</SelectItem>
                  <SelectItem value="in Verwendung">In Verwendung</SelectItem>
                  <SelectItem value="defekt">Defekt</SelectItem>
                  <SelectItem value="in Prüfung">In Prüfung</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lagerort</Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="last_check">Letzte Prüfung</Label>
              <Input
                id="last_check"
                type="date"
                value={formData.last_check || ""}
                onChange={(e) => setFormData({...formData, last_check: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_check">Nächste Prüfung</Label>
              <Input
                id="next_check"
                type="date"
                value={formData.next_check || ""}
                onChange={(e) => setFormData({...formData, next_check: e.target.value})}
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

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    let filtered = equipment;

    if (filterCategory !== "all") {
      filtered = filtered.filter(eq => eq.category === filterCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(eq =>
        eq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.inventory_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEquipment(filtered);
  }, [searchTerm, filterCategory, equipment]);

  const loadEquipment = async () => {
    setLoading(true);
    const data = await Equipment.list("-created_date");
    setEquipment(data);
    setFilteredEquipment(data);
    setLoading(false);
  };

  const handleSave = async (equipmentData) => {
    if (editingEquipment) {
      await Equipment.update(editingEquipment.id, equipmentData);
    } else {
      await Equipment.create(equipmentData);
    }
    setShowForm(false);
    setEditingEquipment(null);
    loadEquipment();
  };

  const handleEdit = (equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Möchten Sie "${item.name}" wirklich löschen?`)) {
      await Equipment.delete(item.id);
      loadEquipment();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-green-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Ausrüstung</h1>
            <p className="text-gray-600">Verwaltung der Feuerwehrausrüstung</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neue Ausrüstung
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
              <EquipmentForm
                equipment={editingEquipment}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEquipment(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Ausrüstung suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {filteredEquipment.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                            <Badge className={`${statusColors[item.status]} border`}>
                              {item.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1"> {/* Added wrapper div for buttons */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {item.inventory_number && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Inv.-Nr.:</span>
                            <span className="font-medium">{item.inventory_number}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Anzahl:</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {item.location}
                          </div>
                        )}
                      </div>

                      {item.next_check && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Nächste Prüfung: {format(new Date(item.next_check), "dd.MM.yyyy", { locale: de })}
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

        {!loading && filteredEquipment.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterCategory !== "all" ? "Keine Ausrüstung gefunden" : "Noch keine Ausrüstung erfasst"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
