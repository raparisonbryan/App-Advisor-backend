# Harnais de Tests Unitaires - AppAdvisor Backend

Ce répertoire contient une suite complète de tests unitaires et d'intégration pour votre application AppAdvisor Backend.

## 🏗️ Structure des Tests

```
tests/
├── setup.js                    # Configuration globale des tests
├── helpers/
│   └── testUtils.js           # Utilitaires de test réutilisables
├── Controllers/                # Tests des contrôleurs
│   ├── userController.test.js
│   ├── avisController.test.js
│   ├── outilsController.test.js
│   └── categoriesController.test.js
├── middleware/                 # Tests des middlewares
│   └── authJwt.test.js
├── utils/                      # Tests des utilitaires
│   └── statistiques.test.js
├── integration/                # Tests d'intégration
│   └── routes.test.js
└── README.md                   # Ce fichier
```

## 🚀 Installation et Configuration

### 1. Installer les dépendances de test

```bash
npm install
```

Les dépendances suivantes sont automatiquement installées :

- `jest` : Framework de test principal
- `supertest` : Tests d'API HTTP
- `mongodb-memory-server` : Base de données en mémoire pour les tests
- `@types/jest` : Types TypeScript pour Jest

### 2. Configuration Jest

La configuration Jest est définie dans `package.json` avec :

- Base de données MongoDB en mémoire
- Couverture de code configurée
- Seuils de couverture définis (70% branches, 80% fonctions/lignes/statements)

## 🧪 Exécution des Tests

### Tests unitaires simples

```bash
npm test
```

### Tests en mode watch (développement)

```bash
npm run test:watch
```

### Tests avec couverture de code

```bash
npm run test:coverage
```

### Tests en mode CI (sans watch)

```bash
npm run test:ci
```

## 📊 Couverture de Code

Les tests couvrent :

- **Contrôleurs** : Toutes les fonctions CRUD et logique métier
- **Middlewares** : Authentification et autorisation
- **Utilitaires** : Calculs de statistiques et fonctions helper
- **Routes** : Tests d'intégration des endpoints API

### Seuils de couverture

- **Branches** : 70%
- **Fonctions** : 80%
- **Lignes** : 80%
- **Statements** : 80%

## 🔧 Utilitaires de Test

### `testUtils.js`

Fonctions helper pour faciliter l'écriture des tests :

```javascript
// Créer des données de test
const userData = createTestUserData({ Admin: true });
const avisData = createTestAvisData({ note: 18 });

// Simuler des requêtes/réponses Express
const req = mockRequest(body, params, query, headers);
const res = mockResponse();

// Vérifications communes
expectErrorResponse(res, 500, "Error message");
expectSuccessResponse(res, 200);
```

## 🗄️ Base de Données de Test

- **MongoDB en mémoire** : Chaque test utilise une base de données isolée
- **Nettoyage automatique** : Les données sont supprimées entre chaque test
- **Variables d'environnement** : Configuration automatique pour les tests

## 📝 Écriture de Nouveaux Tests

### 1. Test de Contrôleur

```javascript
describe("MonController", () => {
  let req, res;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    jest.clearAllMocks();
  });

  it("should handle success case", async () => {
    // Arrange
    const mockData = { id: "1", name: "Test" };
    monModel.find.mockResolvedValue(mockData);

    // Act
    await monController.maFonction(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith(mockData);
  });

  it("should handle error case", async () => {
    // Arrange
    const error = new Error("Database error");
    monModel.find.mockRejectedValue(error);

    // Act
    await monController.maFonction(req, res);

    // Assert
    expectErrorResponse(res, 500, "Database error");
  });
});
```

### 2. Test de Middleware

```javascript
describe("MonMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, cookies: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("should call next() when valid", async () => {
    // Arrange
    req.headers["x-access-token"] = "valid-token";

    // Act
    await monMiddleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });
});
```

## 🚨 Bonnes Pratiques

### 1. Isolation des Tests

- Chaque test doit être indépendant
- Utiliser `beforeEach` pour réinitialiser l'état
- Nettoyer les mocks avec `jest.clearAllMocks()`

### 2. Nommage des Tests

- Noms descriptifs qui expliquent le comportement attendu
- Utiliser le format "should [comportement] when [condition]"

### 3. Structure AAA

- **Arrange** : Préparer les données et mocks
- **Act** : Exécuter la fonction testée
- **Assert** : Vérifier les résultats

### 4. Mocks Appropriés

- Mocker les dépendances externes (base de données, API)
- Tester les cas d'erreur et de succès
- Vérifier les appels de fonction

## 🔍 Débogage des Tests

### Mode verbose

```bash
npm test -- --verbose
```

### Tests spécifiques

```bash
npm test -- --testNamePattern="should create user"
```

### Tests d'un fichier spécifique

```bash
npm test userController.test.js
```

## 📈 Ajout de Nouveaux Tests

1. **Identifier la fonctionnalité** à tester
2. **Créer le fichier de test** dans le bon répertoire
3. **Importer les dépendances** et mocks nécessaires
4. **Écrire les cas de test** pour les scénarios principaux et d'erreur
5. **Vérifier la couverture** avec `npm run test:coverage`
6. **S'assurer que tous les tests passent** avec `npm test`

## 🎯 Exemples de Cas de Test

### Cas de Succès

- Création réussie d'une ressource
- Récupération de données
- Mise à jour réussie
- Suppression réussie

### Cas d'Erreur

- Validation échouée
- Ressource non trouvée
- Erreur de base de données
- Autorisation insuffisante
- Données manquantes

### Cas Limites

- Données vides
- Valeurs aux limites
- Gestion des erreurs réseau
- Timeouts

## 🤝 Contribution

Lors de l'ajout de nouvelles fonctionnalités :

1. **Écrire les tests en premier** (TDD)
2. **Maintenir la couverture** au-dessus des seuils
3. **Tester les cas d'erreur** et edge cases
4. **Documenter** les nouveaux tests

## 📚 Ressources

- [Documentation Jest](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://jestjs.io/docs/best-practices)
