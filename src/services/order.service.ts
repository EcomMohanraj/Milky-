import { Order, Address } from "@/types";

export const orderService = {
  // ORDERS
  async createOrder(
    order: Omit<Order, "id" | "created_at">,
    items: { product_id: string; quantity: number; price: number }[]
  ): Promise<Order> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: order.amount,
        status: order.status,
        payment_id: order.payment_id,
        address: order.address,
        items
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to create order.");
    }

    const data = await res.json();
    return data.order as Order;
  },

  async getOrders(_userId?: string): Promise<Order[]> {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return [];
      const data = await res.json();
      return data.orders as Order[];
    } catch (err) {
      console.error("getOrders error:", err);
      return [];
    }
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update order status.");
    }
  },

  async deleteOrder(orderId: string): Promise<void> {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete order.");
    }
  },

  // ADDRESSES
  async getAddresses(_userId: string): Promise<Address[]> {
    try {
      const res = await fetch("/api/addresses");
      if (!res.ok) return [];
      const data = await res.json();
      return data.addresses as Address[];
    } catch (err) {
      console.error("getAddresses error:", err);
      return [];
    }
  },

  async createAddress(address: Omit<Address, "id">): Promise<Address> {
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: address.address,
        city: address.city,
        pincode: address.pincode,
        is_default: address.is_default
      })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to create address.");
    }

    const data = await res.json();
    return data.address as Address;
  },

  async deleteAddress(addressId: string): Promise<void> {
    const res = await fetch(`/api/addresses/${addressId}`, {
      method: "DELETE"
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete address.");
    }
  },
};
