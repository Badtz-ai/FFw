
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Edit, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const serviceTypeColors = {
  "Übungsdienst": "bg-blue-100 text-blue-800 border-blue-200",
  "Ausbildung": "bg-green-100 text-green-800 border-green-200",
  "Einsatzübung": "bg-orange-100 text-orange-800 border-orange-200",
  "Gerätewartung": "bg-purple-100 text-purple-800 border-purple-200",
  "Besprechung": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Jugendfeuerwehr": "bg-pink-100 text-pink-800 border-pink-200",
  "Öffentlichkeitsarbeit": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Sonstiges": "bg-gray-100 text-gray-800 border-gray-200"
};

export default function ServiceCard({ service, onEdit, onDelete }) {
  const attendedCount = service.participants?.filter(p => p.status === "teilgenommen").length || 0;
  const excusedCount = service.participants?.filter(p => p.status === "entschuldigt").length || 0;
  const unexcusedCount = service.participants?.filter(p => p.status === "unentschuldigt").length || 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Badge className={`${serviceTypeColors[service.service_type]} border mb-2`}>
              {service.service_type}
            </Badge>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {service.title}
            </h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(service)}
              className="hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(service)}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {format(new Date(service.date), "dd.MM.yyyy HH:mm", { locale: de })}
            {service.duration_minutes && ` • ${service.duration_minutes} Min`}
          </div>
          {service.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {service.location}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            {attendedCount} Teilgenommen
            {excusedCount > 0 && ` • ${excusedCount} Entschuldigt`}
            {unexcusedCount > 0 && ` • ${unexcusedCount} Unentschuldigt`}
          </div>
          {service.instructor && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              Leiter: {service.instructor}
            </div>
          )}
        </div>

        {service.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {service.description}
          </p>
        )}

        {service.participants && service.participants.length > 0 && (
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Teilnehmer</p>
            <div className="flex flex-wrap gap-1">
              {service.participants.slice(0, 5).map((participant, idx) => {
                const bgColor = participant.status === "teilgenommen" 
                  ? "from-green-500 to-green-600" 
                  : participant.status === "entschuldigt"
                  ? "from-yellow-500 to-yellow-600"
                  : "from-red-500 to-red-600";
                
                return (
                  <div
                    key={idx}
                    className={`w-8 h-8 bg-gradient-to-br ${bgColor} rounded-full flex items-center justify-center text-white text-xs font-bold`}
                    title={`${participant.member_name} (${participant.status})`}
                  >
                    {participant.member_name?.split(' ').map(n => n[0]).join('')}
                  </div>
                );
              })}
              {service.participants.length > 5 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">
                  +{service.participants.length - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
