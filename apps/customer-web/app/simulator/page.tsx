"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ProFloLogo } from "../shop/components/ProFloLogo";

// Product Type
type SimProduct = {
  id: string;
  barcode: string;
  name: string;
  category: string;
  unitPrice: number;
  size?: string;
  color?: string;
  brand?: string;
  inStock: number;
};

// Customer Type in Simulator
type SimCustomer = {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  x: number;
  y: number;
  status: "entering" | "browsing" | "scanning" | "checking_out" | "settled" | "exiting" | "left";
  currentZone: "entrance" | "mens_wear" | "womens_wear" | "footwear" | "accessories" | "checkout_kiosks" | "cashier_counter" | "exit_pass" | "out";
  cart: { product: SimProduct; qty: number }[];
  sessionId: string | null;
  orderId: string | null;
  tokenNumber: number | null;
  exitQr: string | null;
  paymentMode: "ONLINE" | "COUNTER" | null;
  bubbleText: string | null;
  aiChat: { sender: "user" | "bot"; text: string }[];
  logs: string[];
};

// Default catalog fallback
const DEFAULT_PRODUCTS: SimProduct[] = [
  { id: "p1", barcode: "8901234567890", name: "Classic Denim Jacket", category: "Men's Wear", unitPrice: 1899, size: "L", color: "Blue", brand: "ProFlo", inStock: 12 },
  { id: "p2", barcode: "8901234567891", name: "Floral Summer Dress", category: "Women's Wear", unitPrice: 2499, size: "M", color: "Yellow", brand: "ProFlo", inStock: 8 },
  { id: "p3", barcode: "8901234567892", name: "Classic Leather Sneakers", category: "Footwear", unitPrice: 3499, size: "9", color: "White", brand: "ProFlo", inStock: 5 },
  { id: "p4", barcode: "8901234567893", name: "Canvas Tote Bag", category: "Accessories", unitPrice: 799, size: "One Size", color: "Beige", brand: "ProFlo", inStock: 15 },
  { id: "p5", barcode: "8901234567894", name: "Slim Fit Khaki Chinos", category: "Men's Wear", unitPrice: 1599, size: "32", color: "Khaki", brand: "ProFlo", inStock: 10 },
  { id: "p6", barcode: "8901234567895", name: "Pleated Pink Midi Skirt", category: "Women's Wear", unitPrice: 1799, size: "S", color: "Pink", brand: "ProFlo", inStock: 7 },
  { id: "p7", barcode: "8901234567896", name: "Wool Knit Beanie", category: "Accessories", unitPrice: 499, size: "One Size", color: "Black", brand: "ProFlo", inStock: 20 },
  { id: "p8", barcode: "8901234567897", name: "Air Mesh Running Shoes", category: "Footwear", unitPrice: 4599, size: "10", color: "Grey", brand: "ProFlo", inStock: 3 }
];

const PERSONAS = [
  { name: "Aditya Sharma", phone: "9876543001", color: "#3b82f6" },
  { name: "Priya Patel", phone: "9876543002", color: "#ec4899" },
  { name: "Kiran Rao", phone: "9876543003", color: "#10b981" },
  { name: "Ananya Sen", phone: "9876543004", color: "#8b5cf6" },
  { name: "Rahul Das", phone: "9876543005", color: "#f59e0b" },
  { name: "Rohan Verma", phone: "9876543006", color: "#06b6d4" },
  { name: "Sneha Nair", phone: "9876543007", color: "#14b8a6" }
];

const ZONES = {
  entrance: { name: "Entrance", x: 8, y: 50 },
  mens_wear: { name: "Men's Wear", x: 28, y: 25 },
  womens_wear: { name: "Women's Wear", x: 28, y: 75 },
  footwear: { name: "Footwear", x: 48, y: 25 },
  accessories: { name: "Accessories", x: 48, y: 75 },
  checkout_kiosks: { name: "Self-Checkout", x: 68, y: 75 },
  cashier_counter: { name: "Cashier Counter", x: 68, y: 25 },
  exit_pass: { name: "Exit Gate", x: 88, y: 50 },
  out: { name: "Exited", x: 96, y: 50 }
};

