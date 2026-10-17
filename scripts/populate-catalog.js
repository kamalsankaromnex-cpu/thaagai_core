const { PrismaClient, ProductStatus, ProductType } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting complete Churidar catalog population...");

  // 1. Ensure Categories exist and link proper parent-child tree
  const parentCategory = await prisma.category.upsert({
    where: { slug: "churidars" },
    update: {
      name: "Churidars",
      description: "Authentic ready-to-wear and bespoke made-to-measure churidar suits and sets.",
      imageUrl: "/categories/anarkali.svg",
      sortOrder: 1,
      active: true,
      parentId: null,
    },
    create: {
      name: "Churidars",
      slug: "churidars",
      description: "Authentic ready-to-wear and bespoke made-to-measure churidar suits and sets.",
      imageUrl: "/categories/anarkali.svg",
      sortOrder: 1,
      active: true,
      seoTitle: "Churidars & Suits | THAAGAI",
      seoDescription: "Explore authentic Tamil handloom cotton and festive silk churidars.",
    },
  });
  console.log(`✅ Parent Category: ${parentCategory.name} (${parentCategory.id})`);

  const subCategoriesData = [
    {
      name: "Straight Cut Churidars",
      slug: "straight-cut-churidars",
      description: "Classic straight-cut kurtas paired with matching gathered churidars and elegant dupattas.",
      imageUrl: "/categories/straight-cut.svg",
      sortOrder: 1,
    },
    {
      name: "Anarkali Churidar Suits",
      slug: "anarkali-churidars",
      description: "Flowing festive anarkalis accompanied by gathered churidars and rich dupattas.",
      imageUrl: "/categories/anarkali.svg",
      sortOrder: 2,
    },
    {
      name: "Dailywear Cotton Churidars",
      slug: "cotton-churidars",
      description: "Breathable pure Chettinad and mulmul cotton churidar sets for effortless everyday elegance.",
      imageUrl: "/categories/cotton.svg",
      sortOrder: 3,
    },
    {
      name: "Festive Silk Churidars",
      slug: "silk-churidars",
      description: "Opulent Kanchipuram silk, Chanderi, and raw silk celebration churidar suits with gold zari.",
      imageUrl: "/categories/silk.svg",
      sortOrder: 4,
    },
    {
      name: "Bespoke Tailored Churidars",
      slug: "custom-churidars",
      description: "Made-to-measure churidar sets drafted to your exact height, bust, waist, and pant preferences.",
      imageUrl: "/categories/custom.svg",
      sortOrder: 5,
    },
    {
      name: "Unstitched Churidar Materials",
      slug: "unstitched-materials",
      description: "Authentic 3-piece handloom fabric sets (top, churidar bottom, dupatta) for personalized stitching.",
      imageUrl: "/categories/unstitched.svg",
      sortOrder: 6,
    },
  ];

  const catMap = { churidars: parentCategory.id };
  for (const sub of subCategoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: {
        name: sub.name,
        description: sub.description,
        imageUrl: sub.imageUrl,
        sortOrder: sub.sortOrder,
        parentId: parentCategory.id,
        active: true,
      },
      create: {
        name: sub.name,
        slug: sub.slug,
        description: sub.description,
        imageUrl: sub.imageUrl,
        sortOrder: sub.sortOrder,
        parentId: parentCategory.id,
        active: true,
        seoTitle: `${sub.name} | THAAGAI`,
        seoDescription: sub.description,
      },
    });
    catMap[sub.slug] = c.id;
  }
  console.log("✅ All 6 Churidar subcategories linked to parent Churidars category");

  // Standard sizes helper
  const standardSizes = [
    { size: "S", stock: 12 },
    { size: "M", stock: 16 },
    { size: "L", stock: 14 },
    { size: "XL", stock: 10 },
    { size: "XXL", stock: 8 },
    { size: "3XL", stock: 6 },
  ];

  // 2. Comprehensive Churidar Products
  const catalogProducts = [
    {
      name: "Chettinad Handloom Cotton Straight Churidar Set",
      slug: "chettinad-cotton-straight-churidar",
      sku: "TG-CHU-CC01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 2299,
      salePrice: 1899, // Festive Offer ~17% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["cotton-churidars", "straight-cut-churidars", "churidars"],
      shortDescription: "Pure Chettinad handloom cotton straight kurta with classic gathered churidar and matching dupatta.",
      description: "Crafted from 100% handwoven Chettinad cotton directly from Tamil artisan clusters. Features contrast temple thread borders along the neckline and side slits, breathable all-day comfort, traditional gathered churidar bottom with drawstring, and matching pure cotton dupatta. Includes generous 1.5-inch inner margins for future adjustments.",
      fabricCare: "100% Handloom Cotton. First wash separate in cold water with mild detergent. Shade dry. Warm iron on reverse.",
      shippingInfo: "Dispatched within 24 hours from Tamil Nadu. Free shipping across India. 7-day size exchange.",
      images: [
        { storageKey: "/products/chettinad-cotton-maroon.jpg", altText: "Chettinad Handloom Cotton Straight Churidar in Maroon & Sand", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/embroidery-detail.jpg", altText: "Handloom temple thread border detail", sortOrder: 1, isPrimary: false },
        { storageKey: "/images/product-showcase/thumb-1.jpg", altText: "Chettinad cotton fabric weave detail", sortOrder: 2, isPrimary: false },
      ],
      variants: standardSizes.map((s) => ({
        sku: `TG-CHU-CC01-${s.size}`,
        size: s.size,
        colour: "Temple Maroon & Sand",
        stockQuantity: s.stock,
      })),
    },
    {
      name: "Festive Chanderi Silk Anarkali Churidar Suit",
      slug: "festive-chanderi-anarkali-suit",
      sku: "TG-CHU-ANK01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 4200,
      salePrice: 3499, // Festive Offer ~17% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["anarkali-churidars", "silk-churidars", "churidars"],
      shortDescription: "Flowing 3-piece Chanderi silk anarkali suit with antique gold zari micro-buttas and gathered churidar.",
      description: "Regal festive celebration anarkali churidar tailored from lightweight Chanderi silk blend with delicate zari micro-buttas. Features a multi-kali flared silhouette, accompanied by classic gathered churidar trousers at the ankles and an embellished scalloped sheer organza dupatta.",
      fabricCare: "Chanderi Silk Blend with pure cotton lining. Dry clean recommended for longevity.",
      shippingInfo: "Dispatched within 24–48 hours across India with tamper-evident premium packaging.",
      images: [
        { storageKey: "/products/festive-chanderi-anarkali.jpg", altText: "Festive Chanderi Silk Anarkali Churidar Suit in Royal Wine & Antique Gold", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/hero-main.jpg", altText: "Anarkali multi-kali flare and zari border", sortOrder: 1, isPrimary: false },
        { storageKey: "/images/product-showcase/thumb-2.jpg", altText: "Organza dupatta craftsmanship", sortOrder: 2, isPrimary: false },
      ],
      variants: standardSizes.map((s) => ({
        sku: `TG-CHU-ANK01-${s.size}`,
        size: s.size,
        colour: "Royal Wine & Antique Gold",
        stockQuantity: Math.max(3, s.stock - 4),
      })),
    },
    {
      name: "Peacock Blue Raw Silk Celebration Straight Churidar",
      slug: "raw-silk-celebration-churidar",
      sku: "TG-CHU-SLK01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 4850,
      salePrice: 3999, // Festive Offer ~18% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["silk-churidars", "straight-cut-churidars", "churidars"],
      shortDescription: "Opulent pure raw silk straight kurta suit with understated neckline embroidery and Banarasi zari dupatta.",
      description: "Tailored from pure raw silk with fine antique gold threadwork on the boat neckline and side slits. Paired with sleek narrow churidar trousers and an opulent Banarasi gold zari dupatta for weddings, festive pujas, and family gatherings.",
      fabricCare: "100% Pure Raw Silk with Banarasi Brocade. Dry clean only. Store wrapped in soft muslin.",
      shippingInfo: "Dispatched within 24 hours. Express air courier across India.",
      images: [
        { storageKey: "/products/peacock-blue-raw-silk.jpg", altText: "Peacock Blue Raw Silk Straight Cut Churidar with Gold Zari Dupatta", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/embroidery-detail.jpg", altText: "Boat neckline threadwork detail", sortOrder: 1, isPrimary: false },
        { storageKey: "/images/product-showcase/thumb-3.jpg", altText: "Banarasi brocade zari pallu", sortOrder: 2, isPrimary: false },
      ],
      variants: standardSizes.map((s) => ({
        sku: `TG-CHU-SLK01-${s.size}`,
        size: s.size,
        colour: "Peacock Blue & Gold",
        stockQuantity: Math.max(3, s.stock - 5),
      })),
    },
    {
      name: "Daily Comfort Mulmul Cotton Churidar Set",
      slug: "daily-mulmul-cotton-churidar",
      sku: "TG-CHU-MUL01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 1699,
      salePrice: 1399, // Festive Offer ~18% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["cotton-churidars", "churidars"],
      shortDescription: "Soft, breathable hand-block printed mulmul cotton churidar set for effortless everyday wear.",
      description: "Featherlight mulmul cotton 3-piece suit with traditional hand-block botanical prints in natural earthy hues. Includes straight-cut kurta with comfortable side slits, gathered churidar bottom trousers, and soft matching kota doria printed dupatta.",
      fabricCare: "100% Breathable Mulmul Cotton. Gentle machine wash in cold water with mild detergent.",
      shippingInfo: "Ready to dispatch within 24 hours.",
      images: [
        { storageKey: "/products/daily-mulmul-cotton.jpg", altText: "Daily Comfort Mulmul Cotton Churidar Set in Natural Ochre", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/thumb-4.jpg", altText: "Hand-block floral botanical print detail", sortOrder: 1, isPrimary: false },
      ],
      variants: standardSizes.map((s) => ({
        sku: `TG-CHU-MUL01-${s.size}`,
        size: s.size,
        colour: "Natural Ochre & Terracotta",
        stockQuantity: s.stock + 4,
      })),
    },
    {
      name: "Handloom Kanchipuram Silk Border Churidar Material",
      slug: "kanchipuram-silk-churidar-material",
      sku: "TG-CHU-MAT01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 3200,
      salePrice: 2699, // Festive Offer ~16% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["unstitched-materials", "silk-churidars", "churidars"],
      shortDescription: "3-piece unstitched churidar material set featuring authentic Kanchipuram zari border weave.",
      description: "Authentic unstitched fabric set: 2.5 meters woven silk-blend top fabric with traditional Kanchipuram korvai zari border, 2.25 meters soft cotton-silk bottom fabric for tailored churidar or cigarette pant, and 2.5 meters rich contrast woven dupatta with zari tassels.",
      fabricCare: "Handloom Silk-Cotton blend with pure zari border. Dry clean recommended.",
      shippingInfo: "In stock. Dispatched within 24 hours across India.",
      images: [
        { storageKey: "/products/unstitched-material-set.jpg", altText: "Handloom Kanchipuram Silk Border 3-Piece Churidar Material Set", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/thumb-5.jpg", altText: "Zari border and fabric texture", sortOrder: 1, isPrimary: false },
      ],
      variants: [
        { sku: "TG-CHU-MAT01-OS", size: "Unstitched 3-Piece Material", colour: "Maroon & Antique Gold", stockQuantity: 20 },
        { sku: "TG-CHU-MAT01-RST", size: "Unstitched 3-Piece Material", colour: "Rustic Amber & Copper", stockQuantity: 15 },
      ],
    },
    {
      name: "Bespoke Kanchipuram Silk Bridal Churidar Suite",
      slug: "bespoke-kanchipuram-silk-bridal-churidar",
      sku: "TG-CHU-BESPOKE-BRD",
      productType: ProductType.CUSTOM_MADE,
      basePrice: 5600,
      salePrice: null,
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["custom-churidars", "silk-churidars", "churidars"],
      shortDescription: "Made-to-measure bridal churidar ensemble tailored to your exact height, bust, waist, and bottom cut.",
      description: "Custom-tailored celebration churidar suite created specifically to your silhouette. Select your top silhouette, neckline, sleeve cut, bottom trouser cut (traditional gathered churidar vs straight pant vs salwar), and premium lining. Our master tailor will contact you via WhatsApp for fine-tuning measurements.",
      fabricCare: "Pure Kanchipuram Woven Silk. Dry clean only.",
      shippingInfo: "Custom drafted, hand-cut, and stitched within 5–7 business days with photo confirmation prior to dispatch.",
      images: [
        { storageKey: "/products/kanchipuram-silk-bridal.jpg", altText: "Bespoke Kanchipuram Silk Bridal Churidar Suite", sortOrder: 0, isPrimary: true },
        { storageKey: "/products/peacock-blue-raw-silk.jpg", altText: "Bridal silk weave detail", sortOrder: 1, isPrimary: false },
        { storageKey: "/images/product-showcase/embroidery-detail.jpg", altText: "Intricate neckline embroidery", sortOrder: 2, isPrimary: false },
      ],
      variants: [
        { sku: "TG-CHU-BESPOKE-BRD-VAR", size: "Custom Tailored", colour: "Custom Choice", stockQuantity: 99 },
      ],
      customizationGroups: [
        {
          name: "Top Cut Style",
          type: "SELECT",
          required: true,
          options: [
            { name: "Straight Cut Kurta (Classic)", priceDelta: 0, description: "Timeless straight knee/calf-length kurta with side slits" },
            { name: "A-Line Cut Kurta", priceDelta: 200, description: "Gently flared silhouette for graceful drape" },
            { name: "Flared Anarkali Silhouette", priceDelta: 600, description: "Floor-length multi-kali flared anarkali suit" },
          ],
        },
        {
          name: "Neckline Pattern",
          type: "SELECT",
          required: true,
          options: [
            { name: "Classic Sweetheart Neck", priceDelta: 0, description: "Timeless flattering sweetheart front neckline" },
            { name: "High Boat Neck with Zari Piping", priceDelta: 150, description: "Contemporary regal wide neckline" },
            { name: "Round Neck with Front Slit & Potli Buttons", priceDelta: 100, description: "Delicate handcrafted potli button accents" },
            { name: "Mandarin Collar with Placket", priceDelta: 250, description: "Structured formal royal collar" },
          ],
        },
        {
          name: "Sleeve Style",
          type: "SELECT",
          required: true,
          options: [
            { name: "Elbow Length Sleeves (11-inch)", priceDelta: 0, description: "Traditional elbow sleeve with temple border" },
            { name: "3/4th Sleeves with Zari Cuff", priceDelta: 200, description: "Elegant wrist-approaching sleeve" },
            { name: "Full Sleeves with Gathered Cuffs", priceDelta: 350, description: "Wrist-length sheer silk with micro gathers" },
            { name: "Sleeveless with Contrast Piping", priceDelta: 0, description: "Clean sleeveless tailored finish" },
          ],
        },
        {
          name: "Bottom / Pant Style",
          type: "SELECT",
          required: true,
          options: [
            { name: "Traditional Gathered Churidar", priceDelta: 0, description: "Classic tight-fitting bottom with elegant ankle gathers" },
            { name: "Straight Cigarette Pants with Slit", priceDelta: 200, description: "Modern straight ankle-length cigarette pants" },
            { name: "Loose Pleated Salwar / Patiala", priceDelta: 250, description: "Comfortable roomy pleated salwar with cuff" },
            { name: "Wide-Leg Palazzo Pants", priceDelta: 300, description: "Relaxed flared silhouette with side pocket" },
          ],
        },
        {
          name: "Lining & Padding",
          type: "SELECT",
          required: true,
          options: [
            { name: "Pure Cotton Breathable Lining", priceDelta: 0, description: "100% preshrunk breathable cotton lining" },
            { name: "Butter Crepe Soft Lining", priceDelta: 300, description: "Silky smooth drape lining" },
            { name: "Padded Bodice with Cotton Lining", priceDelta: 450, description: "Soft contoured bust cup support with cotton lining" },
          ],
        },
      ],
    },
    {
      name: "Custom Tailored Chettinad Cotton Everyday Churidar",
      slug: "custom-chettinad-cotton-churidar",
      sku: "TG-CHU-BESPOKE-COT",
      productType: ProductType.CUSTOM_MADE,
      basePrice: 2499,
      salePrice: null,
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["custom-churidars", "cotton-churidars", "churidars"],
      shortDescription: "Bespoke made-to-measure dailywear cotton churidar set tailored to your exact measurements.",
      description: "Custom-made Chettinad cotton churidar ensemble. Choose your neck pattern, sleeve length, and bottom style (classic gathered churidar or straight pants with pocket) for perfect comfort in everyday wear.",
      fabricCare: "100% Pure Chettinad Cotton. Hand wash cold. Shade dry.",
      shippingInfo: "Tailored to your measurements in 4–5 business days.",
      images: [
        { storageKey: "/products/custom-tailored-everyday.jpg", altText: "Custom Tailored Chettinad Cotton Everyday Churidar Set", sortOrder: 0, isPrimary: true },
        { storageKey: "/products/chettinad-cotton-maroon.jpg", altText: "Chettinad cotton fabric view", sortOrder: 1, isPrimary: false },
      ],
      variants: [
        { sku: "TG-CHU-BESPOKE-COT-VAR", size: "Custom Tailored", colour: "Custom Choice", stockQuantity: 99 },
      ],
      customizationGroups: [
        {
          name: "Kurta Silhouette",
          type: "SELECT",
          required: true,
          options: [
            { name: "Straight Knee-Length Cut", priceDelta: 0, description: "Standard straight cut with side slits" },
            { name: "Calf-Length A-Line Cut", priceDelta: 150, description: "Relaxed comfortable A-line styling" },
          ],
        },
        {
          name: "Neckline Style",
          type: "SELECT",
          required: true,
          options: [
            { name: "Simple Round Neck with Piping", priceDelta: 0, description: "Classic modest round neck" },
            { name: "V-Cut Neck with Contrast Piping", priceDelta: 100, description: "Flattering V-shape neckline" },
            { name: "Boat Neck", priceDelta: 100, description: "Wide neckline with matching binding" },
          ],
        },
        {
          name: "Sleeve Cut",
          type: "SELECT",
          required: true,
          options: [
            { name: "Elbow Length (Classic)", priceDelta: 0, description: "Standard 10-11 inch sleeve" },
            { name: "Short Sleeves (6-inch)", priceDelta: 0, description: "Cool short sleeve" },
            { name: "3/4th Sleeves", priceDelta: 150, description: "16-inch sleeve with border accent" },
          ],
        },
        {
          name: "Bottom Style",
          type: "SELECT",
          required: true,
          options: [
            { name: "Classic Gathered Churidar", priceDelta: 0, description: "Traditional churidar bottom with ankle gathering" },
            { name: "Straight Cut Cotton Pant with Side Pocket", priceDelta: 150, description: "Contemporary pant with elastic waistband and pocket" },
            { name: "Relaxed Salwar", priceDelta: 100, description: "Airy traditional salwar" },
          ],
        },
        {
          name: "Lining",
          type: "SELECT",
          required: true,
          options: [
            { name: "Unlined (Lightweight & Breathable)", priceDelta: 0, description: "Ideal for warm tropical weather" },
            { name: "Pure Voile Cotton Lining", priceDelta: 250, description: "Soft interior layer for added opacity" },
          ],
        },
      ],
    },
    {
      name: "Madurai Sungudi Handloom Cotton Straight Churidar",
      slug: "madurai-sungudi-cotton-churidar",
      sku: "TG-CHU-SUN01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 1999,
      salePrice: 1649, // Festive Offer ~18% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["cotton-churidars", "straight-cut-churidars", "churidars"],
      shortDescription: "Authentic Madurai Sungudi handloom cotton straight churidar with traditional round dot resist-dye.",
      description: "Authentic Madurai Sungudi handloom cotton straight churidar suit with traditional round dot bandhani resist-dye patterns and woven metallic zari borders. Breathable, vibrant, and effortlessly stylish with gathered churidar ankles.",
      fabricCare: "Pure Sungudi Cotton. Cold gentle hand wash. Shade dry.",
      shippingInfo: "Dispatched within 24 hours.",
      images: [
        { storageKey: "/products/chettinad-cotton-maroon.jpg", altText: "Madurai Sungudi Handloom Cotton Straight Churidar", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/thumb-2.jpg", altText: "Sungudi traditional bandhani weave", sortOrder: 1, isPrimary: false },
      ],
      variants: standardSizes.map((s) => ({
        sku: `TG-CHU-SUN01-${s.size}`,
        size: s.size,
        colour: "Deep Indigo & Mustard",
        stockQuantity: s.stock - 2,
      })),
    },
    {
      name: "Auspicious Banarasi Zari Silk Churidar Set",
      slug: "banarasi",
      sku: "TG-CHU-BAN01",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 2499,
      salePrice: 1999, // Festive Offer 20% off
      featured: true,
      status: ProductStatus.ACTIVE,
      categorySlugs: ["straight-cut-churidars", "silk-churidars", "churidars"],
      shortDescription: "Timeless Banarasi silk straight kurta with rich gold zari floral motifs and gathering churidar.",
      description: "Timeless Banarasi silk straight kurta with rich gold zari floral buttas, tailored with classic gathering churidar bottom trousers and an embellished contrast dupatta. Perfectly suited for temple visits and festive gatherings.",
      fabricCare: "Banarasi Silk Brocade. Dry clean only.",
      shippingInfo: "In stock. Dispatched within 24 hours.",
      images: [
        { storageKey: "/products/peacock-blue-raw-silk.jpg", altText: "Auspicious Banarasi Zari Silk Churidar Set", sortOrder: 0, isPrimary: true },
        { storageKey: "/images/product-showcase/thumb-3.jpg", altText: "Gold zari floral motif detail", sortOrder: 1, isPrimary: false },
      ],
      variants: standardSizes.map((s) => ({
        sku: `TG-CHU-BAN01-${s.size}`,
        size: s.size,
        colour: "Auspicious Crimson & Gold",
        stockQuantity: s.stock - 1,
      })),
    },
  ];

  // 3. Upsert products into DB
  for (const item of catalogProducts) {
    const { categorySlugs, images, variants, customizationGroups, ...prodData } = item;

    console.log(`Processing: ${prodData.name} (${prodData.slug})`);

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ slug: prodData.slug }, { sku: prodData.sku }],
      },
    });

    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: prodData.name,
          slug: prodData.slug,
          sku: prodData.sku,
          basePrice: prodData.basePrice,
          salePrice: prodData.salePrice,
          productType: prodData.productType,
          status: prodData.status,
          featured: prodData.featured,
          description: prodData.description,
          shortDescription: prodData.shortDescription,
          fabricCare: prodData.fabricCare,
          shippingInfo: prodData.shippingInfo,
          publishedAt: new Date(),
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          ...prodData,
          publishedAt: new Date(),
        },
      });
    }

    // Associate categories
    await prisma.productCategory.deleteMany({ where: { productId: product.id } });
    for (const slug of categorySlugs) {
      const cId = catMap[slug];
      if (cId) {
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId: cId },
        });
      }
    }

    // Associate images
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const img of images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          storageKey: img.storageKey,
          altText: img.altText,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        },
      });
    }

    // Associate variants
    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          size: v.size,
          colour: v.colour,
          stockQuantity: v.stockQuantity,
          active: true,
        },
        create: {
          productId: product.id,
          sku: v.sku,
          size: v.size,
          colour: v.colour,
          stockQuantity: v.stockQuantity,
          lowStockThreshold: 2,
          active: true,
        },
      });
    }

    // Customization groups
    if (customizationGroups && customizationGroups.length > 0) {
      await prisma.customizationGroup.deleteMany({ where: { productId: product.id } });
      for (let gIdx = 0; gIdx < customizationGroups.length; gIdx++) {
        const grp = customizationGroups[gIdx];
        const createdGroup = await prisma.customizationGroup.create({
          data: {
            productId: product.id,
            name: grp.name,
            type: grp.type,
            required: grp.required,
            sortOrder: gIdx,
          },
        });

        for (const opt of grp.options) {
          await prisma.customizationOption.create({
            data: {
              groupId: createdGroup.id,
              name: opt.name,
              priceDelta: opt.priceDelta,
              description: opt.description,
            },
          });
        }
      }
    }
  }

  console.log(`✅ Successfully populated ${catalogProducts.length} polished Churidar products with images, variants, and categories!`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Catalog population error:", e);
  process.exit(1);
});
