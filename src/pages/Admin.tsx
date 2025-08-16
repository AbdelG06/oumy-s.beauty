import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Edit, Trash2, Package, LogOut, Settings, Cloud, DownloadCloud } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { productService, type Product } from "@/lib/productService";
import { pushLocalToRemote, fetchRemoteProducts } from "@/lib/supabaseProductService";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

const Admin = () => {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    stock: "",
    image: ""
  });
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadProducts();
    }
  }, [isAuthenticated]);

  const loadProducts = () => {
    const allProducts = productService.getAllProducts();
    setProducts(allProducts);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      stock: "",
      image: ""
    });
    setSelectedImageFile(null);
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.description) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const newProduct = await productService.addProduct({
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category || undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        image: formData.image,
        imageFile: selectedImageFile
      });

      setProducts(prev => [...prev, newProduct as Product]);
      // Sauvegarder automatiquement les photos
      productService.savePhotos();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Produit ajouté avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout du produit");
      console.error(error);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.description) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const updatedProduct = await productService.updateProduct(editingProduct.id, {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category || undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        image: formData.image,
        imageFile: selectedImageFile
      });

      if (updatedProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
        // Sauvegarder automatiquement les photos
        productService.savePhotos();
        setIsEditDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        toast.success("Produit modifié avec succès !");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification du produit");
      console.error(error);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const success = productService.deleteProduct(productId);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Produit supprimé avec succès !");
    } else {
      toast.error("Erreur lors de la suppression du produit");
    }
  };

  const handleResetToDefault = () => {
    const defaultProducts = productService.resetToDefault();
    setProducts(defaultProducts);
    toast.success("Produits réinitialisés aux valeurs par défaut !");
  };

  const handleFixBrokenImages = () => {
    const fixedProducts = productService.fixBrokenImages();
    setProducts(fixedProducts);
    toast.success("Images cassées corrigées !");
  };

  const handleSavePhotos = () => {
    const savedProducts = productService.savePhotos();
    setProducts(savedProducts);
    toast.success("Photos sauvegardées avec succès !");
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category || "",
      stock: product.stock?.toString() || "",
      image: product.image
    });
    setSelectedImageFile(null);
    setIsEditDialogOpen(true);
  };

  const currency = (v: number) =>
    new Intl.NumberFormat(undefined, { 
      style: "currency", 
      currency: "MAD" 
    }).format(v);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection gérée par le hook
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Administration — Oumy's Beauty</title>
        <meta name="description" content="Interface d'administration pour gérer les produits" />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-display text-lg">Administration Oumy's Beauty</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")}>
              Voir la boutique
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Produits</h1>
            <p className="text-muted-foreground mt-2">
              Gérez votre catalogue de produits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={async () => {
              if (isMigrating) return;
              try {
                setIsMigrating(true);
                const local = productService.getAllProducts();
                if (!local || local.length === 0) {
                  toast.error("Aucun produit à migrer");
                  return;
                }
                const pushed = await pushLocalToRemote(local);
                // save returned products locally so the device that performed the migration has canonical data
                productService.replaceAllProducts(pushed as any);
                setProducts(pushed as any);
                toast.success("Migration terminée. Produits synchronisés vers Supabase (local mis à jour).");
              } catch (err: any) {
                console.error(err);
                toast.error("Erreur lors de la migration: " + (err?.message || String(err)));
              } finally {
                setIsMigrating(false);
              }
            }} disabled={isMigrating}>
              <Cloud className="h-4 w-4 mr-2" />
              {isMigrating ? 'Migration...' : 'Migrer vers Supabase'}
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                const remote = await fetchRemoteProducts();
                if (!remote || remote.length === 0) {
                  toast.error('Aucun produit trouvé sur Supabase');
                  return;
                }
                productService.replaceAllProducts(remote as any);
                setProducts(remote as any);
                toast.success('Import terminé — produits locaux remplacés');
              } catch (err: any) {
                console.error(err);
                toast.error('Erreur import Supabase: ' + (err?.message || String(err)));
              }
            }}>
              <DownloadCloud className="h-4 w-4 mr-2" />
              Importer depuis Supabase
            </Button>
            <Button variant="outline" onClick={handleSavePhotos}>
              <Package className="h-4 w-4 mr-2" />
              Sauvegarder photos
            </Button>
            <Button variant="outline" onClick={handleFixBrokenImages}>
              <Settings className="h-4 w-4 mr-2" />
              Corriger les images
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Crème hydratante"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Prix (MAD) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="99.99"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description détaillée du produit"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soins">Soins</SelectItem>
                        <SelectItem value="Maquillage">Maquillage</SelectItem>
                        <SelectItem value="Parfums">Parfums</SelectItem>
                        <SelectItem value="Accessoires">Accessoires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <ImageUpload
                      onImageSelect={setSelectedImageFile}
                      currentImage={formData.image}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddProduct}>
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden">
              <CardHeader className="p-0">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" 
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produit";
                  }}
                />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <span className="font-semibold whitespace-nowrap">{currency(product.price)}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center gap-2 mb-3">
                  {product.category && (
                    <Badge variant="secondary">{product.category}</Badge>
                  )}
                  {product.stock !== undefined && (
                    <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                      Stock: {product.stock}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditDialog(product)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action ne peut pas être annulée. Le produit "{product.name}" sera définitivement supprimé.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre premier produit
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom du produit *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Crème hydratante"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-price">Prix (MAD) *</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="99.99"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée du produit"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soins">Soins</SelectItem>
                  <SelectItem value="Maquillage">Maquillage</SelectItem>
                  <SelectItem value="Parfums">Parfums</SelectItem>
                  <SelectItem value="Accessoires">Accessoires</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="50"
              />
            </div>
            <div className="grid gap-2">
              <ImageUpload
                onImageSelect={setSelectedImageFile}
                currentImage={formData.image}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditProduct}>
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
