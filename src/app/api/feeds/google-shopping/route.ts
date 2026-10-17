import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteUrl, getAbsoluteImageUrl, SITE_CONFIG } from "@/lib/seo";

export const dynamic = "force-dynamic";

/**
 * Strips HTML tags and excessive whitespace for plain text feeds
 */
function cleanDescription(text?: string | null): string {
  if (!text) return "Handcrafted authentic Tamil churidar ensemble by THAAGAI.";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  try {
    const siteUrl = getSiteUrl();

    const products = await db.product.findMany({
      where: {
        status: "ACTIVE",
        noindex: false,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { where: { active: true } },
        categories: {
          include: {
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const itemsXml: string[] = [];

    for (const product of products) {
      const description = cleanDescription(product.description || product.shortDescription);
      const categoryName = product.categories[0]?.category?.name || "Churidars";
      const productLink = `${siteUrl}/product/${product.slug}`;

      // Images
      const primaryStorageKey = product.images[0]?.storageKey;
      const primaryImageUrl = primaryStorageKey
        ? getAbsoluteImageUrl(
            primaryStorageKey.startsWith("http")
              ? primaryStorageKey
              : `/uploads/${primaryStorageKey}`
          )
        : `${siteUrl}/categories/straight-cut.svg`;

      const additionalImages = product.images
        .slice(1, 11)
        .map((img) =>
          getAbsoluteImageUrl(
            img.storageKey.startsWith("http")
              ? img.storageKey
              : `/uploads/${img.storageKey}`
          )
        );

      const isCustom = product.productType === "CUSTOM_MADE";
      const baseProductPrice = Number(product.basePrice);
      const saleProductPrice = product.salePrice ? Number(product.salePrice) : null;

      // If product has active variants, create an entry for each variant for accurate size/colour/stock
      const variantsToFeed = product.variants.length > 0 ? product.variants : [null];

      for (const variant of variantsToFeed) {
        const variantId = variant ? (variant.sku || variant.id) : product.sku || product.id;
        const itemId = `${product.id}_${variantId}`;

        // Title
        const titleParts = [product.name];
        if (variant?.size) titleParts.push(`Size ${variant.size}`);
        if (variant?.colour) titleParts.push(variant.colour);
        const itemTitle = titleParts.join(" - ");

        // Price calculations
        const effectiveBasePrice = variant?.priceOverride
          ? Number(variant.priceOverride)
          : baseProductPrice;
        const effectiveSalePrice = variant?.salePriceOverride
          ? Number(variant.salePriceOverride)
          : saleProductPrice;

        const hasSale =
          effectiveSalePrice !== null &&
          effectiveSalePrice < effectiveBasePrice;

        // Stock availability
        const inStock = isCustom || (variant ? variant.stockQuantity > 0 : true);
        const availability = inStock ? "in_stock" : "out_of_stock";

        let itemXml = `    <item>
      <g:id>${escapeXml(itemId)}</g:id>
      <g:title><![CDATA[${itemTitle}]]></g:title>
      <g:description><![CDATA[${description}]]></g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(primaryImageUrl)}</g:image_link>`;

        for (const addImg of additionalImages) {
          itemXml += `\n      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>`;
        }

        itemXml += `\n      <g:availability>${availability}</g:availability>
      <g:price>${effectiveBasePrice.toFixed(2)} INR</g:price>`;

        if (hasSale && effectiveSalePrice !== null) {
          itemXml += `\n      <g:sale_price>${effectiveSalePrice.toFixed(2)} INR</g:sale_price>`;
        }

        itemXml += `\n      <g:brand>${SITE_CONFIG.brandName}</g:brand>
      <g:condition>new</g:condition>
      <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>
      <g:google_product_category>5322</g:google_product_category>
      <g:product_type><![CDATA[${categoryName}]]></g:product_type>`;

        if (variant?.size) {
          itemXml += `\n      <g:size><![CDATA[${variant.size}]]></g:size>`;
        }
        if (variant?.colour) {
          itemXml += `\n      <g:color><![CDATA[${variant.colour}]]></g:color>`;
        }

        itemXml += `\n      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Domestic</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;

        itemsXml.push(itemXml);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${SITE_CONFIG.brandName}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
${itemsXml.join("\n")}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Google Shopping feed generation error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      { status: 500, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
