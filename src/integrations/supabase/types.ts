export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          resolved_at: string | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          resolved_at?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      machine: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          installation_date: string
          location: string | null
          manufacturer: string
          model: string
          name: string
          serial_number: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          installation_date: string
          location?: string | null
          manufacturer: string
          model: string
          name: string
          serial_number: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          installation_date?: string
          location?: string | null
          manufacturer?: string
          model?: string
          name?: string
          serial_number?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_parts_used: {
        Row: {
          cost_per_unit: number
          created_at: string | null
          id: string
          maintenance_record_id: string
          part_id: string
          quantity_used: number
          total_cost: number | null
        }
        Insert: {
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          maintenance_record_id: string
          part_id: string
          quantity_used?: number
          total_cost?: number | null
        }
        Update: {
          cost_per_unit?: number
          created_at?: string | null
          id?: string
          maintenance_record_id?: string
          part_id?: string
          quantity_used?: number
          total_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_parts_used_maintenance_record_id_fkey"
            columns: ["maintenance_record_id"]
            isOneToOne: false
            referencedRelation: "maintenance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_parts_used_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_records: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          corrective_action: string | null
          cost: number | null
          created_at: string | null
          downtime_hours: number | null
          failure_description: string | null
          id: string
          labor_hours: number | null
          machine_id: string
          maintenance_type: string
          next_maintenance_date: string | null
          notes: string | null
          parts_replaced: string | null
          priority: string
          reported_by: string | null
          reported_date: string
          root_cause: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          work_order_number: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          corrective_action?: string | null
          cost?: number | null
          created_at?: string | null
          downtime_hours?: number | null
          failure_description?: string | null
          id?: string
          labor_hours?: number | null
          machine_id: string
          maintenance_type: string
          next_maintenance_date?: string | null
          notes?: string | null
          parts_replaced?: string | null
          priority?: string
          reported_by?: string | null
          reported_date?: string
          root_cause?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          work_order_number: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          corrective_action?: string | null
          cost?: number | null
          created_at?: string | null
          downtime_hours?: number | null
          failure_description?: string | null
          id?: string
          labor_hours?: number | null
          machine_id?: string
          maintenance_type?: string
          next_maintenance_date?: string | null
          notes?: string | null
          parts_replaced?: string | null
          priority?: string
          reported_by?: string | null
          reported_date?: string
          root_cause?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          work_order_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine"
            referencedColumns: ["id"]
          },
        ]
      }
      part_inventory: {
        Row: {
          created_at: string | null
          id: string
          last_counted_at: string | null
          location: string | null
          part_id: string
          quantity_available: number | null
          quantity_on_hand: number
          quantity_reserved: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_counted_at?: string | null
          location?: string | null
          part_id: string
          quantity_available?: number | null
          quantity_on_hand?: number
          quantity_reserved?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_counted_at?: string | null
          location?: string | null
          part_id?: string
          quantity_available?: number | null
          quantity_on_hand?: number
          quantity_reserved?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_inventory_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: true
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          lead_time_days: number
          min_stock_level: number
          name: string
          part_number: string
          reorder_point: number
          reorder_quantity: number
          specifications: string | null
          supplier_part_number: string | null
          unit_cost: number
          unit_of_measure: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          lead_time_days?: number
          min_stock_level?: number
          name: string
          part_number: string
          reorder_point?: number
          reorder_quantity?: number
          specifications?: string | null
          supplier_part_number?: string | null
          unit_cost?: number
          unit_of_measure?: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          lead_time_days?: number
          min_stock_level?: number
          name?: string
          part_number?: string
          reorder_point?: number
          reorder_quantity?: number
          specifications?: string | null
          supplier_part_number?: string | null
          unit_cost?: number
          unit_of_measure?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      preventive_schedules: {
        Row: {
          assigned_to: string | null
          checklist_items: string[] | null
          created_at: string | null
          description: string | null
          estimated_duration_hours: number | null
          frequency_type: string
          frequency_value: number
          id: string
          is_active: boolean | null
          last_performed_date: string | null
          machine_id: string
          next_due_date: string
          schedule_name: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          checklist_items?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          frequency_type: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          last_performed_date?: string | null
          machine_id: string
          next_due_date: string
          schedule_name: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          checklist_items?: string[] | null
          created_at?: string | null
          description?: string | null
          estimated_duration_hours?: number | null
          frequency_type?: string
          frequency_value?: number
          id?: string
          is_active?: boolean | null
          last_performed_date?: string | null
          machine_id?: string
          next_due_date?: string
          schedule_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preventive_schedules_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          part_id: string | null
          po_number: string
          quantity: number
          status: string
          total_price: number | null
          unit_price: number
          updated_at: string | null
          vendor_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date: string
          part_id?: string | null
          po_number: string
          quantity: number
          status?: string
          total_price?: number | null
          unit_price: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          part_id?: string | null
          po_number?: string
          quantity?: number
          status?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_readings: {
        Row: {
          created_at: string | null
          id: string
          is_alarm: boolean | null
          machine_id: string
          notes: string | null
          reading_timestamp: string
          reading_value: number
          sensor_name: string
          sensor_type: string
          threshold_max: number | null
          threshold_min: number | null
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_alarm?: boolean | null
          machine_id: string
          notes?: string | null
          reading_timestamp?: string
          reading_value: number
          sensor_name: string
          sensor_type: string
          threshold_max?: number | null
          threshold_min?: number | null
          unit: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_alarm?: boolean | null
          machine_id?: string
          notes?: string | null
          reading_timestamp?: string
          reading_value?: number
          sensor_name?: string
          sensor_type?: string
          threshold_max?: number | null
          threshold_min?: number | null
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machine"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
