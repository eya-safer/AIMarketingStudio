# AI Marketing Studio

Application web qui aide à créer du contenu marketing pour des produits. Elle permet de gérer un catalogue, de générer des textes avec hashtags et de consulter l’historique et les statistiques.

## Fonctionnalités

- Création de compte, connexion et sessions utilisateur
- Ajout et consultation de produits avec image
- Génération de textes marketing avec Google Gemini
- Génération d’images via un service externe
- Historique des contenus générés
- Tableau de bord avec statistiques

## Technologies

- **Backend :** Node.js, Express.js
- **Interface :** EJS, HTML, CSS et JavaScript
- **Données :** stockage local JSON et SQLite pour les sessions
- **IA :** Google Gemini pour les textes ; service externe pour les images
## Capture
<img width="900" height="405" alt="image" src="https://github.com/user-attachments/assets/d3c17da8-3ba4-408b-b975-52f9571a1832" />
<img width="900" height="403" alt="image" src="https://github.com/user-attachments/assets/10f25903-f6aa-4363-8822-61b04e5f8a6b" />
<img width="900" height="408" alt="image" src="https://github.com/user-attachments/assets/a3160475-d1e9-4dc2-a3ac-b31567c786a8" />


## Structure du projet

```text
.
├── AI/                     # API Python de génération d’images
├── assets/                 # Ressources visuelles
├── css/                    # Feuilles de style
├── data/                   # Données locales de l’application
├── js/                     # Scripts JavaScript
├── public/                 # Fichiers servis au navigateur
├── src/services/           # Services, dont l’intégration Gemini
├── views/                  # Pages et composants EJS
├── server.js               # Serveur Express et routes API
└── package.json            # Dépendances et commandes npm
```

## Prérequis

- Node.js et npm
- Une clé API Google Gemini pour générer les textes
- Un service de génération d’images accessible pour activer la génération d’images


## Sécurité

Ne publiez jamais votre fichier `.env` ni vos clés API. Le fichier `.env` est exclu du dépôt par `.gitignore`.

## Auteur

 eya-safer (<https://github.com/eya-safer/>)
