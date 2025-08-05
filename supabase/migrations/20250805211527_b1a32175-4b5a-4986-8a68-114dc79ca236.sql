-- Update the order status from pending to completed
UPDATE public.orders 
SET status = 'completed', 
    updated_at = now()
WHERE order_number = '175442620692-9930' 
AND status = 'pending';