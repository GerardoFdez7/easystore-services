// import { Injectable } from '@nestjs/common';
// import { Product as PrismaProduct, Prisma } from '.prisma/mongodb';
// import { PostgreService } from '@database/postgres.service';
// import { Product } from '../../../aggregates/entities';
// import { IProductRepository } from '../../../aggregates/repositories/product.interface';
// import { ProductMapper } from '../../../application/mappers';
// import { Id, Name, CategoryId } from '../../../aggregates/value-objects';

// @Injectable()
// export class ProductRepository implements IProductRepository {
//   constructor(private readonly prisma: PostgreService) {}

//   // Save (create or update) a product
//   async save(product: Product): Promise<Product> {
//     const id = product.get('id')?.getValue?.();
//     const data: Prisma.ProductCreateInput = {
//       name: product.get('name').getValue(),
//        Category: {
//         connect: (product.get('categoryId') || [])?.map((category) => ({
//           id: category?.getValue(),
//         })),
//       },
//       shortDescription: product.get('shortDescription').getValue(),
//       longDescription: product.get('longDescription')?.getValue() || null,
//       variants: (product.get('variants') || [])?.map((variant) => {
//         const variantValue = variant?.getValue();
//         return {
//           attributes:
//             variantValue?.attributes?.map((attr) => ({
//               key: attr.getKey(),
//               value: attr.getValue(),
//             })) || [],
//           stockPerWarehouse:
//             variantValue.stockPerWarehouse?.map((stock) => stock.getValue()) ||
//             [],
//           price: variantValue.price.getValue(),
//           currency: variantValue.currency.getValue(),
//           variantMedia:
//             variantValue.variantMedia?.map((media) => media.getValue()) || [],
//           personalizationOptions:
//             variantValue.personalizationOptions?.map((option) =>
//               option.getValue(),
//             ) || [],
//           weight: variantValue.weight?.getValue() || null,
//           dimensions: variantValue.dimensions?.getValue() || null,
//           condition: variantValue.condition?.getValue() || null,
//           sku: variantValue.sku?.getValue() || null,
//           upc: variantValue.upc?.getValue() || null,
//           ean: variantValue.ean?.getValue() || null,
//           isbn: variantValue.isbn?.getValue() || null,
//           barcode: variantValue.barcode?.getValue() || null,
//         };
//       }),
//       type: product.get('type').getValue(),
//       cover: product.get('cover').getValue(),
//       media: (product.get('media') || [])?.map((item) => item.getValue()),
//       availableShippingMethods: (
//         product.get('availableShippingMethods') || []
//       )?.map((method) => method.getValue()),
//       shippingRestrictions: (product.get('shippingRestrictions') || [])?.map(
//         (restriction) => restriction.getValue(),
//       ),
//       tags: (product.get('tags') || []).map((tag) => tag.getValue()).flat(),
//       installmentPayments: (product.get('installmentPayments') || [])?.map(
//         (payment) => {
//           const paymentValue = payment.getValue();
//           return {
//             months: paymentValue.months,
//             interestRate: paymentValue.interestRate,
//           };
//         },
//       ),
//       acceptedPaymentMethods: (
//         product.get('acceptedPaymentMethods') || []
//       )?.map((method) => method.getValue()[0]),
//       sustainability: (product.get('sustainability') || null)?.map((item) => {
//         const sustainabilityValue = item.getValue();
//         return {
//           certification: sustainabilityValue.certification,
//           recycledPercentage: sustainabilityValue.recycledPercentage,
//         };
//       }),
//       brand: product.get('brand')?.getValue() || null,
//       manufacturer: product.get('manufacturer')?.getValue() || null,
//       warranty: product.get('warranty')
//         ? {
//             months: product.get('warranty').getValue().months,
//             coverage: product.get('warranty').getValue().coverage,
//             instructions: product.get('warranty').getValue().instructions,
//           }
//         : null,
//       metadata: product.get('metadata')
//         ? {
//             deleted: product.get('metadata').getDeleted(),
//             deletedAt: product.get('metadata')?.getDeletedAt() || null,
//             scheduledForHardDeleteAt:
//               product.get('metadata')?.getScheduledForHardDeleteAt() || null,
//           }
//         : null,
//       createdAt: product.get('createdAt'),
//       updatedAt: product.get('updatedAt'),
//     };
//     let prismaProduct: PrismaProduct;

