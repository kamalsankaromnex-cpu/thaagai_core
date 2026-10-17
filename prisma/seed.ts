import "dotenv/config";
import { PrismaClient, Role, ProductStatus, ProductType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Thaagai Churidar database seed...");

  const adminEmail = process.env.ADMIN_EMAIL || "owner@thaagai.com";
  const rawAdminPassword = process.env.ADMIN_PASSWORD || "AdminThaagai@2026SecurePass";
  const passwordHash = await bcrypt.hash(rawAdminPassword, 12);

  // 1. Safe Admin User (Owner)
  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.OWNER,
      active: true,
    },
    create: {
      name: "Thaagai Store Owner",
      email: adminEmail,
      passwordHash,
      role: Role.OWNER,
      active: true,
    },
  });
  console.log(`✅ Owner admin user ensured: ${admin.email}`);

  // 2. Default Store Settings
  const defaultSettings = [
    {
      key: "store_profile",
      value: {
        storeName: "Thaagai",
        tagline: "Exquisite Ready-Made & Bespoke Churidars",
        currency: "INR",
        supportPhone: process.env.WHATSAPP_BUSINESS_NUMBER || "919876543210",
        orderNotice: "Orders are requests until the seller confirms them on WhatsApp.",
      },
    },
    {
      key: "shipping_defaults",
      value: {
        standardShippingText: "Shipping cost confirmed by seller via WhatsApp based on delivery pin code.",
        estimatedDeliveryDays: "3 to 7 business days across India",
      },
    },
  ];

  for (const s of defaultSettings) {
    await prisma.storeSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log("✅ Store settings initialized");

  // 3. Five Primary Storefront Categories: Kurtis, Sarees, Churidars, Dupattas, Sets
  const primaryCategories = [
    {
      name: "Kurtis",
      slug: "kurtis",
      description: "Handcrafted everyday and festive kurtis and tunics woven in premium handloom cotton and silks.",
      imageUrl: "/categories/straight-cut.svg",
      sortOrder: 1,
    },
    {
      name: "Sarees",
      slug: "sarees",
      description: "Traditional Tamil handloom, Kanchipuram silk, and celebration sarees crafted with heritage artistry.",
      imageUrl: "/categories/silk.svg",
      sortOrder: 2,
    },
    {
      name: "Churidars",
      slug: "churidars",
      description: "Authentic ready-to-wear and bespoke made-to-measure churidar suits and sets.",
      imageUrl: "/categories/anarkali.svg",
      sortOrder: 3,
    },
    {
      name: "Dupattas",
      slug: "dupattas",
      description: "Opulent zari, Banarasi, and breathable mulmul cotton dupattas and stoles.",
      imageUrl: "/categories/unstitched.svg",
      sortOrder: 4,
    },
    {
      name: "Sets",
      slug: "sets",
      description: "Complete coordinated 3-piece churidar sets and tailored ensembles with matching bottoms and dupattas.",
      imageUrl: "/categories/cotton.svg",
      sortOrder: 5,
    },
  ];

  const primaryCatMap: Record<string, string> = {};
  for (const cat of primaryCategories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, sortOrder: cat.sortOrder, active: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        active: true,
        seoTitle: `${cat.name} | THAAGAI`,
        seoDescription: cat.description,
      },
    });
    primaryCatMap[cat.slug] = c.id;
  }
  console.log("✅ Five primary storefront categories ensured (Kurtis, Sarees, Churidars, Dupattas, Sets)");

  // Churidar Subcategories: Straight Cut, Anarkali, Dailywear Cotton, Festive Silk, Bespoke Tailored, Unstitched Materials
  const churidarSubcategories = [
    {
      name: "Straight Cut Churidars",
      slug: "straight-cut-churidars",
      description: "Elegant straight cut kurtas paired with matching churidar bottom and dupatta.",
      imageUrl: "/categories/straight-cut.svg",
      sortOrder: 1,
      parentId: primaryCatMap["churidars"],
    },
    {
      name: "Anarkali Churidar Suits",
      slug: "anarkali-churidars",
      description: "Flowing festive anarkali suits with gathered churidar and rich dupatta.",
      imageUrl: "/categories/anarkali.svg",
      sortOrder: 2,
      parentId: primaryCatMap["churidars"],
    },
    {
      name: "Dailywear Cotton Churidars",
      slug: "cotton-churidars",
      description: "Breathable pure Chettinad and mulmul handloom cotton churidar sets for everyday comfort.",
      imageUrl: "/categories/cotton.svg",
      sortOrder: 3,
      parentId: primaryCatMap["churidars"],
    },
    {
      name: "Festive Silk Churidars",
      slug: "silk-churidars",
      description: "Opulent Kanchipuram silk, Chanderi, and raw silk celebration churidar suits with gold zari accents.",
      imageUrl: "/categories/silk.svg",
      sortOrder: 4,
      parentId: primaryCatMap["churidars"],
    },
    {
      name: "Bespoke Tailored Churidars",
      slug: "custom-churidars",
      description: "Made-to-measure tailored churidars crafted to your exact height, bust, waist, and preferred bottom silhouette.",
      imageUrl: "/categories/custom.svg",
      sortOrder: 5,
      parentId: primaryCatMap["churidars"],
    },
    {
      name: "Unstitched Churidar Materials",
      slug: "unstitched-materials",
      description: "Authentic 3-piece unstitched handloom fabric sets (top, churidar bottom, dupatta) for personalized tailoring.",
      imageUrl: "/categories/unstitched.svg",
      sortOrder: 6,
      parentId: primaryCatMap["churidars"],
    },
  ];

  const catMap: Record<string, string> = { ...primaryCatMap };
  for (const cat of churidarSubcategories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, imageUrl: cat.imageUrl, sortOrder: cat.sortOrder, parentId: cat.parentId, active: true },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        sortOrder: cat.sortOrder,
        parentId: cat.parentId,
        active: true,
        seoTitle: `${cat.name} | Thaagai Chudidar Atelier`,
        seoDescription: cat.description,
      },
    });
    catMap[cat.slug] = c.id;
  }
  console.log("✅ Churidar subcategories ensured with parent linkage");

  // Deactivate old non-churidar products
  const oldProductSlugs = [
    "handloom-cotton-kurta",
    "kanchipuram-silk-blend-saree",
    "festive-anarkali-set",
    "antique-temple-necklace",
    "traditional-kemp-jhumka-earrings",
    "bespoke-silk-bridal-blouse",
    "bespoke-made-to-measure-anarkali-gown",
  ];
  for (const oldSlug of oldProductSlugs) {
    await prisma.product.updateMany({
      where: { slug: oldSlug },
      data: { status: ProductStatus.ARCHIVED, featured: false },
    });
  }

  // 4. Chudidar Products: Ready-to-Wear and Bespoke Tailored
  const sampleProducts = [
    {
      name: "Chettinad Handloom Cotton Straight Churidar Set",
      slug: "chettinad-cotton-straight-churidar",
      shortDescription: "Pure Chettinad handloom cotton straight kurta with classic gathered churidar and matching dupatta.",
      description: "Crafted from 100% handwoven Chettinad cotton. Features contrast temple thread borders, breathable all-day comfort, traditional gathered churidar bottom with drawstring, and matching pure cotton dupatta.",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 1950,
      sku: "TG-CHU-CC01",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["cotton-churidars"],
      variants: [
        { sku: "TG-CHU-CC01-S", size: "S", colour: "Temple Maroon & Sand", stockQuantity: 12 },
        { sku: "TG-CHU-CC01-M", size: "M", colour: "Temple Maroon & Sand", stockQuantity: 15 },
        { sku: "TG-CHU-CC01-L", size: "L", colour: "Temple Maroon & Sand", stockQuantity: 10 },
        { sku: "TG-CHU-CC01-XL", size: "XL", colour: "Temple Maroon & Sand", stockQuantity: 8 },
        { sku: "TG-CHU-CC01-XXL", size: "XXL", colour: "Temple Maroon & Sand", stockQuantity: 6 },
        { sku: "TG-CHU-CC01-IND-M", size: "M", colour: "Indigo Blue", stockQuantity: 10 },
        { sku: "TG-CHU-CC01-IND-L", size: "L", colour: "Indigo Blue", stockQuantity: 8 },
      ],
    },
    {
      name: "Festive Chanderi Silk Anarkali Churidar Suit",
      slug: "festive-chanderi-anarkali-suit",
      shortDescription: "Flowing 3-piece Chanderi silk anarkali suit with antique gold zari border and gathered churidar.",
      description: "Festive celebration anarkali churidar tailored from lightweight Chanderi silk blend with micro zari buttas, accompanied by classic gathered churidar trousers and an embellished organza dupatta.",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 3850,
      sku: "TG-CHU-ANK01",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["anarkali-churidars"],
      variants: [
        { sku: "TG-CHU-ANK01-S", size: "S", colour: "Deep Wine & Gold", stockQuantity: 8 },
        { sku: "TG-CHU-ANK01-M", size: "M", colour: "Deep Wine & Gold", stockQuantity: 10 },
        { sku: "TG-CHU-ANK01-L", size: "L", colour: "Deep Wine & Gold", stockQuantity: 7 },
        { sku: "TG-CHU-ANK01-XL", size: "XL", colour: "Deep Wine & Gold", stockQuantity: 5 },
      ],
    },
    {
      name: "Raw Silk Celebration Straight Cut Churidar",
      slug: "raw-silk-celebration-churidar",
      shortDescription: "Opulent raw silk straight kurta suit with embroidered neckline and cigarette pant churidar option.",
      description: "Tailored from pure raw silk with understated neckline embroidery. Paired with comfortable narrow-cut churidar pants and a rich Banarasi zari dupatta for weddings and festive gatherings.",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 4600,
      sku: "TG-CHU-SLK01",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["silk-churidars"],
      variants: [
        { sku: "TG-CHU-SLK01-S", size: "S", colour: "Peacock Green & Gold", stockQuantity: 6 },
        { sku: "TG-CHU-SLK01-M", size: "M", colour: "Peacock Green & Gold", stockQuantity: 9 },
        { sku: "TG-CHU-SLK01-L", size: "L", colour: "Peacock Green & Gold", stockQuantity: 6 },
        { sku: "TG-CHU-SLK01-XL", size: "XL", colour: "Peacock Green & Gold", stockQuantity: 4 },
      ],
    },
    {
      name: "Daily Comfort Mulmul Cotton Churidar Set",
      slug: "daily-mulmul-cotton-churidar",
      shortDescription: "Soft, breathable hand-block printed mulmul cotton churidar set for effortless everyday wear.",
      description: "Featherlight mulmul cotton 3-piece suit with traditional hand-block botanical prints. Includes straight kurta with side slits, gathered churidar bottom, and soft matching kota doria dupatta.",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 1650,
      sku: "TG-CHU-MUL01",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["cotton-churidars"],
      variants: [
        { sku: "TG-CHU-MUL01-S", size: "S", colour: "Natural Ochre", stockQuantity: 10 },
        { sku: "TG-CHU-MUL01-M", size: "M", colour: "Natural Ochre", stockQuantity: 14 },
        { sku: "TG-CHU-MUL01-L", size: "L", colour: "Natural Ochre", stockQuantity: 12 },
        { sku: "TG-CHU-MUL01-XL", size: "XL", colour: "Natural Ochre", stockQuantity: 6 },
      ],
    },
    {
      name: "Handloom Kanchipuram Silk Border Churidar Material",
      slug: "kanchipuram-silk-churidar-material",
      shortDescription: "3-piece unstitched churidar material set featuring authentic Kanchipuram zari border weave.",
      description: "Authentic unstitched fabric set: 2.5 meters woven top fabric with woven temple zari border, 2.25 meters soft cotton-silk bottom fabric for tailored churidar or cigarette pant, and 2.5 meters rich contrast dupatta.",
      productType: ProductType.READY_TO_WEAR,
      basePrice: 2800,
      sku: "TG-CHU-MAT01",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["unstitched-materials"],
      variants: [
        { sku: "TG-CHU-MAT01-OS", size: "Unstitched 3-Piece Material", colour: "Maroon & Antique Gold", stockQuantity: 15 },
        { sku: "TG-CHU-MAT01-RST", size: "Unstitched 3-Piece Material", colour: "Rustic Amber & Copper", stockQuantity: 10 },
      ],
    },
    {
      name: "Bespoke Kanchipuram Silk Bridal Churidar Suit",
      slug: "bespoke-kanchipuram-silk-bridal-churidar",
      shortDescription: "Made-to-measure bridal churidar ensemble tailored to your exact height, bust, waist, and bottom cut.",
      description: "Custom-tailored celebration churidar suite created specifically to your silhouette. Select your top silhouette, neckline, sleeve cut, bottom trouser cut (traditional gathered churidar vs straight pant vs salwar), and premium lining.",
      productType: ProductType.CUSTOM_MADE,
      basePrice: 5400,
      sku: "TG-CHU-BESPOKE-BRD",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["custom-churidars"],
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
      shortDescription: "Bespoke made-to-measure dailywear cotton churidar set tailored to your exact measurements.",
      description: "Custom-made Chettinad cotton churidar ensemble. Choose your neck pattern, sleeve length, and bottom style (classic gathered churidar or straight pants with pocket) for perfect comfort in everyday wear.",
      productType: ProductType.CUSTOM_MADE,
      basePrice: 2400,
      sku: "TG-CHU-BESPOKE-COT",
      status: ProductStatus.ACTIVE,
      featured: true,
      categoryId: catMap["custom-churidars"],
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
  ];

  for (const item of sampleProducts) {
    const { categoryId, variants, customizationGroups, ...prodData } = item as any;
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: prodData.slug },
          { sku: prodData.sku },
        ],
      },
    });

    let product;
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: prodData.name,
          slug: prodData.slug,
          basePrice: prodData.basePrice,
          status: prodData.status,
          productType: prodData.productType,
          featured: prodData.featured,
          description: prodData.description,
          shortDescription: prodData.shortDescription,
          publishedAt: new Date(),
        },
      });

      // Ensure category link is current
      if (categoryId) {
        await prisma.productCategory.deleteMany({ where: { productId: product.id } });
        await prisma.productCategory.create({
          data: { productId: product.id, categoryId },
        });
      }
    } else {
      product = await prisma.product.create({
        data: {
          ...prodData,
          publishedAt: new Date(),
          categories: {
            create: [{ categoryId }],
          },
        },
      });
    }

    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {
          stockQuantity: v.stockQuantity,
          size: v.size,
          colour: v.colour,
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

    // Add customization groups if custom-made
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

  // 5. Hero Carousel Slides: Traditional, Festive, Custom, Everyday
  const sampleSlides = [
    {
      eyebrow: "Handloom Heritage",
      title: "Traditional Elegance in Every Weave",
      description: "Handwoven Chettinad cotton and pure silk straight cut churidar sets crafted with timeless Tamil artistry.",
      primaryCtaLabel: "Shop Ready-to-Wear",
      primaryCtaUrl: "/shop?type=READY_TO_WEAR",
      secondaryCtaLabel: "Explore Straight Cut",
      secondaryCtaUrl: "/shop?category=straight-cut-churidars",
      desktopImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=90",
      mobileImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=90",
      altText: "Traditional Tamil handloom straight cut churidar collection",
      textAlignment: "left",
      overlayOpacity: 10,
      sortOrder: 1,
      active: true,
    },
    {
      eyebrow: "Celebration Suits",
      title: "Festive Anarkalis with Pure Zari",
      description: "Regal celebratory suits tailored in deep jewel tones with delicate gold temple motifs and gathered churidars.",
      primaryCtaLabel: "Explore Festive Suits",
      primaryCtaUrl: "/shop?category=anarkali-churidars",
      secondaryCtaLabel: "View All Silks",
      secondaryCtaUrl: "/shop?category=silk-churidars",
      desktopImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=2000&q=90",
      mobileImage: "https://images.unsplash.com/photo-1583391733956-6c78276477e4?auto=format&fit=crop&w=1000&q=90",
      altText: "Festive celebration anarkali churidar suit with pure zari",
      textAlignment: "left",
      overlayOpacity: 10,
      sortOrder: 2,
      active: true,
    },
    {
      eyebrow: "Bespoke Tailoring",
      title: "Custom-Made Specifically for You",
      description: "Experience made-to-measure tailoring. Select your kurta silhouette, neckline, sleeve cut, and preferred bottom style.",
      primaryCtaLabel: "Bespoke Atelier",
      primaryCtaUrl: "/custom-made",
      secondaryCtaLabel: "Tailor WhatsApp Help",
      secondaryCtaUrl: "/contact",
      desktopImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=2000&q=90",
      mobileImage: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=90",
      altText: "Bespoke made-to-measure churidar atelier and tailoring guide",
      textAlignment: "left",
      overlayOpacity: 10,
      sortOrder: 3,
      active: true,
    },
    {
      eyebrow: "Everyday Comfort",
      title: "Everyday Grace in Pure Cotton",
      description: "Breathable hand-block printed mulmul and Chettinad cotton churidar sets designed for all-day comfort in tropical weather.",
      primaryCtaLabel: "Shop Dailywear",
      primaryCtaUrl: "/shop?category=cotton-churidars",
      secondaryCtaLabel: "Unstitched Materials",
      secondaryCtaUrl: "/shop?category=unstitched-materials",
      desktopImage: "https://images.unsplash.com/photo-1610189012906-4c6b3a7b4a8e?auto=format&fit=crop&w=2000&q=90",
      mobileImage: "https://images.unsplash.com/photo-1610189012906-4c6b3a7b4a8e?auto=format&fit=crop&w=1000&q=90",
      altText: "Breathable cotton dailywear churidar sets",
      textAlignment: "left",
      overlayOpacity: 10,
      sortOrder: 4,
      active: true,
    },
  ];

  await prisma.heroSlide.deleteMany();
  for (const s of sampleSlides) {
    await prisma.heroSlide.create({ data: s });
  }
  console.log(`✅ Hero Slides ensured: ${sampleSlides.length} slides seeded`);

  console.log(`✅ Churidar Seed complete: ${sampleProducts.length} Chudidar products created/updated`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
