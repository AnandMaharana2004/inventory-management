import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { Env } from '@/constants/env'
import { PrismaClient } from './generated/prisma/client'

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString: Env.DATABASE_URL })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

declare global {
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}