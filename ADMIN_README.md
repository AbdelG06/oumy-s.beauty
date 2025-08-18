# Interface d'Administration - Oumy's Beauty

## 🚀 Fonctionnalités

L'interface d'administration permet de gérer complètement le catalogue de produits de la boutique Oumy's Beauty.

### ✅ Fonctionnalités disponibles

- **Authentification sécurisée** : Connexion avec identifiant et mot de passe
- **Gestion des produits** :
  - ✅ Ajouter de nouveaux produits
  - ✅ Modifier les produits existants (nom, prix, description, catégorie, stock, image)
  - ✅ Supprimer des produits
  - ✅ Visualiser tous les produits dans une interface moderne
- **Upload d'images** : 
  - ✅ Glisser-déposer d'images depuis l'ordinateur
  - ✅ Sélection depuis la galerie photos (mobile)
  - ✅ Aperçu en temps réel
  - ✅ Support des formats JPG, PNG, GIF
- **Stockage local** : Les données sont sauvegardées dans le navigateur
- **Interface responsive** : Fonctionne sur desktop et mobile

## 🔐 Accès à l'administration

### Identifiants de connexion
- **Identifiant** : `admin`
- **Mot de passe** : `oumy2024`

### URL d'accès
- **Page de connexion** : `http://localhost:8081/admin/login`
- **Interface d'administration** : `http://localhost:8081/admin`

## 📋 Guide d'utilisation
Note: Il n'y a plus de produits par défaut. Tout commence vide jusqu'à ce que vous ajoutiez des produits dans l'admin, puis ils sont synchronisés via Supabase si configuré.

### 1. Connexion
1. Accédez à `/admin/login`
2. Entrez l'identifiant : `admin`
3. Entrez le mot de passe : `oumy2024`
4. Cliquez sur "Se connecter"

### 2. Ajouter un produit
1. Cliquez sur le bouton "Ajouter un produit"
2. Remplissez les informations :
   - **Nom du produit** (obligatoire)
   - **Prix en MAD** (obligatoire)
   - **Description** (obligatoire)
   - **Catégorie** (optionnel) : Soins, Maquillage, Parfums, Accessoires
   - **Stock** (optionnel) : Nombre d'unités disponibles
   - **Image** : Glissez-déposez ou cliquez pour sélectionner une image
3. Cliquez sur "Ajouter"

### 3. Upload d'images

#### Sur ordinateur :
- **Glisser-déposer** : Faites glisser une image depuis vos dossiers vers la zone d'upload
- **Cliquer pour sélectionner** : Cliquez sur la zone d'upload pour ouvrir l'explorateur de fichiers
- **Formats supportés** : JPG, PNG, GIF
- **Taille maximale** : 5MB

#### Sur mobile :
- **Sélection depuis la galerie** : Choisissez une photo existante
- **Prise de photo** : Prenez une nouvelle photo avec l'appareil photo
- **Sélection depuis les fichiers** : Accédez à vos dossiers

### 4. Modifier un produit
1. Cliquez sur le bouton "Modifier" d'un produit
2. Modifiez les informations souhaitées
3. Changez l'image si nécessaire
4. Cliquez sur "Enregistrer"

### 5. Supprimer un produit
1. Cliquez sur l'icône de poubelle (🗑️) d'un produit
2. Confirmez la suppression dans la boîte de dialogue

### 6. Navigation
- **Voir la boutique** : Ouvre la boutique dans un nouvel onglet
- **Déconnexion** : Se déconnecte et retourne à la page de connexion

## 🎨 Interface utilisateur

### Design moderne
- Interface inspirée de Material Design
- Couleurs cohérentes avec la marque Oumy's Beauty
- Animations fluides et transitions élégantes

### Composants utilisés
- **Cards** : Affichage des produits
- **Dialogs** : Formulaires d'ajout/modification
- **Alert Dialogs** : Confirmations de suppression
- **Badge** : Affichage des catégories et stocks
- **Toast notifications** : Retours utilisateur
- **ImageUpload** : Composant d'upload d'images avec glisser-déposer

## 🔧 Configuration technique

### Stockage des données
- **LocalStorage** : Les produits sont sauvegardés dans le navigateur
- **Clé de stockage** : `oumy_beauty_products`
- **Format** : JSON

### Gestion des images
- **Upload direct** : Les images sont converties en base64 et stockées localement
- **Aperçu en temps réel** : Prévisualisation immédiate après sélection
- **Validation** : Vérification du type et de la taille des fichiers
- **Fallback** : Image placeholder si aucune image n'est fournie

### Structure des données
```typescript
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  imageFile?: File; // Fichier d'image temporaire
  description: string;
  category?: string;
  stock?: number;
  createdAt: string;
  updatedAt: string;
};
```

## 🛡️ Sécurité

### Authentification
- Stockage de l'état de connexion dans localStorage
- Protection des routes d'administration
- Redirection automatique vers la page de connexion

### Validation
- Champs obligatoires vérifiés avant soumission
- Messages d'erreur explicites
- Confirmation pour les actions destructives
- Validation des types de fichiers d'image

## 🚀 Déploiement

### Variables d'environnement
Aucune variable d'environnement requise pour le moment.

### Build de production
```bash
npm run build
```

### Serveur de développement
```bash
npm run dev
```

## 🔄 Synchronisation avec la boutique

Les produits ajoutés/modifiés/supprimés dans l'administration sont automatiquement reflétés sur la page principale de la boutique.

### Mise à jour en temps réel
- Les changements sont immédiatement visibles
- Pas besoin de recharger la page
- Notifications toast pour confirmer les actions

## 📱 Responsive Design

L'interface s'adapte automatiquement à tous les écrans :
- **Desktop** : Affichage en grille 3 colonnes, glisser-déposer d'images
- **Tablet** : Affichage en grille 2 colonnes, sélection tactile
- **Mobile** : Affichage en grille 1 colonne, accès à la galerie photos

## 🎯 Prochaines améliorations

- [x] Upload d'images directement depuis l'interface
- [ ] Gestion des catégories personnalisées
- [ ] Historique des modifications
- [ ] Export/import des données
- [ ] Gestion des utilisateurs multiples
- [ ] Sauvegarde cloud
- [ ] Compression automatique des images
- [ ] Redimensionnement automatique

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez que vous utilisez les bons identifiants
2. Videz le cache du navigateur si nécessaire
3. Vérifiez que les images sont au bon format (JPG, PNG, GIF)
4. Contactez l'équipe de développement

---

**Oumy's Beauty** - Interface d'administration v1.1 avec upload d'images
