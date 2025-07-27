
export interface Product {
  id: number;
  title: string;
  price: number;
  memo?: string;
  long_description: string;
  specifications: string;
  images: string[];
  tags: string[];
  featured: boolean;
  created_at?: string;
  updated_at?: string;
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
