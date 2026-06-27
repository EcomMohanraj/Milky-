export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  stock: number;
  category: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    carbohydrates?: string;
    fat?: string;
    fiber?: string;
    usage?: string;
  };
  created_at?: string;
}

export interface Order {
  id: string;
  user_id?: string;
  amount: number;
  status: "pending" | "paid" | "failed" | "shipped" | "delivered";
  payment_id?: string;
  razorpay_order_id?: string;
  address?: string;
  tracking_id?: string | null;
  courier_name?: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

export interface Address {
  id: string;
  user_id: string;
  address: string;
  city: string;
  pincode: string;
  is_default: boolean;
  created_at?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
