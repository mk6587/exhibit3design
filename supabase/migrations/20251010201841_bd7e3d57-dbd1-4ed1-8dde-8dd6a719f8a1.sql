-- Drop the orders table and its related objects since only subscriptions are used
DROP TRIGGER IF EXISTS encrypt_subscription_order_data ON public.orders;
DROP TRIGGER IF EXISTS encrypt_customer_data_trigger ON public.orders;
DROP TRIGGER IF EXISTS encrypt_payment_data_trigger ON public.orders;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS validate_order_update_trigger ON public.orders;
DROP TRIGGER IF EXISTS set_order_token_trigger ON public.orders;

DROP TABLE IF EXISTS public.orders CASCADE;