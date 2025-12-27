/**
 * Attribute Seeding Script for Niche-Specific Stores
 * Run: node scripts/seed_niche_attributes.js --niche=automotive
 * 
 * This script populates the `attributes` table with industry-specific
 * attributes based on the selected niche.
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Niche-specific attribute definitions
const NICHE_ATTRIBUTES = {
    automotive: [
        { name: 'سنة الصنع', name_en: 'Year', type: 'select', options: ['2024', '2023', '2022', '2021', '2020', '2019', '2018', 'أقدم'] },
        { name: 'الماركة', name_en: 'Brand', type: 'select', options: ['تويوتا', 'هوندا', 'نيسان', 'مرسيدس', 'BMW', 'لكزس', 'فورد', 'شيفروليه'] },
        { name: 'نوع القطعة', name_en: 'Part Type', type: 'select', options: ['محرك', 'فرامل', 'تعليق', 'كهرباء', 'بودي', 'إكسسوارات'] },
        { name: 'الحالة', name_en: 'Condition', type: 'select', options: ['جديد', 'مستعمل نظيف', 'مستعمل'] },
        { name: 'بلد المنشأ', name_en: 'Origin', type: 'select', options: ['أصلي', 'تايوان', 'صيني', 'كوري'] },
    ],
    fashion: [
        { name: 'المقاس', name_en: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
        { name: 'اللون', name_en: 'Color', type: 'select', options: ['أسود', 'أبيض', 'أزرق', 'أحمر', 'أخضر', 'رمادي', 'بني', 'وردي'] },
        { name: 'المادة', name_en: 'Material', type: 'select', options: ['قطن', 'بوليستر', 'جلد', 'حرير', 'صوف', 'كتان'] },
        { name: 'الموسم', name_en: 'Season', type: 'select', options: ['صيفي', 'شتوي', 'ربيعي', 'كل المواسم'] },
        { name: 'الجنس', name_en: 'Gender', type: 'select', options: ['رجالي', 'نسائي', 'للجنسين', 'أطفال'] },
    ],
    electronics: [
        { name: 'الماركة', name_en: 'Brand', type: 'select', options: ['Apple', 'Samsung', 'Sony', 'LG', 'Huawei', 'Xiaomi', 'Dell', 'HP'] },
        { name: 'الحالة', name_en: 'Condition', type: 'select', options: ['جديد', 'مجدد', 'مستعمل'] },
        { name: 'الضمان', name_en: 'Warranty', type: 'select', options: ['سنة', 'سنتين', 'بدون ضمان', 'ضمان الوكيل'] },
        { name: 'السعة', name_en: 'Storage', type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
        { name: 'اللون', name_en: 'Color', type: 'select', options: ['أسود', 'أبيض', 'فضي', 'ذهبي', 'أزرق'] },
    ],
    grocery: [
        { name: 'النوع', name_en: 'Type', type: 'select', options: ['طازج', 'مجمد', 'معلب', 'مجفف'] },
        { name: 'عضوي', name_en: 'Organic', type: 'boolean', options: ['نعم', 'لا'] },
        { name: 'خالي من', name_en: 'Free From', type: 'multiselect', options: ['غلوتين', 'لاكتوز', 'مكسرات', 'سكر'] },
        { name: 'بلد المنشأ', name_en: 'Origin', type: 'select', options: ['محلي', 'سعودي', 'إماراتي', 'مصري', 'أوروبي'] },
    ],
    beauty: [
        { name: 'نوع البشرة', name_en: 'Skin Type', type: 'select', options: ['عادية', 'دهنية', 'جافة', 'مختلطة', 'حساسة'] },
        { name: 'الماركة', name_en: 'Brand', type: 'select', options: ['MAC', 'Maybelline', 'L\'Oreal', 'Chanel', 'Dior', 'NYX', 'محلي'] },
        { name: 'المكونات', name_en: 'Ingredients', type: 'multiselect', options: ['فيتامين سي', 'ريتينول', 'هيالورونيك', 'نياسيناميد'] },
        { name: 'الحجم', name_en: 'Size', type: 'select', options: ['صغير', 'متوسط', 'كبير', 'عائلي'] },
    ],
    furniture: [
        { name: 'المادة', name_en: 'Material', type: 'select', options: ['خشب صلب', 'MDF', 'معدن', 'قماش', 'جلد'] },
        { name: 'اللون', name_en: 'Color', type: 'select', options: ['بني', 'أسود', 'أبيض', 'رمادي', 'بيج'] },
        { name: 'الغرفة', name_en: 'Room', type: 'select', options: ['غرفة المعيشة', 'غرفة النوم', 'المطبخ', 'المكتب', 'الحديقة'] },
        { name: 'الحجم', name_en: 'Size', type: 'select', options: ['صغير', 'متوسط', 'كبير', 'كينج'] },
    ],
    sports: [
        { name: 'الرياضة', name_en: 'Sport', type: 'select', options: ['كرة قدم', 'سباحة', 'جري', 'لياقة', 'يوغا', 'دراجات'] },
        { name: 'المقاس', name_en: 'Size', type: 'select', options: ['S', 'M', 'L', 'XL', 'XXL'] },
        { name: 'الجنس', name_en: 'Gender', type: 'select', options: ['رجالي', 'نسائي', 'للجنسين'] },
        { name: 'الماركة', name_en: 'Brand', type: 'select', options: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok'] },
    ],
    jewelry: [
        { name: 'المعدن', name_en: 'Metal', type: 'select', options: ['ذهب 24', 'ذهب 21', 'ذهب 18', 'فضة', 'بلاتين', 'ستيل'] },
        { name: 'الأحجار', name_en: 'Stones', type: 'multiselect', options: ['ألماس', 'ياقوت', 'زمرد', 'لؤلؤ', 'بدون'] },
        { name: 'النوع', name_en: 'Type', type: 'select', options: ['خاتم', 'سلسلة', 'أسورة', 'حلق', 'طقم'] },
        { name: 'الوزن', name_en: 'Weight', type: 'text' },
    ],
};

async function seedAttributes(niche) {
    const attributes = NICHE_ATTRIBUTES[niche];

    if (!attributes) {
        console.log(`Available niches: ${Object.keys(NICHE_ATTRIBUTES).join(', ')}`);
        throw new Error(`Unknown niche: ${niche}`);
    }

    console.log(`🌱 Seeding ${attributes.length} attributes for [${niche}] niche...`);

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const attr of attributes) {
            // Insert attribute
            const attrResult = await client.query(
                `INSERT INTO attributes (name, name_en, type, is_filterable, is_required)
                 VALUES ($1, $2, $3, true, false)
                 ON CONFLICT (name) DO UPDATE SET name_en = $2, type = $3
                 RETURNING id`,
                [attr.name, attr.name_en, attr.type]
            );
            const attrId = attrResult.rows[0].id;

            // Insert options if present
            if (attr.options && attr.type !== 'text') {
                for (let i = 0; i < attr.options.length; i++) {
                    await client.query(
                        `INSERT INTO attribute_options (attribute_id, value, sort_order)
                         VALUES ($1, $2, $3)
                         ON CONFLICT (attribute_id, value) DO NOTHING`,
                        [attrId, attr.options[i], i]
                    );
                }
            }
            console.log(`  ✅ ${attr.name} (${attr.type}) - ${attr.options?.length || 0} options`);
        }

        await client.query('COMMIT');
        console.log(`\n🎉 Successfully seeded ${attributes.length} attributes for [${niche}]!`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
        pool.end();
    }
}

// CLI
const args = process.argv.slice(2);
const nicheArg = args.find(a => a.startsWith('--niche='));
const niche = nicheArg ? nicheArg.split('=')[1] : 'automotive';

seedAttributes(niche).catch(err => {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
});
