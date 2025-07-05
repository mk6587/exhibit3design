
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
  floor: string;
  powerSupply: string;
  lighting: string;
  facilities: {
    infoDesk: boolean;
    vipRoom: boolean;
    storage: boolean;
    meetingArea: boolean;
    productDisplay: boolean;
    reception: boolean;
    kitchenette: boolean;
    multimedia: boolean;
  };
}
