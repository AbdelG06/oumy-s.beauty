# Guide de Déploiement - Oumy's Beauty

## Problèmes résolus

### 1. Erreur 404 sur les routes (Admin, etc.)
**Cause** : Vercel ne sait pas gérer les routes React Router
**Solution** : Fichier `vercel.json` avec redirection vers `index.html`

### 2. Images qui disparaissent
**Cause** : Chemins `/src/assets/` qui n'existent pas en production
**Solution** : Images déplacées dans `/public/` avec chemins relatifs

## Fichiers de configuration ajoutés

### vercel.json
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### public/.htaccess
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## Étapes de déploiement

1. **Commit et push sur GitHub** :
   ```bash
   git add .
   git commit -m "Fix Vercel deployment issues"
   git push origin main
   ```

2. **Vercel se redéploie automatiquement**

3. **Vérifier que** :
   - La route `/admin` fonctionne
   - Les images s'affichent correctement
   - Toutes les routes React Router marchent

## Structure des images

Les images sont maintenant dans `/public/` :
- `/product-serum.jpg`
- `/product-cream.jpg` 
- `/product-palette.jpg`
- `/pic/logo.png`

## Notes importantes

- **Ne jamais utiliser** `/src/assets/` en production
- **Toujours utiliser** des chemins relatifs depuis `/public/`
- Le fichier `vercel.json` est essentiel pour le SPA
