import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Phone, Instagram, Music, Settings } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { SITE } from "@/config/site";
import { productService, type Product } from "@/lib/productService";
import { fetchRemoteProducts } from "@/lib/supabaseProductService";

const LOGO_URL = "/pic/logo.png";

// Suppression du type Product et de PRODUCTS car ils sont maintenant importés du service

type CartItem = { id: string; qty: number };

const currency = (v: number) =>
  new Intl.NumberFormat(undefined, { 
    style: "currency", 
    currency: "MAD" 
  }).format(v);

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Charger les produits : tenter Supabase si configuré, sinon fallback local
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const remote = await fetchRemoteProducts();
        if (!cancelled && remote && remote.length) {
          setProducts(remote);
          return;
        }
      } catch (e) {
        // Ignorer et retomber sur le local
        console.warn("Échec du chargement depuis Supabase, fallback local", e);
      }
      if (!cancelled) {
        // Corriger automatiquement les images cassées depuis le local
        const fixedProducts = productService.fixBrokenImages();
        setProducts(fixedProducts);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const total = useMemo(() => cart.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price || 0) * item.qty, 0), [cart, products]);
  const itemsDetailed = useMemo(() => cart.map(ci => ({ ...ci, product: products.find(p => p.id === ci.id)! })), [cart, products]);

  const addToCart = (id: string) => setCart(prev => {
    const found = prev.find(i => i.id === id);
    if (found) return prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
    return [...prev, { id, qty: 1 }];
  });
  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const setQty = (id: string, qty: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));

  const checkoutWhatsApp = () => {
    if (!cart.length) return;
    const lines = [
      SITE.whatsappMessagePrefix,
      "",
      ...itemsDetailed.map(i => `• ${i.product.name} x${i.qty} — ${currency(i.product.price * i.qty)}`),
      "",
      `Total: ${currency(total)}`,
      "",
      `Nom: ${fullname}`,
      `Téléphone: ${phone}`,
      `Adresse: ${address || `${SITE.address.line1}, ${SITE.address.city}, ${SITE.address.country}`}`,
      "Mode de paiement: Paiement à la livraison",
    ];
    const url = `https://wa.me/${SITE.phoneE164.replace(/[^\d]/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  };

  const productsLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, idx) => ({
      "@type": "Product",
      position: idx + 1,
      name: p.name,
      image: window.location.origin + p.image,
      offers: { "@type": "Offer", priceCurrency: SITE.currency, price: p.price }
    }))
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Oumy's Beauty — Boutique de beauté | Paiement à la livraison</title>
        <meta name="description" content="Commandez des cosmétiques élégants — paiement à la livraison." />
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : '/'} />
        <script type="application/ld+json">{JSON.stringify(productsLd)}</script>
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b">
        <div className="container flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <img src={LOGO_URL} alt="Logo Oumy's Beauty – silhouette rose gold" className="h-9 w-auto" loading="eager" />
            <span className="font-display text-lg">Oumy's Beauty</span>
          </a>
          <nav className="flex items-center gap-6 text-sm">
            <div className="hidden md:flex items-center gap-6">
              <a href="#produits" className="story-link">Produits</a>
              <a href="#localisation" className="story-link">Localisation</a>
              <a href="/admin/login" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="h-4 w-4" />
                Admin
              </a>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="soft">Panier ({cart.reduce((n, i) => n + i.qty, 0)})</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Votre panier</DialogTitle>
                </DialogHeader>
                {itemsDetailed.length === 0 ? (
                  <p className="text-muted-foreground">Votre panier est vide.</p>
                ) : (
                  <div className="space-y-4">
                    {itemsDetailed.map(({ id, qty, product }) => (
                      <div key={id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="h-12 w-12 rounded-md object-cover" loading="lazy" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{currency(product.price)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input type="number" min={1} value={qty} onChange={(e) => setQty(id, Math.max(1, Number(e.target.value)))} className="w-20" />
                          <Button variant="ghost" onClick={() => removeFromCart(id)}>Retirer</Button>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span className="font-semibold">{currency(total)}</span>
                    </div>
                    <div className="grid gap-2">
                      <Label>Informations de livraison</Label>
                      <Input placeholder="Nom complet" value={fullname} onChange={(e) => setFullname(e.target.value)} />
                      <Input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <Input placeholder="Adresse complète" value={address} onChange={(e) => setAddress(e.target.value)} />
                      <Button variant="hero" size="xl" onClick={checkoutWhatsApp}>Commander (Paiement à la livraison)</Button>
                      <p className="text-xs text-muted-foreground">Vous payez uniquement lors de la livraison.</p>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60" style={{ background: "var(--gradient-primary)" }} />
        <div className="container grid md:grid-cols-2 gap-10 py-16 md:py-24 items-center">
          <div className="animate-enter">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-tight">
              Oumy's Beauty – élégance et douceur
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-prose">
              Oumy’S beauty Produits de beauté & soins pour sublimer votre peau vous trouverez tout type de maquillage Naturel, tendance & testé avec amour
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#produits"><Button variant="hero" size="xl">Voir les produits</Button></a>
              <a href="#localisation"><Button variant="outline" size="lg">Nous trouver</Button></a>
            </div>
          </div>
          <div className="flex justify-center animate-scale-in">
            <img src={LOGO_URL} alt="Logo Oumy's Beauty – silhouette féminine" className="w-64 md:w-80 lg:w-96 drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* Produits */}
      <main id="produits" className="container py-16 md:py-20">
        <h2 className="font-display text-3xl md:text-4xl mb-8">Nos produits</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="group overflow-hidden">
              <CardHeader className="p-0">
                <img src={p.image} alt={`${p.name} – Oumy's Beauty`} className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                  </div>
                  <span className="font-semibold whitespace-nowrap">{currency(p.price)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => addToCart(p.id)} className="w-full">Ajouter au panier</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      {/* Réseaux sociaux */}
     <section className="border-t">
        <div className="container py-16 md:py-20 text-center">
          <h2 className="font-display text-3xl md:text-4xl mb-8">Suivez-nous</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href={`tel:${SITE?.phoneE164 || ''}`}
              className="flex items-center gap-3 p-4 rounded-lg bg-card border hover:bg-accent hover-scale transition-colors"
            >
              <Phone className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-medium">Appelez-nous</p>
                <p className="text-sm text-muted-foreground">{SITE?.phoneE164 || 'Non disponible'}</p>
              </div>
            </a>
            
            <a
              href={`https://instagram.com/${SITE?.social?.instagram?.replace('@', '') || ''}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-card border hover:bg-accent hover-scale transition-colors"
            >
              <Instagram className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-muted-foreground">{SITE?.social?.instagram || 'Non disponible'}</p>
              </div>
            </a>
            
            <a
              href={`https://tiktok.com/${SITE?.social?.tiktok?.replace('@', '') || ''}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg bg-card border hover:bg-accent hover-scale transition-colors"
            >
              <Music className="h-6 w-6 text-primary" />
              <div className="text-left">
                <p className="font-medium">TikTok</p>
                <p className="text-sm text-muted-foreground">
                  {SITE?.social?.tiktok ? (SITE?.social?.tiktok!.startsWith('@') ? SITE.social.tiktok : `@${SITE.social.tiktok}`) : 'Non disponible'}
                </p>
              </div>
            </a>
          </div>
        </div>
      </section>
      {/* Localisation */}
      <section id="localisation" className="border-t bg-secondary/40">
        <div className="container py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl">Nous trouver</h2>
            <p className="mt-4 text-muted-foreground">
              {SITE.address.line1}, {SITE.address.city}, {SITE.address.country}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Appelez/WhatsApp: {SITE.phoneE164}</p>
            <div className="mt-6">
              <a href={`https://wa.me/${SITE.phoneE164.replace(/[^\\d]/g, "")}`} target="_blank" rel="noreferrer">
                <Button variant="soft">Nous contacter sur WhatsApp</Button>
              </a>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border">
            <iframe
              title="Carte – Oumy's Beauty"
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.4616356405168!2d-5.0264120241768575!3d34.05767857315498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd9ff55f95a83c71%3A0x8e31a6241c52f631!2sOumys%20beauty!5e0!3m2!1sfr!2sma!4v1755091180330!5m2!1sfr!2sma`}
              className="w-full h-[320px] md:h-[380px]"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Oumy's Beauty. Tous droits réservés - By <a href="https://www.instagram.com/abdelkrimgarwaoui_off/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AbdelG</a>.</p>
          <a href="#" className="story-link">Page d'acceuil</a>
        </div>
      </footer>
    </div>
  );
};

export default Index;