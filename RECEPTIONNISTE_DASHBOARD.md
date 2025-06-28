# Tableau de Bord Réceptionniste

## Vue d'ensemble

Le tableau de bord réceptionniste est une interface complète conçue pour faciliter la gestion quotidienne des patients et des rendez-vous dans un établissement médical.

## Fonctionnalités

### 📊 Statistiques en Temps Réel

Le dashboard affiche quatre métriques clés :

1. **Total Patients** - Nombre total de patients enregistrés
2. **Rendez-vous Aujourd'hui** - Nombre de rendez-vous prévus pour la journée
3. **Cette Semaine** - Nombre de rendez-vous pour la semaine en cours
4. **En Attente** - Nombre de rendez-vous à venir

### ⚡ Actions Rapides

Trois boutons d'action rapide permettent d'accéder rapidement aux fonctionnalités principales :

- **Gérer les Patients** - Accès à la liste complète des patients
- **Gérer les Rendez-vous** - Accès au calendrier des rendez-vous
- **Nouveau Patient** - Création rapide d'un nouveau dossier patient

### 📅 Prochains Rendez-vous

Cette section affiche les 5 prochains rendez-vous avec :
- Nom du patient
- Nom du médecin/radiologue
- Date et heure du rendez-vous
- Statut (Terminé, Urgent, À venir)
- Bouton d'accès rapide au profil patient

### 👥 Patients Récents

Cette section affiche les 5 patients les plus récents avec :
- Nom et prénom
- Email et téléphone
- Boutons d'action rapide (voir profil, créer rendez-vous)

## Navigation

### Menu Principal

Le menu latéral inclut :
- **Dashboard** - Vue d'ensemble (page actuelle)
- **Patients** - Gestion des dossiers patients
- **Nouveau Patient** - Création d'un nouveau patient
- **Rendez-vous** - Gestion du calendrier
- **Paramètres** - Configuration du compte

### Couleurs et Thème

- **Couleur principale** : Vert émeraude (#059669)
- **Couleurs des statistiques** :
  - Patients : Vert émeraude
  - Rendez-vous aujourd'hui : Bleu
  - Cette semaine : Orange
  - En attente : Rouge

## Technologies Utilisées

- **Frontend** : Next.js 14 avec TypeScript
- **UI Components** : Shadcn/ui
- **Icons** : Lucide React
- **Styling** : Tailwind CSS
- **State Management** : React Hooks
- **API** : Axios pour les appels HTTP

## Structure des Données

### Interface ReceptionnisteStats
```typescript
interface ReceptionnisteStats {
  totalPatients: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  pendingAppointments: number;
}
```

### Interface DashboardData
```typescript
interface DashboardData {
  stats: ReceptionnisteStats;
  recentAppointments: RendezVous[];
  recentPatients: Patient[];
}
```

## Services API

Le dashboard utilise le service `receptionnisteService` qui fournit :

- `getDashboardData()` - Récupère toutes les données du dashboard
- `getPatientsByEtablissement()` - Patients par établissement
- `getAppointmentsByEtablissement()` - Rendez-vous par établissement

## Responsive Design

Le dashboard est entièrement responsive avec :
- **Mobile** : Menu hamburger, grille adaptative
- **Tablet** : Layout intermédiaire
- **Desktop** : Sidebar fixe, grille complète

## Accessibilité

- Navigation au clavier
- Contraste approprié
- Labels descriptifs
- États de focus visibles

## Performance

- Chargement parallèle des données
- Mise en cache des requêtes
- Optimisation des re-renders
- Lazy loading des composants

## Sécurité

- Authentification requise
- Vérification des rôles (RECEPTIONNISTE)
- Protection des routes
- Validation des données

## Maintenance

### Ajout de nouvelles fonctionnalités

1. Étendre l'interface `ReceptionnisteStats`
2. Mettre à jour le service `receptionnisteService`
3. Ajouter les composants UI nécessaires
4. Mettre à jour la documentation

### Personnalisation

Le dashboard peut être personnalisé en modifiant :
- Les couleurs dans `tailwind.config.js`
- Les icônes dans les imports Lucide
- Les métriques calculées dans le service
- Le nombre d'éléments affichés dans les listes

## Support

Pour toute question ou problème :
1. Vérifier la console du navigateur pour les erreurs
2. Contrôler les logs du serveur backend
3. Vérifier la connectivité API
4. Consulter la documentation des services 