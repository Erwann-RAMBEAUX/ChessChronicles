# --- Étape 1 : L'image de base ---
# On part d'une image Python 3.10 "slim" (légère) basée sur Debian
# "Bookworm" est une version de Debian qui contient Stockfish dans ses paquets
FROM python:3.10-slim-bookworm

# --- Étape 2 : Installation de Stockfish ---
# C'est l'étape magique. On met à jour le gestionnaire de paquets
# et on installe l'exécutable Stockfish.
# On nettoie le cache ensuite pour garder l'image légère.
RUN apt-get update && apt-get install -y \
    stockfish \
    && rm -rf /var/lib/apt/lists/*

# --- Étape 3 : Préparation de l'environnement Python ---
# On définit le dossier de travail à l'intérieur du conteneur
WORKDIR /app

# On copie D'ABORD le fichier requirements.txt
# (Grâce au cache Docker, l'installation ne se refera que si ce fichier change)
COPY requirements.txt .

# On installe les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# --- Étape 4 : Copie de votre application ---
# Maintenant, on copie tout le reste : main.py, .db, etc.
COPY . .

# --- Étape 5 : Définition de la commande de démarrage ---
# On dit à Uvicorn de démarrer sur le port 8000 et d'écouter
# sur 0.0.0.0 (pour être accessible de l'extérieur du conteneur)
# Render utilisera cette commande (ou une similaire)
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]