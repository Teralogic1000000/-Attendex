DROP VIEW IF EXISTS "subscription_full_view" CASCADE;
CREATE OR REPLACE VIEW "subscription_full_view" AS
SELECT 
    os."id" AS "Subscription_ID",
    o."name" AS "org_name",
    sp."name" AS "plan_name",
    os."status" AS "subscription_status",
    os."startDate" AS "start_date",
    os."endDate" AS "end_date",
    os."createdAt" AS "created_at",
    os."updatedAt" AS "updated_at"
FROM "OrganizationSubscription" os
LEFT JOIN "Organization" o ON os."orgId" = o."id"
LEFT JOIN "SubscriptionPlan" sp ON os."planId" = sp."id"
ORDER BY o."name";
