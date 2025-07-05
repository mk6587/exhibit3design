
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  longDescription: string;
  specifications: string; // JSON string containing structured specifications
  images: string[];
  tags: string[];
  fileSize: string;
  featured?: boolean;
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
