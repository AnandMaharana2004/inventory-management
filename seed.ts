/**
 * Seed data for the Beverage Distribution Inventory & Billing System.
 * -----------------------------------------------------------------------
 * Place this file at: lib/seed-data.ts
 *
 * This does NOT create its own PrismaClient or manage connections — it
 * uses the shared singleton from `lib/prisma.ts` so it's safe to import
 * and call from an API route (see app/api/seed/route.ts).
 */

// import { prisma } from "./prisma";
// import {
//   DiscountAttribute,
//   PaymentStatus,
//   ReferenceType,
//   StockTxnType,
//   UserRole,
// } from "./generated/prisma/enums";
import { createHash } from "crypto";
import { DiscountAttribute, PaymentStatus, ReferenceType, StockTxnType, UserRole } from "./lib/generated/prisma/enums";
import prisma from "./lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rounds a number to 2 decimal places (matches Decimal(.., 2) columns). */
function round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Converts pack/loose quantities into total pieces using the item's pack size. */
function toPieces(packQty: number, looseQty: number, packSize: number): number {
    return packQty * packSize + looseQty;
}

/** Splits a GST percentage into equal CGST/SGST halves with computed amounts. */
function gstSplit(taxableAmount: number, gstPct: number) {
    const halfPct = round2(gstPct / 2);
    const cgstAmount = round2((taxableAmount * halfPct) / 100);
    const sgstAmount = round2((taxableAmount * halfPct) / 100);
    return { cgstPct: halfPct, sgstPct: halfPct, cgstAmount, sgstAmount };
}

/** Dev-only placeholder password hash. Swap for bcrypt/argon2 in your real auth flow. */
function placeholderHash(password: string): string {
    return createHash("sha256").update(password).digest("hex");
}

// ---------------------------------------------------------------------------
// seedDatabase
// ---------------------------------------------------------------------------

