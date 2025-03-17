# Usa l'immagine ufficiale di Node.js
FROM node:18

# Installa le dipendenze di sistema: PostgreSQL client e netcat-openbsd
RUN apt-get update && apt-get install -y \
    postgresql-client \
    netcat-openbsd \
  && rm -rf /var/lib/apt/lists/*

# Crea e setta la cartella di lavoro
WORKDIR /app

# Copia i file di package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install
RUN npm install --save-dev nodemon  # Aggiungi nodemon come dipendenza di sviluppo

# Copia il resto dei file del progetto
COPY . .

# Esporta la porta 3000
EXPOSE 3000

# Comando per eseguire il server con nodemon
CMD ["npx", "nodemon", "server.js"]
