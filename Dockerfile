# Usa un'immagine ufficiale di Node.js con supporto per TypeScript
FROM node:18

# Imposta la cartella di lavoro
WORKDIR /app

# Copia solo i file necessari per installare le dipendenze
COPY package*.json tsconfig.json ./

# Installa tutte le dipendenze
RUN npm install && npm install --save-dev nodemon ts-node \
    && apt-get update && apt-get install -y postgresql-client

# Copia il resto del codice
COPY . .

# Esporta la porta dell'app
EXPOSE 3000

# Comando di avvio con attesa per PostgreSQL
CMD echo "📌 Aspettando che PostgreSQL sia pronto..." && \
    until pg_isready -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB}; do \
        echo "⏳ PostgreSQL non è ancora pronto, attendo..."; sleep 2; \
    done && \
    echo "✅ PostgreSQL è pronto!" && \
    echo "🔄 Genero il client Prisma..." && \
    npx prisma generate && \
    echo "📦 Applico le migrazioni al database..." && \
    npx prisma migrate deploy && \
    echo "🚀 Avvio il server con nodemon..." && \
    exec npx nodemon --ext ts --exec ts-node src/server.ts