//     if (id) {
//       prismaProduct = await this.prisma.product.update({
//         where: { id },
//         data,
//       });
//     } else {
//       prismaProduct = await this.prisma.product.create({
//         data,
//       });
//     }
//     return this.mapToDomain(prismaProduct);
//   }

//   // Soft delete a product by its ID
//   async softDelete(id: Id): Promise<void> {
//     const product: PrismaProduct | null = await this.prisma.product.findUnique({
//       where: { id: id.getValue() },
//     });
//     if (!product) return;
//     const now = new Date();
//     const scheduledForHardDeleteAt = new Date(
//       now.getTime() + 30 * 24 * 60 * 60 * 1000,
//     ); // 30 days from now
//     const metadata = {
//       ...product.metadata,
//       deleted: true,
//       deletedAt: now,
//       scheduledForHardDeleteAt,
//     };
//     await this.prisma.product.update({
//       where: { id: id.getValue() },
//       data: {
//         metadata,
//       },
//     });
//   }

//   // Hard delete a product by its ID (permanent deletion)
//   async hardDelete(id: Id): Promise<void> {
//     await this.prisma.product.delete({
//       where: { id: id.getValue() },
//     });
//   }

//   // Restore a soft-deleted product
//   async restore(id: Id): Promise<void> {
//     const product = await this.prisma.product.findUnique({
//       where: { id: id.getValue() },
//     });
//     if (!product) return;
//     await this.prisma.product.update({
//       where: { id: id.getValue() },
//       data: {
//         metadata: {
//           ...product.metadata,
//           deleted: false,
//           deletedAt: null,
//         },
//       },
//     });
//   }

//   // Find a product by its ID
//   async findById(id: Id): Promise<Product | null> {
//     const prismaProduct = await this.prisma.product.findUnique({
//       where: { id: id.getValue() },
//     });
//     if (!prismaProduct) return null;
//     return this.mapToDomain(prismaProduct);
//   }

//   // Find products by name (partial match)
//   async findByName(name: Name, includeSoftDeleted = false): Promise<Product[]> {
//     const whereConditions: Prisma.ProductWhereInput[] = [
//       { name: { contains: name.getValue(), mode: 'insensitive' } },
//     ];

//     if (!includeSoftDeleted) {
//       whereConditions.push({ NOT: { metadata: { deleted: true } } });
//     }

//     const products = await this.prisma.product.findMany({
//       where: { AND: whereConditions },
//     });
//     return products.map((product) => this.mapToDomain(product));
//   }

//   // Find all products with pagination, including option to include soft-deleted items
//   async findAll(
//     page: number,
//     limit: number,
//     categoryId?: CategoryId,
//     includeSoftDeleted = false,
//   ): Promise<{ products: Product[]; total: number }> {
//     const conditions: Prisma.ProductWhereInput[] = [];

//     if (categoryId) {
//       conditions.push({ categoryId: { has: categoryId.getValue() } });
//     }

//     if (!includeSoftDeleted) {
//       conditions.push({ NOT: { metadata: { deleted: true } } });
//     }

//     const whereClause: Prisma.ProductWhereInput =
//       conditions.length > 0 ? { AND: conditions } : {};

//     const [products, total] = await Promise.all([
//       this.prisma.product.findMany({
//         where: whereClause,
//         skip: (page - 1) * limit,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.product.count({ where: whereClause }),
//     ]);
//     return {
//       products: products.map((product) => this.mapToDomain(product)),
//       total,
//     };
//   }

//   // Map from database product to domain product using the centralized mapping approach
//   private mapToDomain(clientPrisma: PrismaProduct): Product {
//     return ProductMapper.fromPersistence(clientPrisma);
//   }
// }
