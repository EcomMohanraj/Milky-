export function getProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/images/fresh_milky_mushrooms.png";
  
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("/")
  ) {
    return imagePath;
  }
  
  // Construct Supabase public storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-project.supabase.co";
  
  // Clean up supabaseUrl (remove trailing slash if present)
  const baseUrl = supabaseUrl.endsWith("/") ? supabaseUrl.slice(0, -1) : supabaseUrl;
  
  // If the image path already starts with the bucket name 'products/' or contains a slash,
  // we just append it. Otherwise, prepend 'products/'.
  const path = imagePath.startsWith("products/") ? imagePath : `products/${imagePath}`;
  
  return `${baseUrl}/storage/v1/object/public/${path}`;
}
