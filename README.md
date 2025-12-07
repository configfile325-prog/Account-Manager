# Discord Account Manager

Un gestionnaire de compte Discord moderne et élégant avec interface web pure (HTML/CSS/JS). Gérez votre compte Discord, effectuez des raids, gérez des webhooks et bien plus.

![Logo](logo.png)

## ⚠️ Avertissement Important

**L'utilisation de selfbots viole les conditions d'utilisation de Discord et peut entraîner un bannissement permanent de votre compte.**

Ce projet est fourni à des fins éducatives uniquement. L'auteur n'est pas responsable de l'utilisation qui en est faite. Utilisez à vos risques et périls.

## ✨ Fonctionnalités

### 📊 Informations
- Affichage des informations utilisateur avec embeds élégants
- Affichage des informations serveur détaillées
- Affichage des informations d'invitation Discord
- Système d'embeds Discord-style

### 🛠️ Utilitaires
- **Gestion des Amis** : Supprimer tous les amis, envoyer un message groupé
- **Gestion des Serveurs** : Mute/Unmute tous vos serveurs
- **HypeSquad** : Changer votre badge HypeSquad (Bravery, Brilliance, Balance)
- **Clan Tag** : Modifier votre clan Discord
- **ID to Token** : Encoder un ID utilisateur en base64
- **DDoS Vocal** : DDoS un DM/Groupe en changeant la région

### ⚙️ Tools
- **Messages** : Supprimer tous vos messages d'un salon, sauvegarder en HTML
- **Amis** : Créer un lien d'invitation pour vous ajouter en ami
- **Nettoyage** : Fermer tous les DMs, DMs de bots uniquement, quitter tous les groupes

### 🔑 Token
- **Vérification** : Vérifier si un token Discord est valide
- **Informations** : Afficher toutes les informations d'un token (email, téléphone, A2F, Nitro, clan)

### 🔗 Webhook
- **Vérification** : Vérifier si un webhook est valide
- **Informations** : Afficher les détails d'un webhook
- **Suppression** : Supprimer un webhook ou tous les webhooks d'un salon
- **Spam** : Spammer un webhook avec un message personnalisé

### 💥 Raid
- **Deface** : Supprime tous les salons, renomme le serveur, crée un salon
- **Webhook Spam** : Crée 2 webhooks par salon et spam
- **Spam Salons** : Création massive de salons
- **Spam Rôles** : Création massive de rôles avec couleurs aléatoires
- **Suppression** : Supprimer tous les salons/rôles
- **Ban/Kick** : Bannir ou kick tous les membres
- **Prune** : Supprimer les membres inactifs (7 jours)
- **Role Up Crash** : Crash un serveur en déplaçant les rôles en boucle
- **Nuke** : Destruction complète d'un serveur

## 🚀 Installation

1. Clonez le repository :
```bash
git clone https://github.com/002-sans/account-manager.git
cd account-manager
```

2. Ouvrez `index.html` dans votre navigateur

3. Entrez votre token Discord

4. Acceptez les risques et profitez des fonctionnalités

## 📦 Structure du Projet

```
account-manager/
├── index.html              # Page principale
├── style.css               # Styles modernes
├── logo.png                # Logo du projet
├── embed-preview.html      # Prévisualisation des embeds sociaux
├── README.md               # Documentation
├── LICENSE                 # Licence MIT
└── js/
    ├── config.js           # Configuration globale
    ├── utils.js            # Fonctions utilitaires
    ├── api.js              # Gestion API Discord
    ├── ui.js               # Gestion interface
    ├── auth.js             # Authentification
    ├── htmlGenerator.js    # Générateur HTML pour messages
    ├── info.js             # Module informations
    ├── friends.js          # Module amis
    ├── messages.js         # Module messages
    ├── server.js           # Module serveurs
    ├── utils-module.js     # Utilitaires avancés
    ├── voice.js            # Module vocal
    ├── tools.js            # Outils divers
    ├── token.js            # Module tokens
    ├── webhook.js          # Module webhooks
    └── raid.js             # Module raids
```

## 🎨 Design

- **Thème** : Fond noir avec accents bleus (#4169ff)
- **Typographie** : Inter (Google Fonts)
- **Style** : Minimaliste et épuré
- **Responsive** : Adapté mobile et desktop
- **Embeds** : Style Discord pour affichage des informations

## ⚡ Optimisations

- Requêtes API ultra-rapides sans délais inutiles
- Actions de raid optimisées avec `await` séquentiel
- Pas de Promise.all() pour éviter les rate limits Discord
- Interface réactive et fluide
- Génération HTML pour sauvegarde de messages

## 🔒 Sécurité

- Token stocké uniquement en mémoire (jamais sauvegardé)
- Pas de stockage local
- Déconnexion automatique au rechargement de la page
- Confirmations pour toutes les actions dangereuses

## 📱 Embeds Réseaux Sociaux

Le site inclut des meta tags optimisés pour :
- **Discord** : Embed avec logo et description
- **Twitter** : Twitter Card avec image
- **Instagram** : Preview optimisé
- **Facebook** : Open Graph tags

Prévisualisez les embeds en ouvrant `embed-preview.html`

## 🔧 Technologies

- HTML5
- CSS3
- JavaScript Vanilla (aucune dépendance)
- Discord API v10
- Fetch API

## 📝 Utilisation

1. Obtenez votre token Discord (F12 > Console > copier le token)
2. Collez-le dans le champ de connexion
3. Acceptez les avertissements
4. Naviguez entre les onglets pour accéder aux fonctionnalités

## ⚠️ Disclaimer

Ce projet est fourni "tel quel" sans garantie d'aucune sorte. L'utilisation de selfbots est strictement interdite par les conditions d'utilisation de Discord. L'auteur décline toute responsabilité quant à l'utilisation de ce logiciel.

## 👤 Auteur

**002-sans**
- GitHub: [@002-sans](https://github.com/002-sans)
- Projet: [account-manager](https://github.com/002-sans/account-manager)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

## 📧 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

**⚠️ Rappel Final** : L'utilisation de selfbots viole les ToS de Discord et peut entraîner un bannissement permanent. Utilisez ce projet uniquement à des fins éducatives et de test sur vos propres comptes de test.

Made with 💙 by 002-sans
