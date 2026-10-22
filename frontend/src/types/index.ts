export type PriceTier = {
  id: string;
  quantity: number;
  pricePer100: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  material: string;
  finish: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  tiers: PriceTier[];
};

export type Category = {
  slug: string;
  count: number;
};

export type CardTemplate = "classic" | "minimal" | "bold" | "elegant";

export type CardText = {
  name: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
};

export type CardCustomization = {
  template: CardTemplate;
  bg: string;
  accent: string;
  font: string;
  text: CardText;
};

export type CartItem = {
  key: string;
  productSlug: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  custom: CardCustomization;
};

export type OrderPayload = {
  email: string;
  fullName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  items: {
    productSlug: string;
    quantity: number;
    custom: CardCustomization;
  }[];
};

export type OrderResponse = {
  reference: string;
  checkoutUrl: string | null;
  isDemo: boolean;
  status: string;
  total: number;
};

export type OrderDetail = {
  reference: string;
  status: string;
  totals: { subtotal: number; shipping: number; total: number };
  isDemo: boolean;
  paymentMethod: string;
  createdAt: string;
  email: string;
  fullName: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    custom: Partial<CardCustomization>;
  }[];
};
