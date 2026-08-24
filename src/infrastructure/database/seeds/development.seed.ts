import fs from 'fs';
import path from 'path';
import { CustomLoggerService } from '../../../config/logger';
import {
  AddressLine1,
  AddressType,
  City,
  PostalCode,
} from '../../../domains/address/aggregates/value-objects';
import {
  AccountType,
  Email,
  Password,
} from '../../../domains/authentication/aggregates/value-objects';
import {
  Brand,
  Manufacturer,
  Price,
  SKU,
  Tags,
  Type,
  Weight,
} from '../../../domains/product/aggregates/value-objects';
import {
  Id,
  Name,
  PhoneNumber,
  ShortDescription,
} from '../../../domains/shared/value-objects';
import { LongDescription } from '../../../domains/shared/value-objects/long-description.vo';
import { Media } from '../../../domains/shared/value-objects/media.vo';
import {
  Currency,
  Domain,
} from '../../../domains/tenant/aggregates/value-objects';
import { PostgreService } from '../postgres.service';

const logger = new CustomLoggerService();
const dataDir = path.join(__dirname, '..', 'countries');

export const developmentSeedPassword = 'EasyStoreDev123!';

export const developmentSeedAccounts = [
  { email: 'owner@easystore.lat', accountType: 'TENANT' },
  { email: 'customer@easystore.lat', accountType: 'CUSTOMER' },
  { email: 'manager@easystore.lat', accountType: 'EMPLOYEE' },
] as const;

export const developmentSeedPasswordHash =
  '$2b$10$P2d7dp29uQyDPINXmrduAOVzn4..nJr8bRGzcv09ya7lUoIommgyG';

export function createDevelopmentFixtureIds(): Record<
  | 'tenantAuth'
  | 'tenant'
  | 'customerAuth'
  | 'customer'
  | 'employeeRole'
  | 'employee'
  | 'plan'
  | 'subscription'
  | 'tenantPhone'
  | 'customerPhone'
  | 'warehouseAddress'
  | 'customerAddress'
  | 'warehouse'
  | 'category'
  | 'product'
  | 'variant'
  | 'media'
  | 'dimension'
  | 'attribute'
  | 'installment'
  | 'sustainability'
  | 'warranty'
  | 'productCategory'
  | 'taxRate'
  | 'shippingRule'
  | 'shipmentRate'
  | 'stock'
  | 'stockMovement'
  | 'promotion'
  | 'coupon'
  | 'cart'
  | 'cartItem'
  | 'cartPromotion'
  | 'order'
  | 'orderDetail'
  | 'orderPromotion'
  | 'couponUsage'
  | 'return'
  | 'tenantPaymentMethod'
  | 'customerPaymentMethod'
  | 'payment'
  | 'wishList'
  | 'review'
  | 'feature'
  | 'roleFeature',
  string
> {
  return {
    tenantAuth: Id.generate().getValue(),
    tenant: Id.generate().getValue(),
    customerAuth: Id.generate().getValue(),
    customer: Id.generate().getValue(),
    employeeRole: Id.generate().getValue(),
    employee: Id.generate().getValue(),
    plan: Id.generate().getValue(),
    subscription: Id.generate().getValue(),
    tenantPhone: Id.generate().getValue(),
    customerPhone: Id.generate().getValue(),
    warehouseAddress: Id.generate().getValue(),
    customerAddress: Id.generate().getValue(),
    warehouse: Id.generate().getValue(),
    category: Id.generate().getValue(),
    product: Id.generate().getValue(),
    variant: Id.generate().getValue(),
    media: Id.generate().getValue(),
    dimension: Id.generate().getValue(),
    attribute: Id.generate().getValue(),
    installment: Id.generate().getValue(),
    sustainability: Id.generate().getValue(),
    warranty: Id.generate().getValue(),
    productCategory: Id.generate().getValue(),
    taxRate: Id.generate().getValue(),
    shippingRule: Id.generate().getValue(),
    shipmentRate: Id.generate().getValue(),
    stock: Id.generate().getValue(),
    stockMovement: Id.generate().getValue(),
    promotion: Id.generate().getValue(),
    coupon: Id.generate().getValue(),
    cart: Id.generate().getValue(),
    cartItem: Id.generate().getValue(),
    cartPromotion: Id.generate().getValue(),
    order: Id.generate().getValue(),
    orderDetail: Id.generate().getValue(),
    orderPromotion: Id.generate().getValue(),
    couponUsage: Id.generate().getValue(),
    return: Id.generate().getValue(),
    tenantPaymentMethod: Id.generate().getValue(),
    customerPaymentMethod: Id.generate().getValue(),
    payment: Id.generate().getValue(),
    wishList: Id.generate().getValue(),
    review: Id.generate().getValue(),
    feature: Id.generate().getValue(),
    roleFeature: Id.generate().getValue(),
  };
}

