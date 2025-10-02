
import React, { useState, useEffect } from "react";
import { Member } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import MemberCard from "../components/members/MemberCard";
import MemberForm from "../components/members/MemberForm";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = members.filter(m => 
        m.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.rank.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchTerm, members]);

  const loadMembers = async () => {
    setLoading(true);
    const data = await Member.list("-created_date");
    setMembers(data);
    setFilteredMembers(data);
    setLoading(false);
  };

  const handleSave = async (memberData) => {
    if (editingMember) {
      await Member.update(editingMember.id, memberData);
    } else {
      await Member.create(memberData);
    }
    setShowForm(false);
    setEditingMember(null);
    loadMembers();
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = async (member) => {
    if (window.confirm(`Möchten Sie ${member.first_name} ${member.last_name} wirklich löschen?`)) {
      await Member.delete(member.id);
      loadMembers();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Kameraden</h1>
            <p className="text-gray-600">Verwaltung aller Feuerwehrkameraden</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Neuen Kameraden
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
              <MemberForm
                member={editingMember}
                onSave={handleSave}
                onCancel={() => {
                  setShowForm(false);
                  setEditingMember(null);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Kamerad suchen..."
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
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full"
                >
                  <MemberCard member={member} onEdit={handleEdit} onDelete={handleDelete} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? "Keine Kameraden gefunden" : "Noch keine Kameraden erfasst"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
