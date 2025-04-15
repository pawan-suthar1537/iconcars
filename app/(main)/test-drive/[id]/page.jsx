import { getCarById } from "@/actions/cars-listing";
import React from "react";
import { TestDriveForm } from "./_components/test-drive-form";

const TestDrive = async ({ params }) => {
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success) {
    notFound();
  }
  return (
    <div>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-6xl mb-6 gradient-title">Book a Test Drive</h1>
        <TestDriveForm
          car={result.data}
          testDriveInfo={result.data.testDriveInfo}
        />
      </div>
    </div>
  );
};

export default TestDrive;
