import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Clock, MapPin } from "lucide-react";

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

export default function RecentOperations({ operations }) {
  return (
    <Card className="shadow-md border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold">Letzte Einsätze</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {operations.slice(0, 5).map((operation) => (
            <div key={operation.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <Badge className={`${operationTypeColors[operation.operation_type]} border mb-2`}>
                    {operation.operation_type}
                  </Badge>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {operation.operation_number || `E-${operation.id.slice(0, 8)}`}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(operation.date), "dd.MM.yyyy HH:mm", { locale: de })}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {operation.location}
                    </div>
                  </div>
                </div>
              </div>
              {operation.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{operation.description}</p>
              )}
            </div>
          ))}
          {operations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              Noch keine Einsätze erfasst
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}