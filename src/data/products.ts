import exhibitionPlaceholder from '@/assets/exhibition-placeholder.jpg';

export interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  tags: string[];
  description: string;
  longDescription: string;
  specifications: string;
  images: string[];
  fileFormats: string[];
  fileSize: string;
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    title: "Modern Exhibition Stand",
    price: 149,
    image: exhibitionPlaceholder,
    tags: ["Modern", "4-sided", "Large", "Innovation", "SKP", "3DS", "MAX", "PDF"],
    description: "A modern exhibition stand design perfect for showcasing your products at trade shows and exhibitions.",
    longDescription: `
      <p>This modern exhibition stand design is perfect for businesses looking to make an impact at trade shows and exhibitions. The design features a clean, contemporary aesthetic with ample display space.</p>
      
      <p>Key features include:</p>
      <ul>
        <li>Open layout with multiple product display areas</li>
        <li>Integrated lighting system</li>
        <li>Reception counter and meeting space</li>
        <li>Storage area for marketing materials and personal items</li>
        <li>Customizable graphics panels</li>
      </ul>
    `,
    specifications: `
      <h4>Technical Specifications</h4>
      <ul>
        <li>Dimensions: 6m x 6m (customizable)</li>
        <li>Height: 3.5m</li>
        <li>Materials: Aluminum structure, MDF panels, glass shelving</li>
        <li>Required floor space: 36m²</li>
        <li>Setup time: Approximately 8 hours</li>
      </ul>
    `,
    images: [
      exhibitionPlaceholder,
      exhibitionPlaceholder
    ],
    fileFormats: ["SKP", "3DS", "MAX", "PDF"],
    fileSize: "258 MB",
    featured: true
  },
  {
    id: 2,
    title: "Corner Exhibition Booth",
    price: 199,
    image: exhibitionPlaceholder,
    tags: ["2-sided", "Modern", "Large", "Meeting-room", "Premium", "SKP", "MAX"],
    description: "Corner exhibition booth design maximizing visibility from multiple angles.",
    longDescription: `
      <p>This corner exhibition booth design is specifically crafted to maximize visibility and engagement from multiple angles. Perfect for corner spaces at trade shows.</p>
      
      <p>Features:</p>
      <ul>
        <li>360-degree visibility design</li>
        <li>Multi-level display areas</li>
        <li>Interactive demo stations</li>
        <li>Private meeting room</li>
      </ul>
    `,
    specifications: `
      <h4>Technical Specifications</h4>
      <ul>
        <li>Dimensions: 8m x 8m corner space</li>
        <li>Height: 4m</li>
        <li>Materials: Steel frame, acrylic panels</li>
        <li>Required floor space: 64m²</li>
      </ul>
    `,
    images: [
      exhibitionPlaceholder,
      exhibitionPlaceholder
    ],
    fileFormats: ["SKP", "MAX", "PDF"],
    fileSize: "312 MB",
    featured: true
  },
  {
    id: 3,
    title: "Island Exhibition Design",
    price: 249,
    image: exhibitionPlaceholder,
    tags: ["4-sided", "Luxury", "Large", "Interactive", "Premium", "3DS", "MAX"],
    description: "Premium island exhibition design for maximum impact and visitor engagement.",
    longDescription: `
      <p>Our premium island exhibition design offers maximum impact and visitor engagement with 360-degree access and stunning visual appeal.</p>
      
      <p>Premium features:</p>
      <ul>
        <li>Central attraction design</li>
        <li>Multiple entry points</li>
        <li>VIP lounge area</li>
        <li>Interactive technology integration</li>
      </ul>
    `,
    specifications: `
      <h4>Technical Specifications</h4>
      <ul>
        <li>Dimensions: 10m x 10m island</li>
        <li>Height: 5m</li>
        <li>Materials: Premium aluminum, glass, LED lighting</li>
        <li>Required floor space: 100m²</li>
      </ul>
    `,
    images: [
      exhibitionPlaceholder,
      exhibitionPlaceholder
    ],
    fileFormats: ["3DS", "MAX", "PDF"],
    fileSize: "445 MB",
    featured: true
  },
  {
    id: 4,
    title: "Minimalist Trade Show Stand",
    price: 99,
    image: exhibitionPlaceholder,
    tags: ["1-sided", "Minimal", "Small", "Economy", "SKP", "PDF"],
    description: "Clean minimalist design perfect for startups and small businesses.",
    longDescription: `
      <p>A clean, minimalist exhibition stand design that's perfect for startups and small businesses looking to make a professional impression without breaking the budget.</p>
      
      <p>Key benefits:</p>
      <ul>
        <li>Cost-effective solution</li>
        <li>Easy setup and breakdown</li>
        <li>Flexible configuration</li>
        <li>Professional appearance</li>
      </ul>
    `,
    specifications: `
      <h4>Technical Specifications</h4>
      <ul>
        <li>Dimensions: 3m x 3m</li>
        <li>Height: 2.5m</li>
        <li>Materials: Portable aluminum frame, fabric graphics</li>
        <li>Required floor space: 9m²</li>
      </ul>
    `,
    images: [
      exhibitionPlaceholder
    ],
    fileFormats: ["SKP", "PDF"],
    fileSize: "89 MB"
  },
  {
    id: 5,
    title: "Tech Innovation Booth",
    price: 299,
    image: exhibitionPlaceholder,
    tags: ["3-sided", "Futuristic", "Medium", "Interactive", "Innovation", "MAX"],
    description: "High-tech exhibition booth with interactive displays and modern aesthetics.",
    longDescription: `
      <p>A cutting-edge exhibition booth designed specifically for technology companies and innovation showcases. Features integrated interactive displays and modern aesthetics.</p>
      
      <p>Technology features:</p>
      <ul>
        <li>Interactive touchscreen displays</li>
        <li>LED wall integration</li>
        <li>Smart lighting system</li>
        <li>Wireless charging stations</li>
        <li>AR/VR demo areas</li>
      </ul>
    `,
    specifications: `
      <h4>Technical Specifications</h4>
      <ul>
        <li>Dimensions: 7m x 5m</li>
        <li>Height: 4m</li>
        <li>Materials: Carbon fiber, tempered glass, LED panels</li>
        <li>Power requirements: 220V, 50A</li>
        <li>Network: Built-in WiFi 6 infrastructure</li>
      </ul>
    `,
    images: [
      exhibitionPlaceholder,
      exhibitionPlaceholder
    ],
    fileFormats: ["MAX", "3DS", "PDF"],
    fileSize: "678 MB"
  },
  {
    id: 6,
    title: "Luxury Brand Pavilion",
    price: 399,
    image: exhibitionPlaceholder,
    tags: ["4-sided", "Luxury", "Large", "Wood", "Premium", "Brand", "Meeting-room", "MAX", "3DS"],
    description: "Elegant luxury pavilion design for high-end brands and premium products.",
    longDescription: `
      <p>An elegant luxury pavilion design crafted for high-end brands and premium products. This design emphasizes sophistication and exclusivity.</p>
      
      <p>Luxury features:</p>
      <ul>
        <li>Premium materials and finishes</li>
        <li>Private consultation areas</li>
        <li>Climate-controlled environment</li>
        <li>Champagne bar and hospitality suite</li>
        <li>Exclusive product showcase areas</li>
      </ul>
    `,
    specifications: `
      <h4>Technical Specifications</h4>
      <ul>
        <li>Dimensions: 12m x 8m</li>
        <li>Height: 4.5m</li>
        <li>Materials: Marble, mahogany, crystal, gold accents</li>
        <li>Climate control: Independent HVAC system</li>
        <li>Security: Integrated alarm system</li>
      </ul>
    `,
    images: [
      exhibitionPlaceholder,
      exhibitionPlaceholder
    ],
    fileFormats: ["MAX", "3DS", "SKP", "PDF"],
    fileSize: "892 MB"
  }
];
