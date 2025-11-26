import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Cog, Calendar, MapPin, FileText } from "lucide-react";

interface MachineData {
  id: string;
  name: string;
  model: string;
  serial_number: string;
  manufacturer: string;
  installation_date: string;
  location: string | null;
  description: string | null;
  status: string;
  image_url: string | null;
}

const Machine = () => {
  const { toast } = useToast();
  const [machine, setMachine] = useState<MachineData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachine();
  }, []);

  const fetchMachine = async () => {
    try {
      const { data, error } = await supabase
        .from("machine")
        .select("*")
        .single();

      if (error) throw error;
      setMachine(data);
    } catch (error) {
      console.error("Error fetching machine:", error);
      toast({
        title: "Error",
        description: "Failed to load machine data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading machine data...</div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">No machine found</div>
      </div>
    );
  }

  const statusColors = {
    operational: "bg-success",
    maintenance: "bg-warning",
    down: "bg-destructive",
    decommissioned: "bg-muted",
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Machine Overview</h1>
        <p className="text-muted-foreground mt-2">
          Coffee Roaster Details and Status
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Machine Card */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">{machine.name}</h2>
              <p className="text-muted-foreground mt-1">{machine.model}</p>
            </div>
            <Badge
              className={statusColors[machine.status as keyof typeof statusColors]}
            >
              {machine.status.toUpperCase()}
            </Badge>
          </div>

          {machine.image_url && (
            <div className="mb-6 rounded-lg overflow-hidden bg-muted">
              <img
                src={machine.image_url}
                alt={machine.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Cog className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Manufacturer</p>
                <p className="text-muted-foreground">{machine.manufacturer}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Serial Number</p>
                <p className="text-muted-foreground">{machine.serial_number}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Installation Date</p>
                <p className="text-muted-foreground">
                  {new Date(machine.installation_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-muted-foreground">
                  {machine.location || "Not specified"}
                </p>
              </div>
            </div>

            {machine.description && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-muted-foreground">{machine.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Card */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Machine Age</p>
                <p className="text-lg font-semibold">
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(machine.installation_date).getTime()) /
                      (1000 * 60 * 60 * 24 * 365)
                  )}{" "}
                  years
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Status</p>
                <p className="text-lg font-semibold capitalize">
                  {machine.status}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-info/10 border-info">
            <h3 className="font-semibold mb-2 text-info-foreground">
              Machine Locked
            </h3>
            <p className="text-sm text-muted-foreground">
              This is the only machine in the system. No additional machines can be added.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Machine;