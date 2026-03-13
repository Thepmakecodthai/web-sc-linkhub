const {PrismaClient} = require('@prisma/client');
(async ()=>{
  const prisma = new PrismaClient();
  const res = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name='User'`;
  console.log(res);
  process.exit(0);
})();