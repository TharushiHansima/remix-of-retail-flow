CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'manager',
    'cashier',
    'technician'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  
  -- Assign default role (cashier) to new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cashier');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user_approval(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user_approval() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Create an approval request for the new user
  INSERT INTO public.approvals (
    entity_type,
    entity_id,
    rule_id,
    rule_name,
    status,
    metadata,
    requested_by
  ) VALUES (
    'user',
    NEW.id,
    'user_signup_approval',
    'New User Signup Approval',
    'pending',
    jsonb_build_object(
      'email', NEW.email,
      'full_name', NEW.full_name
    ),
    NEW.user_id
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_authenticated(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_authenticated() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT auth.uid() IS NOT NULL
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid NOT NULL,
    rule_id text NOT NULL,
    rule_name text NOT NULL,
    requested_by uuid,
    requested_at timestamp with time zone DEFAULT now(),
    status text DEFAULT 'pending'::text NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    comment text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.batches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    branch_id uuid,
    batch_number text NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    expiry_date date,
    manufacturing_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text,
    phone text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    parent_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    credit_limit numeric(12,2) DEFAULT 0,
    credit_balance numeric(12,2) DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grn; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grn (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_number text NOT NULL,
    po_id uuid,
    supplier_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    invoice_number text,
    invoice_date date,
    notes text,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    landed_cost numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    received_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone
);


--
-- Name: grn_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grn_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_id uuid NOT NULL,
    product_id uuid NOT NULL,
    po_item_id uuid,
    ordered_quantity integer DEFAULT 0 NOT NULL,
    received_quantity integer NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    batch_number text,
    expiry_date date,
    serial_numbers text[]
);


--
-- Name: grn_landed_costs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grn_landed_costs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grn_id uuid NOT NULL,
    cost_type text NOT NULL,
    description text,
    amount numeric(12,2) NOT NULL
);


--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    discount_percent numeric(5,2) DEFAULT 0,
    tax_percent numeric(5,2) DEFAULT 0,
    total numeric(12,2) NOT NULL,
    serial_number_id uuid,
    batch_id uuid
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text NOT NULL,
    customer_id uuid,
    branch_id uuid NOT NULL,
    invoice_type text DEFAULT 'sale'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    paid_amount numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    payment_method text NOT NULL,
    amount numeric(12,2) NOT NULL,
    reference text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    category_id uuid,
    brand_id uuid,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    cost_price numeric(12,2) DEFAULT 0 NOT NULL,
    is_serialized boolean DEFAULT false NOT NULL,
    is_batched boolean DEFAULT false NOT NULL,
    min_stock_level integer DEFAULT 0,
    max_stock_level integer DEFAULT 100,
    reorder_quantity integer DEFAULT 10,
    lead_time_days integer DEFAULT 7,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    wholesale_price numeric DEFAULT 0 NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approval_status text DEFAULT 'pending'::text NOT NULL,
    approved_at timestamp with time zone,
    approved_by uuid
);


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    po_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    received_quantity integer DEFAULT 0 NOT NULL
);


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    po_number text NOT NULL,
    supplier_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    expected_delivery date,
    notes text,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    created_by uuid,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone
);


--
-- Name: serial_numbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.serial_numbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    branch_id uuid,
    serial_number text NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    purchase_date date,
    warranty_expiry date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_adjustment_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustment_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adjustment_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity_change integer NOT NULL,
    serial_numbers text[]
);


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    adjustment_number text NOT NULL,
    branch_id uuid NOT NULL,
    adjustment_type text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_by uuid,
    approved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone
);


--
-- Name: stock_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_levels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    branch_id uuid NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stock_transfer_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfer_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transfer_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    serial_numbers text[]
);


--
-- Name: stock_transfers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_transfers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transfer_number text NOT NULL,
    from_branch_id uuid NOT NULL,
    to_branch_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    received_at timestamp with time zone
);


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    address text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'cashier'::public.app_role NOT NULL
);


--
-- Name: approvals approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_pkey PRIMARY KEY (id);


--
-- Name: batches batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_pkey PRIMARY KEY (id);


--
-- Name: batches batches_product_id_batch_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_product_id_batch_number_key UNIQUE (product_id, batch_number);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: grn grn_grn_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn
    ADD CONSTRAINT grn_grn_number_key UNIQUE (grn_number);


--
-- Name: grn_items grn_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_pkey PRIMARY KEY (id);


--
-- Name: grn_landed_costs grn_landed_costs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn_landed_costs
    ADD CONSTRAINT grn_landed_costs_pkey PRIMARY KEY (id);


--
-- Name: grn grn_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn
    ADD CONSTRAINT grn_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_sku_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_po_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_po_number_key UNIQUE (po_number);


--
-- Name: serial_numbers serial_numbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_pkey PRIMARY KEY (id);


--
-- Name: serial_numbers serial_numbers_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_serial_number_key UNIQUE (serial_number);


