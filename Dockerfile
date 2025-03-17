# Usa l'immagine ufficiale di Node.js
FROM node:18

# Crea e setta la cartella di lavoro
WORKDIR /app

# Copia i file di package e package-lock
COPY package*.json ./

# Installa le dipendenze
RUN npm install
RUN npm install --save-dev nodemon  # Aggiungi nodemon come dipendenza di sviluppo

# Copia il resto dei file del progetto
COPY . .

# Esporta la porta 3000
EXPOSE 3000

# Comando per avviare il server con nodemon
CMD ["npx", "nodemon", "server.js"]
