
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Member } from "@/api/entities";
import { Users, TrendingUp, Calendar } from "lucide-react";
import { differenceInYears } from "date-fns";

export default function MemberOverview() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    retired: 0,
    averageAge: 0,
    youngestAge: 0,
    oldestAge: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemberStats();
  }, []);

  const loadMemberStats = async () => {
    setLoading(true);
    const members = await Member.list();
    
    const activeMembers = members.filter(m => m.status === "aktiv");
    const inactiveMembers = members.filter(m => m.status === "inaktiv");
    const retiredMembers = members.filter(m => m.status === "pensioniert");
    
    const membersWithAge = members.filter(m => m.birth_date);
    const ages = membersWithAge.map(m => 
      differenceInYears(new Date(), new Date(m.birth_date))
    );
    
    const averageAge = ages.length > 0 
      ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
      : 0;
    
    const youngestAge = ages.length > 0 ? Math.min(...ages) : 0;
    const oldestAge = ages.length > 0 ? Math.max(...ages) : 0;

    setStats({
      total: members.length,
      active: activeMembers.length,
      inactive: inactiveMembers.length,
      retired: retiredMembers.length,
      averageAge,
      youngestAge,
      oldestAge
    });
    
    setLoading(false);
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-red-600" />
          Kameradenübersicht
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-600">Kameraden</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-2xl font-bold text-gray-900">{stats.averageAge}</p>
                    <p className="text-xs text-gray-600">Ø Alter</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Aktive Kameraden</span>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {stats.active}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Inaktive Kameraden</span>
                </div>
                <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                  {stats.inactive}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Pensionierte Kameraden</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {stats.retired}
                </Badge>
              </div>
            </div>

            {stats.averageAge > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Altersverteilung</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{stats.youngestAge}</p>
                    <p className="text-xs text-gray-600">Jüngster Kamerad</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <p className="text-2xl font-bold text-orange-700">{stats.oldestAge}</p>
                    <p className="text-xs text-gray-600">Ältester Kamerad</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