export async function seedDatabase() {
    // Running stock balance per itemId, kept in memory while seeding so each
    // StockLedger row gets a correct `balanceAfter` (mirrors what your DB
    // triggers would do on real inserts). Declared inside the function so a
    // fresh map is used on every call to this endpoint.
    const stockBalance: Record<number, number> = {};

    async function applyStockMovement(opts: {
        itemId: number;
        txnDate: Date;
        txnType: StockTxnType;
        referenceType: ReferenceType;
        referenceId?: number | null;
        qtyIn?: number;
        qtyOut?: number;
        unitCost?: number;
        unitPrice?: number;
        remarks?: string;
        createdById: number;
    }) {
        const qtyIn = opts.qtyIn ?? 0;
        const qtyOut = opts.qtyOut ?? 0;
        const current = stockBalance[opts.itemId] ?? 0;
        const balanceAfter = current + qtyIn - qtyOut;
        stockBalance[opts.itemId] = balanceAfter;

        await prisma.stockLedger.create({
            data: {
                txnDate: opts.txnDate,
                itemId: opts.itemId,
                txnType: opts.txnType,
                referenceType: opts.referenceType,
                referenceId: opts.referenceId ?? null,
                qtyInPieces: qtyIn,
                qtyOutPieces: qtyOut,
                balanceAfter,
                unitCost: opts.unitCost,
                unitPrice: opts.unitPrice,
                remarks: opts.remarks,
                createdById: opts.createdById,
            },
        });

        await prisma.itemStock.update({
            where: { itemId: opts.itemId },
            data: { currentStockPieces: balanceAfter },
        });
    }

    console.log("Cleaning existing data...");
    // Delete in FK-safe order (children before parents)
    await prisma.stockLedger.deleteMany();
    await prisma.damage.deleteMany();
    await prisma.billDtl.deleteMany();
    await prisma.billHdr.deleteMany();
    await prisma.poDtl.deleteMany();
    await prisma.poHdr.deleteMany();
    await prisma.discount.deleteMany();
    await prisma.itemStock.deleteMany();
    await prisma.itemMaster.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany();

    // -------------------------------------------------------------------
    // Users
    // -------------------------------------------------------------------
    console.log("Seeding users...");
    const passwordHash = placeholderHash("Password@123");

    const admin = await prisma.user.create({
        data: {
            name: "Anand Verma",
            passwordHash,
            role: UserRole.ADMIN,
            contactNumber: "9876500001",
            email: "anand.admin@coldchain.com",
        },
    });

    const manager = await prisma.user.create({
        data: {
            name: "Priya Nair",
            passwordHash,
            role: UserRole.MANAGER,
            contactNumber: "9876500002",
            email: "priya.manager@coldchain.com",
        },
    });

    const salesman1 = await prisma.user.create({
        data: {
            name: "Ravi Kumar",
            passwordHash,
            role: UserRole.SALESMAN,
            contactNumber: "9876500003",
            email: "ravi.sales@coldchain.com",
        },
    });

    const salesman2 = await prisma.user.create({
        data: {
            name: "Suresh Yadav",
            passwordHash,
            role: UserRole.SALESMAN,
            contactNumber: "9876500004",
            email: "suresh.sales@coldchain.com",
        },
    });

    // -------------------------------------------------------------------
    // Vendors
    // -------------------------------------------------------------------
    console.log("Seeding vendors...");
    const vendor1 = await prisma.vendor.create({
        data: {
            name: "Hindustan Coca-Cola Beverages Pvt Ltd",
            gstin: "07AAFCH1234M1Z5",
            location: "Najafgarh Road, Delhi",
            contactPerson: "Vikram Sharma",
            contactNumber: "9810011111",
            email: "orders@hccb-delhi.com",
        },
    });

    const vendor2 = await prisma.vendor.create({
        data: {
            name: "Varun Beverages Ltd",
            gstin: "07AAFCV5678N1Z2",
            location: "Okhla Industrial Area, Delhi",
            contactPerson: "Amit Chawla",
            contactNumber: "9810022222",
            email: "supply@varunbeverages.com",
        },
    });

    const vendor3 = await prisma.vendor.create({
        data: {
            name: "Bisleri International Pvt Ltd",
            gstin: "07AAACB4321P1Z9",
            location: "Mayapuri Industrial Area, Delhi",
            contactPerson: "Neha Kapoor",
            contactNumber: "9810033333",
            email: "distribution@bisleri.com",
        },
    });

    const vendor4 = await prisma.vendor.create({
        data: {
            name: "Red Bull India Pvt Ltd",
            gstin: "07AABCR8765Q1Z4",
            location: "Gurugram, Haryana",
            contactPerson: "Karan Mehta",
            contactNumber: "9810044444",
            email: "distribution@redbull-india.com",
        },
    });

    // -------------------------------------------------------------------
    // Customers
    // -------------------------------------------------------------------
    console.log("Seeding customers...");
    const customer1 = await prisma.customer.create({
        data: {
            name: "Sharma General Store",
            mobileNo: "9911100001",
            gstin: "07ABCDE1111F1Z1",
            contactPerson: "Mahesh Sharma",
            address: "Shop 12, Gharroli Market",
            city: "Delhi",
        },
    });

    const customer2 = await prisma.customer.create({
        data: {
            name: "City Mart",
            mobileNo: "9911100002",
            gstin: "07ABCDE2222F1Z2",
            contactPerson: "Rekha Singh",
            address: "Main Market, Vasundhara Enclave",
            city: "Delhi",
        },
    });

    const customer3 = await prisma.customer.create({
        data: {
            name: "New Apna Bazar",
            mobileNo: "9911100003",
            contactPerson: "Deepak Gupta",
            address: "Sector 5, Patparganj",
            city: "Delhi",
        },
    });

    const customer4 = await prisma.customer.create({
        data: {
            name: "Krishna Wines & Beverages",
            mobileNo: "9911100004",
            gstin: "07ABCDE4444F1Z4",
            contactPerson: "Krishna Mohan",
            address: "GT Road, Mayur Vihar",
            city: "Delhi",
        },
    });

    const customer5 = await prisma.customer.create({
        data: {
            name: "Sunrise Departmental Store",
            mobileNo: "9911100005",
            contactPerson: "Sunita Rawat",
            address: "Pocket 3, Trilokpuri",
            city: "Delhi",
        },
    });

    // -------------------------------------------------------------------
    // Items + opening stock
    // -------------------------------------------------------------------
    console.log("Seeding item master & opening stock...");

    type ItemSeed = {
        itemCode: string;
        itemDesc: string;
        hsnCode: string;
        category: string;
        brand: string;
        packSize: number;
        unitName: string;
        gstPct: number;
        reorderLevel: number;
        purchaseRate: number; // base cost, also used for opening valuation + POs
        saleRate: number; // used for sales bills below
        openingPacks: number;
        openingLoose: number;
    };

    const itemSeeds: ItemSeed[] = [
        { itemCode: "CC200", itemDesc: "Coca-Cola 200ml Bottle", hsnCode: "22021010", category: "Soft Drink", brand: "Coca-Cola", packSize: 24, unitName: "Bottle", gstPct: 28, reorderLevel: 48, purchaseRate: 14.0, saleRate: 18.0, openingPacks: 3, openingLoose: 0 },
        { itemCode: "CC750", itemDesc: "Coca-Cola 750ml Bottle", hsnCode: "22021010", category: "Soft Drink", brand: "Coca-Cola", packSize: 12, unitName: "Bottle", gstPct: 28, reorderLevel: 24, purchaseRate: 38.0, saleRate: 45.0, openingPacks: 3, openingLoose: 0 },
        { itemCode: "SP200", itemDesc: "Sprite 200ml Bottle", hsnCode: "22021020", category: "Soft Drink", brand: "Sprite", packSize: 24, unitName: "Bottle", gstPct: 28, reorderLevel: 48, purchaseRate: 13.5, saleRate: 17.0, openingPacks: 3, openingLoose: 0 },
        { itemCode: "TU250", itemDesc: "Thums Up 250ml Bottle", hsnCode: "22021030", category: "Soft Drink", brand: "Thums Up", packSize: 24, unitName: "Bottle", gstPct: 28, reorderLevel: 48, purchaseRate: 14.0, saleRate: 18.0, openingPacks: 3, openingLoose: 0 },
        { itemCode: "LM200", itemDesc: "Limca 200ml Bottle", hsnCode: "22021040", category: "Soft Drink", brand: "Limca", packSize: 24, unitName: "Bottle", gstPct: 28, reorderLevel: 48, purchaseRate: 13.0, saleRate: 16.5, openingPacks: 3, openingLoose: 0 },
        { itemCode: "MZ600", itemDesc: "Maaza Mango 600ml Bottle", hsnCode: "20098990", category: "Fruit Drink", brand: "Maaza", packSize: 24, unitName: "Bottle", gstPct: 12, reorderLevel: 24, purchaseRate: 22.0, saleRate: 28.0, openingPacks: 2, openingLoose: 0 },
        { itemCode: "PP200", itemDesc: "Pepsi 200ml Bottle", hsnCode: "22021010", category: "Soft Drink", brand: "Pepsi", packSize: 24, unitName: "Bottle", gstPct: 28, reorderLevel: 48, purchaseRate: 13.5, saleRate: 17.0, openingPacks: 3, openingLoose: 0 },
        { itemCode: "AQ500", itemDesc: "Aquafina Water 500ml Bottle", hsnCode: "22011010", category: "Packaged Water", brand: "Aquafina", packSize: 24, unitName: "Bottle", gstPct: 18, reorderLevel: 48, purchaseRate: 9.5, saleRate: 13.0, openingPacks: 3, openingLoose: 0 },
        { itemCode: "BSL1L", itemDesc: "Bisleri Water 1L Bottle", hsnCode: "22011010", category: "Packaged Water", brand: "Bisleri", packSize: 12, unitName: "Bottle", gstPct: 18, reorderLevel: 24, purchaseRate: 16.0, saleRate: 20.0, openingPacks: 2, openingLoose: 0 },
        { itemCode: "RB250", itemDesc: "Red Bull Energy Drink 250ml Can", hsnCode: "22029920", category: "Energy Drink", brand: "Red Bull", packSize: 24, unitName: "Can", gstPct: 28, reorderLevel: 24, purchaseRate: 85.0, saleRate: 110.0, openingPacks: 2, openingLoose: 0 },
    ];

    const items: Record<string, { id: number; packSize: number; gstPct: number }> = {};
    const rateByCode: Record<string, { purchaseRate: number; saleRate: number }> = {};

    for (const seed of itemSeeds) {
        const created = await prisma.itemMaster.create({
            data: {
                itemCode: seed.itemCode,
                itemDesc: seed.itemDesc,
                hsnCode: seed.hsnCode,
                category: seed.category,
                brand: seed.brand,
                packSize: seed.packSize,
                unitName: seed.unitName,
                gstPct: seed.gstPct,
                reorderLevel: seed.reorderLevel,
            },
        });

        await prisma.itemStock.create({
            data: { itemId: created.id, currentStockPieces: 0 },
        });

        items[seed.itemCode] = { id: created.id, packSize: seed.packSize, gstPct: seed.gstPct };
        rateByCode[seed.itemCode] = { purchaseRate: seed.purchaseRate, saleRate: seed.saleRate };

        const openingPieces = toPieces(seed.openingPacks, seed.openingLoose, seed.packSize);
        await applyStockMovement({
            itemId: created.id,
            txnDate: new Date("2026-06-01"),
            txnType: StockTxnType.OPENING,
            referenceType: ReferenceType.OPENING,
            qtyIn: openingPieces,
            unitCost: seed.purchaseRate,
            remarks: "Opening stock balance",
            createdById: admin.id,
        });
    }

    // -------------------------------------------------------------------
    // Purchase Orders
    // -------------------------------------------------------------------
    console.log("Seeding purchase orders...");

    type POLine = { itemCode: string; packQty: number; looseQty: number; discountPct: number };

    async function createPurchaseOrder(
        vendorId: number,
        createdById: number,
        poDate: Date,
        invoiceNumber: string,
        lines: POLine[]
    ) {
        const computed = lines.map((line) => {
            const item = items[line.itemCode];
            const rate = rateByCode[line.itemCode].purchaseRate;
            const totalPieces = toPieces(line.packQty, line.looseQty, item.packSize);
            const lineAmount = round2(totalPieces * rate);
            const discountAmount = round2((lineAmount * line.discountPct) / 100);
            const taxable = round2(lineAmount - discountAmount);
            const { cgstPct, sgstPct, cgstAmount, sgstAmount } = gstSplit(taxable, item.gstPct);
            const netAmount = round2(taxable + cgstAmount + sgstAmount);

            return {
                itemId: item.id,
                packQty: line.packQty,
                looseQty: line.looseQty,
                totalPieces,
                purchaseRate: rate,
                lineAmount,
                discountPct: line.discountPct,
                discountAmount,
                cgstPct,
                cgstAmount,
                sgstPct,
                sgstAmount,
                netAmount,
            };
        });

        const totals = computed.reduce(
            (acc, d) => ({
                totalAmount: round2(acc.totalAmount + d.lineAmount),
                discountAmount: round2(acc.discountAmount + d.discountAmount),
                cgstAmount: round2(acc.cgstAmount + d.cgstAmount),
                sgstAmount: round2(acc.sgstAmount + d.sgstAmount),
                netAmount: round2(acc.netAmount + d.netAmount),
            }),
            { totalAmount: 0, discountAmount: 0, cgstAmount: 0, sgstAmount: 0, netAmount: 0 }
        );

        const po = await prisma.poHdr.create({
            data: {
                poDate,
                invoiceNumber,
                vendorId,
                createdById,
                ...totals,
                details: { create: computed },
            },
            include: { details: true },
        });

        for (const d of computed) {
            await applyStockMovement({
                itemId: d.itemId,
                txnDate: poDate,
                txnType: StockTxnType.PURCHASE,
                referenceType: ReferenceType.PO,
                referenceId: po.id,
                qtyIn: d.totalPieces,
                unitCost: d.purchaseRate,
                remarks: `Purchase via invoice ${invoiceNumber}`,
                createdById,
            });
        }

        return po;
    }

    await createPurchaseOrder(vendor1.id, manager.id, new Date("2026-06-05"), "HCCB/2026/0451", [
        { itemCode: "CC200", packQty: 10, looseQty: 0, discountPct: 2 },
        { itemCode: "CC750", packQty: 10, looseQty: 0, discountPct: 2 },
        { itemCode: "SP200", packQty: 10, looseQty: 0, discountPct: 2 },
        { itemCode: "TU250", packQty: 10, looseQty: 0, discountPct: 2 },
        { itemCode: "LM200", packQty: 10, looseQty: 0, discountPct: 2 },
        { itemCode: "MZ600", packQty: 10, looseQty: 6, discountPct: 2 },
    ]);

    await createPurchaseOrder(vendor2.id, manager.id, new Date("2026-06-08"), "VBL/INV/3320", [
        { itemCode: "PP200", packQty: 10, looseQty: 0, discountPct: 1.5 },
        { itemCode: "AQ500", packQty: 10, looseQty: 5, discountPct: 1.5 },
    ]);

    await createPurchaseOrder(vendor3.id, manager.id, new Date("2026-06-10"), "BISL/2026/00987", [
        { itemCode: "BSL1L", packQty: 15, looseQty: 0, discountPct: 0 },
    ]);

    await createPurchaseOrder(vendor4.id, manager.id, new Date("2026-06-12"), "RBI/SUP/2026/118", [
        { itemCode: "RB250", packQty: 8, looseQty: 12, discountPct: 0 },
    ]);

    // -------------------------------------------------------------------
    // Damages (placed after the relevant POs so stock actually exists)
    // -------------------------------------------------------------------
    console.log("Seeding damage entries...");

    async function createDamage(
        itemCode: string,
        packQty: number,
        looseQty: number,
        reason: string,
        damageDate: Date,
        createdById: number
    ) {
        const item = items[itemCode];
        const totalPieces = toPieces(packQty, looseQty, item.packSize);
        const estimatedLoss = round2(totalPieces * rateByCode[itemCode].purchaseRate);

        const damage = await prisma.damage.create({
            data: {
                damageDate,
                itemId: item.id,
                packQty,
                looseQty,
                totalPieces,
                reason,
                estimatedLoss,
                createdById,
            },
        });

        await applyStockMovement({
            itemId: item.id,
            txnDate: damageDate,
            txnType: StockTxnType.DAMAGE,
            referenceType: ReferenceType.DAMAGE,
            referenceId: damage.id,
            qtyOut: totalPieces,
            unitCost: rateByCode[itemCode].purchaseRate,
            remarks: reason,
            createdById,
        });

        return damage;
    }

    await createDamage("RB250", 1, 0, "Cans dented and leaking during transit", new Date("2026-06-13"), salesman2.id);
    await createDamage("CC200", 1, 2, "Bottles broken during warehouse handling", new Date("2026-06-20"), salesman1.id);

    // -------------------------------------------------------------------
    // Sales Bills
    // -------------------------------------------------------------------
    console.log("Seeding sales bills...");

    type BillLine = { itemCode: string; packQty: number; looseQty: number; discountPct: number };

    async function createSalesBill(
        customerId: number,
        createdById: number,
        billDate: Date,
        paymentStatus: PaymentStatus,
        lines: BillLine[]
    ) {
        const computed = lines.map((line) => {
            const item = items[line.itemCode];
            const rate = rateByCode[line.itemCode].saleRate;
            const totalPieces = toPieces(line.packQty, line.looseQty, item.packSize);
            const lineAmount = round2(totalPieces * rate);
            const discountAmount = round2((lineAmount * line.discountPct) / 100);
            const taxable = round2(lineAmount - discountAmount);
            const { cgstPct, sgstPct, cgstAmount, sgstAmount } = gstSplit(taxable, item.gstPct);
            const netAmount = round2(taxable + cgstAmount + sgstAmount);

            return {
                itemId: item.id,
                packQty: line.packQty,
                looseQty: line.looseQty,
                totalPieces,
                saleRate: rate,
                lineAmount,
                discountPct: line.discountPct,
                discountAmount,
                cgstPct,
                sgstPct,
                cgstAmount,
                sgstAmount,
                netAmount,
            };
        });

        const totals = computed.reduce(
            (acc, d) => ({
                totalAmount: round2(acc.totalAmount + d.lineAmount),
                discountAmount: round2(acc.discountAmount + d.discountAmount),
                cgstAmount: round2(acc.cgstAmount + d.cgstAmount),
                sgstAmount: round2(acc.sgstAmount + d.sgstAmount),
                netAmount: round2(acc.netAmount + d.netAmount),
            }),
            { totalAmount: 0, discountAmount: 0, cgstAmount: 0, sgstAmount: 0, netAmount: 0 }
        );

        const bill = await prisma.billHdr.create({
            data: {
                billDate,
                customerId,
                createdById,
                paymentStatus,
                ...totals,
                details: { create: computed },
            },
            include: { details: true },
        });

        for (const d of computed) {
            await applyStockMovement({
                itemId: d.itemId,
                txnDate: billDate,
                txnType: StockTxnType.SALE,
                referenceType: ReferenceType.BILL,
                referenceId: bill.id,
                qtyOut: d.totalPieces,
                unitPrice: d.saleRate,
                remarks: `Sale via bill #${bill.id}`,
                createdById,
            });
        }

        return bill;
    }

    await createSalesBill(customer1.id, salesman1.id, new Date("2026-06-15"), PaymentStatus.PAID, [
        { itemCode: "CC200", packQty: 2, looseQty: 5, discountPct: 0 },
        { itemCode: "SP200", packQty: 1, looseQty: 10, discountPct: 0 },
        { itemCode: "AQ500", packQty: 2, looseQty: 0, discountPct: 0 },
    ]);

    await createSalesBill(customer2.id, salesman1.id, new Date("2026-06-18"), PaymentStatus.PARTIAL, [
        { itemCode: "TU250", packQty: 2, looseQty: 0, discountPct: 1 },
        { itemCode: "LM200", packQty: 1, looseQty: 8, discountPct: 1 },
        { itemCode: "RB250", packQty: 1, looseQty: 4, discountPct: 0 },
    ]);

    await createSalesBill(customer3.id, salesman2.id, new Date("2026-06-20"), PaymentStatus.PAID, [
        { itemCode: "PP200", packQty: 3, looseQty: 0, discountPct: 2 },
        { itemCode: "BSL1L", packQty: 2, looseQty: 0, discountPct: 0 },
        { itemCode: "MZ600", packQty: 1, looseQty: 10, discountPct: 0 },
    ]);

    await createSalesBill(customer4.id, salesman2.id, new Date("2026-06-22"), PaymentStatus.PENDING, [
        { itemCode: "CC750", packQty: 2, looseQty: 0, discountPct: 0 },
        { itemCode: "RB250", packQty: 1, looseQty: 0, discountPct: 0 },
        { itemCode: "AQ500", packQty: 1, looseQty: 6, discountPct: 0 },
    ]);

    await createSalesBill(customer5.id, salesman1.id, new Date("2026-06-24"), PaymentStatus.PAID, [
        { itemCode: "CC200", packQty: 1, looseQty: 12, discountPct: 0 },
        { itemCode: "SP200", packQty: 1, looseQty: 0, discountPct: 0 },
        { itemCode: "LM200", packQty: 1, looseQty: 0, discountPct: 0 },
    ]);

    // -------------------------------------------------------------------
    // Discount schemes
    // -------------------------------------------------------------------
    console.log("Seeding discount schemes...");

    // Buy 10 packs of Coca-Cola 200ml, get 1 pack free (self-item, PER_PACK)
    await prisma.discount.create({
        data: {
            onItemId: items["CC200"].id,
            discountedItemId: items["CC200"].id,
            perAttribute: DiscountAttribute.PER_PACK,
            attributeQty: 10,
            discountedAttribute: DiscountAttribute.PER_PACK,
            discountedQty: 1,
            startDate: new Date("2026-06-01"),
            endDate: new Date("2026-07-31"),
            isActive: true,
            createdById: admin.id,
        },
    });

    // Buy 24 pieces of Red Bull, get 2 Aquafina bottles free (cross-item, PER_ITEM)
    await prisma.discount.create({
        data: {
            onItemId: items["RB250"].id,
            discountedItemId: items["AQ500"].id,
            perAttribute: DiscountAttribute.PER_ITEM,
            attributeQty: 24,
            discountedAttribute: DiscountAttribute.PER_ITEM,
            discountedQty: 2,
            startDate: new Date("2026-06-01"),
            endDate: new Date("2026-06-30"),
            isActive: true,
            createdById: admin.id,
        },
    });

    // Buy 5 packs of Maaza, get 1 pack discounted (self-item, PER_PACK)
    await prisma.discount.create({
        data: {
            onItemId: items["MZ600"].id,
            discountedItemId: items["MZ600"].id,
            perAttribute: DiscountAttribute.PER_PACK,
            attributeQty: 5,
            discountedAttribute: DiscountAttribute.PER_PACK,
            discountedQty: 1,
            startDate: new Date("2026-06-15"),
            endDate: new Date("2026-07-15"),
            isActive: true,
            createdById: admin.id,
        },
    });

    // Expired scheme — demonstrates PER_AMOUNT + isActive: false
    await prisma.discount.create({
        data: {
            onItemId: items["CC750"].id,
            discountedItemId: items["CC750"].id,
            perAttribute: DiscountAttribute.PER_AMOUNT,
            attributeQty: 2000,
            discountedAttribute: DiscountAttribute.PER_AMOUNT,
            discountedQty: 100,
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-03-31"),
            isActive: false,
            createdById: admin.id,
            updatedById: admin.id,
        },
    });

    const summary = {
        users: 4,
        vendors: 4,
        customers: 5,
        items: itemSeeds.length,
        purchaseOrders: 4,
        salesBills: 5,
        damages: 2,
        discounts: 4,
    };

    console.log("Seed complete:", summary);
    return summary;
}