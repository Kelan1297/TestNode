Avvio:
docker-compose up --build
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate deploy
docker-compose down

Swagger:
http://localhost:3000/api-docs/#/

Reg:
http://localhost:3000/register POST
-username
-password

Login:http://localhost:3000/login POST
-username
-password

