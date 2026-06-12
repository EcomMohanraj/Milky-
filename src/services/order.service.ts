import { Order, OrderItem, Address } from "@/types";
import { supabase, isSupabaseConfigured, getLocalStorageItem, setLocalStorageItem } from "./api-client";
import { SEED_PRODUCTS, productService } from "./product.service";

export const orderService = {
  // ORDERS
  async createOrder(
    order: Omit<Order, "id" | "created_at">,
    items: { product_id: string; quantity: number; price: number }[]
  ): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: "ord-" + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .insert(newOrder)
          .select()
          .single();
        if (!error && data) {
          const orderItems = items.map((item) => ({
            ...item,
            order_id: data.id,
          }));
          await supabase.from("order_items").insert(orderItems);
          return { ...data, items: orderItems } as Order;
        }
        console.warn("Supabase createOrder returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase createOrder failed, falling back: ", err);
      }
    }

    // Mock
    const orders = getLocalStorageItem<Order[]>("milky_orders", []);
    const products = getLocalStorageItem("milky_products", SEED_PRODUCTS);

    const populatedItems: OrderItem[] = items.map((item) => ({
      id: "item-" + Math.random().toString(36).substr(2, 9),
      order_id: newOrder.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product: products.find((p) => p.id === item.product_id),
    }));

    const completeOrder = { ...newOrder, items: populatedItems };
    orders.push(completeOrder);
    setLocalStorageItem("milky_orders", orders);

    // Update stock in mock DB
    for (const item of items) {
      const prod = products.find((p) => p.id === item.product_id);
      if (prod) {
        await productService.updateProductStock(prod.id, Math.max(0, prod.stock - item.quantity));
      }
    }

    return completeOrder;
  },

  async getOrders(userId?: string): Promise<Order[]> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*, order_items(*, products(*))")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) return data as Order[];
        console.warn("Supabase getOrders returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase getOrders failed, falling back: ", err);
      }
    }
    const orders = getLocalStorageItem<Order[]>("milky_orders", []);
    if (userId) {
      return orders.filter((o) => o.user_id === userId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return orders.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
        if (!error) return;
        console.warn("Supabase updateOrderStatus returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase updateOrderStatus failed, falling back: ", err);
      }
    }
    const orders = getLocalStorageItem<Order[]>("milky_orders", []);
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setLocalStorageItem("milky_orders", updated);
  },

  // ADDRESSES
  async getAddresses(userId: string): Promise<Address[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .select("*")
          .eq("user_id", userId);
        if (!error && data) return data as Address[];
        console.warn("Supabase getAddresses returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase getAddresses failed, falling back: ", err);
      }
    }
    const addresses = getLocalStorageItem<Address[]>("milky_addresses", []);
    return addresses.filter((a) => a.user_id === userId);
  },

  async createAddress(address: Omit<Address, "id">): Promise<Address> {
    const newAddress: Address = {
      ...address,
      id: "addr-" + Math.random().toString(36).substr(2, 9),
    };
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("addresses")
          .insert(newAddress)
          .select()
          .single();
        if (!error && data) return data as Address;
        console.warn("Supabase createAddress returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase createAddress failed, falling back: ", err);
      }
    }
    const addresses = getLocalStorageItem<Address[]>("milky_addresses", []);
    if (newAddress.is_default) {
      addresses.forEach((a) => {
        if (a.user_id === newAddress.user_id) a.is_default = false;
      });
    }
    addresses.push(newAddress);
    setLocalStorageItem("milky_addresses", addresses);
    return newAddress;
  },

  async deleteAddress(addressId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("addresses").delete().eq("id", addressId);
        if (!error) return;
        console.warn("Supabase deleteAddress returned error, falling back to local: ", error);
      } catch (err) {
        console.error("Supabase deleteAddress failed, falling back: ", err);
      }
    }
    const addresses = getLocalStorageItem<Address[]>("milky_addresses", []);
    const filtered = addresses.filter((a) => a.id !== addressId);
    setLocalStorageItem("milky_addresses", filtered);
  },
};