export function validateDevelopmentFixtures(): void {
  developmentSeedAccounts.forEach(({ email, accountType }) => {
    Email.create(email);
    AccountType.create(accountType);
  });
  Password.create(developmentSeedPassword);
  Domain.create('demo.easystore.lat');
  Currency.create('GTQ');
  [
    'EasyStore Demo',
    'Demo Owner',
    'Demo Customer',
    'Demo Warehouse',
    'Home',
    'Central Warehouse',
    'Home Office',
    'Ergonomic Desk Chair',
  ].forEach((name) => Name.create(name));
  ['+50255550101', '+50255550102'].forEach((phoneNumber) =>
    PhoneNumber.create(phoneNumber),
  );
  ['12 Avenida 4-20', '6a Calle 7-15'].forEach((addressLine1) =>
    AddressLine1.create(addressLine1),
  );
  ['01010', '01009'].forEach((postalCode) => PostalCode.create(postalCode));
  City.create('Guatemala City');
  AddressType.create('WAREHOUSE');
  AddressType.create('SHIPPING');
  ShortDescription.create('Adjustable chair for daily work');
  LongDescription.create('Breathable mesh chair with lumbar support.');
  Media.createCover(
    'https://images.unsplash.com/photo-1505843490701-5d5d9f0c7034',
  );
  Brand.create('EasyStore');
  Manufacturer.create('Demo Furnishings');
  Tags.create(['office', 'chair', 'ergonomic']);
  Type.create('PHYSICAL');
  Price.create(1899.99);
  SKU.create('DEMO-CHAIR-BLK');
  Weight.create(14.5);
}

interface StateData {
  name: string;
  code: string;
}
interface CountryFileData {
  country: { name: string; code: string };
  states: StateData[];
}
interface GeographyIds {
  countryId: string;
  stateId: string;
}

async function seedGeography(prisma: PostgreService): Promise<GeographyIds> {
  const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.endsWith('.json'));

  let guatemala: GeographyIds | null = null;

  for (const file of files) {
    const data = JSON.parse(
      fs.readFileSync(path.join(dataDir, file), 'utf-8'),
    ) as CountryFileData;
    const existingCountry = await prisma.country.findUnique({
      where: { code: data.country.code },
    });
    const countryId = existingCountry?.id ?? Id.generate().getValue();

    await prisma.country.upsert({
      where: { id: countryId },
      update: { name: data.country.name, code: data.country.code },
      create: {
        id: countryId,
        name: data.country.name,
        code: data.country.code,
      },
    });

    for (const state of data.states) {
      const existingState = await prisma.state.findFirst({
        where: { code: state.code, countryId },
      });
      const stateId = existingState?.id ?? Id.generate().getValue();

      await prisma.state.upsert({
        where: { id: stateId },
        update: { name: state.name, code: state.code, countryId },
        create: { id: stateId, name: state.name, code: state.code, countryId },
      });

      if (data.country.code === 'GT' && state.code === 'GU') {
        guatemala = { countryId, stateId };
      }
    }
  }

  if (!guatemala) {
    throw new Error(
      'Guatemala geography fixtures are required for development data.',
    );
  }

  return guatemala;
}

