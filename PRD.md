# Product Requirements Document (PRD): CloudPOS

**Project Name:** CloudPOS  
**Version:** 1.0.0  
**Status:** Draft / Ready for Development  
**Tech Stack:** Next.js (App Router), TypeScript, shadcn/ui, Tailwind CSS, Prisma ORM, NextAuth.js.

---

## 1. Executive Summary
CloudPOS is a high-performance, web-based Point of Sale (POS) and Inventory Management system. The goal is to provide a "Zero-Training" experience for cashiers while offering robust data control, stock management, and sales analytics for business owners (Admins).

---

## 2. User Roles & Access Control (RBAC)

| Feature | Cashier (Staff) | Admin (Owner) |
| :--- | :---: | :---: |
| **Sales Terminal (POS)** | ✅ Full Access | ✅ Full Access |
| **Receipt Printing** | ✅ Access | ✅ Access |
| **Inventory Management** | ❌ No Access | ✅ Full CRUD |
| **Price/Image Editing** | ❌ No Access | ✅ Access |
| **Sales Analytics/Reports** | ❌ No Access | ✅ Full Access |
| **Staff/User Management** | ❌ No Access | ✅ Full Access |

---

## 3. Functional Requirements

### 3.1 Authentication & Security
* **Secure Login:** Dedicated login page using `NextAuth.js`.
* **Role-Based Redirection:** * Admins: Redirected to **Analytics Dashboard**.
    * Cashiers: Redirected directly to **POS Terminal**.
* **Session Management:** Secure JWT-based sessions with automatic logout on session expiry.

### 3.2 Inventory Management (Admin Only)
* **Product Catalog:** Manage products with fields: Name, SKU/Barcode, Category, Cost Price, Selling Price.
* **Image Management:** Drag-and-drop upload for product images (optimized for web).
* **Stock Control:** * Real-time stock decrementing upon sale.
    * **Low Stock Alerts:** Visual indicators (shadcn Badges) when stock falls below `minStock` levels.
* **Batch Entry:** "Save & Add Another" workflow to speed up inventory input.

### 3.3 POS Terminal (Cashier & Admin)
* **UX for Beginners:** Large, touch-friendly product cards with clear images and prices.
* **Fast Search:** `Command` palette for instant SKU or name lookup.
* **Shopping Cart:** One-tap addition, quantity toggles (+/-), and "Clear All" functionality.
* **Checkout Workflow:** * Support for multiple payment methods (Cash, QRIS).
    * **Change Calculator:** Auto-calculates change based on "Cash Received."
* **Receipt Printing:** Optimized CSS media queries for 58mm/80mm thermal printers.

### 3.4 Reporting & Analytics (Admin Only)
* **Dashboard:** Visual charts for daily/monthly revenue.
* **Profit Tracking:** Automatically calculates profit margins (`Sell Price - Cost Price`).
* **Transaction History:** Searchable logs of all sales, filterable by date and Cashier name.

---

## 4. Technical Architecture

### 4.1 Database Schema (Prisma)
```prisma
enum Role {
  ADMIN
  CASHIER
}

model User {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  password String // Hashed
  role     Role   @default(CASHIER)
  sales    Sale[]
}

model Product {
  id          String   @id @default(cuid())
  name        String
  sku         String   @unique
  imageUrl    String?
  costPrice   Decimal
  sellPrice   Decimal
  stock       Int      @default(0)
  minStock    Int      @default(5)
  category    String
}

model Sale {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  totalAmount Decimal
  cashPaid    Decimal
  changeGiven Decimal
  createdAt   DateTime @default(now())
}

## 5. Non-Functional Requirements
Performance: POS cart interactions must be near-instant (under 100ms).

Reliability: Atomic database transactions to ensure stock is only decremented if the sale is saved.

Responsiveness: UI must scale from 10" Tablets to 27" Desktop monitors.

Accessibility: Full keyboard shortcut support for "Power Cashiers."

## 6. Success Metrics
Efficiency: A cashier can complete a 3-item transaction in under 30 seconds.

Accuracy: Zero discrepancy between system stock and physical inventory.

Training: New staff can use the POS without a printed manual.