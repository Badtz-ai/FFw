
import React, { useState, useEffect } from "react";
import { Service } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import ServiceCard from "../components/services/ServiceCard";
import ServiceForm from "../components/services/ServiceForm";

export default function Services() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    let filtered = services;

    if (filterType !== "all") {
      filtered = filtered.filter(s => s.service_type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchTerm, filterType, services]);

  const loadServices = async () => {
    setLoading(true);
    const data = await Service.list("-date");
    setServices(data);
    setFilteredServices(data);
    setLoading(false);
  };

  const handleSave = async (serviceData) => {
    if (editingService) {
      await Service.update(editingService.id, serviceData);
    } else {
      await Service.create(serviceData);
    }
    setShowForm(false);
    setEditingService(null);
    loadServices();
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async (service) => {
    if (window.confirm(`Möchten Sie den Dienst "${service.title}" wirklich löschen?`)) {
      await Service.delete(service.id);
      loadServices();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dienste</h1>
            <p className="text-gray-600">Erfassung geleisteter Dienste und Teilnahmen</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neuer Dienst
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
              <ServiceForm
                service={editingService}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingService(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Dienst suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Alle Dienstarten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Dienstarten</SelectItem>
                <SelectItem value="Übungsdienst">Übungsdienst</SelectItem>
                <SelectItem value="Ausbildung">Ausbildung</SelectItem>
                <SelectItem value="Einsatzübung">Einsatzübung</SelectItem>
                <SelectItem value="Gerätewartung">Gerätewartung</SelectItem>
                <SelectItem value="Besprechung">Besprechung</SelectItem>
                <SelectItem value="Jugendfeuerwehr">Jugendfeuerwehr</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-72 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  <ServiceCard service={service} onEdit={handleEdit} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterType !== "all" ? "Keine Dienste gefunden" : "Noch keine Dienste erfasst"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
