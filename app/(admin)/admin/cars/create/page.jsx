import React from "react";
import Addcarform from "../_components/add-cars-form";

export const metadata = {
  title: "Add new car | ADMIN",
  description: "Cars | ADMIN",
};

const CarsCreatePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
      <Addcarform />
    </div>
  );
};

export default CarsCreatePage;