export default function SimulatorPage() {
  // Config
  const [apiMode, setApiMode] = useState<"MOCK" | "LIVE">("MOCK");
  const [apiUrl, setApiUrl] = useState("http://localhost:4000");
  const [speed, setSpeed] = useState<number>(1);
  const [autoSpawn, setAutoSpawn] = useState(true);
  
  // State
  const [products, setProducts] = useState<SimProduct[]>(DEFAULT_PRODUCTS);
  const [customers, setCustomers] = useState<SimCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"CASHIER" | "ADMIN">("ADMIN");
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; time: string; text: string; type: "info" | "api" | "db" }[]>([]);
  
  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [checkedOutCount, setCheckedOutCount] = useState(0);
  const [activeAuditLogs, setActiveAuditLogs] = useState<{ time: string; actor: string; action: string; detail: string }[]>([]);

  const customersRef = useRef<SimCustomer[]>([]);
  customersRef.current = customers;
  const consoleLogsRef = useRef(consoleLogs);
  consoleLogsRef.current = consoleLogs;

  // Log function
  const addLog = useCallback((text: string, type: "info" | "api" | "db" = "info") => {
    const time = new Date().toLocaleTimeString();
    setConsoleLogs((prev) => [
      { id: Math.random().toString(), time, text, type },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  }, []);

  // Fetch live products if mode is LIVE
  useEffect(() => {
    if (apiMode === "LIVE") {
      addLog(`Connecting to live API at ${apiUrl}...`, "info");
      fetch(`${apiUrl}/health`)
        .then((res) => res.json())
        .then((health) => {
          if (health.ok) {
            addLog(`API Health OK. Database is ${health.database}.`, "api");
            // Load products
            return fetch(`${apiUrl}/v1/customer/products`);
          } else {
            throw new Error("Health check failed");
          }
        })
        .then((res) => (res ? res.json() : null))
        .then((data: any[]) => {
          if (data) {
            const mapped = data.map((p) => ({
              id: p.id,
              barcode: p.barcode,
              name: p.name,
              category: p.category || "General",
              unitPrice: p.unitPrice,
              size: p.size,
              color: p.color,
              brand: p.brand,
              inStock: p.inStock ?? 10
            }));
            setProducts(mapped);
            addLog(`Successfully loaded ${mapped.length} products from live API.`, "api");
          }
        })
        .catch((err) => {
          addLog(`Could not connect to live API. Falling back to Mock Database: ${err.message}`, "info");
          setApiMode("MOCK");
        });
    } else {
      setProducts(DEFAULT_PRODUCTS);
      addLog("Initialized local mock SQL database catalog.", "db");
    }
  }, [apiMode, apiUrl, addLog]);

  // Discount event handler
  const triggerDiscount = (productId: string, percent: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const discountAmt = Math.round(p.unitPrice * (percent / 100));
          addLog(`[DISCOUNT] Applied ${percent}% off on ${p.name}. Price reduced from ₹${p.unitPrice} to ₹${p.unitPrice - discountAmt}.`, "db");
          setActiveAuditLogs((logs) => [
            { time: new Date().toLocaleTimeString(), actor: "manager", action: "discount.set", detail: `${p.name} -${percent}%` },
            ...logs
          ]);
          return { ...p, unitPrice: p.unitPrice - discountAmt };
        }
        return p;
      })
    );
  };

  // Restock handler
  const triggerRestock = () => {
    setProducts((prev) =>
      prev.map((p) => {
        addLog(`[RESTOCK] Restocked ${p.name} (+10 units).`, "db");
        return { ...p, inStock: p.inStock + 10 };
      })
    );
    addLog(`All inventory restocked successfully.`, "info");
    setActiveAuditLogs((logs) => [
      { time: new Date().toLocaleTimeString(), actor: "staff", action: "inventory.adjust", detail: "All products +10" },
      ...logs
    ]);
  };

  // Spawn simulated customer
  const spawnCustomer = useCallback(async () => {
    const activePhones = customersRef.current.map((c) => c.phone);
    const availablePersonas = PERSONAS.filter((p) => !activePhones.includes(p.phone));
    if (availablePersonas.length === 0) return;

    const persona = availablePersonas[Math.floor(Math.random() * availablePersonas.length)];
    const newCust: SimCustomer = {
      id: Math.random().toString(),
      name: persona.name,
      phone: persona.phone,
      avatarColor: persona.color,
      x: ZONES.entrance.x + (Math.random() * 4 - 2),
      y: ZONES.entrance.y + (Math.random() * 8 - 4),
      status: "entering",
      currentZone: "entrance",
      cart: [],
      sessionId: null,
      orderId: null,
      tokenNumber: null,
      exitQr: null,
      paymentMode: null,
      bubbleText: "Just walked in! Checking out ProFlo.",
      aiChat: [],
      logs: []
    };

    setCustomers((prev) => [...prev, newCust]);
    setSelectedCustomerId((id) => (id === null ? newCust.id : id));

    addLog(`Customer ${newCust.name} (${newCust.phone}) entered the store.`, "info");

    // Live backend session create
    if (apiMode === "LIVE") {
      try {
        const res = await fetch(`${apiUrl}/v1/customer/session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storeCode: "BLR001", customerPhone: newCust.phone })
        });
        const data = await res.json();
        if (res.ok && data.sessionId) {
          setCustomers((prev) =>
            prev.map((c) => (c.id === newCust.id ? { ...c, sessionId: data.sessionId, logs: [...c.logs, `API: Session created: ${data.sessionId}`] } : c))
          );
          addLog(`[API POST] /v1/customer/session -> 201 Created (visit recovery ready)`, "api");
        }
      } catch (err: any) {
        addLog(`[API ERROR] Session initialization failed: ${err.message}`, "api");
      }
    } else {
      const mockSessionId = `sess_${Math.random().toString(36).substr(2, 9)}`;
      setCustomers((prev) =>
        prev.map((c) => (c.id === newCust.id ? { ...c, sessionId: mockSessionId, logs: [...c.logs, `DB: Mock session started: ${mockSessionId}`] } : c))
      );
      addLog(`[MOCK DB] INSERT INTO customer_sessions values ('${mockSessionId}', 'active')`, "db");
    }
  }, [apiMode, apiUrl, addLog]);

  // Auto-spawn controller
  useEffect(() => {
    if (!autoSpawn) return;
    const interval = setInterval(() => {
      const activeCount = customersRef.current.filter((c) => c.status !== "left").length;
      if (activeCount < 5 && Math.random() > 0.3) {
        void spawnCustomer();
      }
    }, 15000 / speed);
    return () => clearInterval(interval);
  }, [autoSpawn, speed, spawnCustomer]);

  // Customer state simulation machine
  useEffect(() => {
    const interval = setInterval(() => {
      setCustomers((prevCustomers) => {
        return prevCustomers.map((cust) => {
          if (cust.status === "left") return cust;

          const updated = { ...cust };
          const rand = Math.random();

          // 1. Entering -> walks to aisles
          if (updated.status === "entering") {
            const nextZone = rand > 0.5 ? "mens_wear" : "womens_wear";
            updated.currentZone = nextZone as any;
            updated.x = ZONES[nextZone].x + (Math.random() * 6 - 3);
            updated.y = ZONES[nextZone].y + (Math.random() * 8 - 4);
            updated.status = "browsing";
            updated.bubbleText = `Heading over to ${ZONES[nextZone].name}!`;
            updated.logs.push(`Walked to ${ZONES[nextZone].name} area`);
            return updated;
          }

          // 2. Browsing -> Pick a product and scan, or ask AI Stylist, or go to checkout
          if (updated.status === "browsing") {
            const categoryMatch =
              updated.currentZone === "mens_wear"
                ? "Men's Wear"
                : updated.currentZone === "womens_wear"
                ? "Women's Wear"
                : updated.currentZone === "footwear"
                ? "Footwear"
                : "Accessories";

            const possibleProducts = products.filter((p) => p.category === categoryMatch && p.inStock > 0);

            // Add item to cart (50% chance if there are items, else move zone)
            if (possibleProducts.length > 0 && rand > 0.4 && updated.cart.length < 3) {
              const product = possibleProducts[Math.floor(Math.random() * possibleProducts.length)];
              updated.status = "scanning";
              updated.bubbleText = `Scanning barcode ${product.barcode} for ${product.name}`;
              updated.logs.push(`Scanning barcode: ${product.name}`);

              // Add item fetch API/Mock
              const qty = 1;
              const cartIndex = updated.cart.findIndex((item) => item.product.id === product.id);

              if (cartIndex > -1) {
                updated.cart[cartIndex].qty += qty;
              } else {
                updated.cart.push({ product, qty });
              }

              // Update local stock in simulator
              setProducts((prevP) => prevP.map((p) => (p.id === product.id ? { ...p, inStock: Math.max(0, p.inStock - 1) } : p)));

              // Log
              setTimeout(() => {
                addLog(`Customer ${updated.name} scanned ${product.name} (₹${product.unitPrice}).`, "info");
                if (apiMode === "LIVE" && updated.sessionId) {
                  fetch(`${apiUrl}/v1/customer/cart/items`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sessionId: updated.sessionId, barcode: product.barcode, quantity: qty })
                  })
                    .then((res) => res.json())
                    .then(() => {
                      addLog(`[API POST] /v1/customer/cart/items -> 200 OK (Cart updated)`, "api");
                    })
                    .catch((err) => addLog(`[API ERROR] Cart add failed: ${err.message}`, "api"));
                } else {
                  addLog(`[MOCK DB] UPDATE customer_sessions SET cart = cart + '${product.name}' WHERE id = '${updated.sessionId}'`, "db");
                }
              }, 1000);

              return updated;
            }

            // AI Stylist Enthusiast (20% chance)
            if (updated.cart.length > 0 && updated.aiChat.length === 0 && rand < 0.25) {
              const mainItem = updated.cart[0].product.name;
              updated.bubbleText = "Let me ask the AI Stylist what coordinates with my cart!";
              updated.aiChat.push({ sender: "user", text: `I scanned the ${mainItem}. What coordinates well with this?` });
              updated.logs.push("Opened AI Fashion Assistant Chat");

              setTimeout(() => {
                let botText = `That ${mainItem} looks amazing! `;
                if (categoryMatch === "Men's Wear") {
                  botText += "I recommend pairing it with our White Leather Sneakers [Product:8901234567892] and the Canvas Tote [Product:8901234567893] for a modern, relaxed aesthetic.";
                } else {
                  botText += "You should style it with the Pink Midi Skirt [Product:8901234567895] and our Beanie [Product:8901234567896] for an elegant yet trendy layered look.";
                }
                setCustomers((cList) =>
                  cList.map((c) => {
                    if (c.id === updated.id) {
                      addLog(`[AI STYLIST] AI Fashion Bot responded to ${c.name}`, "info");
                      return {
                        ...c,
                        bubbleText: "AI Stylist recommended perfect matches!",
                        aiChat: [...c.aiChat, { sender: "bot", text: botText }],
                        logs: [...c.logs, "Received AI styling recommendations"]
                      };
                    }
                    return c;
                  })
                );
              }, 1800);

              return updated;
            }

            // Walk to other sections or proceed to checkout
            if (updated.cart.length > 0 && rand > 0.6) {
              // Time to checkout
              const payMode = Math.random() > 0.5 ? "ONLINE" : "COUNTER";
              const nextZone = payMode === "ONLINE" ? "checkout_kiosks" : "cashier_counter";
              updated.currentZone = nextZone as any;
              updated.x = ZONES[nextZone].x + (Math.random() * 4 - 2);
              updated.y = ZONES[nextZone].y + (Math.random() * 8 - 4);
              updated.status = "checking_out";
              updated.paymentMode = payMode;
              updated.bubbleText = payMode === "ONLINE" ? "Self-checking out via phone..." : "Heading to the cashier to pay!";
              updated.logs.push(`Proceeded to checkout area: ${payMode}`);

              // Trigger checkout call
              setTimeout(async () => {
                const total = updated.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);
                if (apiMode === "LIVE" && updated.sessionId) {
                  try {
                    const res = await fetch(`${apiUrl}/v1/customer/checkout`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        sessionId: updated.sessionId,
                        paymentMode: payMode,
                        receiptEmail: `${updated.name.toLowerCase().replace(" ", "")}@gmail.com`
                      })
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setCustomers((cList) =>
                        cList.map((c) => {
                          if (c.id === updated.id) {
                            addLog(`[API POST] /v1/customer/checkout -> 201 Created (Order ID: ${data.orderId})`, "api");
                            return {
                              ...c,
                              orderId: data.orderId,
                              tokenNumber: data.tokenNumber || null,
                              logs: [...c.logs, `API Checkout success. Order created: ${data.orderId.slice(0, 8)}`]
                            };
                          }
                          return c;
                        })
                      );
                    }
                  } catch (err: any) {
                    addLog(`[API ERROR] Checkout request failed: ${err.message}`, "api");
                  }
                } else {
                  const mockOrderId = `ord_${Math.random().toString(36).substr(2, 9)}`;
                  const mockToken = payMode === "COUNTER" ? Math.floor(1000 + Math.random() * 9000) : null;
                  setCustomers((cList) =>
                    cList.map((c) => {
                      if (c.id === updated.id) {
                        return {
                          ...c,
                          orderId: mockOrderId,
                          tokenNumber: mockToken,
                          logs: [...c.logs, `Mock Order generated: ${mockOrderId.slice(0, 8)}`]
                        };
                      }
                      return c;
                    })
                  );
                  addLog(`[MOCK DB] INSERT INTO orders VALUES ('${mockOrderId}', total=₹${total}, mode=${payMode})`, "db");
                }
              }, 1200);

              return updated;
            } else {
              const options = ["mens_wear", "womens_wear", "footwear", "accessories"].filter((z) => z !== updated.currentZone);
              const nextZone = options[Math.floor(Math.random() * options.length)] as keyof typeof ZONES;
              updated.currentZone = nextZone;
              updated.x = ZONES[nextZone].x + (Math.random() * 6 - 3);
              updated.y = ZONES[nextZone].y + (Math.random() * 8 - 4);
              updated.bubbleText = `Let's look at ${ZONES[nextZone].name}!`;
              updated.logs.push(`Walked to ${ZONES[nextZone].name}`);
              return updated;
            }
          }

          // 3. Scanning -> completes scanning and goes back to browsing
          if (updated.status === "scanning") {
            updated.status = "browsing";
            updated.bubbleText = "Added to cart! What next?";
            return updated;
          }

          // 4. Checking out -> waits for payment or settles
          if (updated.status === "checking_out") {
            if (updated.paymentMode === "ONLINE") {
              // Online payments settle automatically after a delay
              if (rand > 0.4) {
                updated.status = "settled";
                updated.currentZone = "exit_pass";
                updated.x = ZONES.exit_pass.x + (Math.random() * 4 - 2);
                updated.y = ZONES.exit_pass.y + (Math.random() * 6 - 3);
                updated.bubbleText = "Online payment successful! Generating exit QR pass.";
                updated.logs.push("Online payment verified");

                const total = updated.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);
                setTotalRevenue((rev) => rev + total);

                // Live/Mock receipt call
                setTimeout(() => {
                  addLog(`Customer ${updated.name} settled order ${updated.orderId?.slice(0, 8)} online. Total: ₹${total}`, "info");
                  setActiveAuditLogs((logs) => [
                    { time: new Date().toLocaleTimeString(), actor: updated.name, action: "order.settled", detail: `ONLINE ₹${total}` },
                    ...logs
                  ]);

                  if (apiMode === "LIVE" && updated.orderId) {
                    fetch(`${apiUrl}/v1/receipt/${updated.orderId}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ whatsapp: updated.phone })
                    })
                      .then((res) => res.json())
                      .then((data) => {
                        setCustomers((cList) =>
                          cList.map((c) => (c.id === updated.id ? { ...c, exitQr: data.exitQr, logs: [...c.logs, "Exit QR pass retrieved from API"] } : c))
                        );
                        addLog(`[API POST] /v1/receipt -> 200 OK (QR Pass generated)`, "api");
                      })
                      .catch((err) => addLog(`[API ERROR] Receipt generation failed: ${err.message}`, "api"));
                  } else {
                    const mockQrToken = jwtSignMock({ orderId: updated.orderId! });
                    setCustomers((cList) =>
                      cList.map((c) => (c.id === updated.id ? { ...c, exitQr: mockQrToken, logs: [...c.logs, "Mock exit pass signed locally"] } : c))
                    );
                    addLog(`[MOCK DB] INSERT INTO receipts values ('rcpt_${Date.now()}', total=₹${total})`, "db");
                  }
                }, 1000);

                return updated;
              }
            } else {
              // Wait at Cashier counter queue, wait for cashier manual click settle
              updated.bubbleText = updated.tokenNumber
                ? `Waiting in Cashier queue. My token is #${updated.tokenNumber}.`
                : "Awaiting cashier register settlement...";
              return updated;
            }
          }

          // 5. Settled -> walks to Exit Gate and scans pass
          if (updated.status === "settled") {
            if (updated.currentZone !== "exit_pass") {
              updated.currentZone = "exit_pass";
              updated.x = ZONES.exit_pass.x + (Math.random() * 4 - 2);
              updated.y = ZONES.exit_pass.y + (Math.random() * 4 - 2);
              updated.bubbleText = "Scanning exit token at verification gate.";
              updated.logs.push("Scanning exit pass at gate");
              return updated;
            } else {
              // Verify pass at gate
              updated.status = "exiting";
              updated.bubbleText = "Exit authorized! Gate opened.";
              updated.logs.push("Gate unlocked green");

              setTimeout(() => {
                addLog(`Exit Gate verified Customer ${updated.name}'s token successfully. Exit gate opened.`, "info");
                if (apiMode === "LIVE" && updated.exitQr) {
                  // Simulate QR scan REST verification
                  fetch(`${apiUrl}/v1/gate/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: updated.exitQr })
                  })
                    .then((res) => res.json())
                    .then(() => {
                      addLog(`[API POST] /v1/gate/verify -> 200 OK (Pass Valid)`, "api");
                    })
                    .catch((err) => addLog(`[API ERROR] Gate token verify failed: ${err.message}`, "api"));
                } else {
                  addLog(`[MOCK DB] INSERT INTO exit_tokens_used values ('hash_${Date.now()}')`, "db");
                }
              }, 800);

              return updated;
            }
          }

          // 6. Exiting -> exits store completely
          if (updated.status === "exiting") {
            updated.currentZone = "out";
            updated.x = ZONES.out.x;
            updated.y = ZONES.out.y;
            updated.status = "left";
            updated.bubbleText = null;
            updated.logs.push("Left store");
            setCheckedOutCount((c) => c + 1);

            // Remove shopper after a delay
            setTimeout(() => {
              setCustomers((cList) => cList.filter((c) => c.id !== updated.id));
              if (selectedCustomerId === updated.id) {
                setSelectedCustomerId(null);
              }
            }, 3000);

            return updated;
          }

          return updated;
        });
      });
    }, 4500 / speed);

    return () => clearInterval(interval);
  }, [speed, apiMode, apiUrl, products, addLog, selectedCustomerId]);

  // Cashier settle trigger handler
  const settleCounterOrder = async (cust: SimCustomer) => {
    if (!cust.orderId) return;
    const total = cust.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);

    addLog(`Cashier settling counter payment for ${cust.name} (Token #${cust.tokenNumber})`, "info");

    if (apiMode === "LIVE") {
      try {
        const res = await fetch(`${apiUrl}/v1/cashier/orders/${cust.orderId}/settle`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-cashier-key": "dev-cashier-key" }
        });
        const data = await res.json();
        if (res.ok) {
          addLog(`[API POST] /v1/cashier/orders/${cust.orderId}/settle -> 200 OK (Paid)`, "api");
          
          // Retrieve receipt
          const receiptRes = await fetch(`${apiUrl}/v1/receipt/${cust.orderId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ whatsapp: cust.phone })
          });
          const receiptData = await receiptRes.json();

          setCustomers((prev) =>
            prev.map((c) =>
              c.id === cust.id
                ? {
                    ...c,
                    status: "settled",
                    exitQr: receiptData.exitQr,
                    bubbleText: "Payment settled at cashier counter!",
                    logs: [...c.logs, "Settled order at cashier desk", "Exit QR pass generated"]
                  }
                : c
            )
          );
          setTotalRevenue((rev) => rev + total);
          setActiveAuditLogs((logs) => [
            { time: new Date().toLocaleTimeString(), actor: "cashier", action: "order.settled", detail: `COUNTER Token #${cust.tokenNumber} ₹${total}` },
            ...logs
          ]);
        }
      } catch (err: any) {
        addLog(`[API ERROR] Cashier settlement failed: ${err.message}`, "api");
      }
    } else {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === cust.id
            ? {
                ...c,
                status: "settled",
                exitQr: jwtSignMock({ orderId: cust.orderId! }),
                bubbleText: "Payment settled at cashier counter!",
                logs: [...c.logs, "Settled order at cashier desk", "Exit QR pass generated"]
              }
            : c
        )
      );
      setTotalRevenue((rev) => rev + total);
      setActiveAuditLogs((logs) => [
        { time: new Date().toLocaleTimeString(), actor: "cashier", action: "order.settled", detail: `COUNTER Token #${cust.tokenNumber} ₹${total}` },
        ...logs
      ]);
      addLog(`[MOCK DB] UPDATE orders SET paid = true WHERE id = '${cust.orderId}'`, "db");
      addLog(`[MOCK DB] INSERT INTO receipts values ('rcpt_${Date.now()}', total=₹${total})`, "db");
    }
  };

  // Select customer helper
  const getSelectedCustomer = (): SimCustomer | undefined => {
    return customers.find((c) => c.id === selectedCustomerId);
  };

  // Mock JWT sign helper
  const jwtSignMock = (payload: any): string => {
    return `jwt_mock_${btoa(JSON.stringify(payload))}`;
  };

  const selectedCustomer = getSelectedCustomer();

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", color: "#f8fafc", background: "#0a1628", minHeight: "100vh", padding: "16px 24px", display: "flex", flexDirection: "column" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        h1, h2, h3, h4, .brand-font { font-family: 'Lexend', sans-serif; }
        .glow-blue { box-shadow: 0 0 15px rgba(0, 102, 255, 0.35); }
        .glass-panel { background: rgba(19, 34, 56, 0.75); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; }
        .pulse-dot { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.1); } }
        .log-line { font-family: 'Courier New', monospace; font-size: 0.8rem; line-height: 1.4; padding: 4px 8px; border-radius: 4px; margin-bottom: 2px; }
        .log-info { color: #94a3b8; }
        .log-api { color: #38bdf8; background: rgba(56, 189, 248, 0.08); }
        .log-db { color: #34d399; background: rgba(52, 211, 153, 0.08); }
        .customer-avatar { transition: top 1.5s cubic-bezier(0.25, 1, 0.5, 1), left 1.5s cubic-bezier(0.25, 1, 0.5, 1); cursor: pointer; }
        .zone-box { border: 1.5px dashed rgba(255, 255, 255, 0.12); border-radius: 12px; background: rgba(255, 255, 255, 0.02); display: flex; align-items: center; justify-content: center; text-align: center; }
      `}} />

      {/* Top Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <ProFloLogo size={36} showText={true} />
          <div style={{ background: "#0066FF", padding: "4px 10px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Realtime Simulator
          </div>
        </div>

        {/* Global Connection Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", background: "#111827", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "2px" }}>
            <button
              onClick={() => setApiMode("MOCK")}
              style={{ padding: "6px 12px", border: "none", background: apiMode === "MOCK" ? "#0066FF" : "transparent", color: "#ffffff", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}
            >
              Mock DB
            </button>
            <button
              onClick={() => setApiMode("LIVE")}
              style={{ padding: "6px 12px", border: "none", background: apiMode === "LIVE" ? "#0066FF" : "transparent", color: "#ffffff", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}
            >
              Live API Mode
            </button>
          </div>

          {apiMode === "LIVE" && (
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              style={{ background: "#111827", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#f8fafc", padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem", width: "160px" }}
            />
          )}

          <Link href="/" style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", color: "#f8fafc", textDecoration: "none", fontSize: "0.85rem", fontWeight: 500, transition: "background 0.2s" }}>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main style={{ flexGrow: 1, display: "grid", gridTemplateColumns: "1fr 340px 360px", gap: "20px", marginTop: "20px" }}>
        
        {/* Left Side: Store floor plan & log terminal */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* A. 2D Interactive Digital Twin Floor Plan */}
          <div className="glass-panel" style={{ flexGrow: 1, position: "relative", minHeight: "440px", padding: "16px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} className="pulse-dot"></span>
                Interactive Retail Floor Plan (Store BLR001)
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8rem", color: "#94a3b8" }}>
                <span>Active Shoppers: {customers.filter((c) => c.status !== "left").length}</span>
                <span>•</span>
                <span>Revenue Today: ₹{totalRevenue}</span>
              </div>
            </div>

            {/* Visual Store Map */}
            <div style={{ flexGrow: 1, position: "relative", background: "#060913", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
              {/* Zones Overlay */}
              <div className="zone-box" style={{ position: "absolute", left: "2%", top: "35%", width: "12%", height: "30%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>ENTRANCE<br/>🚪</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "20%", top: "10%", width: "18%", height: "35%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>MEN'S WEAR<br/>👔</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "20%", top: "55%", width: "18%", height: "35%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>WOMEN'S WEAR<br/>👗</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "42%", top: "10%", width: "18%", height: "35%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>FOOTWEAR<br/>👟</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "42%", top: "55%", width: "18%", height: "35%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>ACCESSORIES<br/>🎒</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "64%", top: "55%", width: "18%", height: "35%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>SELF-CHECKOUT<br/>📱</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "64%", top: "10%", width: "18%", height: "35%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>CASHIER CODES<br/>💵</div>
              </div>
              <div className="zone-box" style={{ position: "absolute", left: "86%", top: "35%", width: "12%", height: "30%" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748b" }}>EXIT GATE<br/>🚦</div>
              </div>

              {/* Dynamic Shopper Avatars */}
              {customers.map((cust) => {
                if (cust.status === "left") return null;
                const isSelected = cust.id === selectedCustomerId;

                return (
                  <div
                    key={cust.id}
                    className="customer-avatar"
                    onClick={() => setSelectedCustomerId(cust.id)}
                    style={{
                      position: "absolute",
                      left: `${cust.x}%`,
                      top: `${cust.y}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isSelected ? 50 : 20,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center"
                    }}
                  >
                    {/* Visual Shopper Speech Bubble */}
                    {cust.bubbleText && (
                      <div style={{
                        background: "#1e293b",
                        color: "#f1f5f9",
                        fontSize: "0.7rem",
                        padding: "4px 8px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        whiteSpace: "nowrap",
                        marginBottom: "6px",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
                      }}>
                        {cust.bubbleText}
                      </div>
                    )}

                    {/* Customer Icon Dot */}
                    <div style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: cust.avatarColor,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      border: isSelected ? "3px solid #ffffff" : "2px solid #0f172a",
                      boxShadow: isSelected ? "0 0 15px rgba(255,255,255,0.5)" : "0 4px 6px rgba(0,0,0,0.25)"
                    }}>
                      {cust.name.split(" ").map((n) => n[0]).join("")}
                    </div>

                    {/* Shopper mini-caption */}
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: "2px", fontWeight: 500, background: "rgba(0,0,0,0.5)", padding: "1px 4px", borderRadius: "4px" }}>
                      {cust.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Live Dev console / Event Logger */}
          <div className="glass-panel" style={{ height: "180px", padding: "12px", display: "flex", flexDirection: "column" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8", marginTop: 0, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Live SQL Database & Express API Request Console Logs
            </h4>
            <div style={{ flexGrow: 1, overflowY: "auto", background: "#05070c", borderRadius: "8px", padding: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
              {consoleLogs.length === 0 ? (
                <div style={{ color: "#475569", fontFamily: "Courier New", fontSize: "0.8rem", textAlign: "center", marginTop: "30px" }}>
                  Awaiting database transaction records... Spawning customers triggers API requests.
                </div>
              ) : (
                consoleLogs.map((log) => (
                  <div key={log.id} className={`log-line log-${log.type}`}>
                    <span>[{log.time}] </span>
                    <span style={{ fontWeight: 600 }}>[{log.type.toUpperCase()}] </span>
                    <span>{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Middle: Shopper Mobile Screen Mockup */}
        <div className="glass-panel" style={{ padding: "12px", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#94a3b8", marginTop: 0, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
            Shopper Mobile view (Self-Checkout)
          </h3>

          {selectedCustomer ? (
            /* Mobile Device Frame */
            <div style={{ flexGrow: 1, background: "#000000", border: "8px solid #1e293b", borderRadius: "32px", overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
              
              {/* Speaker & camera slot */}
              <div style={{ height: "20px", background: "#1e293b", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: "60px", height: "4px", background: "#0b0f19", borderRadius: "10px" }}></div>
              </div>

              {/* Mobile Screen Header */}
              <div style={{ background: "#111827", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ProFloLogo size={18} showText={false} />
                  <span style={{ fontWeight: 700 }}>ProFlo Self-Checkout</span>
                </div>
                <div style={{ background: selectedCustomer.avatarColor, width: "8px", height: "8px", borderRadius: "50%" }}></div>
              </div>

              {/* Mobile Screen Body Content */}
              <div style={{ flexGrow: 1, padding: "12px", overflowY: "auto", display: "flex", flexDirection: "column", background: "#0b0f19", fontSize: "0.85rem" }}>
                
                {/* 1. Visit Login state */}
                {selectedCustomer.status === "entering" && (
                  <div style={{ textAlign: "center", marginTop: "30px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem" }}>Welcome shopper</h4>
                      <p style={{ color: "#94a3b8", fontSize: "0.75rem", margin: 0 }}>Registering visitor visit to retrieve cart history...</p>
                    </div>
                    <div style={{ background: "#111827", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.8rem", textAlign: "left" }}>
                      <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Phone Number</div>
                      <div style={{ fontWeight: 600 }}>+91 {selectedCustomer.phone}</div>
                    </div>
                  </div>
                )}

                {/* 2. Cart & Scanning State */}
                {(selectedCustomer.status === "browsing" || selectedCustomer.status === "scanning" || selectedCustomer.status === "checking_out") && (
                  <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, gap: "12px" }}>
                    
                    {/* Active visits details */}
                    <div style={{ background: "#111827", padding: "8px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div>
                        <div style={{ color: "#94a3b8", fontSize: "0.65rem" }}>Shopper Profile</div>
                        <div style={{ fontWeight: 600 }}>{selectedCustomer.name}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "#94a3b8", fontSize: "0.65rem" }}>Visit Code</div>
                        <div style={{ fontFamily: "monospace", fontSize: "0.7rem" }}>{selectedCustomer.sessionId?.slice(0, 8)}</div>
                      </div>
                    </div>

                    {/* Barcode scanner mockup animation when scanning */}
                    {selectedCustomer.status === "scanning" && (
                      <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1.5px dashed #3b82f6", borderRadius: "8px", padding: "12px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: "2px", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }}></div>
                        <div style={{ fontSize: "0.7rem", color: "#38bdf8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Reading Barcode Matrix</div>
                        <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Self-scanning in checkout aisle...</div>
                      </div>
                    )}

                    {/* Cart Lines list */}
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#94a3b8", marginBottom: "6px" }}>Scanned Cart Items ({selectedCustomer.cart.reduce((s, i) => s + i.qty, 0)})</div>
                      {selectedCustomer.cart.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#475569", padding: "30px 10px", fontSize: "0.75rem", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "8px" }}>
                          No products scanned yet. The customer is currently walking the store aisles browsing apparel.
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {selectedCustomer.cart.map((item) => (
                            <div key={item.product.id} style={{ display: "flex", justifyContent: "space-between", background: "#111827", padding: "6px 8px", borderRadius: "6px", fontSize: "0.75rem" }}>
                              <div>
                                <div style={{ fontWeight: 600 }}>{item.product.name}</div>
                                <div style={{ color: "#94a3b8", fontSize: "0.65rem" }}>₹{item.product.unitPrice} × {item.qty}</div>
                              </div>
                              <div style={{ fontWeight: 600, alignSelf: "center" }}>
                                ₹{item.product.unitPrice * item.qty}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* AI Styling Chat bubble inside Mobile view */}
                    {selectedCustomer.aiChat.length > 0 && (
                      <div style={{ background: "#1e293b", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#8b5cf6", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>🤖 ProFlo AI Stylist Bot</span>
                        </div>
                        <div style={{ maxHeight: "80px", overflowY: "auto", fontSize: "0.7rem", color: "#cbd5e1" }}>
                          {selectedCustomer.aiChat.map((msg, i) => (
                            <div key={i} style={{ marginBottom: "4px", textAlign: msg.sender === "user" ? "right" : "left" }}>
                              <span style={{ display: "inline-block", background: msg.sender === "user" ? "#3b82f6" : "#0f172a", padding: "4px 6px", borderRadius: "6px", maxWidth: "90%" }}>
                                {msg.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Checkout totals Summary */}
                    {selectedCustomer.cart.length > 0 && (
                      <div style={{ background: "#111827", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#94a3b8" }}>Cart Subtotal:</span>
                          <span>₹{selectedCustomer.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#94a3b8" }}>GST (5% Included):</span>
                          <span>₹{Math.round(selectedCustomer.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0) * 0.05)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "4px", marginTop: "2px", color: "#38bdf8" }}>
                          <span>Grand Total:</span>
                          <span>₹{selectedCustomer.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0)}</span>
                        </div>
                      </div>
                    )}

                    {/* Checkout steps status */}
                    {selectedCustomer.status === "checking_out" && (
                      <div style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "8px", padding: "10px", textAlign: "center", fontSize: "0.75rem" }}>
                        {selectedCustomer.paymentMode === "ONLINE" ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <div style={{ color: "#f59e0b", fontWeight: 600 }}>Simulating Razorpay Transaction</div>
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Verifying card auth with payment gateway...</div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ color: "#f59e0b", fontWeight: 600 }}>Awaiting Cashier Settlement</div>
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Present checkout code at store register desk.</div>
                            {selectedCustomer.tokenNumber && (
                              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#f8fafc", margin: "6px 0" }}>Token #{selectedCustomer.tokenNumber}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Settled Exit QR code pass */}
                {(selectedCustomer.status === "settled" || selectedCustomer.status === "exiting" || selectedCustomer.status === "left") && (
                  <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "12px", marginTop: "15px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <div>
                      <h4 style={{ margin: "0 0 2px 0", color: "#10b981", fontSize: "0.9rem" }}>Payment Confirmed!</h4>
                      <p style={{ color: "#94a3b8", fontSize: "0.7rem", margin: 0 }}>Receipt generated successfully</p>
                    </div>

                    {/* Exit pass QR Code visual */}
                    <div style={{ background: "#ffffff", padding: "12px", borderRadius: "12px", width: "120px", height: "120px", margin: "10px auto", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>
                      {selectedCustomer.exitQr ? (
                        /* Simple schematic QR placeholder */
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2px", width: "100%", height: "100%" }}>
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div key={i} style={{ background: (i + selectedCustomer.name.length) % 3 === 0 || i === 0 || i === 3 || i === 12 || i === 15 ? "#000000" : "#ffffff" }}></div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: "#000", fontSize: "0.6rem" }}>Signing...</div>
                      )}
                    </div>

                    <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      Scan QR at the checkout exit gate to unlock verification lock sensors automatically.
                    </div>

                    <div style={{ background: "#111827", padding: "6px", borderRadius: "6px", fontSize: "0.7rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "#94a3b8" }}>Payment Mode: </span>
                      <span style={{ fontWeight: 600, color: "#34d399" }}>{selectedCustomer.paymentMode}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Screen Home button */}
              <div style={{ height: "30px", background: "#111827", display: "flex", justifyContent: "center", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", border: "2px solid #4b5563" }}></div>
              </div>
            </div>
          ) : (
            <div style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#05070c", border: "2px dashed rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
              <div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" style={{ margin: "0 auto 12px" }}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 600 }}>No shopper selected</div>
                <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "4px", maxWidth: "220px" }}>
                  Click on any customer node on the store layout to track their mobile self-checkout flow.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Store Management toggles (Cashier / Admin Dashboard) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* Controls toggle buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "#111827", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "2px" }}>
            <button
              onClick={() => setActiveTab("ADMIN")}
              style={{ padding: "8px", border: "none", background: activeTab === "ADMIN" ? "#3b82f6" : "transparent", color: "#ffffff", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}
            >
              📊 Manager Dashboard
            </button>
            <button
              onClick={() => setActiveTab("CASHIER")}
              style={{ padding: "8px", border: "none", background: activeTab === "CASHIER" ? "#3b82f6" : "transparent", color: "#ffffff", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", transition: "all 0.2s" }}
            >
              💵 Cashier Desk ({customers.filter((c) => c.status === "checking_out" && c.paymentMode === "COUNTER").length})
            </button>
          </div>

          {/* C. Toggle Panels */}
          {activeTab === "ADMIN" ? (
            /* Manager panel view */
            <div className="glass-panel" style={{ flexGrow: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "640px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", color: "#38bdf8" }}>
                ProFlo Enterprise Admin Console
              </h3>

              {/* Stats Grid Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#05070c", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Total Store Sales</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#10b981", marginTop: "2px" }}>₹{totalRevenue}</div>
                </div>
                <div style={{ background: "#05070c", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: "0.65rem", color: "#94a3b8" }}>Completed Orders</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#38bdf8", marginTop: "2px" }}>{checkedOutCount}</div>
                </div>
              </div>

              {/* Stock inventory monitor with Alerts */}
              <div>
                <h4 style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Stock Catalog Inventory levels</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#05070c", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", maxHeight: "150px", overflowY: "auto" }}>
                  {products.map((p) => {
                    const low = p.inStock <= 3;
                    return (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", padding: "2px 0", borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                        <span style={{ color: low ? "#f87171" : "#f1f5f9", fontWeight: low ? 600 : 400 }}>{p.name} {low && "(LOW)"}</span>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "#94a3b8" }}>₹{p.unitPrice}</span>
                          <span style={{ fontWeight: 600, color: p.inStock === 0 ? "#ef4444" : low ? "#f59e0b" : "#34d399" }}>
                            {p.inStock} left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit Trail Logs */}
              <div>
                <h4 style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, margin: "0 0 6px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>SQL ledger audit trails</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#05070c", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", maxHeight: "110px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.65rem" }}>
                  {activeAuditLogs.length === 0 ? (
                    <div style={{ color: "#475569", padding: "15px 0", textAlign: "center" }}>No catalog edits or transaction commits logged.</div>
                  ) : (
                    activeAuditLogs.map((log, i) => (
                      <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: "2px" }}>
                        <span style={{ color: "#94a3b8" }}>[{log.time}]</span>{" "}
                        <span style={{ color: "#38bdf8", fontWeight: 600 }}>{log.actor}</span>:{" "}
                        <span style={{ color: "#f1f5f9" }}>{log.action}</span>{" "}
                        <span style={{ color: "#cbd5e1" }}>({log.detail})</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Promo Discount events scheduler */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                <h4 style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Campaign Manager: Apply Discount</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <select
                    id="discount-product-select"
                    style={{ background: "#111827", color: "#f8fafc", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.8rem" }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.unitPrice})</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        const el = document.getElementById("discount-product-select") as HTMLSelectElement;
                        if (el) triggerDiscount(el.value, 15);
                      }}
                      style={{ flexGrow: 1, padding: "8px", background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#38bdf8", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem", transition: "background 0.2s" }}
                    >
                      Apply 15% Discount
                    </button>
                    <button
                      onClick={() => {
                        const el = document.getElementById("discount-product-select") as HTMLSelectElement;
                        if (el) triggerDiscount(el.value, 30);
                      }}
                      style={{ flexGrow: 1, padding: "8px", background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem", transition: "background 0.2s" }}
                    >
                      Apply 30% Flash
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Cashier register screen */
            <div className="glass-panel" style={{ flexGrow: 1, padding: "16px", display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", maxHeight: "640px" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", color: "#10b981" }}>
                Cashier register Desk
              </h3>
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                Customers checkout with COUNTER payment mode and stand in the register queue. Scan or settle their tokens to approve exit gate passes.
              </p>

              {/* Waiting customer queue */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px", flexGrow: 1 }}>
                {customers.filter((c) => c.status === "checking_out" && c.paymentMode === "COUNTER").length === 0 ? (
                  <div style={{ color: "#475569", padding: "40px 10px", fontSize: "0.8rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "8px" }}>
                    Cashier register is empty. Spawning customers will checkout soon.
                  </div>
                ) : (
                  customers
                    .filter((c) => c.status === "checking_out" && c.paymentMode === "COUNTER")
                    .map((cust) => {
                      const total = cust.cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);
                      return (
                        <div key={cust.id} style={{ background: "#05070c", padding: "10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ background: "#10b981", color: "#000", fontWeight: 700, fontSize: "0.65rem", padding: "2px 6px", borderRadius: "4px" }}>
                                TOKEN #{cust.tokenNumber}
                              </span>
                              <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>{cust.name}</span>
                            </div>
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "4px" }}>
                              {cust.cart.length} unique items • total: ₹{total}
                            </div>
                          </div>
                          <button
                            onClick={() => settleCounterOrder(cust)}
                            style={{ padding: "6px 12px", background: "#10b981", color: "#000000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem", transition: "background 0.2s" }}
                          >
                            Settle Pay
                          </button>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* D. Simulator system controls panel */}
          <div className="glass-panel" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h4 style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: 600, margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Simulation Engine Controls
            </h4>
            
            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <button
                onClick={spawnCustomer}
                style={{ padding: "8px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                ➕ Spawn Shopper
              </button>
              <button
                onClick={triggerRestock}
                style={{ padding: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem" }}
              >
                🔄 Restock All
              </button>
            </div>

            {/* Config lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8" }}>Auto Shopper Spawn:</span>
                <input
                  type="checkbox"
                  checked={autoSpawn}
                  onChange={(e) => setAutoSpawn(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#94a3b8" }}>Simulation Speed ({speed}x):</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  style={{ background: "#111827", color: "#f8fafc", border: "1px solid rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem" }}
                >
                  <option value={1}>1x (Normal)</option>
                  <option value={2}>2x (Fast)</option>
                  <option value={5}>5x (Turbo)</option>
                  <option value={10}>10x (Hyperspeed)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "12px", fontSize: "0.75rem", color: "#475569" }}>
        <span>© {new Date().getFullYear()} ProFlo Interactive Digital Twin Platform.</span>
        <span>Connected to database: BLR001 Register A</span>
      </footer>
    </div>
  );
}
