import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon } from "lucide-react";

const Schedule = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: preventiveSchedules } = useQuery({
    queryKey: ["preventive-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("preventive_schedules")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: maintenanceRecords } = useQuery({
    queryKey: ["maintenance-records"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .in("status", ["open", "in_progress"]);
      if (error) throw error;
      return data;
    },
  });

  const getDatesWithEvents = () => {
    const dates = new Set<string>();

    preventiveSchedules?.forEach((schedule) => {
      dates.add(new Date(schedule.next_due_date).toDateString());
    });

    maintenanceRecords?.forEach((record) => {
      if (record.started_at) {
        dates.add(new Date(record.started_at).toDateString());
      }
    });

    return dates;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    const events: any[] = [];

    preventiveSchedules?.forEach((schedule) => {
      if (new Date(schedule.next_due_date).toDateString() === dateStr) {
        events.push({
          type: "preventive",
          title: schedule.schedule_name,
          data: schedule,
        });
      }
    });

    maintenanceRecords?.forEach((record) => {
      if (record.started_at && new Date(record.started_at).toDateString() === dateStr) {
        events.push({
          type: "maintenance",
          title: `${record.work_order_number} - ${record.maintenance_type}`,
          data: record,
        });
      }
    });

    return events;
  };

  const datesWithEvents = getDatesWithEvents();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          Maintenance Schedule
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage your maintenance calendar
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                hasEvent: (date) => datesWithEvents.has(date.toDateString()),
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? `Events for ${selectedDate.toLocaleDateString()}`
                : "Select a Date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{event.title}</p>
                      <Badge
                        variant={
                          event.type === "preventive" ? "default" : "secondary"
                        }
                      >
                        {event.type === "preventive" ? "Preventive" : "Maintenance"}
                      </Badge>
                    </div>
                    {event.type === "preventive" && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Frequency: Every {event.data.frequency_value} {event.data.frequency_type}</p>
                        {event.data.assigned_to && (
                          <p>Assigned: {event.data.assigned_to}</p>
                        )}
                        {event.data.estimated_duration_hours && (
                          <p>Duration: {event.data.estimated_duration_hours}h</p>
                        )}
                      </div>
                    )}
                    {event.type === "maintenance" && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Priority: {event.data.priority}</p>
                        <p>Status: {event.data.status}</p>
                        {event.data.assigned_to && (
                          <p>Assigned: {event.data.assigned_to}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No events scheduled for this date
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Preventive Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {preventiveSchedules
                ?.sort(
                  (a, b) =>
                    new Date(a.next_due_date).getTime() -
                    new Date(b.next_due_date).getTime()
                )
                .slice(0, 5)
                .map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{schedule.schedule_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(schedule.next_due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>Preventive</Badge>
                  </div>
                ))}
              {preventiveSchedules?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No preventive maintenance scheduled
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {maintenanceRecords
                ?.sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return (
                    priorityOrder[a.priority as keyof typeof priorityOrder] -
                    priorityOrder[b.priority as keyof typeof priorityOrder]
                  );
                })
                .slice(0, 5)
                .map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{record.work_order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.maintenance_type} - {record.priority} priority
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "in_progress" ? "default" : "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                  </div>
                ))}
              {maintenanceRecords?.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No active work orders
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;
