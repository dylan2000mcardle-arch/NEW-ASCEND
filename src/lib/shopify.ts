const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN!;
const ENDPOINT = `https://${DOMAIN}/api/2024-01/graphql.json`;

async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? "Storefront API error");
  return json.data as T;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ShopifyVariant {
  id: string;
  price: Money;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariantFull {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  /** Merchant-set "was" price. Only present when on sale. */
  compareAtPrice: Money | null;
  selectedOptions: SelectedOption[];
  image: ShopifyImage | null;
}

export interface ShopifyOption {
  name: string;
  values: string[];
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyProductCard {
  handle: string;
  title: string;
  description: string;
  featuredImage: ShopifyImage | null;
  price: Money;
  availableForSale: boolean;
}

export interface ShopifyProduct extends ShopifyProductCard {
  descriptionHtml: string;
  images: ShopifyImage[];
  /** First/default variant id — fallback when no variant is selected. */
  variantId: string;
  options: ShopifyOption[];
  variants: ShopifyVariantFull[];
}

interface ProductData {
  productByHandle: {
    title: string;
    variants: { edges: { node: ShopifyVariant }[] };
  } | null;
}

export async function getProductVariant(handle: string): Promise<ShopifyVariant | null> {
  const data = await storefront<ProductData>(
    `query GetProduct($handle: String!) {
      productByHandle(handle: $handle) {
        title
        variants(first: 1) {
          edges { node { id price { amount currencyCode } } }
        }
      }
    }`,
    { handle }
  );
  return data.productByHandle?.variants.edges[0]?.node ?? null;
}

export interface ProductMeta {
  price: Money;
  image: ShopifyImage | null;
}

interface MetaData {
  productByHandle: {
    featuredImage: ShopifyImage | null;
    variants: { edges: { node: { price: Money } }[] };
  } | null;
}

/** Lightweight fetch for cart/quiz thumbnails — price + featured image. */
export async function getProductMeta(handle: string): Promise<ProductMeta | null> {
  const data = await storefront<MetaData>(
    `query GetMeta($handle: String!) {
      productByHandle(handle: $handle) {
        featuredImage { url altText }
        variants(first: 1) { edges { node { price { amount currencyCode } } } }
      }
    }`,
    { handle }
  );
  const p = data.productByHandle;
  const price = p?.variants.edges[0]?.node.price;
  if (!p || !price) return null;
  return { price, image: p.featuredImage };
}

interface ProductCardNode {
  handle: string;
  title: string;
  description: string;
  featuredImage: ShopifyImage | null;
  availableForSale: boolean;
  priceRange: { minVariantPrice: Money };
}

interface AllProductsData {
  products: { edges: { node: ProductCardNode }[] };
}

function toCard(node: ProductCardNode): ShopifyProductCard {
  return {
    handle: node.handle,
    title: node.title,
    description: node.description,
    featuredImage: node.featuredImage,
    availableForSale: node.availableForSale,
    price: node.priceRange.minVariantPrice,
  };
}

/** All products for the shop grid. */
export async function getAllProducts(): Promise<ShopifyProductCard[]> {
  const data = await storefront<AllProductsData>(
    `query AllProducts {
      products(first: 20, sortKey: TITLE) {
        edges {
          node {
            handle
            title
            description
            availableForSale
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
          }
        }
      }
    }`
  );
  return data.products.edges.map((e) => toCard(e.node));
}

interface FullProductData {
  productByHandle:
    | (ProductCardNode & {
        descriptionHtml: string;
        images: { edges: { node: ShopifyImage }[] };
        options: ShopifyOption[];
        variants: { edges: { node: ShopifyVariantFull }[] };
      })
    | null;
}

/** Full product for the detail page. */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefront<FullProductData>(
    `query Product($handle: String!) {
      productByHandle(handle: $handle) {
        handle
        title
        description
        descriptionHtml
        availableForSale
        featuredImage { url altText }
        images(first: 8) { edges { node { url altText } } }
        priceRange { minVariantPrice { amount currencyCode } }
        options { name values }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              selectedOptions { name value }
              image { url altText }
            }
          }
        }
      }
    }`,
    { handle }
  );
  const p = data.productByHandle;
  if (!p) return null;
  const variants = p.variants.edges.map((e) => e.node);
  const variantId = variants[0]?.id;
  if (!variantId) return null;
  return {
    ...toCard(p),
    descriptionHtml: p.descriptionHtml,
    images: p.images.edges.map((e) => e.node),
    variantId,
    options: p.options,
    variants,
  };
}

interface CartData {
  cartCreate: {
    cart: { checkoutUrl: string } | null;
    userErrors: { message: string }[];
  };
}

export interface CheckoutLine {
  variantId: string;
  quantity: number;
}

export async function createCheckout(items: CheckoutLine[]): Promise<string> {
  const lines = items.map((l) => ({ merchandiseId: l.variantId, quantity: l.quantity }));
  const data = await storefront<CartData>(
    `mutation CartCreate($lines: [CartLineInput!]!) {
      cartCreate(input: { lines: $lines }) {
        cart { checkoutUrl }
        userErrors { message }
      }
    }`,
    { lines }
  );
  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length) throw new Error(userErrors[0].message);
  if (!cart?.checkoutUrl) throw new Error("No checkout URL returned");
  return cart.checkoutUrl;
}
