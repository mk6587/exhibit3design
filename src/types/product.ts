
export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  longDescription: string;
  specifications: string;
  images: string[];
  tags: string[];
  fileSize: string;
  featured?: boolean;
}
