export function getProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/images/fresh_milky_mushrooms.webp";

  // Redirect legacy/broken product image references to correct local assets
  if (imagePath.includes("premium-fresh-milky-mushrooms")) {
    return "/images/fresh_milky_mushrooms.webp";
  }

  // Redirect legacy Unsplash recipe images to optimized local WebP assets
  if (imagePath.includes("photo-1626132647523-66f5bf380027")) {
    return "/images/chettinad_mushroom_gravy.webp";
  }
  if (imagePath.includes("photo-1633945274405-b6c8069047b0")) {
    return "/images/organic_mushroom_biryani.webp";
  }
  
  // Clean up legacy PNG extensions to WebP dynamically
  let cleanPath = imagePath;
  if (cleanPath.endsWith(".png")) {
    cleanPath = cleanPath.replace(/\.png$/, ".webp");
  }
  
  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("/")
  ) {
    return cleanPath;
  }
  
  // Construct Supabase public storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === "https://mock-project.supabase.co" || supabaseUrl === "https://your-project-id.supabase.co") {
    return "/images/fresh_milky_mushrooms.webp";
  }
  
  // Clean up supabaseUrl (remove trailing slash if present)
  const baseUrl = supabaseUrl.endsWith("/") ? supabaseUrl.slice(0, -1) : supabaseUrl;
  
  // If the image path already starts with the bucket name 'products/' or contains a slash,
  // we just append it. Otherwise, prepend 'products/'.
  const path = cleanPath.startsWith("products/") ? cleanPath : `products/${cleanPath}`;
  
  return `${baseUrl}/storage/v1/object/public/${path}`;
}
