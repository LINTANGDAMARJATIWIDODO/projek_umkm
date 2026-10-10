import React, { useState, useEffect } from "react";
import { Search, Coffee, ShoppingBag, Plus, Sparkles, Filter } from "lucide-react";
import { api } from "../../services/api";
import { useCart } from "../../context/CartContext";
import TiltCard from "../../components/TiltCard";

export default function MenuCatalogPage({ onOpenCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadData() {
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
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === "all" || p.category_slug === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div style={{ padding: "3rem 0 5rem 0" }}>
      <div className="container">
        {/* Header Title */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 2.5rem auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.08em" }}>
            KATALOG RESMI
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.6rem", color: "var(--primary)", marginTop: "0.35rem" }}>
            Daftar Menu Ruang Namu
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            Arahkan kursor pada kartu untuk efek visual 3D interaktif. Pilih dan nikmati seduhan kopi spesialti nusantara.
          </p>
        </div>

        {/* Search Bar & Categories Tabs */}
        <div style={{ marginBottom: "2.5rem" }}>
          {/* Search Input */}
          <div style={{ maxWidth: "480px", margin: "0 auto 1.5rem auto", position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)" }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: "42px", borderRadius: "var(--radius-full)" }}
              placeholder="Cari kopi, mocktail, atau hidangan favorit..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter Pills */}
          <div style={{
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            paddingBottom: "0.5rem",
            justifyContent: "flex-start",
            scrollbarWidth: "none"
          }}>
            <button
              onClick={() => setActiveCategory("all")}
              className={`btn btn-sm ${activeCategory === "all" ? "btn-primary" : "btn-outline"}`}
              style={{ borderRadius: "var(--radius-full)" }}
            >
              Semua Menu
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
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <Coffee size={40} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
            <p>Memuat daftar menu...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>Tidak ada menu yang cocok</p>
            <p style={{ fontSize: "0.85rem" }}>Coba ubah kata kunci pencarian atau kategori filter.</p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.75rem"
          }}>
            {filteredProducts.map((product) => (
              <TiltCard key={product.id} maxTilt={12} glare={true} style={{ height: "100%" }}>
                <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
                  <div style={{ position: "relative", height: "190px" }}>
                    <img
                      src={product.image_url || "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80"}
                      alt={product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {product.is_popular ? (
                      <span className="badge badge-warning" style={{ position: "absolute", top: "10px", right: "10px", transform: "translateZ(30px)" }}>
                        ⭐ Favorit
                      </span>
                    ) : null}
                    {product.is_promo ? (
                      <span className="badge badge-danger" style={{ position: "absolute", top: "10px", left: "10px", transform: "translateZ(30px)" }}>
                        Promo
                      </span>
                    ) : null}
                    <span style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      backgroundColor: "rgba(0,0,0,0.65)",
                      backdropFilter: "blur(4px)",
                      color: "#FFFFFF",
                      fontSize: "0.72rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      transform: "translateZ(25px)"
                    }}>
                      {product.category_name}
                    </span>
                  </div>

                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.35rem", transform: "translateZ(20px)" }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", flex: 1, marginBottom: "1rem", lineHeight: 1.5 }}>
                      {product.description}
                    </p>

                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid var(--border-light)",
                      paddingTop: "0.75rem"
                    }}>
                      <div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-light)", display: "block" }}>
                          Stok: {product.stock > 0 ? `${product.stock} porsi` : "Habis"}
                        </span>
                        <strong style={{ fontSize: "1.15rem", color: "var(--accent)" }}>
                          Rp {product.price.toLocaleString("id-ID")}
                        </strong>
                      </div>

                      <button
                        disabled={product.stock <= 0}
                        onClick={() => {
                          addItem(product);
                          if (onOpenCart) onOpenCart();
                        }}
                        className={`btn btn-sm ${product.stock > 0 ? "btn-primary" : "btn-outline"}`}
                        style={{ opacity: product.stock <= 0 ? 0.5 : 1, transform: "translateZ(25px)" }}
                      >
                        {product.stock > 0 ? <><Plus size={14} /> Pesan</> : "Habis"}
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
