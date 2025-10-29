-- ============================================
-- VISTA BASE: Dashboard Sales (Granular y Reutilizable)
-- ============================================
-- Esta vista contiene TODOS los datos detallados para múltiples gráficas
CREATE OR REPLACE VIEW sales.dashboard_sales_view AS
SELECT 
    -- Información de la orden
    o.id as order_id,
    o."orderNumber" as order_number,
    o.status as order_status,
    o."totalAmount" as order_total,
    o."createdAt" as order_date,
    o."tenantId" as tenant_id,
    
    -- Información del cliente
    c.id as customer_id,
    c.name as customer_name,
    
    -- Información de la dirección
    a.city as shipping_city,
    a."addressLine1" as shipping_address,
    
    -- Detalles del producto/variante vendido
    od.id as order_detail_id,
    od.qty as quantity_sold,
    od."unitPrice" as unit_price,
    od.subtotal as item_subtotal,
    od."productName" as product_name,
    
    -- Información del variant
    v.id as variant_id,
    v.sku as variant_sku,
    v.price as variant_price,
    v."variantCover" as variant_cover,
    
    -- Información del producto
    p.id as product_id,
    p.name as product_full_name,
    p.brand as product_brand,
    p.cover as product_cover,
    p."productType" as product_type,
    
    -- Agregaciones temporales (útiles para filtros)
    DATE(o."createdAt") as order_date_only,
    DATE_TRUNC('day', o."createdAt") as day_start,
    DATE_TRUNC('week', o."createdAt") as week_start,
    DATE_TRUNC('month', o."createdAt") as month_start,
    DATE_TRUNC('year', o."createdAt") as year_start,
    EXTRACT(DOW FROM o."createdAt") as day_of_week,
    EXTRACT(HOUR FROM o."createdAt") as hour_of_day
    
FROM 
    sales."Order" o
INNER JOIN 
    customer."Customer" c ON c.id = o."customerId"
INNER JOIN 
    "common"."Address" a ON a.id = o."addressId"
LEFT JOIN 
    sales."OrderDetail" od ON od."orderId" = o.id
LEFT JOIN 
    product."Variant" v ON v.id = od."variantId"
LEFT JOIN 
    product."Product" p ON p.id = v."productId"
WHERE 
    v."isArchived" = false 
    AND p."isArchived" = false;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_order_tenant_date_status 
    ON sales."Order"("tenantId", "createdAt", "status");

CREATE INDEX IF NOT EXISTS idx_order_detail_order_variant 
    ON sales."OrderDetail"("orderId", "variantId");

CREATE INDEX IF NOT EXISTS idx_customer_tenant 
    ON customer."Customer"("tenantId");

COMMENT ON VIEW sales.dashboard_sales_view IS 
'Vista base granular para dashboard con todos los datos de órdenes, clientes y productos';
