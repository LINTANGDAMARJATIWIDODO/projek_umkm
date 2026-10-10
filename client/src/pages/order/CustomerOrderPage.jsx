import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Coffee, Search, ShoppingBag, QrCode, CheckCircle2, AlertCircle, Plus, Minus, ArrowRight } from "lucide-react";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useCafe } from "../../context/CafeContext";
import CartDrawer from "../../components/CartDrawer";
import QrisModal from "../../components/QrisModal";
import ReceiptModal from "../../components/ReceiptModal";

export default function CustomerOrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Table Validation State
  const [tableStatus, setTableStatus] = useState({
    isValid: false,
    verifiedViaQr: false,
    tableNumber: "",
    allowChange: true,
    message: ""
  });

  // Modal States
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [qrisModalOpen, setQrisModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState(null);
  const [currentOrderData, setCurrentOrderData] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const {
    items,
    tableInfo,
    setTableInfo,
    customerName,
    setCustomerName,
    addItem,
    clearCart,
    cartSubtotal,
    cartCount
  } = useCart();

  const { taxAndFees } = useCafe();

  // 1. Detect & Validate Table from URL
  useEffect(() => {
    const tableParam = searchParams.get("table") || tableInfo.tableNumber;
    const tokenParam = searchParams.get("token") || tableInfo.token;

    if (tableParam) {
      api.validateTable(tableParam, tokenParam)
        .then((res) => {
          if (res.isValid) {
            setTableStatus({
              isValid: true,
              verifiedViaQr: res.tokenValid,
              tableNumber: res.table.table_number,
              allowChange: res.allowChange,
              message: res.tokenValid ? "Meja Terverifikasi via Scan QR" : "Meja Valid"
            });
            setTableInfo({
              tableNumber: res.table.table_number,
              token: tokenParam || ""
            });
          }
        })
        .catch((err) => {
          setTableStatus({
            isValid: false,
            verifiedViaQr: false,
            tableNumber: tableParam,
            allowChange: true,
            message: err.message
          });
        });
    }
  }, [searchParams]);

  // 2. Load Products & Categories
  useEffect(() => {
    async function loadCatalog() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts(),
          api.getCategories()
        ]);
        if (prodRes.success) setProducts(prodRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error("Failed to load catalog:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === "all" || p.category_slug === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  // 3. Handle Checkout & QRIS Generation
  const handleCheckout = async ({ customerName, tableNumber, items }) => {
    if (items.length === 0) return;
    setLoadingCheckout(true);

    try {
      // 1. Create order on backend (recalculates prices & checks stock atomically)
      const orderPayload = {
        customer_name: customerName,
        table_id: tableNumber,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          notes: i.notes || ""
        })),
        payment_method: "QRIS"
      };

      const orderRes = await api.createOrder(orderPayload);
      if (!orderRes.success) {
        throw new Error(orderRes.message || "Gagal membuat pesanan.");
      }

      const order = orderRes.data;
      setCurrentOrderData(order);

      // 2. Create Dynamic QRIS payment
      const paymentRes = await api.createPayment({
        order_id: order.id
      });

      if (!paymentRes.success) {
        throw new Error(paymentRes.message || "Gagal membuat transaksi QRIS.");
      }

      setActivePaymentData(paymentRes.data);
      setCartDrawerOpen(false);
      setQrisModalOpen(true);
    } catch (err) {
      alert("Checkout Gagal: " + err.message);
    } finally {
      setLoadingCheckout(false);
    }
  };

  // 4. Handle Payment Success
  const handlePaymentSuccess = () => {
    setQrisModalOpen(false);
    clearCart();

    // Fetch updated complete order
    if (currentOrderData) {
      api.getOrder(currentOrderData.id, currentOrderData.customerToken)
        .then((res) => {
          if (res.success) {
            setCurrentOrderData(res.data);
            setReceiptModalOpen(true);
          }
        });
    }
  };

  return (
    <div style={{ padding: "1.5rem 0 5rem 0", minHeight: "85vh" }}>
      <div className="container" style={{ maxWidth: "900px" }}>
        {/* Table & Customer Identification Bar */}
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)" }}>
                {tableInfo.tableNumber ? `📍 ${tableInfo.tableNumber}` : "📍 Belum Memilih Meja"}
              </span>
              {tableStatus.verifiedViaQr && (
                <span className="badge badge-success" style={{ fontSize: "0.72rem" }}>
                  <CheckCircle2 size={12} /> Scan QR Resmi
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Pelanggan: <strong>{customerName || "(Belum diisi)"}</strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: "0.82rem" }}
            >
              Ubah Data Meja / Nama
            </button>
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <ShoppingBag size={15} /> Keranjang ({cartCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px", borderRadius: "var(--radius-full)", backgroundColor: "#FFFFFF" }}
            placeholder="Cari kopi, hidangan utama, atau camilan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Horizontal Filter */}
        <div style={{
          display: "flex",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
          marginBottom: "1.5rem",
          scrollbarWidth: "none"
        }}>
          <button
            onClick={() => setActiveCategory("all")}
            className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-outline"}`}
            style={{ borderRadius: "var(--radius-full)" }}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug)}
              className={`btn btn-sm ${activeCategory === c.slug ? "btn-primary" : "btn-outline"}`}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <Coffee size={36} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
            <p>Memuat menu...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-muted)" }}>
            <p>Menu tidak ditemukan.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filteredProducts.map((product) => {
              const inCart = items.find((i) => i.productId === product.id);
              return (
                <div key={product.id} className="card" style={{ padding: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80"}
                    alt={product.name}
                    style={{ width: "85px", height: "85px", borderRadius: "var(--radius-sm)", objectFit: "cover", flexShrink: 0 }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                        {product.name}
                      </h4>
                      {product.is_popular ? (
                        <span className="badge badge-warning" style={{ fontSize: "0.68rem" }}>⭐ Favorit</span>
                      ) : null}
                    </div>

                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.25rem 0 0.5rem 0", lineHeight: 1.4 }}>
                      {product.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <strong style={{ fontSize: "1.05rem", color: "var(--accent)" }}>
                        Rp {product.price.toLocaleString("id-ID")}
                      </strong>
                      <span style={{ fontSize: "0.72rem", color: product.stock > 0 ? "var(--text-light)" : "var(--danger)" }}>
                        {product.stock > 0 ? `Sisa: ${product.stock}` : "Stok Habis"}
                      </span>
                    </div>
                  </div>

                  {/* Add / Quantity Button */}
                  <div>
                    {product.stock <= 0 ? (
                      <span className="badge badge-danger">Habis</span>
                    ) : inCart ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <button
                          onClick={() => addItem(product, -1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "4px",
                            backgroundColor: "var(--bg-sand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", minWidth: "18px", textAlign: "center" }}>
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => addItem(product, 1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "4px",
                            backgroundColor: "var(--primary)",
                            color: "#FFFFFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(product, 1)}
                        className="btn btn-primary btn-sm"
                      >
                        + Pesan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar for Mobile */}
      {cartCount > 0 && (
        <div style={{
          position: "fixed",
          bottom: "16px",
          left: "16px",
          right: "16px",
          maxWidth: "860px",
          margin: "0 auto",
          backgroundColor: "var(--bg-coffee)",
          color: "#FFFFFF",
          borderRadius: "var(--radius-md)",
          padding: "0.85rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "var(--shadow-lg)",
          zIndex: 90
        }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "#D1C7BD" }}>
              {cartCount} Menu • {tableInfo.tableNumber || "Meja Belum Dipilih"}
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--accent)" }}>
              Rp {cartSubtotal.toLocaleString("id-ID")}
            </div>
          </div>

          <button
            onClick={() => setCartDrawerOpen(true)}
            className="btn btn-accent"
            style={{ padding: "0.6rem 1.25rem" }}
          >
            Lihat Keranjang & Bayar <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        onCheckout={handleCheckout}
        loadingCheckout={loadingCheckout}
      />

      {/* QRIS Dynamic Payment Modal */}
      {qrisModalOpen && activePaymentData && currentOrderData && (
        <QrisModal
          paymentData={activePaymentData}
          orderData={currentOrderData}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setQrisModalOpen(false)}
        />
      )}

      {/* Digital Receipt Modal */}
      {receiptModalOpen && currentOrderData && (
        <ReceiptModal
          order={currentOrderData}
          onClose={() => {
            setReceiptModalOpen(false);
            navigate(`/order/status/${currentOrderData.id}?token=${currentOrderData.customerToken || currentOrderData.customer_token}`);
          }}
        />
      )}
    </div>
  );
}
