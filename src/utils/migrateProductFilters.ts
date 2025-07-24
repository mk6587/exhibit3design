import { supabase } from "@/integrations/supabase/client";
import { recognizeFiltersFromProduct, generateFilterTags } from "./filterRecognition";
import { Product } from "@/types/product";

export async function migrateExistingProducts() {
  console.log('🔄 Starting migration of existing products...');
  
  try {
    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('❌ Failed to fetch products:', error);
      throw error;
    }

    if (!products || products.length === 0) {
      console.log('ℹ️ No products found to migrate');
      return;
    }

    console.log(`📦 Found ${products.length} products to migrate`);

    // Process each product
    for (const product of products) {
      try {
        console.log(`🔄 Processing product ${product.id}: ${product.title}`);
        
        // Check if product already has filter tags
        const hasFilterTags = product.tags.some((tag: string) => tag.startsWith('filter:'));
        
        if (hasFilterTags) {
          console.log(`✅ Product ${product.id} already has filter tags, skipping`);
          continue;
        }

        // Generate filter tags
        const filterTags = recognizeFiltersFromProduct(
          product.title,
          product.description || '',
          product.specifications || '',
          product.price
        );
        
        const autoFilterTags = generateFilterTags(filterTags);
        
        // Combine existing tags (remove any existing filter tags) with new filter tags
        const existingTags = product.tags.filter((tag: string) => !tag.startsWith('filter:'));
        const finalTags = [...existingTags, ...autoFilterTags];
        
        console.log(`🏷️ Generated tags for ${product.title}:`, autoFilterTags);
        
        // Update the product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            tags: finalTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', product.id);

        if (updateError) {
          console.error(`❌ Failed to update product ${product.id}:`, updateError);
          continue;
        }

        console.log(`✅ Successfully migrated product ${product.id}`);
        
      } catch (productError) {
        console.error(`❌ Error processing product ${product.id}:`, productError);
        continue;
      }
    }

    console.log('✅ Migration completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}