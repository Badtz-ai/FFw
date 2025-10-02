
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Truck, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const operationTypeColors = {
  "Brandeinsatz": "bg-red-100 text-red-800 border-red-200",
  "Technische Hilfeleistung": "bg-blue-100 text-blue-800 border-blue-200",
  "Verkehrsunfall": "bg-orange-100 text-orange-800 border-orange-200",
  "Rettungsdienst": "bg-green-100 text-green-800 border-green-200",
  "Gefahrgut": "bg-purple-100 text-purple-800 border-purple-200",
  "Unwetter": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Fehlalarm": "bg-gray-100 text-gray-800 border-gray-200",
  "Sonstiges": "bg-slate-100 text-slate-800 border-slate-200"
};

const severityColors = {
  "niedrig": "bg-green-100 text-green-800",
  "mittel": "bg-yellow-100 text-yellow-800",
  "hoch": "bg-orange-100 text-orange-800",
  "kritisch": "bg-red-100 text-red-800"
};

export default function OperationCard({ operation, onEdit, onDelete }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${operationTypeColors[operation.operation_type]} border`}>
                {operation.operation_type}
              </Badge>
              <Badge className={severityColors[operation.severity]}>
                {operation.severity}
              </Badge>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {operation.operation_number || `E-${operation.id.slice(0, 8)}`}
            </h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(operation)}
              className="hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(operation)}
              className="hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            {format(new Date(operation.date), "dd.MM.yyyy HH:mm", { locale: de })}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            {operation.location}
          </div>
          {operation.participants && operation.participants.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              {operation.participants.length} Einsatzkräfte
            </div>
          )}
          {operation.vehicles && operation.vehicles.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              {operation.vehicles.join(", ")}
            </div>
          )}
        </div>

        {operation.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {operation.description}
          </p>
        )}

        {operation.participants && operation.participants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Eingesetzte Kräfte</p>
            <div className="flex flex-wrap gap-1">
              {operation.participants.slice(0, 6).map((participant, idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  title={participant.member_name + (participant.role ? ` (${participant.role})` : '')}
                >
                  {participant.member_name?.split(' ').map(n => n[0]).join('')}
                </div>
              ))}
              {operation.participants.length > 6 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 text-xs font-bold">
                  +{operation.participants.length - 6}
                </div>
              )}
            </div>
          </div>
        )}

        {operation.commander && (
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <p className="text-xs text-gray-500">Einsatzleiter</p>
            <p className="text-sm font-medium text-gray-900">{operation.commander}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
