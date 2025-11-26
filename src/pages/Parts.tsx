import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Package, AlertTriangle, Pencil } from "lucide-react";

interface PartInventory {
  quantity_on_hand: number;
  quantity_available: number;
}

interface Part {
  id: string;
  part_number: string;
  name: string;
  description: string | null;
  category: string;
  unit_of_measure: string;
  unit_cost: number;
  min_stock_level: number;
  reorder_point: number;
  reorder_quantity: number;
  lead_time_days: number;
  part_inventory?: PartInventory | PartInventory[];
}

const Parts = () => {
  const { toast } = useToast();
  const [parts, setParts] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [newPart, setNewPart] = useState({
    part_number: "",
    name: "",
    description: "",
    category: "",
    unit_of_measure: "unit",
    unit_cost: "0",
    min_stock_level: "0",
    reorder_point: "0",
    reorder_quantity: "0",
    lead_time_days: "0",
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from("parts")
        .select(`
          *,
          part_inventory (
            quantity_on_hand,
            quantity_available
          )
        `)
        .order("name");

      if (error) throw error;
      setParts(data || []);
    } catch (error) {
      console.error("Error fetching parts:", error);
      toast({
        title: "Error",
        description: "Failed to load parts",
        variant: "destructive",
      });
    }
  };

  const handleAddPart = async () => {
    try {
      const { data: partData, error: partError } = await supabase
        .from("parts")
        .insert([{
          ...newPart,
          unit_cost: parseFloat(newPart.unit_cost),
          min_stock_level: parseInt(newPart.min_stock_level),
          reorder_point: parseInt(newPart.reorder_point),
          reorder_quantity: parseInt(newPart.reorder_quantity),
          lead_time_days: parseInt(newPart.lead_time_days),
        }])
        .select()
        .single();

      if (partError) throw partError;

      // Create inventory record
      const { error: inventoryError } = await supabase
        .from("part_inventory")
        .insert([{
          part_id: partData.id,
          quantity_on_hand: 0,
          quantity_reserved: 0,
        }]);

      if (inventoryError) throw inventoryError;

      toast({
        title: "Success",
        description: "Part added successfully",
      });

      setIsAddDialogOpen(false);
      setNewPart({
        part_number: "",
        name: "",
        description: "",
        category: "",
        unit_of_measure: "unit",
        unit_cost: "0",
        min_stock_level: "0",
        reorder_point: "0",
        reorder_quantity: "0",
        lead_time_days: "0",
      });
      fetchParts();
    } catch (error) {
      console.error("Error adding part:", error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive",
      });
    }
  };

  const filteredParts = parts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditPart = async () => {
    if (!editingPart) return;
    
    try {
      const inventory = Array.isArray(editingPart.part_inventory)
        ? editingPart.part_inventory?.[0]
        : editingPart.part_inventory;

      if (!inventory) {
        toast({
          title: "Error",
          description: "No inventory record found",
          variant: "destructive",
        });
        return;
      }

      const quantity = parseInt(newQuantity);
      const { error } = await supabase
        .from("part_inventory")
        .update({ 
          quantity_on_hand: quantity,
          quantity_available: quantity 
        })
        .eq("part_id", editingPart.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingPart(null);
      setNewQuantity("");
      fetchParts();
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  const getStockStatus = (part: Part) => {
    const inventory = Array.isArray(part.part_inventory) 
      ? part.part_inventory?.[0] 
      : part.part_inventory;
    if (!inventory) return { label: "No Data", color: "bg-muted" };
    
    const qty = inventory.quantity_available;
    if (qty <= 0) return { label: "Out of Stock", color: "bg-destructive" };
    if (qty <= part.reorder_point) return { label: "Low Stock", color: "bg-warning" };
    return { label: "In Stock", color: "bg-success" };
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Parts Inventory</h1>
          <p className="text-muted-foreground mt-2">
            Manage spare parts and inventory levels
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Part</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <Label>Part Number *</Label>
                <Input
                  value={newPart.part_number}
                  onChange={(e) => setNewPart({ ...newPart, part_number: e.target.value })}
                  placeholder="PN-001"
                />
              </div>
              <div>
                <Label>Name *</Label>
                <Input
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  placeholder="Heating Element"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Input
                  value={newPart.description}
                  onChange={(e) => setNewPart({ ...newPart, description: e.target.value })}
                  placeholder="Part description"
                />
              </div>
              <div>
                <Label>Category *</Label>
                <Input
                  value={newPart.category}
                  onChange={(e) => setNewPart({ ...newPart, category: e.target.value })}
                  placeholder="Electrical"
                />
              </div>
              <div>
                <Label>Unit Cost *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newPart.unit_cost}
                  onChange={(e) => setNewPart({ ...newPart, unit_cost: e.target.value })}
                />
              </div>
              <div>
                <Label>Min Stock Level *</Label>
                <Input
                  type="number"
                  value={newPart.min_stock_level}
                  onChange={(e) => setNewPart({ ...newPart, min_stock_level: e.target.value })}
                />
              </div>
              <div>
                <Label>Reorder Point *</Label>
                <Input
                  type="number"
                  value={newPart.reorder_point}
                  onChange={(e) => setNewPart({ ...newPart, reorder_point: e.target.value })}
                />
              </div>
              <div>
                <Label>Reorder Quantity *</Label>
                <Input
                  type="number"
                  value={newPart.reorder_quantity}
                  onChange={(e) => setNewPart({ ...newPart, reorder_quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Lead Time (days) *</Label>
                <Input
                  type="number"
                  value={newPart.lead_time_days}
                  onChange={(e) => setNewPart({ ...newPart, lead_time_days: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPart}>Add Part</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search parts by name, part number, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Parts Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Part Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No parts found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredParts.map((part) => {
                const status = getStockStatus(part);
                const inventory = Array.isArray(part.part_inventory) 
                  ? part.part_inventory?.[0] 
                  : part.part_inventory;
                
                return (
                  <TableRow key={part.id}>
                    <TableCell className="font-medium">{part.part_number}</TableCell>
                    <TableCell>{part.name}</TableCell>
                    <TableCell>{part.category}</TableCell>
                    <TableCell>
                      {inventory?.quantity_available ?? 0} {part.unit_of_measure}
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>${part.unit_cost.toFixed(2)}</TableCell>
                    <TableCell>
                      {part.reorder_point}
                      {inventory && inventory.quantity_available <= part.reorder_point && (
                        <AlertTriangle className="inline-block ml-2 h-4 w-4 text-warning" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPart(part);
                          setNewQuantity(inventory?.quantity_on_hand?.toString() || "0");
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Inventory</DialogTitle>
          </DialogHeader>
          {editingPart && (
            <div className="space-y-4">
              <div>
                <Label>Part</Label>
                <p className="text-sm font-medium">{editingPart.name}</p>
                <p className="text-xs text-muted-foreground">{editingPart.part_number}</p>
              </div>
              <div>
                <Label htmlFor="quantity">Quantity on Hand</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="Enter new quantity"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditPart}>Update</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Parts;