"use client";

import React, { useEffect, useState, use } from "react";
import Image from "next/image";
import { getProductImageUrl } from "@/lib/image";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, ShieldCheck, Heart, Star, Sparkles, MessageSquare } from "lucide-react";
import { productService } from "@/services/product.service";
import { Product, Review } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast-simple";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const { slug } = use(params);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const prodData = await productService.getProductBySlug(slug);
        if (prodData) {
          setProduct(prodData);
          const { reviews: revs, canReview: eligible } = await productService.getReviews(prodData.id);
          setReviews(revs);
          setCanReview(eligible);
        }
      } catch (err) {
        console.error("Error loading product: ", err);
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center flex-grow">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center flex-grow flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-foreground">Product Not Found</h2>
        <p className="text-sm text-muted-foreground">The product you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard?checkout=true";
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be signed in to submit a review.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await productService.createReview(
        {
          product_id: product.id,
          user_id: user.id,
          rating,
          comment,
        },
        user.name
      );

      setReviews((prev) => {
        const index = prev.findIndex((r) => r.user_id === user.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = newReview;
          return updated;
        }
        return [newReview, ...prev];
      });

      setComment("");
      setRating(5);
      setIsEditing(false);
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
        variant: "success",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Could not post review.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "No reviews";

  return (
    <div className="container mx-auto px-4 md:px-6 py-10 flex-grow">
      
      {/* Back Button */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Shop Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* Product Image Section */}
        <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-border shadow-md bg-secondary">
          <Image
            src={getProductImageUrl(product.image)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 500px"
            priority
          />
          <button
            onClick={() => toggleWishlist(product)}
            className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-colors z-10 ${
              isFavorite
                ? "bg-red-500 text-white"
                : "bg-white/90 dark:bg-black/60 text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              100% Organic {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mt-1 font-outfit">
              {product.name}
            </h1>
            
            {/* Reviews summary */}
            <div className="flex items-center gap-2 mt-3 text-sm">
              <div className="flex text-amber-500 font-bold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(averageRating) || 0) ? "fill-current" : "opacity-30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-foreground">
                {averageRating}
              </span>
              <span className="text-muted-foreground text-xs font-semibold">
                ({reviews.length} customer reviews)
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-black text-primary">₹{product.price.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground font-semibold">/ 250g retail pack</span>
            </div>
          </div>

          <div className="border-t border-b border-border py-4 text-sm text-muted-foreground leading-relaxed">
            <p>{product.description}</p>
          </div>

          {/* Nutrition Table */}
          {product.nutrition && (Object.keys(product.nutrition).length > 0) && (
            <div>
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground mb-3">
                Nutrition Facts & Usage
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(product.nutrition).map(([key, val]) => (
                  <div key={key} className="bg-card border border-border p-3 rounded-xl shadow-sm">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{key}</p>
                    <p className="font-black text-sm text-foreground mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity and Checkout buttons */}
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                {product.stock > 0 ? `${product.stock} packs ready at farm` : "Out of stock"}
              </div>

              {!isOutOfStock && (
                <div className="flex items-center border border-border rounded-xl bg-card overflow-hidden">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    -
                  </button>
                  <span className="px-5 text-sm font-extrabold text-foreground">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 w-full">
              {!isOutOfStock ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 min-w-[150px] py-4 bg-secondary text-secondary-foreground font-bold text-sm rounded-xl hover:bg-secondary/80 flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add To Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 min-w-[150px] py-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/95 text-center shadow-md shadow-primary/10 transition-all"
                  >
                    Buy Now
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-muted text-muted-foreground font-bold text-sm rounded-xl cursor-not-allowed text-center"
                >
                  Harvest Out of Stock
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* REVIEWS & FEEDBACK */}
      <section className="mt-20 border-t border-border pt-16 max-w-4xl">
        <h2 className="text-2xl font-extrabold text-foreground mb-8 flex items-center gap-2 font-outfit">
          <MessageSquare className="w-6 h-6 text-primary" />
          Customer Feedback ({reviews.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Write a review form */}
          <div className="md:col-span-1 bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="font-extrabold text-sm text-foreground">Write a Review</h3>
            {user ? (
              (() => {
                const existingReview = reviews.find((r) => r.user_id === user.id);
                if (existingReview && !isEditing) {
                  return (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">Your Review</span>
                        <button 
                          onClick={() => {
                            setRating(existingReview.rating);
                            setComment(existingReview.comment || "");
                            setIsEditing(true);
                          }}
                          className="text-[10px] text-primary hover:underline font-bold"
                        >
                          Edit Review
                        </button>
                      </div>
                      <div className="flex text-amber-500 font-bold">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < existingReview.rating ? "fill-current" : "opacity-30"}`}
                          />
                        ))}
                      </div>
                      {existingReview.comment && (
                        <p className="text-xs text-muted-foreground italic leading-normal">
                          &ldquo;{existingReview.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                }

                if (!existingReview && !canReview) {
                  return (
                    <div className="text-center py-6 px-4 bg-muted/10 border border-dashed border-border/80 rounded-xl flex flex-col gap-2">
                      <ShieldCheck className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                      <p className="text-xs text-muted-foreground leading-normal font-medium">
                        Only customers who purchased this product can leave a review.
                      </p>
                    </div>
                  );
                }

                return (
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Rating</label>
                      <div className="flex gap-1.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Comments</label>
                      <textarea
                        rows={3}
                        placeholder="Tell us what you made!"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        className="w-full mt-1 border border-border rounded-lg p-2 text-xs text-foreground bg-background focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-grow py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:bg-primary/95 transition-colors text-center"
                      >
                        {submittingReview ? "Posting..." : existingReview ? "Update Review" : "Submit Review"}
                      </button>
                      {existingReview && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setComment("");
                          }}
                          className="px-3 py-2 bg-secondary text-secondary-foreground font-bold text-xs rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                );
              })()
            ) : (
              <div className="text-center py-4 flex flex-col gap-2">
                <p className="text-xs text-muted-foreground leading-normal">
                  You must be logged in to submit product reviews.
                </p>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-secondary text-secondary-foreground font-bold text-xs rounded-lg hover:bg-secondary/80 inline-block"
                >
                  Sign In Now
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 flex flex-col gap-4">
            {reviews.length === 0 ? (
              <div className="bg-muted/20 border border-border/40 p-8 rounded-2xl text-center">
                <p className="text-xs text-muted-foreground italic">No reviews yet for this product. Be the first to write one!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-card border border-border/40 p-4 rounded-xl shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">{rev.user_name}</span>
                    <span className="text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex text-amber-500 font-bold">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? "fill-current" : "opacity-30"
                        }`}
                      />
                    ))}
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-muted-foreground mt-1 leading-normal italic">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
