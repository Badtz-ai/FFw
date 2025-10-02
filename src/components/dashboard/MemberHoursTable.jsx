
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Service } from "@/api/entities";
import { Operation } from "@/api/entities";
import { Member } from "@/api/entities";
import { Clock, TrendingUp, Award } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MemberHoursTable() {
  const [memberStats, setMemberStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sortBy, setSortBy] = useState("total");
  const [totalCounts, setTotalCounts] = useState({ services: 0, operations: 0 });

  const loadMemberHours = useCallback(async () => {
    setLoading(true);
    
    try {
      const [services, operations, members] = await Promise.all([
        Service.list(),
        Operation.list(),
        Member.filter({ status: "aktiv" })
      ]);

      const yearStart = new Date(parseInt(selectedYear), 0, 1);
      const yearEnd = new Date(parseInt(selectedYear), 11, 31, 23, 59, 59);

      const stats = {};

      members.forEach(member => {
        stats[member.id] = {
          member_id: member.id,
          member_name: `${member.first_name} ${member.last_name}`,
          rank: member.rank,
          service_hours: 0,
          operation_hours: 0,
          total_hours: 0,
          service_count: 0,
          operation_count: 0
        };
      });

      let totalServicesCount = 0;
      let totalOperationsCount = 0;

      services.forEach(service => {
        try {
          const serviceDate = new Date(service.date);
          if (serviceDate >= yearStart && serviceDate <= yearEnd && service.participants) {
            totalServicesCount++;
            const hours = (service.duration_minutes || 0) / 60;
            
            service.participants.forEach(participant => {
              // Nur "teilgenommen" Status zählt für Stunden
              if (participant.status === "teilgenommen" && stats[participant.member_id]) {
                stats[participant.member_id].service_hours += hours;
                stats[participant.member_id].service_count += 1;
              }
            });
          }
        } catch (e) {
          console.error('Error processing service:', service, e);
        }
      });

      operations.forEach(operation => {
        try {
          const operationDate = new Date(operation.date);
          if (operationDate >= yearStart && operationDate <= yearEnd && operation.participants) {
            totalOperationsCount++;
            const hours = (operation.duration_minutes || 0) / 60;
            
            operation.participants.forEach(participant => {
              if (stats[participant.member_id]) {
                stats[participant.member_id].operation_hours += hours;
                stats[participant.member_id].operation_count += 1;
              }
            });
          }
        } catch (e) {
          console.error('Error processing operation:', operation, e);
        }
      });

      setTotalCounts({ services: totalServicesCount, operations: totalOperationsCount });

      Object.keys(stats).forEach(id => {
        stats[id].total_hours = stats[id].service_hours + stats[id].operation_hours;
        stats[id].service_hours = Math.round(stats[id].service_hours * 10) / 10;
        stats[id].operation_hours = Math.round(stats[id].operation_hours * 10) / 10;
        stats[id].total_hours = Math.round(stats[id].total_hours * 10) / 10;
      });

      const statsArray = Object.values(stats).filter(s => s.total_hours > 0);
      
      const sorted = statsArray.sort((a, b) => {
        if (sortBy === "total") return b.total_hours - a.total_hours;
        if (sortBy === "service") return b.service_hours - a.service_hours;
        if (sortBy === "operation") return b.operation_hours - a.operation_hours;
        return 0;
      });
      
      setMemberStats(sorted);
    } catch (error) {
      console.error('Error loading member hours:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, sortBy]);

  useEffect(() => {
    loadMemberHours();
  }, [loadMemberHours]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Removed: const topPerformer = memberStats[0];

  const totalStats = {
    service_count: totalCounts.services,
    service_hours: Math.round(memberStats.reduce((sum, m) => sum + m.service_hours, 0) * 10) / 10,
    operation_count: totalCounts.operations,
    operation_hours: Math.round(memberStats.reduce((sum, m) => sum + m.operation_hours, 0) * 10) / 10,
    total_hours: Math.round(memberStats.reduce((sum, m) => sum + m.total_hours, 0) * 10) / 10
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold mb-1">Geleistete Stunden</CardTitle>
            <p className="text-sm text-gray-600">Dienst- und Einsatzstunden pro Kamerad</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Gesamt</SelectItem>
                <SelectItem value="service">Dienststunden</SelectItem>
                <SelectItem value="operation">Einsatzstunden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : memberStats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Keine Daten für {selectedYear} verfügbar
          </div>
        ) : (
          <>
            {/* Removed: Top-Performer section */}
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kamerad
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dienste
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dienststunden
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Einsätze
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Einsatzstunden
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Gesamt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {memberStats.map((member, index) => (
                    <tr key={member.member_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <TrendingUp className="w-4 h-4 text-amber-500 mr-2" />}
                          <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{member.member_name}</p>
                          <p className="text-xs text-gray-500">{member.rank}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {member.service_count}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900">{member.service_hours}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {member.operation_count}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-gray-900">{member.operation_hours}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-red-600" />
                          <span className="text-base font-bold text-gray-900">{member.total_hours}h</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-red-50 border-t-2 border-red-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap" colSpan="2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Gesamt ({memberStats.length} Kameraden)</p>
                          <p className="text-xs text-gray-600">Summe aller geleisteten Stunden</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-bold">
                        {totalStats.service_count}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-5 h-5 text-blue-700" />
                        <span className="text-base font-bold text-gray-900">{totalStats.service_hours}h</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 font-bold">
                        {totalStats.operation_count}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-5 h-5 text-orange-700" />
                        <span className="text-base font-bold text-gray-900">{totalStats.operation_hours}h</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-5 h-5 text-red-700" />
                        <span className="text-xl font-bold text-red-700">{totalStats.total_hours}h</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
