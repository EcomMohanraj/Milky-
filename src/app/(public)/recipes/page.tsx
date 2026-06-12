"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, X, ChefHat, BookOpen } from "lucide-react";
import { productService } from "@/services/product.service";
import { BlogPost } from "@/types";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<BlogPost[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<BlogPost | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await productService.getBlogPosts();
        setRecipes(data);
        setFilteredRecipes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Handle local searching
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecipes(recipes);
    } else {
      const q = searchQuery.toLowerCase();
      const filtered = recipes.filter(
        (r) => r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q)
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, recipes]);

  // Static difficulty and timings matching seeded recipes
  const getRecipeMetadata = (slug: string) => {
    switch (slug) {
      case "spicy-milky-mushroom-fry":
        return { prep: "10m", cook: "15m", difficulty: "Easy", chef: "Chef Ramesh" };
      case "creamy-milky-mushroom-soup":
        return { prep: "10m", cook: "20m", difficulty: "Medium", chef: "Chef Vinoth" };
      case "chettinad-milky-mushroom-gravy":
        return { prep: "15m", cook: "20m", difficulty: "Medium", chef: "Chef Meenakshi" };
      case "organic-milky-mushroom-biryani":
        return { prep: "20m", cook: "30m", difficulty: "Hard", chef: "Chef Ramesh" };
      default:
        return { prep: "15m", cook: "20m", difficulty: "Easy", chef: "Farm Kitchen" };
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow flex flex-col pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-8 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary justify-center">
          <ChefHat className="w-3.5 h-3.5" />
          Farm Culinary Blog
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground font-outfit">
          Milky Mushroom Recipes
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
          Unlock the culinary versatility of Milky Mushrooms. Explore South Indian classics, comforting soups, and Dum Biryanis crafted by our farm kitchen.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-12">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search recipes (e.g. Biryani, Fry)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-card border border-border animate-pulse rounded-2xl h-[340px]" />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-card border border-border/60 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 max-w-lg mx-auto">
          <BookOpen className="w-10 h-10 text-muted-foreground" />
          <h3 className="font-bold text-base text-foreground">No Recipes Found</h3>
          <p className="text-xs text-muted-foreground leading-normal">
            We couldn&apos;t find any recipes matching your search query. Try typing &apos;Fry&apos;, &apos;Biryani&apos;, or &apos;Soup&apos;!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => {
            const meta = getRecipeMetadata(recipe.slug);
            return (
              <motion.div
                key={recipe.id}
                whileHover={{ y: -6 }}
                className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer group"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full bg-secondary overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black/70 text-white rounded-md">
                    {meta.difficulty}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                      {recipe.title}
                    </h3>
                    
                    {/* Snippet */}
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {recipe.content.replace(/###.*/g, "").replace(/\*.*/g, "").substring(0, 100)}...
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold border-t border-border/40 pt-3 mt-1 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Prep: {meta.prep} / Cook: {meta.cook}
                    </span>
                    <span className="text-primary font-extrabold">View Recipe</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Recipe Modal Overlay */}
      <AnimatePresence>
        {selectedRecipe && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="fixed inset-0 bg-black z-50 cursor-pointer backdrop-blur-sm"
            />

            {/* Modal Body */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto max-h-[85vh] relative"
              >
                {/* Close Trigger */}
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-black/60 md:bg-muted md:hover:bg-muted/80 text-white md:text-muted-foreground rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Banner Image */}
                <div className="relative h-[200px] w-full shrink-0 bg-secondary">
                  <Image
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex items-end p-5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary-foreground/95 px-2 py-0.5 rounded">
                        {getRecipeMetadata(selectedRecipe.slug).difficulty} Recipe
                      </span>
                      <h2 className="text-xl md:text-2xl font-black text-white mt-1.5 font-outfit leading-tight">
                        {selectedRecipe.title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Recipe Instructions Scrollable */}
                <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6 text-sm text-foreground">
                  {/* Meta items */}
                  <div className="grid grid-cols-3 gap-3 text-center border-b border-border/80 pb-4 shrink-0">
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Prep Time</p>
                      <p className="font-extrabold text-foreground mt-0.5">{getRecipeMetadata(selectedRecipe.slug).prep}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Cook Time</p>
                      <p className="font-extrabold text-primary mt-0.5">{getRecipeMetadata(selectedRecipe.slug).cook}</p>
                    </div>
                    <div className="bg-muted/30 p-2.5 rounded-xl border border-border/30">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Creator</p>
                      <p className="font-extrabold text-foreground mt-0.5 truncate">{getRecipeMetadata(selectedRecipe.slug).chef}</p>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-foreground leading-relaxed text-xs md:text-sm">
                    {/* Render content split by lines, simple formatting */}
                    {selectedRecipe.content.split("\n").map((line, idx) => {
                      if (line.startsWith("###")) {
                        return (
                          <h4 key={idx} className="font-black text-base text-foreground mt-5 mb-2 border-b border-border/50 pb-1">
                            {line.replace("###", "").trim()}
                          </h4>
                        );
                      }
                      if (line.startsWith("-")) {
                        return (
                          <li key={idx} className="list-disc list-inside ml-2 text-muted-foreground py-0.5">
                            {line.replace("-", "").trim()}
                          </li>
                        );
                      }
                      if (line.match(/^\d+\./)) {
                        return (
                          <p key={idx} className="text-muted-foreground py-1">
                            <span className="font-extrabold text-primary mr-1">{line.match(/^\d+/)?.[0]}.</span>
                            {line.replace(/^\d+\./, "").trim()}
                          </p>
                        );
                      }
                      return <p key={idx} className="my-1.5 leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-border bg-muted/10 shrink-0 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedRecipe(null)}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/95 shadow-sm"
                  >
                    Got It, Thank You!
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
