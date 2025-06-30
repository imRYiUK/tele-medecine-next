# 💻 Frontend Télémédecine – Next.js

Bienvenue dans l'interface utilisateur du projet **Télémédecine** ! 🌐

---

## ✨ Présentation

Ce dépôt contient l'interface web du projet de télémédecine, développée avec [Next.js](https://nextjs.org/) et React. Elle permet aux patients et médecins d'accéder à la plateforme, de consulter les dossiers médicaux, d'échanger en temps réel et de visualiser des images médicales DICOM.

---

## ⚙️ Fonctionnalités principales

- 🔐 Authentification et gestion de session
- 🖼️ Visualisation d'images médicales (DICOM)
- 💬 Communication temps réel (WebSocket)
- 📱 Interface responsive et moderne (Tailwind CSS)

---

## 🛠️ Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- Accès à l'API backend ([tele-medecine-nest](../tele-medecine-nest))

---

## 🚀 Installation

1. **Clonez le dépôt :**
   ```bash
   git clone <url-du-repo>
   cd tele-medecine-next
   ```
2. **Installez les dépendances :**
   ```bash
   npm install
   ```
3. **Configurez les variables d'environnement dans `.env.local` :**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   # Autres variables selon vos besoins
   ```

---

## 🏃‍♂️ Lancement du serveur

- **Développement** :
  ```bash
  npm run dev
  ```
- **Production** :
  ```bash
  npm run build
  npm start
  ```

---

## 🗂️ Structure du projet

```
tele-medecine-next/
├── src/           # Code source principal (pages, composants, hooks)
├── public/        # Ressources statiques
├── components.json # Configuration des composants
└── ...
```

---

## 🚢 Déploiement

- **Vercel** : connectez le repo et déployez automatiquement
- **Docker** :
  ```bash
  docker build -t tele-medecine-next .
  docker run -p 3000:3000 tele-medecine-next
  ```

---

## 👥 Membres de l'équipe

- 🧑‍💻 Mouhamed DIAGNE
- 🧑‍💻 Cheikh Ahmed Tidiane THIANDOUM
- ��‍💻 Assane MBENGUE
- 🧑‍💻 Anna Sow

---

## 📄 Licence

Ce projet est sous licence **MIT**.
