-- Create machine table (single coffee roaster)
CREATE TABLE public.machine (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  model TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  installation_date DATE NOT NULL,
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'down', 'decommissioned')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create parts table
CREATE TABLE public.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit_of_measure TEXT NOT NULL DEFAULT 'unit',
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER NOT NULL DEFAULT 0,
  reorder_quantity INTEGER NOT NULL DEFAULT 0,
  lead_time_days INTEGER NOT NULL DEFAULT 0,
  supplier_part_number TEXT,
  specifications TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create part inventory table
CREATE TABLE public.part_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  location TEXT,
  last_counted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(part_id)
);

-- Create vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  website TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create purchase orders table
CREATE TABLE public.purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  part_id UUID REFERENCES public.parts(id) ON DELETE SET NULL,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create maintenance records table
CREATE TABLE public.maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machine(id) ON DELETE CASCADE,
  work_order_number TEXT UNIQUE NOT NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('corrective', 'preventive', 'predictive')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  failure_description TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  parts_replaced TEXT,
  labor_hours DECIMAL(10, 2),
  downtime_hours DECIMAL(10, 2),
  cost DECIMAL(10, 2) DEFAULT 0,
  reported_by TEXT,
  assigned_to TEXT,
  reported_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create maintenance parts used junction table
CREATE TABLE public.maintenance_parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_record_id UUID NOT NULL REFERENCES public.maintenance_records(id) ON DELETE CASCADE,
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL DEFAULT 1,
  cost_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_used * cost_per_unit) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create preventive maintenance schedules table
CREATE TABLE public.preventive_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machine(id) ON DELETE CASCADE,
  schedule_name TEXT NOT NULL,
  description TEXT,
  frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
  frequency_value INTEGER NOT NULL DEFAULT 1,
  last_performed_date DATE,
  next_due_date DATE NOT NULL,
  estimated_duration_hours DECIMAL(10, 2),
  assigned_to TEXT,
  checklist_items TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sensor readings table for predictive maintenance
CREATE TABLE public.sensor_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES public.machine(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  reading_value DECIMAL(10, 4) NOT NULL,
  unit TEXT NOT NULL,
  threshold_min DECIMAL(10, 4),
  threshold_max DECIMAL(10, 4),
  is_alarm BOOLEAN GENERATED ALWAYS AS (
    (threshold_min IS NOT NULL AND reading_value < threshold_min) OR 
    (threshold_max IS NOT NULL AND reading_value > threshold_max)
  ) STORED,
  reading_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL CHECK (alert_type IN ('inventory', 'maintenance_due', 'sensor_alarm', 'purchase_order', 'general')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_machine_updated_at BEFORE UPDATE ON public.machine
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON public.parts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_inventory_updated_at BEFORE UPDATE ON public.part_inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preventive_schedules_updated_at BEFORE UPDATE ON public.preventive_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert the single coffee roaster machine
INSERT INTO public.machine (name, model, serial_number, manufacturer, installation_date, location, description)
VALUES (
  'Coffee Roaster Unit 1',
  'CR-5000 Industrial',
  'CR5000-2024-001',
  'RoastTech Industries',
  '2024-01-15',
  'Production Floor A',
  'Primary coffee roasting machine for specialty beans. Capacity: 50kg per batch.'
);

-- Enable RLS on all tables
ALTER TABLE public.machine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for now - adjust based on auth requirements)
CREATE POLICY "Allow all access to machine" ON public.machine FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to parts" ON public.parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to part_inventory" ON public.part_inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to vendors" ON public.vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to maintenance_records" ON public.maintenance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to maintenance_parts_used" ON public.maintenance_parts_used FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to preventive_schedules" ON public.preventive_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sensor_readings" ON public.sensor_readings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_parts_part_number ON public.parts(part_number);
CREATE INDEX idx_maintenance_records_machine_id ON public.maintenance_records(machine_id);
CREATE INDEX idx_maintenance_records_status ON public.maintenance_records(status);
CREATE INDEX idx_sensor_readings_machine_id ON public.sensor_readings(machine_id);
CREATE INDEX idx_sensor_readings_timestamp ON public.sensor_readings(reading_timestamp DESC);
CREATE INDEX idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX idx_alerts_severity ON public.alerts(severity);
CREATE INDEX idx_preventive_schedules_next_due_date ON public.preventive_schedules(next_due_date);