--
-- Name: stock_adjustment_items stock_adjustment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_adjustment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_adjustment_number_key UNIQUE (adjustment_number);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_levels stock_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_levels
    ADD CONSTRAINT stock_levels_pkey PRIMARY KEY (id);


--
-- Name: stock_levels stock_levels_product_id_branch_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_levels
    ADD CONSTRAINT stock_levels_product_id_branch_id_key UNIQUE (product_id, branch_id);


--
-- Name: stock_transfer_items stock_transfer_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_pkey PRIMARY KEY (id);


--
-- Name: stock_transfers stock_transfers_transfer_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_transfer_number_key UNIQUE (transfer_number);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_approvals_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approvals_entity ON public.approvals USING btree (entity_type, entity_id);


--
-- Name: idx_approvals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approvals_status ON public.approvals USING btree (status);


--
-- Name: idx_profiles_approval_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_approval_status ON public.profiles USING btree (approval_status);


--
-- Name: profiles on_profile_created_approval; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created_approval AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_approval();


--
-- Name: invoices update_invoices_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: approvals approvals_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES auth.users(id);


--
-- Name: approvals approvals_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approvals
    ADD CONSTRAINT approvals_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


--
-- Name: batches batches_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: batches batches_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.batches
    ADD CONSTRAINT batches_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: categories categories_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);


--
-- Name: grn grn_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn
    ADD CONSTRAINT grn_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: grn_items grn_items_grn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.grn(id) ON DELETE CASCADE;


--
-- Name: grn_items grn_items_po_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_po_item_id_fkey FOREIGN KEY (po_item_id) REFERENCES public.purchase_order_items(id);


--
-- Name: grn_items grn_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn_items
    ADD CONSTRAINT grn_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: grn_landed_costs grn_landed_costs_grn_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn_landed_costs
    ADD CONSTRAINT grn_landed_costs_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES public.grn(id) ON DELETE CASCADE;


--
-- Name: grn grn_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn
    ADD CONSTRAINT grn_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id);


--
-- Name: grn grn_received_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn
    ADD CONSTRAINT grn_received_by_fkey FOREIGN KEY (received_by) REFERENCES auth.users(id);


--
-- Name: grn grn_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grn
    ADD CONSTRAINT grn_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: invoice_items invoice_items_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id);


--
-- Name: invoice_items invoice_items_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoice_items invoice_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: invoice_items invoice_items_serial_number_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_serial_number_id_fkey FOREIGN KEY (serial_number_id) REFERENCES public.serial_numbers(id);


--
-- Name: invoices invoices_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: invoices invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: invoices invoices_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: payments payments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: payments payments_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: products products_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_po_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_po_id_fkey FOREIGN KEY (po_id) REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_orders purchase_orders_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: purchase_orders purchase_orders_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: purchase_orders purchase_orders_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: serial_numbers serial_numbers_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: serial_numbers serial_numbers_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.serial_numbers
    ADD CONSTRAINT serial_numbers_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: stock_adjustment_items stock_adjustment_items_adjustment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_adjustment_id_fkey FOREIGN KEY (adjustment_id) REFERENCES public.stock_adjustments(id) ON DELETE CASCADE;


--
-- Name: stock_adjustment_items stock_adjustment_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustment_items
    ADD CONSTRAINT stock_adjustment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_adjustments stock_adjustments_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: stock_adjustments stock_adjustments_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: stock_adjustments stock_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: stock_levels stock_levels_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_levels
    ADD CONSTRAINT stock_levels_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id) ON DELETE CASCADE;


--
-- Name: stock_levels stock_levels_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_levels
    ADD CONSTRAINT stock_levels_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: stock_transfer_items stock_transfer_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock_transfer_items stock_transfer_items_transfer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfer_items
    ADD CONSTRAINT stock_transfer_items_transfer_id_fkey FOREIGN KEY (transfer_id) REFERENCES public.stock_transfers(id) ON DELETE CASCADE;


--
-- Name: stock_transfers stock_transfers_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: stock_transfers stock_transfers_from_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_from_branch_id_fkey FOREIGN KEY (from_branch_id) REFERENCES public.branches(id);


--
-- Name: stock_transfers stock_transfers_to_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_transfers
    ADD CONSTRAINT stock_transfers_to_branch_id_fkey FOREIGN KEY (to_branch_id) REFERENCES public.branches(id);


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: branches Admins can manage branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage branches" ON public.branches USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: brands Admins can manage brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage brands" ON public.brands USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.categories USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: products Admins can manage products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage products" ON public.products USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can update any profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: approvals Auth users can create approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can create approvals" ON public.approvals FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: grn Auth users can view GRN; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view GRN" ON public.grn FOR SELECT TO authenticated USING (true);


--
-- Name: grn_items Auth users can view GRN items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view GRN items" ON public.grn_items FOR SELECT TO authenticated USING (true);


--
-- Name: purchase_order_items Auth users can view PO items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view PO items" ON public.purchase_order_items FOR SELECT TO authenticated USING (true);


