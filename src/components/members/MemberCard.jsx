
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Calendar, Edit, AlertCircle, Clock, Trash2 } from "lucide-react";
import { format, addYears, isPast, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { Service } from "@/api/entities";

const statusColors = {
  "aktiv": "bg-green-100 text-green-800 border-green-200",
  "inaktiv": "bg-gray-100 text-gray-800 border-gray-200",
  "pensioniert": "bg-blue-100 text-blue-800 border-blue-200"
};

export default function MemberCard({ member, onEdit, onDelete }) { // Added onDelete prop
  const [serviceHours, setServiceHours] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadServiceHours = useCallback(async () => {
    setLoading(true);
    try {
      const services = await Service.list();
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1);
      const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

      let totalHours = 0;

      services.forEach(service => {
        try {
          const serviceDate = new Date(service.date);
          if (serviceDate >= yearStart && serviceDate <= yearEnd && service.participants) {
            const participant = service.participants.find(p => p.member_id === member.id);
            if (participant && participant.status === "teilgenommen") {
              const hours = (service.duration_minutes || 0) / 60;
              totalHours += hours;
            }
          }
        } catch (e) {
          console.error('Error processing service:', service, e);
        }
      });

      setServiceHours(Math.round(totalHours * 10) / 10);
    } catch (error) {
      console.error('Error loading service hours:', error);
    } finally {
      setLoading(false);
    }
  }, [member.id]); // member.id is a dependency here because it's used inside the function

  useEffect(() => {
    loadServiceHours();
  }, [loadServiceHours]); // loadServiceHours is now a stable function due to useCallback

  const getServiceHoursStatus = () => {
    if (serviceHours < 20) {
      return { color: "bg-red-100 text-red-800 border-red-200", label: "Kritisch", icon: "text-red-600" };
    } else if (serviceHours < 40) {
      return { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Problematisch", icon: "text-yellow-600" };
    } else {
      return { color: "bg-green-100 text-green-800 border-green-200", label: "OK", icon: "text-green-600" };
    }
  };

  const hasAtemschutz = member.qualifications?.some(q => 
    q.toLowerCase().includes("atemschutz")
  );

  const getG26Status = () => {
    if (!member.last_g26 || !member.g26_validity_years) return null;
    
    const expiryDate = addYears(new Date(member.last_g26), member.g26_validity_years);
    const daysUntilExpiry = differenceInDays(expiryDate, new Date());
    
    if (isPast(expiryDate)) {
      return { status: "expired", color: "text-red-600", text: "Abgelaufen" };
    } else if (daysUntilExpiry <= 60) {
      return { status: "warning", color: "text-orange-600", text: `Läuft ab in ${daysUntilExpiry} Tagen` };
    }
    return { status: "valid", color: "text-green-600", text: "Gültig" };
  };

  const getTestTrackStatus = () => {
    if (!member.last_test_track) return null;
    
    const expiryDate = addYears(new Date(member.last_test_track), 1);
    const daysUntilExpiry = differenceInDays(expiryDate, new Date());
    
    if (isPast(expiryDate)) {
      return { status: "expired", color: "text-red-600", text: "Abgelaufen" };
    } else if (daysUntilExpiry <= 60) {
      return { status: "warning", color: "text-orange-600", text: `Läuft ab in ${daysUntilExpiry} Tagen` };
    }
    return { status: "valid", color: "text-green-600", text: "Gültig" };
  };

  const g26Status = hasAtemschutz ? getG26Status() : null;
  const testTrackStatus = hasAtemschutz ? getTestTrackStatus() : null;
  const hoursStatus = getServiceHoursStatus();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md">
              {member.first_name[0]}{member.last_name[0]}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {member.first_name}
              </h3>
              <h3 className="text-xl font-bold text-gray-900 mb-1 leading-tight">
                {member.last_name}
              </h3>
              <p className="text-sm font-medium text-red-600 mb-2">{member.rank}</p>
              <div className="flex gap-2">
                <Badge className={`${statusColors[member.status]} border`}>
                  {member.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-1"> {/* Wrapper div for buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(member)}
              className="hover:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
            </Button>
            {onDelete && ( // Only render delete button if onDelete prop is provided
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(member)}
                className="hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${hoursStatus.icon}`} />
              <div>
                <p className="text-xs text-gray-600">Dienststunden {new Date().getFullYear()}</p>
                <p className="text-lg font-bold text-gray-900">{loading ? "..." : `${serviceHours}h`}</p>
              </div>
            </div>
            {!loading && (
              <Badge className={`${hoursStatus.color} border`}>
                {hoursStatus.label}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {member.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              {member.email}
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              {member.phone}
            </div>
          )}
          {member.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {member.address}
            </div>
          )}
          {member.entry_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              Dabei seit: {format(new Date(member.entry_date), "dd.MM.yyyy", { locale: de })}
            </div>
          )}
        </div>

        {member.qualifications && member.qualifications.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Qualifikationen</p>
            <div className="flex flex-wrap gap-2">
              {member.qualifications.map((qual, idx) => (
                <Badge key={idx} variant="outline" className="bg-gray-50">
                  {qual}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hasAtemschutz && (member.last_g26 || member.last_test_track) && (
          <div className="border-t pt-4 mt-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Atemschutz-Daten</p>
            <div className="space-y-2">
              {member.last_g26 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">G26 Untersuchung:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{format(new Date(member.last_g26), "dd.MM.yyyy", { locale: de })}</span>
                    {g26Status && (
                      <div className={`flex items-center gap-1 ${g26Status.color}`}>
                        {g26Status.status !== "valid" && <AlertCircle className="w-4 h-4" />}
                        <span className="text-xs font-medium">{g26Status.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {member.last_test_track && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Letzte Teststrecke:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{format(new Date(member.last_test_track), "dd.MM.yyyy", { locale: de })}</span>
                    {testTrackStatus && (
                      <div className={`flex items-center gap-1 ${testTrackStatus.color}`}>
                        {testTrackStatus.status !== "valid" && <AlertCircle className="w-4 h-4" />}
                        <span className="text-xs font-medium">{testTrackStatus.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
