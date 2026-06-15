import { Order, Address } from "@/types";
import { apiFetch } from "./api-client";

export const orderService = {
  // ORDERS
  async createOrder(
    order: Omit<Order, "id" | "created_at">,
    items: { product_id: string; quantity: number; price: number }[]
  ): Promise<Order> {
    const res = await apiFetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: order.amount,
        address: order.address,
        payment_id: order.payment_id,
        status: order.status,
        items,
      }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to place order.");
    }
    return await res.json();
  },

  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const res = await apiFetch("/api/orders");
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("getOrders failed:", err);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    try {
      const res = await apiFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update order status.");
      }
    } catch (err) {
      console.error("updateOrderStatus failed:", err);
      throw err;
    }
  },

  // ADDRESSES
  async getAddresses(userId: string): Promise<Address[]> {
    try {
      const res = await apiFetch("/api/addresses");
      if (!res.ok) return [];
      return await res.json();
    } catch (err) {
      console.error("getAddresses failed:", err);
      return [];
    }
  },

  async createAddress(address: Omit<Address, "id">): Promise<Address> {
    const res = await apiFetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: address.address,
        city: address.city,
        pincode: address.pincode,
        is_default: address.is_default,
      }),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to save address.");
    }
    return await res.json();
  },

  async deleteAddress(addressId: string): Promise<void> {
    try {
      const res = await apiFetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete address.");
      }
    } catch (err) {
      console.error("deleteAddress failed:", err);
      throw err;
    }
  },
};