--
-- Name: purchase_orders Auth users can view POs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view POs" ON public.purchase_orders FOR SELECT TO authenticated USING (true);


--
-- Name: stock_adjustment_items Auth users can view adjustment items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view adjustment items" ON public.stock_adjustment_items FOR SELECT TO authenticated USING (true);


--
-- Name: stock_adjustments Auth users can view adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view adjustments" ON public.stock_adjustments FOR SELECT TO authenticated USING (true);


--
-- Name: approvals Auth users can view approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view approvals" ON public.approvals FOR SELECT USING (true);


--
-- Name: batches Auth users can view batches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view batches" ON public.batches FOR SELECT TO authenticated USING (true);


--
-- Name: branches Auth users can view branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view branches" ON public.branches FOR SELECT TO authenticated USING (true);


--
-- Name: brands Auth users can view brands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view brands" ON public.brands FOR SELECT TO authenticated USING (true);


--
-- Name: categories Auth users can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);


--
-- Name: customers Auth users can view customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);


--
-- Name: invoice_items Auth users can view invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view invoice items" ON public.invoice_items FOR SELECT TO authenticated USING (true);


--
-- Name: invoices Auth users can view invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view invoices" ON public.invoices FOR SELECT TO authenticated USING (true);


--
-- Name: grn_landed_costs Auth users can view landed costs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view landed costs" ON public.grn_landed_costs FOR SELECT TO authenticated USING (true);


--
-- Name: payments Auth users can view payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view payments" ON public.payments FOR SELECT TO authenticated USING (true);


--
-- Name: products Auth users can view products; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view products" ON public.products FOR SELECT TO authenticated USING (true);


--
-- Name: serial_numbers Auth users can view serials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view serials" ON public.serial_numbers FOR SELECT TO authenticated USING (true);


--
-- Name: stock_levels Auth users can view stock; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view stock" ON public.stock_levels FOR SELECT TO authenticated USING (true);


--
-- Name: suppliers Auth users can view suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (true);


--
-- Name: stock_transfer_items Auth users can view transfer items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view transfer items" ON public.stock_transfer_items FOR SELECT TO authenticated USING (true);


--
-- Name: stock_transfers Auth users can view transfers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view transfers" ON public.stock_transfers FOR SELECT TO authenticated USING (true);


--
-- Name: purchase_order_items Managers can manage PO items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Managers can manage PO items" ON public.purchase_order_items USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: purchase_orders Managers can manage POs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Managers can manage POs" ON public.purchase_orders USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: suppliers Managers can manage suppliers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Managers can manage suppliers" ON public.suppliers USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: approvals Managers can update approvals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Managers can update approvals" ON public.approvals FOR UPDATE USING ((public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'manager'::public.app_role)));


--
-- Name: invoices Staff can create invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can create invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: payments Staff can create payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can create payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: grn Staff can manage GRN; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage GRN" ON public.grn TO authenticated USING (true);


--
-- Name: grn_items Staff can manage GRN items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage GRN items" ON public.grn_items TO authenticated USING (true);


--
-- Name: stock_adjustment_items Staff can manage adjustment items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage adjustment items" ON public.stock_adjustment_items TO authenticated USING (true);


--
-- Name: stock_adjustments Staff can manage adjustments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage adjustments" ON public.stock_adjustments TO authenticated USING (true);


--
-- Name: batches Staff can manage batches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage batches" ON public.batches TO authenticated USING (true);


--
-- Name: customers Staff can manage customers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage customers" ON public.customers TO authenticated USING (true);


--
-- Name: invoice_items Staff can manage invoice items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage invoice items" ON public.invoice_items TO authenticated USING (true);


--
-- Name: grn_landed_costs Staff can manage landed costs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage landed costs" ON public.grn_landed_costs TO authenticated USING (true);


--
-- Name: serial_numbers Staff can manage serials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage serials" ON public.serial_numbers TO authenticated USING (true);


--
-- Name: stock_levels Staff can manage stock; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage stock" ON public.stock_levels TO authenticated USING (true);


--
-- Name: stock_transfer_items Staff can manage transfer items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage transfer items" ON public.stock_transfer_items TO authenticated USING (true);


--
-- Name: stock_transfers Staff can manage transfers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can manage transfers" ON public.stock_transfers TO authenticated USING (true);


--
-- Name: invoices Staff can update invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Staff can update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: batches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: brands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: grn; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grn ENABLE ROW LEVEL SECURITY;

--
-- Name: grn_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grn_items ENABLE ROW LEVEL SECURITY;

--
-- Name: grn_landed_costs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grn_landed_costs ENABLE ROW LEVEL SECURITY;

--
-- Name: invoice_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

--
-- Name: invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_order_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_orders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

--
-- Name: serial_numbers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.serial_numbers ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_adjustment_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_adjustment_items ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_adjustments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_levels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_levels ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_transfer_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_transfer_items ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_transfers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_transfers ENABLE ROW LEVEL SECURITY;

--
-- Name: suppliers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;