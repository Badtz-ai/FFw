import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, bgColor = "bg-red-600" }) {
  const isPositive = trend === "up";
  
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <div className={`absolute top-0 right-0 w-32 h-32 ${bgColor} opacity-5 rounded-full transform translate-x-8 -translate-y-8`} />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <CardTitle className="text-3xl font-bold text-gray-900">
              {value}
            </CardTitle>
          </div>
          <div className={`p-3 rounded-xl ${bgColor} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${bgColor.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardHeader>
      {trendValue && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-1 text-sm">
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {trendValue}
            </span>
            <span className="text-gray-500">vs. letzter Monat</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}