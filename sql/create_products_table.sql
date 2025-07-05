
-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  long_description TEXT,
  specifications TEXT,
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  file_size VARCHAR(50),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data (migrating from your existing data)
INSERT INTO products (id, title, price, description, long_description, specifications, images, tags, file_size, featured) VALUES
(1, 'Modern Exhibition Stand', 149, 'A modern exhibition stand design perfect for showcasing your products at trade shows and exhibitions.', 
'<p>This modern exhibition stand design is perfect for businesses looking to make an impact at trade shows and exhibitions. The design features a clean, contemporary aesthetic with ample display space.</p><p>Key features include:</p><ul><li>Open layout with multiple product display areas</li><li>Integrated lighting system</li><li>Reception counter and meeting space</li><li>Storage area for marketing materials and personal items</li><li>Customizable graphics panels</li></ul>', 
'<h4>Technical Specifications</h4><ul><li>Dimensions: 6m x 6m (customizable)</li><li>Height: 3.5m</li><li>Materials: Aluminum structure, MDF panels, glass shelving</li><li>Required floor space: 36m²</li><li>Setup time: Approximately 8 hours</li></ul>',
ARRAY['https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop'],
ARRAY['Modern', 'SKP', '3DS', 'MAX', 'PDF'], '258 MB', true),

(2, 'Corner Exhibition Booth', 199, 'Corner exhibition booth design maximizing visibility from multiple angles.',
'<p>This corner exhibition booth design is specifically crafted to maximize visibility and engagement from multiple angles. Perfect for corner spaces at trade shows.</p><p>Features:</p><ul><li>360-degree visibility design</li><li>Multi-level display areas</li><li>Interactive demo stations</li><li>Private meeting room</li></ul>',
'<h4>Technical Specifications</h4><ul><li>Dimensions: 8m x 8m corner space</li><li>Height: 4m</li><li>Materials: Steel frame, acrylic panels</li><li>Required floor space: 64m²</li></ul>',
ARRAY['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'],
ARRAY['Corner', 'Premium', 'SKP', 'MAX'], '312 MB', true),

(3, 'Island Exhibition Design', 249, 'Premium island exhibition design for maximum impact and visitor engagement.',
'<p>Our premium island exhibition design offers maximum impact and visitor engagement with 360-degree access and stunning visual appeal.</p><p>Premium features:</p><ul><li>Central attraction design</li><li>Multiple entry points</li><li>VIP lounge area</li><li>Interactive technology integration</li></ul>',
'<h4>Technical Specifications</h4><ul><li>Dimensions: 10m x 10m island</li><li>Height: 5m</li><li>Materials: Premium aluminum, glass, LED lighting</li><li>Required floor space: 100m²</li></ul>',
ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'],
ARRAY['Island', 'Premium', '3DS', 'MAX'], '445 MB', true),

(4, 'Minimalist Trade Show Stand', 99, 'Clean minimalist design perfect for startups and small businesses.',
'<p>A clean, minimalist exhibition stand design that''s perfect for startups and small businesses looking to make a professional impression without breaking the budget.</p><p>Key benefits:</p><ul><li>Cost-effective solution</li><li>Easy setup and breakdown</li><li>Flexible configuration</li><li>Professional appearance</li></ul>',
'<h4>Technical Specifications</h4><ul><li>Dimensions: 3m x 3m</li><li>Height: 2.5m</li><li>Materials: Portable aluminum frame, fabric graphics</li><li>Required floor space: 9m²</li></ul>',
ARRAY['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop'],
ARRAY['Minimalist', 'Budget', 'SKP', 'PDF'], '89 MB', false),

(5, 'Tech Innovation Booth', 299, 'High-tech exhibition booth with interactive displays and modern aesthetics.',
'<p>A cutting-edge exhibition booth designed specifically for technology companies and innovation showcases. Features integrated interactive displays and modern aesthetics.</p><p>Technology features:</p><ul><li>Interactive touchscreen displays</li><li>LED wall integration</li><li>Smart lighting system</li><li>Wireless charging stations</li><li>AR/VR demo areas</li></ul>',
'<h4>Technical Specifications</h4><ul><li>Dimensions: 7m x 5m</li><li>Height: 4m</li><li>Materials: Carbon fiber, tempered glass, LED panels</li><li>Power requirements: 220V, 50A</li><li>Network: Built-in WiFi 6 infrastructure</li></ul>',
ARRAY['https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'],
ARRAY['Tech', 'Innovation', 'Interactive', 'MAX'], '678 MB', false),

(6, 'Luxury Brand Pavilion', 399, 'Elegant luxury pavilion design for high-end brands and premium products.',
'<p>An elegant luxury pavilion design crafted for high-end brands and premium products. This design emphasizes sophistication and exclusivity.</p><p>Luxury features:</p><ul><li>Premium materials and finishes</li><li>Private consultation areas</li><li>Climate-controlled environment</li><li>Champagne bar and hospitality suite</li><li>Exclusive product showcase areas</li></ul>',
'<h4>Technical Specifications</h4><ul><li>Dimensions: 12m x 8m</li><li>Height: 4.5m</li><li>Materials: Marble, mahogany, crystal, gold accents</li><li>Climate control: Independent HVAC system</li><li>Security: Integrated alarm system</li></ul>',
ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'],
ARRAY['Luxury', 'Premium', 'Brand', 'MAX', '3DS'], '892 MB', false);

-- Create an index on featured products for better performance
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Create an index on tags for better search performance
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
