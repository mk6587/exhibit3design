
export interface Product {
  id: number;
  title: string;
  price: number;
  memo?: string | null;
  specifications?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
  featured?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface StandSpecifications {
  dimensions: string;
  height: string;
  layout: string;
  lighting: string;
  specifications: {
    infoDesk: boolean;
    storage: boolean;
    screen: boolean;
    kitchen: boolean;
    seatingArea: boolean;
    meetingRoom: boolean;
    hangingBanner: boolean;
  };
}
