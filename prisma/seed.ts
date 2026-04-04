import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: { email: "admin@cloudpos.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@cloudpos.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: "cashier@cloudpos.com" },
    update: {},
    create: {
      name: "Cashier",
      email: "cashier@cloudpos.com",
      password: hashedPassword,
      role: "CASHIER",
    },
  })

  const products = [
    { name: "Coffee", sku: "COF001", costPrice: 1.5, sellPrice: 3.0, stock: 100, minStock: 10, category: "Beverages" },
    { name: "Sandwich", sku: "SAN001", costPrice: 2.5, sellPrice: 5.0, stock: 50, minStock: 5, category: "Food" },
    { name: "Chips", sku: "CHP001", costPrice: 0.5, sellPrice: 1.5, stock: 80, minStock: 15, category: "Snacks" },
    { name: "Soda", sku: "SOD001", costPrice: 0.75, sellPrice: 2.0, stock: 60, minStock: 10, category: "Beverages" },
    { name: "Water", sku: "WAT001", costPrice: 0.25, sellPrice: 1.0, stock: 100, minStock: 20, category: "Beverages" },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }

  const categories = [
    { name: "Beverages", color: "#10B981" },
    { name: "Food", color: "#F59E0B" },
    { name: "Snacks", color: "#8B5CF6" },
  ]

  const createdCategories: Record<string, string> = {}
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    })
    createdCategories[cat.name] = created.id
  }

  const tags = [
    { name: "Hot", categoryId: createdCategories["Beverages"] },
    { name: "Cold", categoryId: createdCategories["Beverages"] },
    { name: "Fresh", categoryId: createdCategories["Food"] },
    { name: "Spicy", categoryId: createdCategories["Snacks"] },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }

  console.log("Seed data created:")
  console.log("- Admin:", admin.email)
  console.log("- Cashier:", cashier.email)
  console.log("- Products:", products.length)
  console.log("- Categories:", categories.length)
  console.log("- Tags:", tags.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })