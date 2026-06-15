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

export interface ShopifyVariant {
  id: string;
  price: { amount: string; currencyCode: string };
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

interface CartData {
  cartCreate: {
    cart: { checkoutUrl: string } | null;
    userErrors: { message: string }[];
  };
}

export async function createCheckout(variantIds: string[]): Promise<string> {
  const lines = variantIds.map((id) => ({ merchandiseId: id, quantity: 1 }));
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