async function seedDevelopmentDataForDatabase(
  prisma: PostgreService,
  geography: GeographyIds,
): Promise<void> {
  const ids = createDevelopmentFixtureIds();

  await prisma.authIdentity.upsert({
    where: { id: ids.tenantAuth },
    update: {
      email: developmentSeedAccounts[0].email,
      password: developmentSeedPasswordHash,
      accountType: 'TENANT',
      emailVerified: true,
    },
    create: {
      id: ids.tenantAuth,
      email: developmentSeedAccounts[0].email,
      password: developmentSeedPasswordHash,
      accountType: 'TENANT',
      emailVerified: true,
    },
  });
  await prisma.tenant.upsert({
    where: { id: ids.tenant },
    update: {
      businessName: 'EasyStore Demo',
      ownerName: 'Demo Owner',
      domain: 'demo.easystore.local',
      currency: 'GTQ',
      authIdentityId: ids.tenantAuth,
    },
    create: {
      id: ids.tenant,
      businessName: 'EasyStore Demo',
      ownerName: 'Demo Owner',
      domain: 'demo.easystore.local',
      currency: 'GTQ',
      authIdentityId: ids.tenantAuth,
    },
  });
  await prisma.authIdentity.upsert({
    where: { id: ids.customerAuth },
    update: {
      email: developmentSeedAccounts[1].email,
      password: developmentSeedPasswordHash,
      accountType: 'CUSTOMER',
      emailVerified: true,
    },
    create: {
      id: ids.customerAuth,
      email: developmentSeedAccounts[1].email,
      password: developmentSeedPasswordHash,
      accountType: 'CUSTOMER',
      emailVerified: true,
    },
  });
  await prisma.customer.upsert({
    where: { id: ids.customer },
    update: {
      name: 'Demo Customer',
      tenantId: ids.tenant,
      authIdentityId: ids.customerAuth,
    },
    create: {
      id: ids.customer,
      name: 'Demo Customer',
      tenantId: ids.tenant,
      authIdentityId: ids.customerAuth,
    },
  });
  await prisma.plan.upsert({
    where: { id: ids.plan },
    update: {
      name: 'Demo Growth',
      description: 'Development subscription plan',
      price: 199,
    },
    create: {
      id: ids.plan,
      name: 'Demo Growth',
      description: 'Development subscription plan',
      price: 199,
    },
  });
  await prisma.subscription.upsert({
    where: { id: ids.subscription },
    update: {
      status: 'ACTIVE',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      planId: ids.plan,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.subscription,
      status: 'ACTIVE',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      planId: ids.plan,
      tenantId: ids.tenant,
    },
  });
  await prisma.phoneNumber.upsert({
    where: { id: ids.tenantPhone },
    update: { number: '+50255550101', tenantId: ids.tenant },
    create: {
      id: ids.tenantPhone,
      number: '+50255550101',
      tenantId: ids.tenant,
    },
  });
  await prisma.phoneNumber.upsert({
    where: { id: ids.customerPhone },
    update: { number: '+50255550102', customerId: ids.customer },
    create: {
      id: ids.customerPhone,
      number: '+50255550102',
      customerId: ids.customer,
    },
  });
  await prisma.address.upsert({
    where: { id: ids.warehouseAddress },
    update: {
      name: 'Demo Warehouse',
      addressLine1: '12 Avenida 4-20',
      postalCode: '01010',
      city: 'Guatemala City',
      countryId: geography.countryId,
      stateId: geography.stateId,
      addressType: 'WAREHOUSE',
      deliveryNum: '4-20',
      tenantId: ids.tenant,
    },
    create: {
      id: ids.warehouseAddress,
      name: 'Demo Warehouse',
      addressLine1: '12 Avenida 4-20',
      postalCode: '01010',
      city: 'Guatemala City',
      countryId: geography.countryId,
      stateId: geography.stateId,
      addressType: 'WAREHOUSE',
      deliveryNum: '4-20',
      tenantId: ids.tenant,
    },
  });
  await prisma.address.upsert({
    where: { id: ids.customerAddress },
    update: {
      name: 'Home',
      addressLine1: '6a Calle 7-15',
      postalCode: '01009',
      city: 'Guatemala City',
      countryId: geography.countryId,
      stateId: geography.stateId,
      addressType: 'SHIPPING',
      deliveryNum: '7-15',
      customerId: ids.customer,
    },
    create: {
      id: ids.customerAddress,
      name: 'Home',
      addressLine1: '6a Calle 7-15',
      postalCode: '01009',
      city: 'Guatemala City',
      countryId: geography.countryId,
      stateId: geography.stateId,
      addressType: 'SHIPPING',
      deliveryNum: '7-15',
      customerId: ids.customer,
    },
  });
  await prisma.tenant.update({
    where: { id: ids.tenant },
    data: {
      defaultPhoneNumberId: ids.tenantPhone,
      defaultShippingAddressId: ids.warehouseAddress,
      defaultBillingAddressId: ids.warehouseAddress,
    },
  });
  await prisma.customer.update({
    where: { id: ids.customer },
    data: {
      defaultPhoneNumberId: ids.customerPhone,
      defaultShippingAddressId: ids.customerAddress,
      defaultBillingAddressId: ids.customerAddress,
    },
  });
  await prisma.feature.upsert({
    where: { id: ids.feature },
    update: {
      code: 'CATALOG',
      name: 'Catalog',
      description: 'Manage products and inventory',
    },
    create: {
      id: ids.feature,
      code: 'CATALOG',
      name: 'Catalog',
      description: 'Manage products and inventory',
    },
  });
  await prisma.employeeRole.upsert({
    where: { id: ids.employeeRole },
    update: { role: 'MANAGER', tenantId: ids.tenant },
    create: { id: ids.employeeRole, role: 'MANAGER', tenantId: ids.tenant },
  });
  await prisma.roleFeatures.upsert({
    where: { id: ids.roleFeature },
    update: { roleId: ids.employeeRole, featureId: ids.feature },
    create: {
      id: ids.roleFeature,
      roleId: ids.employeeRole,
      featureId: ids.feature,
    },
  });
  await prisma.authIdentity.upsert({
    where: { id: ids.employee },
    update: {
      email: developmentSeedAccounts[2].email,
      password: developmentSeedPasswordHash,
      accountType: 'EMPLOYEE',
      emailVerified: true,
    },
    create: {
      id: ids.employee,
      email: developmentSeedAccounts[2].email,
      password: developmentSeedPasswordHash,
      accountType: 'EMPLOYEE',
      emailVerified: true,
    },
  });
  await prisma.employee.upsert({
    where: { id: ids.employee },
    update: {
      name: 'Demo Manager',
      roleId: ids.employeeRole,
      authIdentityId: ids.employee,
    },
    create: {
      id: ids.employee,
      name: 'Demo Manager',
      roleId: ids.employeeRole,
      authIdentityId: ids.employee,
    },
  });
  await prisma.category.upsert({
    where: { id: ids.category },
    update: {
      name: 'Home Office',
      cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
      description: 'Products for productive workspaces',
      tenantId: ids.tenant,
    },
    create: {
      id: ids.category,
      name: 'Home Office',
      cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
      description: 'Products for productive workspaces',
      tenantId: ids.tenant,
    },
  });
  await prisma.product.upsert({
    where: { id: ids.product },
    update: {
      name: 'Ergonomic Desk Chair',
      shortDescription: 'Adjustable chair for daily work',
      longDescription: 'Breathable mesh chair with lumbar support.',
      productType: 'PHYSICAL',
      cover: 'https://images.unsplash.com/photo-1505843490701-5d5d9f0c7034',
      brand: 'EasyStore',
      manufacturer: 'Demo Furnishings',
      tags: ['office', 'chair', 'ergonomic'],
      tenantId: ids.tenant,
    },
    create: {
      id: ids.product,
      name: 'Ergonomic Desk Chair',
      shortDescription: 'Adjustable chair for daily work',
      longDescription: 'Breathable mesh chair with lumbar support.',
      productType: 'PHYSICAL',
      cover: 'https://images.unsplash.com/photo-1505843490701-5d5d9f0c7034',
      brand: 'EasyStore',
      manufacturer: 'Demo Furnishings',
      tags: ['office', 'chair', 'ergonomic'],
      tenantId: ids.tenant,
    },
  });
  await prisma.productCategories.upsert({
    where: { id: ids.productCategory },
    update: { productId: ids.product, categoryId: ids.category },
    create: {
      id: ids.productCategory,
      productId: ids.product,
      categoryId: ids.category,
    },
  });
  await prisma.variant.upsert({
    where: { id: ids.variant },
    update: {
      price: 1899.99,
      personalizationOptions: ['Assembly'],
      weight: 14.5,
      condition: 'NEW',
      sku: 'DEMO-CHAIR-BLK',
      barcode: 'DEMO-CHAIR-BLK',
      productId: ids.product,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.variant,
      price: 1899.99,
      personalizationOptions: ['Assembly'],
      weight: 14.5,
      condition: 'NEW',
      sku: 'DEMO-CHAIR-BLK',
      barcode: 'DEMO-CHAIR-BLK',
      productId: ids.product,
      tenantId: ids.tenant,
    },
  });
  await prisma.media.upsert({
    where: { id: ids.media },
    update: {
      url: 'https://images.unsplash.com/photo-1505843490701-5d5d9f0c7034',
      position: 0,
      mediaType: 'IMAGE',
      productId: ids.product,
    },
    create: {
      id: ids.media,
      url: 'https://images.unsplash.com/photo-1505843490701-5d5d9f0c7034',
      position: 0,
      mediaType: 'IMAGE',
      productId: ids.product,
    },
  });
  await prisma.dimension.upsert({
    where: { id: ids.dimension },
    update: { length: 70, width: 70, height: 120, variantId: ids.variant },
    create: {
      id: ids.dimension,
      length: 70,
      width: 70,
      height: 120,
      variantId: ids.variant,
    },
  });
  await prisma.attribute.upsert({
    where: { id: ids.attribute },
    update: { key: 'Color', value: 'Black', variantId: ids.variant },
    create: {
      id: ids.attribute,
      key: 'Color',
      value: 'Black',
      variantId: ids.variant,
    },
  });
  await prisma.installmentPayment.upsert({
    where: { id: ids.installment },
    update: { months: 6, interestRate: 0, variantId: ids.variant },
    create: {
      id: ids.installment,
      months: 6,
      interestRate: 0,
      variantId: ids.variant,
    },
  });
  await prisma.sustainability.upsert({
    where: { id: ids.sustainability },
    update: {
      certification: 'FSC',
      recycledPercentage: 35,
      productId: ids.product,
    },
    create: {
      id: ids.sustainability,
      certification: 'FSC',
      recycledPercentage: 35,
      productId: ids.product,
    },
  });
  await prisma.warranty.upsert({
    where: { id: ids.warranty },
    update: {
      months: 24,
      coverage: 'Manufacturing defects',
      instructions: 'Keep proof of purchase.',
      variantId: ids.variant,
    },
    create: {
      id: ids.warranty,
      months: 24,
      coverage: 'Manufacturing defects',
      instructions: 'Keep proof of purchase.',
      variantId: ids.variant,
    },
  });
  await prisma.warehouse.upsert({
    where: { id: ids.warehouse },
    update: {
      name: 'Central Warehouse',
      addressId: ids.warehouseAddress,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.warehouse,
      name: 'Central Warehouse',
      addressId: ids.warehouseAddress,
      tenantId: ids.tenant,
    },
  });
  await prisma.stockPerWarehouse.upsert({
    where: { id: ids.stock },
    update: {
      qtyAvailable: 24,
      qtyReserved: 2,
      productLocation: 'A-03-02',
      serialNumbers: [],
      variantId: ids.variant,
      warehouseId: ids.warehouse,
    },
    create: {
      id: ids.stock,
      qtyAvailable: 24,
      qtyReserved: 2,
      productLocation: 'A-03-02',
      serialNumbers: [],
      variantId: ids.variant,
      warehouseId: ids.warehouse,
    },
  });
  await prisma.stockMovement.upsert({
    where: { id: ids.stockMovement },
    update: {
      deltaQty: 26,
      reason: 'Initial development inventory',
      createdById: ids.employee,
      warehouseId: ids.warehouse,
      stockPerWarehouseId: ids.stock,
    },
    create: {
      id: ids.stockMovement,
      deltaQty: 26,
      reason: 'Initial development inventory',
      createdById: ids.employee,
      warehouseId: ids.warehouse,
      stockPerWarehouseId: ids.stock,
    },
  });
  await prisma.taxRate.upsert({
    where: { id: ids.taxRate },
    update: {
      rate: 12,
      countryId: geography.countryId,
      stateId: geography.stateId,
      categoryId: ids.category,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.taxRate,
      rate: 12,
      countryId: geography.countryId,
      stateId: geography.stateId,
      categoryId: ids.category,
      tenantId: ids.tenant,
    },
  });
  await prisma.shippingRule.upsert({
    where: { id: ids.shippingRule },
    update: {
      type: 'METHOD',
      slug: 'standard-delivery',
      description: 'Standard delivery in Guatemala City',
      priority: 1,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.shippingRule,
      type: 'METHOD',
      slug: 'standard-delivery',
      description: 'Standard delivery in Guatemala City',
      priority: 1,
      tenantId: ids.tenant,
    },
  });
  await prisma.shipmentRate.upsert({
    where: { id: ids.shipmentRate },
    update: {
      fixedRate: 45,
      calculationMethod: 'FIXED',
      shippingRuleId: ids.shippingRule,
      countryId: geography.countryId,
      stateId: geography.stateId,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.shipmentRate,
      fixedRate: 45,
      calculationMethod: 'FIXED',
      shippingRuleId: ids.shippingRule,
      countryId: geography.countryId,
      stateId: geography.stateId,
      tenantId: ids.tenant,
    },
  });
  const promotionData = {
    name: 'Welcome Discount',
    description: 'Ten percent off first purchase',
    type: 'COUPON' as const,
    actionType: 'PERCENTAGE' as const,
    actionValue: 10,
    isStackable: false,
    params: { minimumAmount: 100 },
    priority: 1,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2026-12-31'),
    tenantId: ids.tenant,
  };

  await prisma.promotion.upsert({
    where: { id: ids.promotion },
    update: promotionData,
    create: { id: ids.promotion, ...promotionData },
  });
  await prisma.coupon.upsert({
    where: { id: ids.coupon },
    update: {
      code: 'WELCOME10',
      usageLimit: 100,
      promotionId: ids.promotion,
      customerId: ids.customer,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.coupon,
      code: 'WELCOME10',
      usageLimit: 100,
      promotionId: ids.promotion,
      customerId: ids.customer,
      tenantId: ids.tenant,
    },
  });
  await prisma.cart.upsert({
    where: { id: ids.cart },
    update: { customerId: ids.customer },
    create: { id: ids.cart, customerId: ids.customer },
  });
  await prisma.cartItem.upsert({
    where: { id: ids.cartItem },
    update: {
      qty: 1,
      variantId: ids.variant,
      cartId: ids.cart,
      promotionId: ids.promotion,
    },
    create: {
      id: ids.cartItem,
      qty: 1,
      variantId: ids.variant,
      cartId: ids.cart,
      promotionId: ids.promotion,
    },
  });
  await prisma.cartPromotions.upsert({
    where: { id: ids.cartPromotion },
    update: { cartId: ids.cart, promotionId: ids.promotion },
    create: {
      id: ids.cartPromotion,
      cartId: ids.cart,
      promotionId: ids.promotion,
    },
  });
  await prisma.order.upsert({
    where: { id: ids.order },
    update: {
      orderNumber: 'DEMO-1001',
      status: 'COMPLETED',
      totalAmount: 1754.99,
      customerId: ids.customer,
      cartId: ids.cart,
      addressId: ids.customerAddress,
      tenantId: ids.tenant,
    },
    create: {
      id: ids.order,
      orderNumber: 'DEMO-1001',
      status: 'COMPLETED',
      totalAmount: 1754.99,
      customerId: ids.customer,
      cartId: ids.cart,
      addressId: ids.customerAddress,
      tenantId: ids.tenant,
    },
  });
  await prisma.orderDetail.upsert({
    where: { id: ids.orderDetail },
    update: {
      productName: 'Ergonomic Desk Chair',
      qty: 1,
      unitPrice: 1899.99,
      subtotal: 1899.99,
      orderId: ids.order,
      variantId: ids.variant,
    },
    create: {
      id: ids.orderDetail,
      productName: 'Ergonomic Desk Chair',
      qty: 1,
      unitPrice: 1899.99,
      subtotal: 1899.99,
      orderId: ids.order,
      variantId: ids.variant,
    },
  });
  await prisma.orderPromotions.upsert({
    where: { id: ids.orderPromotion },
    update: { orderId: ids.order, promotionId: ids.promotion },
    create: {
      id: ids.orderPromotion,
      orderId: ids.order,
      promotionId: ids.promotion,
    },
  });
  await prisma.couponUsage.upsert({
    where: { id: ids.couponUsage },
    update: { couponId: ids.coupon, orderId: ids.order },
    create: { id: ids.couponUsage, couponId: ids.coupon, orderId: ids.order },
  });
  await prisma.return.upsert({
    where: { id: ids.return },
    update: {
      returnReason: 'Sample completed return',
      refundAmount: 100,
      variantId: ids.variant,
      orderId: ids.order,
    },
    create: {
      id: ids.return,
      returnReason: 'Sample completed return',
      refundAmount: 100,
      variantId: ids.variant,
      orderId: ids.order,
    },
  });
  await prisma.paymentMethod.upsert({
    where: { id: ids.tenantPaymentMethod },
    update: {
      acceptedPaymentMethods: ['CREDIT_CARD', 'BANK_TRANSFER'],
      tenantId: ids.tenant,
    },
    create: {
      id: ids.tenantPaymentMethod,
      acceptedPaymentMethods: ['CREDIT_CARD', 'BANK_TRANSFER'],
      tenantId: ids.tenant,
    },
  });
  await prisma.paymentMethod.upsert({
    where: { id: ids.customerPaymentMethod },
    update: {
      acceptedPaymentMethods: ['CREDIT_CARD'],
      customerId: ids.customer,
    },
    create: {
      id: ids.customerPaymentMethod,
      acceptedPaymentMethods: ['CREDIT_CARD'],
      customerId: ids.customer,
    },
  });
  await prisma.payment.upsert({
    where: { id: ids.payment },
    update: {
      amount: 1754.99,
      status: 'COMPLETED',
      transactionId: 'demo-payment-1001',
      orderId: ids.order,
      paymentMethodId: ids.customerPaymentMethod,
      subscriptionId: ids.subscription,
    },
    create: {
      id: ids.payment,
      amount: 1754.99,
      status: 'COMPLETED',
      transactionId: 'demo-payment-1001',
      orderId: ids.order,
      paymentMethodId: ids.customerPaymentMethod,
      subscriptionId: ids.subscription,
    },
  });
  await prisma.wishList.upsert({
    where: { id: ids.wishList },
    update: { variantId: ids.variant, customerId: ids.customer },
    create: {
      id: ids.wishList,
      variantId: ids.variant,
      customerId: ids.customer,
    },
  });
  await prisma.customerReviewProduct.upsert({
    where: { id: ids.review },
    update: {
      ratingCount: 4.5,
      comment: 'Comfortable and easy to assemble.',
      customerId: ids.customer,
      variantId: ids.variant,
    },
    create: {
      id: ids.review,
      ratingCount: 4.5,
      comment: 'Comfortable and easy to assemble.',
      customerId: ids.customer,
      variantId: ids.variant,
    },
  });
}

export async function seedDevelopmentData(): Promise<void> {
  validateDevelopmentFixtures();

  const prisma = new PostgreService();
  await prisma.onModuleInit();

  try {
    const geography = await seedGeography(prisma);

    await seedDevelopmentDataForDatabase(prisma, geography);
    logger.log('Development database seed completed.');
  } finally {
    await prisma.onModuleDestroy();
  }
}
