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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      approvals: {
        Row: {
          comment: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          requested_at: string | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rule_id: string
          rule_name: string
          status: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          requested_at?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_id: string
          rule_name: string
          status?: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          requested_at?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rule_id?: string
          rule_name?: string
          status?: string
        }
        Relationships: []
      }
      batches: {
        Row: {
          batch_number: string
          branch_id: string | null
          created_at: string
          expiry_date: string | null
          id: string
          manufacturing_date: string | null
          product_id: string
          quantity: number
        }
        Insert: {
          batch_number: string
          branch_id?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          manufacturing_date?: string | null
          product_id: string
          quantity?: number
        }
        Update: {
          batch_number?: string
          branch_id?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          manufacturing_date?: string | null
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "batches_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      cash_drawers: {
        Row: {
          actual_closing: number | null
          branch_id: string
          closed_at: string | null
          closed_by: string | null
          created_at: string
          expected_closing: number | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          opening_float: number
          status: string
          variance: number | null
        }
        Insert: {
          actual_closing?: number | null
          branch_id: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          expected_closing?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by: string
          opening_float?: number
          status?: string
          variance?: number | null
        }
        Update: {
          actual_closing?: number | null
          branch_id?: string
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          expected_closing?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string
          opening_float?: number
          status?: string
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cash_drawers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_transactions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          drawer_id: string
          id: string
          reason: string
          reference: string | null
          requires_approval: boolean
          transaction_type: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by: string
          drawer_id: string
          id?: string
          reason: string
          reference?: string | null
          requires_approval?: boolean
          transaction_type: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string
          drawer_id?: string
          id?: string
          reason?: string
          reference?: string | null
          requires_approval?: boolean
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_transactions_drawer_id_fkey"
            columns: ["drawer_id"]
            isOneToOne: false
            referencedRelation: "cash_drawers"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_layer_consumptions: {
        Row: {
          consumed_at: string
          consumption_id: string | null
          consumption_number: string | null
          consumption_type: string
          cost_layer_id: string
          created_at: string
          id: string
          quantity_consumed: number
          total_cost: number
          unit_cost_at_consumption: number
        }
        Insert: {
          consumed_at?: string
          consumption_id?: string | null
          consumption_number?: string | null
          consumption_type: string
          cost_layer_id: string
          created_at?: string
          id?: string
          quantity_consumed: number
          total_cost: number
          unit_cost_at_consumption: number
        }
        Update: {
          consumed_at?: string
          consumption_id?: string | null
          consumption_number?: string | null
          consumption_type?: string
          cost_layer_id?: string
          created_at?: string
          id?: string
          quantity_consumed?: number
          total_cost?: number
          unit_cost_at_consumption?: number
        }
        Relationships: [
          {
            foreignKeyName: "cost_layer_consumptions_cost_layer_id_fkey"
            columns: ["cost_layer_id"]
            isOneToOne: false
            referencedRelation: "cost_layers"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_layers: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          is_exhausted: boolean
          product_id: string
          received_date: string
          received_qty: number
          remaining_qty: number
          source_id: string | null
          source_number: string | null
          source_type: string
          unit_cost: number
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          is_exhausted?: boolean
          product_id: string
          received_date?: string
          received_qty?: number
          remaining_qty?: number
          source_id?: string | null
          source_number?: string | null
          source_type: string
          unit_cost?: number
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          is_exhausted?: boolean
          product_id?: string
          received_date?: string
          received_qty?: number
          remaining_qty?: number
          source_id?: string | null
          source_number?: string | null
          source_type?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "cost_layers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cost_layers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          credit_balance: number | null
          credit_limit: number | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          credit_balance?: number | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          credit_balance?: number | null
          credit_limit?: number | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      grn: {
        Row: {
          allocation_method: string | null
          branch_id: string
          created_at: string
          grn_number: string
          id: string
          invoice_date: string | null
          invoice_number: string | null
          is_landed_cost_allocated: boolean
          landed_cost: number
          notes: string | null
          po_id: string | null
          received_by: string | null
          status: string
          subtotal: number
          supplier_id: string
          total_amount: number
          verified_at: string | null
        }
        Insert: {
          allocation_method?: string | null
          branch_id: string
          created_at?: string
          grn_number: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          is_landed_cost_allocated?: boolean
          landed_cost?: number
          notes?: string | null
          po_id?: string | null
          received_by?: string | null
          status?: string
          subtotal?: number
          supplier_id: string
          total_amount?: number
          verified_at?: string | null
        }
        Update: {
          allocation_method?: string | null
          branch_id?: string
          created_at?: string
          grn_number?: string
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          is_landed_cost_allocated?: boolean
          landed_cost?: number
          notes?: string | null
          po_id?: string | null
          received_by?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          total_amount?: number
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grn_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      grn_items: {
        Row: {
          allocated_landed_cost: number
          batch_number: string | null
          expiry_date: string | null
          final_unit_cost: number
          grn_id: string
          id: string
          ordered_quantity: number
          po_item_id: string | null
          product_id: string
          received_quantity: number
          serial_numbers: string[] | null
          total_line_cost: number
          unit_cost: number
        }
        Insert: {
          allocated_landed_cost?: number
          batch_number?: string | null
          expiry_date?: string | null
          final_unit_cost?: number
          grn_id: string
          id?: string
          ordered_quantity?: number
          po_item_id?: string | null
          product_id: string
          received_quantity: number
          serial_numbers?: string[] | null
          total_line_cost?: number
          unit_cost: number
        }
        Update: {
          allocated_landed_cost?: number
          batch_number?: string | null
          expiry_date?: string | null
          final_unit_cost?: number
          grn_id?: string
          id?: string
          ordered_quantity?: number
          po_item_id?: string | null
          product_id?: string
          received_quantity?: number
          serial_numbers?: string[] | null
          total_line_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "grn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      grn_landed_costs: {
        Row: {
          amount: number
          cost_type: string
          description: string | null
          grn_id: string
          id: string
        }
        Insert: {
          amount: number
          cost_type: string
          description?: string | null
          grn_id: string
          id?: string
        }
        Update: {
          amount?: number
          cost_type?: string
          description?: string | null
          grn_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grn_landed_costs_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "grn"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_valuation_snapshots: {
        Row: {
          aging_bucket: string | null
          available_qty: number
          branch_id: string | null
          category_id: string | null
          costing_method: string
          created_at: string
          days_since_receipt: number | null
          id: string
          on_hand_qty: number
          product_id: string
          product_name: string
          product_sku: string | null
          reserved_qty: number
          snapshot_date: string
          supplier_id: string | null
          total_value: number
          unit_cost: number
        }
        Insert: {
          aging_bucket?: string | null
          available_qty?: number
          branch_id?: string | null
          category_id?: string | null
          costing_method: string
          created_at?: string
          days_since_receipt?: number | null
          id?: string
          on_hand_qty?: number
          product_id: string
          product_name: string
          product_sku?: string | null
          reserved_qty?: number
          snapshot_date: string
          supplier_id?: string | null
          total_value?: number
          unit_cost?: number
        }
        Update: {
          aging_bucket?: string | null
          available_qty?: number
          branch_id?: string | null
          category_id?: string | null
          costing_method?: string
          created_at?: string
          days_since_receipt?: number | null
          id?: string
          on_hand_qty?: number
          product_id?: string
          product_name?: string
          product_sku?: string | null
          reserved_qty?: number
          snapshot_date?: string
          supplier_id?: string | null
          total_value?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_valuation_snapshots_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_valuation_snapshots_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_valuation_snapshots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_valuation_snapshots_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          batch_id: string | null
          discount_percent: number | null
          id: string
          invoice_id: string
          product_id: string
          quantity: number
          serial_number_id: string | null
          tax_percent: number | null
          total: number
          unit_price: number
        }
        Insert: {
          batch_id?: string | null
          discount_percent?: number | null
          id?: string
          invoice_id: string
          product_id: string
          quantity: number
          serial_number_id?: string | null
          tax_percent?: number | null
          total: number
          unit_price: number
        }
        Update: {
          batch_id?: string | null
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          product_id?: string
          quantity?: number
          serial_number_id?: string | null
          tax_percent?: number | null
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_serial_number_id_fkey"
            columns: ["serial_number_id"]
            isOneToOne: false
            referencedRelation: "serial_numbers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          branch_id: string
          created_at: string
          created_by: string | null
          customer_id: string | null
          discount_amount: number
          id: string
          invoice_number: string
          invoice_type: string
          notes: string | null
          paid_amount: number
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          invoice_number: string
          invoice_type?: string
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          discount_amount?: number
          id?: string
          invoice_number?: string
          invoice_type?: string
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          category: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          category?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id: string
          payment_method: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      petty_cash_expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          category: string
          created_at: string
          created_by: string
          description: string
          expense_date: string
          id: string
          notes: string | null
          receipt_reference: string | null
          receipt_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          category: string
          created_at?: string
          created_by: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
          receipt_reference?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
          receipt_reference?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "petty_cash_expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      petty_cash_funds: {
        Row: {
          amount: number
          balance_after: number
          branch_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          balance_after: number
          branch_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          branch_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "petty_cash_funds_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stock_locations: {
        Row: {
          id: string
          is_primary: boolean
          location_id: string
          product_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          is_primary?: boolean
          location_id: string
          product_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          is_primary?: boolean
          location_id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_locations_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_locations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_uom: {
        Row: {
          barcode: string | null
          conversion_factor: number
          created_at: string
          id: string
          is_base_unit: boolean
          is_purchase_unit: boolean
          is_sales_unit: boolean
          product_id: string
          uom_name: string
        }
        Insert: {
          barcode?: string | null
          conversion_factor?: number
          created_at?: string
          id?: string
          is_base_unit?: boolean
          is_purchase_unit?: boolean
          is_sales_unit?: boolean
          product_id: string
          uom_name: string
        }
        Update: {
          barcode?: string | null
          conversion_factor?: number
          created_at?: string
          id?: string
          is_base_unit?: boolean
          is_purchase_unit?: boolean
          is_sales_unit?: boolean
          product_id?: string
          uom_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_uom_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          avg_cost: number
          brand_id: string | null
          category_id: string | null
          cost_price: number
          costing_method: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_batched: boolean
          is_serialized: boolean
          lead_time_days: number | null
          max_stock_level: number | null
          min_stock_level: number | null
          name: string
          reorder_quantity: number | null
          sku: string
          unit_price: number
          unit_weight: number | null
          updated_at: string
          wholesale_price: number
        }
        Insert: {
          avg_cost?: number
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number
          costing_method?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_batched?: boolean
          is_serialized?: boolean
          lead_time_days?: number | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name: string
          reorder_quantity?: number | null
          sku: string
          unit_price?: number
          unit_weight?: number | null
          updated_at?: string
          wholesale_price?: number
        }
        Update: {
          avg_cost?: number
          brand_id?: string | null
          category_id?: string | null
          cost_price?: number
          costing_method?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_batched?: boolean
          is_serialized?: boolean
          lead_time_days?: number | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          name?: string
          reorder_quantity?: number | null
          sku?: string
          unit_price?: number
          unit_weight?: number | null
          updated_at?: string
          wholesale_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          po_id: string
          product_id: string
          quantity: number
          received_quantity: number
          unit_cost: number
        }
        Insert: {
          id?: string
          po_id: string
          product_id: string
          quantity: number
          received_quantity?: number
          unit_cost: number
        }
        Update: {
          id?: string
          po_id?: string
          product_id?: string
          quantity?: number
          received_quantity?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          expected_delivery: string | null
          id: string
          notes: string | null
          po_number: string
          status: string
          supplier_id: string
          total_amount: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number: string
          status?: string
          supplier_id: string
          total_amount?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          expected_delivery?: string | null
          id?: string
          notes?: string | null
          po_number?: string
          status?: string
          supplier_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string
          created_by: string
          filters: Json | null
          format: string
          id: string
          is_active: boolean
          last_sent_at: string | null
          name: string
          recipients: string[]
          report_type: string
          schedule_day: number | null
          schedule_time: string
          schedule_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          filters?: Json | null
          format?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name: string
          recipients: string[]
          report_type: string
          schedule_day?: number | null
          schedule_time?: string
          schedule_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          filters?: Json | null
          format?: string
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          name?: string
          recipients?: string[]
          report_type?: string
          schedule_day?: number | null
          schedule_time?: string
          schedule_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      serial_numbers: {
        Row: {
          branch_id: string | null
          created_at: string
          id: string
          product_id: string
          purchase_date: string | null
          serial_number: string
          status: string
          warranty_expiry: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          id?: string
          product_id: string
          purchase_date?: string | null
          serial_number: string
          status?: string
          warranty_expiry?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          id?: string
          product_id?: string
          purchase_date?: string | null
          serial_number?: string
          status?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "serial_numbers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "serial_numbers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustment_items: {
        Row: {
          adjustment_id: string
          id: string
          product_id: string
          quantity_change: number
          serial_numbers: string[] | null
        }
        Insert: {
          adjustment_id: string
          id?: string
          product_id: string
          quantity_change: number
          serial_numbers?: string[] | null
        }
        Update: {
          adjustment_id?: string
          id?: string
          product_id?: string
          quantity_change?: number
          serial_numbers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustment_items_adjustment_id_fkey"
            columns: ["adjustment_id"]
            isOneToOne: false
            referencedRelation: "stock_adjustments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustment_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjustment_number: string
          adjustment_type: string
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          id: string
          reason: string
          status: string
        }
        Insert: {
          adjustment_number: string
          adjustment_type: string
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          reason: string
          status?: string
        }
        Update: {
          adjustment_number?: string
          adjustment_type?: string
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_levels: {
        Row: {
          avg_unit_cost: number
          branch_id: string
          id: string
          product_id: string
          quantity: number
          reserved_quantity: number
          total_value: number
          updated_at: string
        }
        Insert: {
          avg_unit_cost?: number
          branch_id: string
          id?: string
          product_id: string
          quantity?: number
          reserved_quantity?: number
          total_value?: number
          updated_at?: string
        }
        Update: {
          avg_unit_cost?: number
          branch_id?: string
          id?: string
          product_id?: string
          quantity?: number
          reserved_quantity?: number
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_levels_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_levels_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_locations: {
        Row: {
          aisle: string | null
          bin: string | null
          branch_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_code: string
          rack: string | null
          shelf: string | null
          zone: string | null
        }
        Insert: {
          aisle?: string | null
          bin?: string | null
          branch_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_code: string
          rack?: string | null
          shelf?: string | null
          zone?: string | null
        }
        Update: {
          aisle?: string | null
          bin?: string | null
          branch_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_code?: string
          rack?: string | null
          shelf?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_locations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          id: string
          product_id: string
          quantity: number
          serial_numbers: string[] | null
          transfer_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity: number
          serial_numbers?: string[] | null
          transfer_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          serial_numbers?: string[] | null
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          created_at: string
          created_by: string | null
          from_branch_id: string
          id: string
          notes: string | null
          received_at: string | null
          status: string
          to_branch_id: string
          transfer_number: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          from_branch_id: string
          id?: string
          notes?: string | null
          received_at?: string | null
          status?: string
          to_branch_id: string
          transfer_number: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          from_branch_id?: string
          id?: string
          notes?: string | null
          received_at?: string | null
          status?: string
          to_branch_id?: string
          transfer_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_from_branch_id_fkey"
            columns: ["from_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_branch_id_fkey"
            columns: ["to_branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_invoices: {
        Row: {
          created_at: string
          created_by: string | null
          due_date: string
          grn_id: string | null
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_amount: number
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          due_date: string
          grn_id?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          due_date?: string
          grn_id?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_invoices_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "grn"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference: string | null
          supplier_invoice_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          reference?: string | null
          supplier_invoice_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference?: string | null
          supplier_invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_invoice_id_fkey"
            columns: ["supplier_invoice_id"]
            isOneToOne: false
            referencedRelation: "supplier_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_grn_landed_costs: {
        Args: { p_grn_id: string }
        Returns: undefined
      }
      calculate_cogs: {
        Args: {
          p_branch_id: string
          p_consumption_id?: string
          p_consumption_number?: string
          p_consumption_type?: string
          p_product_id: string
          p_quantity: number
        }
        Returns: number
      }
      consume_fifo_layers: {
        Args: {
          p_branch_id: string
          p_consumption_id: string
          p_consumption_number: string
          p_consumption_type: string
          p_product_id: string
          p_quantity: number
        }
        Returns: number
      }
      create_fifo_layers_from_grn: {
        Args: { p_grn_id: string }
        Returns: undefined
      }
      get_aging_bucket: { Args: { days_old: number }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager" | "cashier" | "technician"
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
    Enums: {
      app_role: ["admin", "manager", "cashier", "technician"],
    },
  },
} as const
