# Logistics Engine

This engine provides shipment and transfer order visibility per tenant. This scaffold includes:

- Landing page: page.tsx
- ShipmentCard component

Tables required:
- shipments (see db/migrations for example)

RBAC permissions (suggestions):
- shipments.view
- shipments.create
- shipments.update
- shipments.delete

Tenant notes:
- All queries must include tenant_email filter. Ensure RLS policies are active.
