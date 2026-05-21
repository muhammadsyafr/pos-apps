import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10)
  const hashedCashierPassword = await bcrypt.hash("cashier123", 10)

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
      password: hashedCashierPassword,
      role: "CASHIER",
    },
  })

  const products = [
    { name: "Coffee", sku: "COF001", costPrice: 2000, sellPrice: 5000, stock: 100, minStock: 10, category: "Beverages", imageUrl: "https://picsum.photos/seed/coffee/200/300" },
    { name: "Sandwich", sku: "SAN001", costPrice: 2500, sellPrice: 5000, stock: 50, minStock: 5, category: "Food", imageUrl: "https://picsum.photos/seed/sandwich/200/300" },
    { name: "Chips", sku: "CHP001", costPrice: 500, sellPrice: 1500, stock: 80, minStock: 15, category: "Snacks", imageUrl: "https://picsum.photos/seed/chips/200/300" },
    { name: "Soda", sku: "SOD001", costPrice: 750, sellPrice: 2000, stock: 60, minStock: 10, category: "Beverages", imageUrl: "https://picsum.photos/seed/soda/200/300" },
    { name: "Water", sku: "WAT001", costPrice: 250, sellPrice: 1000, stock: 100, minStock: 20, category: "Beverages", imageUrl: "https://picsum.photos/seed/water/200/300" },
    { name: "Cake", sku: "CAK001", costPrice: 3000, sellPrice: 6000, stock: 30, minStock: 5, category: "Food", imageUrl: "https://picsum.photos/seed/cake/200/300" },
    { name: "Juice", sku: "JUI001", costPrice: 1500, sellPrice: 3500, stock: 40, minStock: 5, category: "Beverages", imageUrl: "https://picsum.photos/seed/juice/200/300" },
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