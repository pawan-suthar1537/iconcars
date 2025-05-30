import React from "react";
import { Dashboard } from "./_components/Dashboard";
import { getDashboardData } from "@/actions/admin";

const Adminpage = async () => {
  const dashboardData = await getDashboardData();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Dashboard initialData={dashboardData} />
    </div>
  );
};

export default Adminpage;
