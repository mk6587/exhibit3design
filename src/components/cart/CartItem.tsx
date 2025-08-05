
import { Button } from "@/components/ui/button";
import { X, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";

export interface CartItemType {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
}

const CartItem = ({ item, onRemove, onUpdateQuantity }: CartItemProps) => {
  return (
    <div className="flex py-6 border-b">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
        <img
          src={item.image}
          alt={item.title}
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="ml-4 flex flex-1 flex-col">
        <div>
          <div className="flex justify-between text-base font-medium">
            <h3>
              <Link to={`/product/${item.id}`} className="hover:text-primary">
                {item.title}
              </Link>
            </h3>
            <p className="ml-4">€{item.price}</p>
          </div>
        </div>
        <div className="flex flex-1 items-end justify-between text-sm">
          <div className="flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(item.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
