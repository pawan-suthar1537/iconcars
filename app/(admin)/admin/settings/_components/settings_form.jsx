"use client";
import { getDealershipInfo, saveworkingHour } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useFetch from "@/hooks/use-fetch";
import { Clock, Loader2, Save } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const SettingsForm = () => {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day) => ({
      dayOfWeek: day.value,
      openTime: "09:00",
      closeTime: "18:00",
      isOpen: day.value !== "SUNDAY",
    }))
  );
  const {
    loading: getDealershipInfoloading,
    fn: getDealershipInfofn,
    data: getDealershipInfodata,
    error: getDealershipInfoerror,
  } = useFetch(getDealershipInfo);
  const {
    loading: saveworkingHourloading,
    fn: saveworkingHourfn,
    data: saveworkingHourdata,
    error: saveworkingHourerror,
  } = useFetch(saveworkingHour);

  useEffect(() => {
    getDealershipInfofn();
  }, []);

  useEffect(() => {
    if (getDealershipInfodata?.success && getDealershipInfodata?.data) {
      const dealership = getDealershipInfodata.data;

      if (dealership.workingHours.length > 0) {
        const mappedhpurs = DAYS.map((day) => {
          const Hourdata = dealership.workingHours.find(
            (h) => h.dayOfWeek === day.value
          );

          if (Hourdata) {
            return {
              dayOfWeek: Hourdata.dayOfWeek,
              openTime: Hourdata.openTime,
              closeTime: Hourdata.closeTime,
              isOpen: Hourdata.isOpen,
            };
          }
          return {
            dayOfWeek: day.value,
            openTime: "09:00",
            closeTime: "18:00",
            isOpen: day.value !== "SUNDAY",
          };
        });
        setWorkingHours(mappedhpurs);
      }
    }
  }, [getDealershipInfodata]);

  useEffect(() => {
    if (getDealershipInfoerror) {
      toast.error("Failed to load dealership settings");
    }

    if (saveworkingHourerror) {
      toast.error(
        `Failed to save working hours: ${saveworkingHourerror.message}`
      );
    }
  }, [getDealershipInfoerror, saveworkingHourerror]);

  const handleSaveHours = async () => {
    await saveworkingHourfn(workingHours);
  };
  useEffect(() => {
    if (saveworkingHourdata?.success) {
      toast.success("Working hours saved successfully");
      getDealershipInfofn();
    }
  }, [saveworkingHourdata]);

  const handleWorkingHourChange = (index, field, value) => {
    const updatedHours = [...workingHours];
    updatedHours[index] = {
      ...updatedHours[index],
      [field]: value,
    };
    setWorkingHours(updatedHours);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hours">
        <TabsList>
          <TabsTrigger value="hours">
            <Clock className="mr-2 w-4 h-4" />
            Working hours
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hours" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set Your Dealership's Working Hour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS.map((day, index) => {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg hover:bg-slate-50"
                    >
                      <div className="col-span-3 md:col-span-2">
                        <div className="font-medium">{day.label}</div>
                      </div>
                      <div className="col-span-9 md:col-span-2 flex items-center">
                        <Checkbox
                          id={`is-open-${day.value}`}
                          checked={workingHours[index]?.isOpen}
                          onCheckedChange={(checked) => {
                            handleWorkingHourChange(index, "isOpen", checked);
                          }}
                        />
                        <Label
                          htmlFor={`is-open-${day.value}`}
                          className="ml-2 cursor-pointer"
                        >
                          {workingHours[index]?.isOpen ? "Open" : "Closed"}
                        </Label>
                      </div>
                      {workingHours[index]?.isOpen && (
                        <>
                          <div className="col-span-5 md:col-span-4">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <Input
                                type="time"
                                value={workingHours[index]?.openTime}
                                onChange={(e) =>
                                  handleWorkingHourChange(
                                    index,
                                    "openTime",
                                    e.target.value
                                  )
                                }
                                className="text-sm"
                              />
                            </div>
                          </div>

                          <div className="text-center col-span-1">to</div>

                          <div className="col-span-5 md:col-span-3">
                            <Input
                              type="time"
                              value={workingHours[index]?.closeTime}
                              onChange={(e) =>
                                handleWorkingHourChange(
                                  index,
                                  "closeTime",
                                  e.target.value
                                )
                              }
                              className="text-sm"
                            />
                          </div>
                        </>
                      )}
                      {!workingHours[index]?.isOpen && (
                        <div className="col-span-11 md:col-span-8 text-gray-500 italic text-sm">
                          Closed all day
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  className="cursor-pointer"
                  onClick={handleSaveHours}
                  disabled={saveworkingHourloading}
                >
                  {saveworkingHourloading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Working Hours
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsForm;
