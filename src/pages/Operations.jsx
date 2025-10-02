
import React, { useState, useEffect } from "react";
import { Operation } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatePresence, motion } from "framer-motion";
import OperationCard from "../components/operations/OperationCard";
import OperationForm from "../components/operations/OperationForm";

export default function Operations() {
  const [operations, setOperations] = useState([]);
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOperations();
  }, []);

  useEffect(() => {
    let filtered = operations;

    if (filterType !== "all") {
      filtered = filtered.filter(op => op.operation_type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(op =>
        op.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.operation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOperations(filtered);
  }, [searchTerm, filterType, operations]);

  const loadOperations = async () => {
    setLoading(true);
    const data = await Operation.list("-date");
    setOperations(data);
    setFilteredOperations(data);
    setLoading(false);
  };

  const handleSave = async (operationData) => {
    if (editingOperation) {
      await Operation.update(editingOperation.id, operationData);
    } else {
      await Operation.create(operationData);
    }
    setShowForm(false);
    setEditingOperation(null);
    loadOperations();
  };

  const handleEdit = (operation) => {
    setEditingOperation(operation);
    setShowForm(true);
  };

  const handleDelete = async (operation) => {
    if (window.confirm(`Möchten Sie den Einsatz ${operation.operation_number || operation.id.slice(0, 8)} wirklich löschen?`)) {
      await Operation.delete(operation.id);
      loadOperations();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Einsätze</h1>
            <p className="text-gray-600">Dokumentation aller Feuerwehreinsätze</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neuer Einsatz
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
              <OperationForm
                operation={editingOperation}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingOperation(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Einsatz suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Alle Einsatzarten" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Einsatzarten</SelectItem>
                <SelectItem value="Brandeinsatz">Brandeinsatz</SelectItem>
                <SelectItem value="Technische Hilfeleistung">Technische Hilfeleistung</SelectItem>
                <SelectItem value="Verkehrsunfall">Verkehrsunfall</SelectItem>
                <SelectItem value="Rettungsdienst">Rettungsdienst</SelectItem>
                <SelectItem value="Gefahrgut">Gefahrgut</SelectItem>
                <SelectItem value="Unwetter">Unwetter</SelectItem>
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
              {filteredOperations.map((operation) => (
                <motion.div
                  key={operation.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  <OperationCard operation={operation} onEdit={handleEdit} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredOperations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || filterType !== "all" ? "Keine Einsätze gefunden" : "Noch keine Einsätze erfasst"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
