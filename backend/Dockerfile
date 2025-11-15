# Étape 1: Définir l'image de base
FROM python:3.11-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Étape 2: Installer les dépendances système, y compris Stockfish
# - apt-get update: met à jour la liste des paquets disponibles
# - --no-install-recommends: n'installe que les dépendances principales, réduit la taille de l'image
# - stockfish: le moteur d'échecs
# - rm -rf /var/lib/apt/lists/*: nettoie le cache apt pour garder l'image légère
RUN apt-get update && \
    apt-get install -y --no-install-recommends stockfish && \
    rm -rf /var/lib/apt/lists/*

# Définir la variable d'environnement pour le chemin de Stockfish dans le conteneur
ENV STOCKFISH_PATH=/usr/games/stockfish

# Étape 3: Copier et installer les dépendances Python
# Copier d'abord le fichier des dépendances pour profiter de la mise en cache de Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Étape 4: Copier le code source de l'application
COPY . .

# Étape 5: Commande pour lancer l'application
# Render définit automatiquement la variable d'environnement PORT.
# Uvicorn écoutera sur 0.0.0.0 pour être accessible depuis l'extérieur du conteneur.
# Assurez-vous que votre fichier principal s'appelle `main.py` et l'instance FastAPI `app`.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]