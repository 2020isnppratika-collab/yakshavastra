import logging
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from app.core.security import hash_password

logger = logging.getLogger("uvicorn.error")

COSTUMES_SEED = [
    # --- 1. RAJA VESHA (Royal Characters: Arjuna, Dharmaraya, Karna, Indra, etc.) ---
    {
        "sku": "YK-RAJA-001",
        "name": "Raja Vesha Full Set (Arjuna / Dharmaraya)",
        "kannada_name": "ರಾಜ ವೇಷ ಪೂರ್ಣ ಸೆಟ್",
        "description": "Exquisite royal Yakshagana Badagu-thittu full set including tall golden Kireeta, sculpted wooden Bhujakeerthi with gold leaf foil, breastplate (Edur Kante), vibrant red-and-gold pleated kachche skirt, and waist daabu.",
        "category": "full_set",
        "character_type": "raja",
        "tags": ["royal", "badagu-thittu", "arjuna", "kireeta", "gold-foil", "stage-grade"],
        "sizes": ["Free", "L", "XL"],
        "images": [
            "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2400.0,
        "price_per_slot": {"morning": 1100.0, "evening": 1400.0, "night": 1900.0},
        "security_deposit": 4000.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Raja Kireeta (Crown)", "Pair of Bhujakeerthi (Shoulder ornaments)", "Kante (Necklace/Chest piece)", "Red & Gold Kachche Skirt", "Golden Daabu (Waist belt)", "Angavastra cloth"],
        "care_notes": "Handle golden foil surfaces carefully. Store crown in rigid box provided. Dry clean only.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RAJA-002",
        "name": "Karna Vesha Heroic Gold Set",
        "kannada_name": "ಕರ್ಣ ವೇಷ ಸುವರ್ಣ ಸೆಟ್",
        "description": "Specially crafted Karna character set with distinct radiant sun-motif Karna Kireeta, kundalas (ear ornaments), Kavacha-style chest guard, and royal ochre silk vestments.",
        "category": "full_set",
        "character_type": "raja",
        "tags": ["karna", "sun-god", "kavacha", "kundala", "tenku-thittu"],
        "sizes": ["Free", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2200.0,
        "price_per_slot": {"morning": 1000.0, "evening": 1300.0, "night": 1750.0},
        "security_deposit": 3500.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Sun-motif Karna Kireeta", "Golden Kavacha Breastplate", "Kundalas (Pair)", "Bhujakeerthi", "Ochre Silk Skirt"],
        "care_notes": "Do not fold chest armor. Wipe clean with soft velvet cloth.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RAJA-003",
        "name": "Indrajithu / Crown Prince Warrior Set",
        "kannada_name": "ಇಂದ್ರಜಿತು ಯುವರಾಜ ವೇಷ",
        "description": "Fierce young royal costume with pointed winged headgear, emerald-studded mirror foil breastplate, and dynamic battle skirt.",
        "category": "full_set",
        "character_type": "raja",
        "tags": ["prince", "warrior", "indrajitu", "stage-grade"],
        "sizes": ["M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1900.0,
        "price_per_slot": {"morning": 900.0, "evening": 1100.0, "night": 1500.0},
        "security_deposit": 3000.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Winged Prince Crown", "Mirror-embroidered Vest", "Shoulder Guards", "Pleated Skirt"],
        "care_notes": "Handle mirrors gently.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RAJA-004",
        "name": "Dasharatha Maharaja Classical King Set",
        "kannada_name": "ದಶರಥ ಮಹಾರಾಜ ಸಾಂಪ್ರದಾಯಿಕ ಸೆಟ್",
        "description": "Elder monarch attire featuring stately tiered Kireeta, pearl garlands, rich velvet outer drape, and ceremonial waistband.",
        "category": "full_set",
        "character_type": "raja",
        "tags": ["monarch", "dasharatha", "classical", "badagu-thittu"],
        "sizes": ["Free", "XL"],
        "images": [
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2100.0,
        "price_per_slot": {"morning": 950.0, "evening": 1200.0, "night": 1650.0},
        "security_deposit": 3500.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Tiered King Kireeta", "Velvet Embroidered Robe", "Royal Sash", "Neck Garlands"],
        "care_notes": "Store pearls in velvet wrap.",
        "troupe_grade": "performance"
    },

    # --- 2. RAKSHASA & BANNADA VESHA (Demons / Fierce Painted Roles) ---
    {
        "sku": "YK-RAK-001",
        "name": "Ravana Dashakanta Fierce Asura Set",
        "kannada_name": "ರಾವಣ ದಶಕಂಠ ಮಹಾ ರಾಕ್ಷಸ ವೇಷ",
        "description": "Magnificent Badagu-thittu Ravana costume complete with towering Ten-headed Asura Kireeta, ferocious face chutti frame, giant curved Bhujakeerthi, flared red-black pleated battle skirt, and artificial fangs.",
        "category": "full_set",
        "character_type": "rakshasa",
        "tags": ["ravana", "ten-headed", "asura", "fierce", "badagu-thittu", "stage-grade"],
        "sizes": ["Free", "L", "XL"],
        "images": [
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 3200.0,
        "price_per_slot": {"morning": 1400.0, "evening": 1800.0, "night": 2500.0},
        "security_deposit": 5000.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Giant Ravana Asura Kireeta", "Fierce Face Chutti Stencil Base", "Heavy Carved Bhujakeerthi (Pair)", "Layered Flared Red-Black Skirt", "Ornate Silver & Gold Daabu", "Silver Demon Fangs"],
        "care_notes": "Crown requires two people to pack into its special wooden carrying crate.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RAK-002",
        "name": "Mahishasura Battle Set with Horned Crown",
        "kannada_name": "ಮಹಿಷಾಸುರ ಕೋರೆ ಕಿರೀಟ ಸೆಟ್",
        "description": "Authentic Tenku-thittu Mahishasura costume with curved buffalo horns integrated into golden crown, dark crimson breastplate, and heavy ankle bells.",
        "category": "full_set",
        "character_type": "bannada",
        "tags": ["mahishasura", "tenku-thittu", "bannada", "horned-crown"],
        "sizes": ["Free", "L"],
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2800.0,
        "price_per_slot": {"morning": 1250.0, "evening": 1600.0, "night": 2200.0},
        "security_deposit": 4500.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Horned Asura Crown", "Crimson Battle Breastplate", "Gaggara Bells", "Wide Pleated Skirt"],
        "care_notes": "Handle horn mounts gently.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RAK-003",
        "name": "Kumbhakarna Giant Asura Sleeping/Waking Set",
        "kannada_name": "ಕುಂಭಕರ್ಣ ವಿಶಾಲ ರಾಕ್ಷಸ ವೇಷ",
        "description": "Oversized Rakshasa attire with wide round crown, bushy yak-hair beard/moustache, padded torso lining, and deep purple-gold sash.",
        "category": "full_set",
        "character_type": "rakshasa",
        "tags": ["kumbhakarna", "giant", "asura", "comedy-fierce"],
        "sizes": ["XL", "Free"],
        "images": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2500.0,
        "price_per_slot": {"morning": 1100.0, "evening": 1450.0, "night": 2000.0},
        "security_deposit": 4000.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Round Kumbhakarna Crown", "Bushy Yak Hair Beard", "Wide Chest Guard", "Padded Undertunic"],
        "care_notes": "Comb yak hair beard with wide-tooth comb only.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RAK-004",
        "name": "Shoorpanakha Fierce Demoness Set",
        "kannada_name": "ಶೂರ್ಪನಖಿ ಭಯಂಕರ ವೇಷ",
        "description": "Dramatic female demon attire featuring black and blood-red silk robes, jagged-motif headgear, prosthetic claw gloves, and wild black tresses.",
        "category": "full_set",
        "character_type": "bannada",
        "tags": ["shoorpanakha", "demoness", "female-demon", "dramatic"],
        "sizes": ["Free", "M"],
        "images": [
            "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1800.0,
        "price_per_slot": {"morning": 800.0, "evening": 1050.0, "night": 1400.0},
        "security_deposit": 2800.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Jagged Headpiece", "Red & Black Saree Drape", "Claw Gloves", "Long Wild Wig"],
        "care_notes": "Do not pull hair strands. Keep gloves dry.",
        "troupe_grade": "performance"
    },

    # --- 3. STREE VESHA (Female Roles: Damayanthi, Mohini, Subhadra, Seetha) ---
    {
        "sku": "YK-STR-001",
        "name": "Damayanthi Royal Stree Vesha Full Set",
        "kannada_name": "ದಮಯಂತಿ ರಾಜ ಸ್ತ್ರೀ ವೇಷ ಸೆಟ್",
        "description": "Classical Yakshagana Stree Vesha attire with handwoven Kanjeevaram-style red zari saree, traditional conical Mundasu or floral headpiece, gold foil Jadai (braid ornament), waist belt, and bridal chest ornaments.",
        "category": "full_set",
        "character_type": "stree",
        "tags": ["stree-vesha", "damayanthi", "bridal", "saree", "classical", "badagu-thittu"],
        "sizes": ["Free", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2000.0,
        "price_per_slot": {"morning": 900.0, "evening": 1150.0, "night": 1600.0},
        "security_deposit": 3200.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Zari Silk Performance Saree", "Pleated Fan Drape", "Floral Pearl Mundasu / Tiara", "Golden Jadai (Braid Ornament)", "Stree Daabu Belt", "Choker & Long Haram Set"],
        "care_notes": "Dry clean only. Store floral tiara in protective case.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-STR-002",
        "name": "Mohini Divine Enchantress Vesha",
        "kannada_name": "ಮೋಹಿನಿ ದಿವ್ಯ ಮೋಹಕ ವೇಷ",
        "description": "Iridescent royal blue and peacock green Stree Vesha set with shimmer brocade, celestial sun-moon hair ornaments, and crystal waistband.",
        "category": "full_set",
        "character_type": "stree",
        "tags": ["mohini", "enchantress", "celestial", "dance-grade"],
        "sizes": ["Free", "S", "M"],
        "images": [
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2100.0,
        "price_per_slot": {"morning": 950.0, "evening": 1200.0, "night": 1700.0},
        "security_deposit": 3500.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Peacock Blue Silk Costume", "Sun-Moon Hair Clips", "Layered Waist Belts", "Jasmine Hair Garland (Faux Silk)"],
        "care_notes": "Gentle steam iron on low temperature only.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-STR-003",
        "name": "Seetha Devi Classical Forest/Ashrama Attire",
        "kannada_name": "ಸೀತಾ ದೇವಿ ಸಾತ್ವಿಕ ವೇಷ",
        "description": "Satvik Stree Vesha in warm saffron-ochre and unbleached cotton zari, gentle terracotta jewelry, and simple graceful headwrap.",
        "category": "full_set",
        "character_type": "stree",
        "tags": ["seetha", "satvik", "ramayana", "classical"],
        "sizes": ["Free", "M"],
        "images": [
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1600.0,
        "price_per_slot": {"morning": 750.0, "evening": 950.0, "night": 1300.0},
        "security_deposit": 2500.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Saffron Zari Saree", "Satvik Wood/Terracotta Ornaments", "Head Scarf", "Armlets"],
        "care_notes": "Wash hands before handling unbleached cotton fabric.",
        "troupe_grade": "performance"
    },

    # --- 4. VANARA & DIVINE HEROES (Hanuman, Sugreeva, Vali) ---
    {
        "sku": "YK-HAN-001",
        "name": "Hanuman Veeranjaneya Complete Fur & Mask Set",
        "kannada_name": "ವೀರಾಂಜನೇಯ ಹನುಮಂತ ಪೂರ್ಣ ಸೆಟ್",
        "description": "Renowned Yakshagana Hanuman costume featuring realistic fur bodysuit, golden Vanara Kireeta, sculpted jaw mask, articulated tail with brass bells, red dhoti, and golden chest emblem.",
        "category": "full_set",
        "character_type": "hanuman",
        "tags": ["hanuman", "veeranjaneya", "vanara", "mask", "tail", "stage-grade"],
        "sizes": ["Free", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2600.0,
        "price_per_slot": {"morning": 1200.0, "evening": 1500.0, "night": 2100.0},
        "security_deposit": 4500.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Vanara Gold Kireeta", "Hanuman Jaw Mask with Chutti", "White Fur Upper & Lower Suit", "Flexible 6-foot Bell Tail", "Red Silk Kachche", "Golden Gada (Mace)"],
        "care_notes": "Hang fur suit to air out immediately after show. Do not wash in washing machine.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-HAN-002",
        "name": "Sugreeva / Vali Kishkindha King Set",
        "kannada_name": "ಸುಗ್ರೀವ / ವಾಲಿ ಕಿಷ್ಕಿಂಧಾ ರಾಜ ವೇಷ",
        "description": "Regal Vanara monarch costume with pointed gold and ruby-cut headpiece, brown-gold fur accents, warrior chestplate, and twin arm cuffs.",
        "category": "full_set",
        "character_type": "hanuman",
        "tags": ["sugreeva", "vali", "kishkindha", "vanara-king"],
        "sizes": ["Free", "L"],
        "images": [
            "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 2300.0,
        "price_per_slot": {"morning": 1050.0, "evening": 1350.0, "night": 1850.0},
        "security_deposit": 3800.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Vanara King Kireeta", "Golden Breastplate", "Fur Accents & Tail", "Battle Kachche"],
        "care_notes": "Brush fur gently after use.",
        "troupe_grade": "performance"
    },

    # --- 5. RISHI / MUNI (Sages: Narada, Vishwamitra, Parashurama) ---
    {
        "sku": "YK-RSH-001",
        "name": "Narada Maharshi Veena & Sage Set",
        "kannada_name": "ನಾರದ ಮಹರ್ಷಿ ವೀಣೆ ಹಾಗೂ ವೇಷ",
        "description": "Complete Devashri Narada attire with high ascetic Mundasu turban, Tambura/Veena prop, Chipla hand cymbals, Rudraksha malas, and flowing saffron-white dhoti.",
        "category": "full_set",
        "character_type": "rishi",
        "tags": ["narada", "sage", "veena", "tambura", "rudraksha"],
        "sizes": ["Free", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1500.0,
        "price_per_slot": {"morning": 700.0, "evening": 850.0, "night": 1200.0},
        "security_deposit": 2500.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Ascetic Sage Mundasu", "Wood Carved Tambura/Veena", "Brass Chipla Cymbals", "Rudraksha Garlands", "Saffron Silk Angavastra & Dhoti"],
        "care_notes": "Tambura is an acoustic theatre prop; do not apply excessive tension to pegs.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-RSH-002",
        "name": "Parashurama Warrior Sage Fierce Set",
        "kannada_name": "ಪರಶುರಾಮ ಭಾರ್ಗವ ಕ್ಷಾತ್ರ ತಪಸ್ವಿ ವೇಷ",
        "description": "Fierce Brahmin warrior attire with Matted Jata Headpiece, tiger-print shoulder wrap, sacred thread, battle bow, and ceremonial silver Parashu (Battle Axe).",
        "category": "full_set",
        "character_type": "rishi",
        "tags": ["parashurama", "warrior-sage", "axe", "battle-axe"],
        "sizes": ["Free", "L", "XL"],
        "images": [
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1900.0,
        "price_per_slot": {"morning": 850.0, "evening": 1100.0, "night": 1500.0},
        "security_deposit": 3000.0,
        "total_units": 2,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Matted Jata Crown", "Silver Carved Battle Axe (Parashu)", "Tiger Print Sash", "Rudraksha Set", "Dhoti"],
        "care_notes": "Axe blade is theatre-safe blunt wood coated with silver foil.",
        "troupe_grade": "performance"
    },

    # --- 6. COMIC & VIDUSHAKA (Kodangi, Hasya characters) ---
    {
        "sku": "YK-COM-001",
        "name": "Kodangi / Vidushaka Comic Clown Full Attire",
        "kannada_name": "ಕೋದಂಗಿ / ವಿದೂಷಕ ಹಾಸ್ಯ ವೇಷ",
        "description": "Traditional Yakshagana Kodangi prelude attire featuring multi-colored conical fool's cap with tinkling brass bells, chequered red-yellow pantaloons, comical wooden spectacles, and jester staff.",
        "category": "full_set",
        "character_type": "comic",
        "tags": ["kodangi", "vidushaka", "comic", "hasya", "bells", "stage-grade"],
        "sizes": ["Free", "M", "L"],
        "images": [
            "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1200.0,
        "price_per_slot": {"morning": 550.0, "evening": 700.0, "night": 950.0},
        "security_deposit": 1800.0,
        "total_units": 4,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Kodangi Bell Cap", "Comical Spectacles", "Chequered Clown Pantaloons", "Jester Staff", "Ankle Bells"],
        "care_notes": "Do not submerge bell cap in water. Wipe clean.",
        "troupe_grade": "performance"
    },

    # --- 7. CROWNS & HEADGEAR (Kireeta, Mundasu) ---
    {
        "sku": "YK-CRW-001",
        "name": "Badagu-thittu Raja Kireeta (Grand Royal Crown)",
        "kannada_name": "ಬಡಗುತಿಟ್ಟು ಭವ್ಯ ರಾಜ ಕಿರೀಟ",
        "description": "Authentic master-carved lightweight Shivani wood Kireeta coated with pure 24k gold leaf foil, inlaid with mirror glass and crimson ruby stones. Standalone rental.",
        "category": "crown",
        "character_type": "raja",
        "tags": ["kireeta", "crown", "badagu-thittu", "wood-carved", "gold-leaf"],
        "sizes": ["Free (Adjustable strap)"],
        "images": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1200.0,
        "price_per_slot": {"morning": 550.0, "evening": 700.0, "night": 950.0},
        "security_deposit": 2500.0,
        "total_units": 4,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Shivani Wood Kireeta", "Protective Rigid Plywood Box", "Velvet Forehead Cushion Strap"],
        "care_notes": "Never expose to rain or moisture. Always store in padded box.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-CRW-002",
        "name": "Karna Sun-Ray Crest Kireeta",
        "kannada_name": "ಕರ್ಣ ಸೂರ್ಯ ಪ್ರಭಾ ಕಿರೀಟ",
        "description": "Distinctive radiant circular aureole crown symbolizing the Sun god, handcrafted with brass repousse and gold lacquer.",
        "category": "crown",
        "character_type": "raja",
        "tags": ["karna", "sun-crown", "tenku-thittu"],
        "sizes": ["Free"],
        "images": [
            "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 1000.0,
        "price_per_slot": {"morning": 450.0, "evening": 600.0, "night": 800.0},
        "security_deposit": 2000.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Sun Crest Kireeta", "Carry Case"],
        "care_notes": "Handle sun-rays with care.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-CRW-003",
        "name": "Tenku-thittu Pagadi / Mundasu (Turban Headgear)",
        "kannada_name": "ತೆಂಕುತಿಟ್ಟು ಪಗಡಿ / ಮುಂಡಾಸು",
        "description": "Intricately wound conical Tenku-thittu style Mundasu turban with rich silver and red borders, pre-formed on lightweight fibre base for rapid wearing.",
        "category": "crown",
        "character_type": "general",
        "tags": ["mundasu", "pagadi", "tenku-thittu", "turban"],
        "sizes": ["Free"],
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 850.0,
        "price_per_slot": {"morning": 400.0, "evening": 500.0, "night": 700.0},
        "security_deposit": 1500.0,
        "total_units": 5,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Structured Pagadi Mundasu", "Velvet dust bag"],
        "care_notes": "Do not crush.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-CRW-004",
        "name": "Stree Vesha Floral Mundasu & Tiara",
        "kannada_name": "ಸ್ತ್ರೀ ವೇಷ ಮುಂಡಾಸು ಮತ್ತು ಜಡೆ",
        "description": "Feminine headdress featuring beaded white and crimson faux-jasmine patterns, gold tiara crest, and trailing temple jewelry braid clasp.",
        "category": "crown",
        "character_type": "stree",
        "tags": ["stree", "mundasu", "tiara", "floral"],
        "sizes": ["Free"],
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 750.0,
        "price_per_slot": {"morning": 350.0, "evening": 450.0, "night": 600.0},
        "security_deposit": 1200.0,
        "total_units": 4,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Floral Mundasu Tiara", "Jadai Hair Extension Base"],
        "care_notes": "Keep in plastic zip pouch.",
        "troupe_grade": "performance"
    },

    # --- 8. ORNAMENTS & JEWELRY (Bhujakeerthi, Kante, Daabu) ---
    {
        "sku": "YK-ORN-001",
        "name": "Pair of Wooden Gold Foil Bhujakeerthi (Shoulder Guards)",
        "kannada_name": "ಭುಜಕೀರ್ತಿ ಜೋಡಿ (ಕೆತ್ತನೆಯ ಮರ)",
        "description": "Masterpiece pair of winged shoulder guards carved from light balsa/Shivani wood, embellished with dazzling red foil and gold leaf detailing. Complete with arm tie-cords.",
        "category": "ornament",
        "character_type": "raja",
        "tags": ["bhujakeerthi", "shoulder-guards", "wood-carved", "gold-foil"],
        "sizes": ["Free (Adjustable ties)"],
        "images": [
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 700.0,
        "price_per_slot": {"morning": 300.0, "evening": 400.0, "night": 550.0},
        "security_deposit": 1500.0,
        "total_units": 6,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Pair of Left & Right Bhujakeerthi", "Heavy Duty Cotton Arm Cords"],
        "care_notes": "Do not exert pressure on decorative wing tips.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-ORN-002",
        "name": "Edur Kante & Dagale (Carved Chest Guard & Collar)",
        "kannada_name": "ಎದುರು ಕಂತೆ ಮತ್ತು ಡಗಲೆ (ಎದೆ ಹಾರ)",
        "description": "Elaborate Yakshagana chestplate featuring three-tiered gold foil medallions, mirror embellishments, and velvet backing.",
        "category": "ornament",
        "character_type": "raja",
        "tags": ["kante", "chestplate", "collar", "gold"],
        "sizes": ["Free"],
        "images": [
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 650.0,
        "price_per_slot": {"morning": 300.0, "evening": 400.0, "night": 500.0},
        "security_deposit": 1200.0,
        "total_units": 5,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Edur Kante Chest Piece", "Neck Collar"],
        "care_notes": "Wipe with dry microfiber cloth.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-ORN-003",
        "name": "Golden Daabu (Heavy Yakshagana Waist Belt)",
        "kannada_name": "ಬಂಗಾರದ ಬಣ್ಣದ ದಾಬು (ಸೊಂಟದ ಪಟ್ಟಿ)",
        "description": "Wide traditional warrior waist belt studded with faux emeralds, rubies, and golden fringe hanging tassels. Provides structural support for pleated dhotis.",
        "category": "ornament",
        "character_type": "general",
        "tags": ["daabu", "waist-belt", "tassels", "gold"],
        "sizes": ["Free (30 to 42 inch waist)"],
        "images": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 500.0,
        "price_per_slot": {"morning": 250.0, "evening": 300.0, "night": 400.0},
        "security_deposit": 1000.0,
        "total_units": 6,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Embossed Waist Belt", "Side Tassels"],
        "care_notes": "Keep buckled when stored.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-ORN-004",
        "name": "Baju-band (Pair of Upper Arm Ornaments)",
        "kannada_name": "ಬಾಜುಬಂದ್ ಜೋಡಿ",
        "description": "Ornate pair of upper-arm bands carved with lion face (Simha-mukha) motifs and gold foil leaf.",
        "category": "ornament",
        "character_type": "raja",
        "tags": ["baju-band", "armbands", "simha-mukha"],
        "sizes": ["Free"],
        "images": [
            "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 400.0,
        "price_per_slot": {"morning": 200.0, "evening": 250.0, "night": 320.0},
        "security_deposit": 800.0,
        "total_units": 6,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Pair of Baju-band Armlets"],
        "care_notes": "Tie with cotton tape provided.",
        "troupe_grade": "performance"
    },

    # --- 9. GARMENTS (Pleated Skirts, Dhotis, Angavastras) ---
    {
        "sku": "YK-GAR-001",
        "name": "Red-Gold Checkered Pleated Kachche Skirt",
        "kannada_name": "ಕೆಂಪು ಬಂಗಾರ ಬಣ್ಣದ ಕಚ್ಚೆ ಲಂಗ",
        "description": "Traditional Yakshagana flared performance skirt stitched with heavy stiff cotton lining for maximum stage whirl and flare. Patterned in sacred red, yellow, and black checks.",
        "category": "garment",
        "character_type": "general",
        "tags": ["kachche", "skirt", "pleated", "cotton", "flared"],
        "sizes": ["Free (Drawstring waist)"],
        "images": [
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 600.0,
        "price_per_slot": {"morning": 300.0, "evening": 350.0, "night": 500.0},
        "security_deposit": 1000.0,
        "total_units": 8,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Flared Checkered Skirt", "Under-pleat Stiffener"],
        "care_notes": "Iron pleats carefully along stitched creases.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-GAR-002",
        "name": "Asura Fierce Multi-Tiered Battle Skirt",
        "kannada_name": "ಅಸುರ ಕಪ್ಪು-ಕೆಂಪು ಕದನ ಲಂಗ",
        "description": "Heavy three-tiered flared skirt tailored specifically for Rakshasa and Bannada roles, featuring dramatic triangular black, crimson, and flame-orange dagales.",
        "category": "garment",
        "character_type": "rakshasa",
        "tags": ["asura-skirt", "tiered", "flared", "rakshasa"],
        "sizes": ["Free (32 to 44 inch waist)"],
        "images": [
            "https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 750.0,
        "price_per_slot": {"morning": 350.0, "evening": 450.0, "night": 600.0},
        "security_deposit": 1400.0,
        "total_units": 4,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Three-tier Asura Battle Skirt"],
        "care_notes": "Dry clean only.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-GAR-003",
        "name": "Silk Angavastra & Shoulder Drape Set",
        "kannada_name": "ರೇಷ್ಮೆ ಅಂಗವಸ್ತ್ರ ಮತ್ತು ಶಲ್ಯ ಜೋಡಿ",
        "description": "Pair of pure raw silk shawls with wide temple zari borders, used for character entrance, royal postures, and emotional abhinaya.",
        "category": "garment",
        "character_type": "raja",
        "tags": ["angavastra", "silk", "zari", "shawl"],
        "sizes": ["Free (2.5 meters length)"],
        "images": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 400.0,
        "price_per_slot": {"morning": 200.0, "evening": 250.0, "night": 320.0},
        "security_deposit": 800.0,
        "total_units": 6,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Pair of Matching Silk Angavastras"],
        "care_notes": "Dry iron only.",
        "troupe_grade": "performance"
    },

    # --- 10. WEAPONS & STAGE PROPS (Gada, Dhanus, Swords) ---
    {
        "sku": "YK-WEP-001",
        "name": "Hanuman Golden Gada (Mace / Club)",
        "kannada_name": "ಹನುಮಂತನ ಸುವರ್ಣ ಗದೆ",
        "description": "Lightweight stage-performance Gada crafted with wooden core, papier-mache bulb, and brilliant 24k gold foil leaf with fluted grooves.",
        "category": "weapon",
        "character_type": "hanuman",
        "tags": ["gada", "mace", "hanuman", "prop", "gold"],
        "sizes": ["36 inches standard"],
        "images": [
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 500.0,
        "price_per_slot": {"morning": 250.0, "evening": 300.0, "night": 400.0},
        "security_deposit": 1000.0,
        "total_units": 5,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Carved Gold Foil Gada", "Padded Carry Bag"],
        "care_notes": "Stage prop for theatrical choreography. Do not strike against hard surfaces.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-WEP-002",
        "name": "Dhanus & Bana (Royal Curved Bow & Arrow Set)",
        "kannada_name": "ಧನುಸ್ಸು ಹಾಗೂ ಬಾಣ ಜೋಡಿ (ರಾಮ/ಅರ್ಜುನ)",
        "description": "Gracefully curved Yakshagana performance bow with silver-gold foil tips, taut nylon string, and matching quiver with 3 ornamental arrows.",
        "category": "weapon",
        "character_type": "raja",
        "tags": ["dhanus", "bow", "arrow", "arjuna", "rama"],
        "sizes": ["48 inches standard"],
        "images": [
            "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 450.0,
        "price_per_slot": {"morning": 200.0, "evening": 280.0, "night": 380.0},
        "security_deposit": 900.0,
        "total_units": 4,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Royal Bow (Dhanus)", "Quiver with Strap", "3 Stage-safe Arrows"],
        "care_notes": "Blunt decorative arrows.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-WEP-003",
        "name": "Carved Wooden Sword & Shield (Khadga & Parike)",
        "kannada_name": "ಕೆತ್ತನೆಯ ಮರದ ಖಡ್ಗ ಮತ್ತು ಪರಿಕೆ (ಗುರಾಣಿ)",
        "description": "Authentic Yakshagana battle set featuring curved wooden scimitar painted in silver leaf, and round shield painted with sun and tiger insignia.",
        "category": "weapon",
        "character_type": "general",
        "tags": ["sword", "shield", "khadga", "parike", "battle"],
        "sizes": ["Standard"],
        "images": [
            "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 550.0,
        "price_per_slot": {"morning": 250.0, "evening": 350.0, "night": 450.0},
        "security_deposit": 1000.0,
        "total_units": 5,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Wooden Stage Sword", "Round Sun Shield with Handstraps"],
        "care_notes": "Store dry.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-WEP-004",
        "name": "Devi Trishula (Sacred Golden Trident Prop)",
        "kannada_name": "ದೇವಿ ತ್ರಿಶೂಲ (ಬಂಗಾರದ ಛಾಯೆ)",
        "description": "Gleaming golden trident prop with sacred damaru rattle tied to the neck, ideal for Durga and Mahishasuramardini performances.",
        "category": "weapon",
        "character_type": "stree",
        "tags": ["trishula", "trident", "durga", "devi", "prop"],
        "sizes": ["54 inches"],
        "images": [
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 600.0,
        "price_per_slot": {"morning": 280.0, "evening": 380.0, "night": 500.0},
        "security_deposit": 1200.0,
        "total_units": 3,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Modular 2-piece Golden Trishula", "Mini Damaru Rattle"],
        "care_notes": "Screws together smoothly; do not over-torque threads.",
        "troupe_grade": "performance"
    },

    # --- 11. ACCESSORIES (Gaggara bells, Face-paint chutti base, Moustaches) ---
    {
        "sku": "YK-ACC-001",
        "name": "Heavy Brass Yakshagana Gaggara (Ankle Bells)",
        "kannada_name": "ಹಿತ್ತಾಳೆ ಗಗ್ಗರ (ಕಾಲ್ಗೆಜ್ಜೆ ಜೋಡಿ)",
        "description": "Heavy cast bell-metal (Panchaloha-look) ankle rings that produce the resounding metallic rhythmic sound characteristic of Yakshagana leaps and footwork.",
        "category": "accessory",
        "character_type": "general",
        "tags": ["gaggara", "ankle-bells", "brass", "percussion"],
        "sizes": ["Pair standard"],
        "images": [
            "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 400.0,
        "price_per_slot": {"morning": 200.0, "evening": 250.0, "night": 350.0},
        "security_deposit": 800.0,
        "total_units": 10,
        "buffer_days": 0,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Pair of Tuned Brass Gaggara", "Cloth Ankle Padding"],
        "care_notes": "Polish periodically with dry brass cleaner.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-ACC-002",
        "name": "Chutti Face-Paint Base & Contour Ridge Frame",
        "kannada_name": "ಮುಖವರ್ಣಿಕೆ ಚುಟ್ಟಿ ಅಚ್ಚು ಹಾಗೂ ಪರಿಕರ",
        "description": "Pre-moulded lightweight silicone/paper ridge base used for Badagu and Tenku facial contour makeup, reducing makeup application time from 3 hours to 30 minutes.",
        "category": "accessory",
        "character_type": "rakshasa",
        "tags": ["chutti", "makeup", "face-paint", "contour"],
        "sizes": ["Universal fit"],
        "images": [
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 350.0,
        "price_per_slot": {"morning": 150.0, "evening": 200.0, "night": 300.0},
        "security_deposit": 600.0,
        "total_units": 6,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Sanitized Chutti Ridge Frame", "Face Spirit Gum Adhesive"],
        "care_notes": "Sanitize with isopropyl alcohol wipe after removal.",
        "troupe_grade": "performance"
    },
    {
        "sku": "YK-ACC-003",
        "name": "Yak Hair Imperial Meeshe (Moustache & Beard Set)",
        "kannada_name": "ಯಾಕ್ ಕೂದಲಿನ ಭವ್ಯ ಮೀಸೆ ಹಾಗೂ ಗಡ್ಡ",
        "description": "Natural hand-knotted Himalayan yak hair moustache with upturned warrior curls and matching chin goatee, mounted on fine invisible theatrical lace.",
        "category": "accessory",
        "character_type": "raja",
        "tags": ["meeshe", "moustache", "beard", "yak-hair"],
        "sizes": ["Universal"],
        "images": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
        ],
        "price_per_day": 300.0,
        "price_per_slot": {"morning": 150.0, "evening": 200.0, "night": 250.0},
        "security_deposit": 500.0,
        "total_units": 8,
        "buffer_days": 1,
        "rental_mode": "both",
        "is_active": True,
        "includes": ["Lace Moustache", "Lace Chin Beard", "Adhesive Remover Wipe"],
        "care_notes": "Clean adhesive off lace with cotton bud and spirit.",
        "troupe_grade": "performance"
    }
]

async def seed_database(db):
    logger.info("Checking database seed status...")
    costumes_count = await db.costumes.count_documents({})
    
    # Seed or refresh costumes
    if costumes_count == 0:
        logger.info(f"Seeding {len(COSTUMES_SEED)} authentic Yakshagana costumes...")
        now = datetime.now(timezone.utc)
        for costume_data in COSTUMES_SEED:
            doc = dict(costume_data)
            doc["created_at"] = now
            await db.costumes.insert_one(doc)
        logger.info("Costumes seeded successfully.")
    else:
        logger.info(f"Database already has {costumes_count} costumes.")

    # Seed Admin & Demo Users
    admin_user = await db.users.find_one({"email": "admin@demo.com"})
    if not admin_user:
        admin_doc = {
            "name": "Yakshagana Admin",
            "email": "admin@demo.com",
            "phone": "+91 98800 12345",
            "password_hash": hash_password("Admin@123"),
            "role": "admin",
            "address": {
                "line1": "Car Street, Near Sri Krishna Temple",
                "city": "Udupi",
                "state": "Karnataka",
                "pincode": "576101"
            },
            "created_at": datetime.now(timezone.utc)
        }
        res = await db.users.insert_one(admin_doc)
        admin_id = str(res.inserted_id)
        logger.info("Admin user created (admin@demo.com / Admin@123)")
    else:
        admin_id = str(admin_user.get("_id"))

    customer_user = await db.users.find_one({"email": "customer@demo.com"})
    if not customer_user:
        cust_doc = {
            "name": "Pratheek Shetty (Troupe Director)",
            "email": "customer@demo.com",
            "phone": "+91 99001 54321",
            "password_hash": hash_password("Customer@123"),
            "role": "customer",
            "address": {
                "line1": "Kadri Temple Road",
                "city": "Mangaluru",
                "state": "Karnataka",
                "pincode": "575002"
            },
            "created_at": datetime.now(timezone.utc)
        }
        res = await db.users.insert_one(cust_doc)
        customer_id = str(res.inserted_id)
        logger.info("Demo Customer created (customer@demo.com / Customer@123)")
    else:
        customer_id = str(customer_user.get("_id"))

    # Seed realistic bookings to showcase calendar blocking & demo workflow
    bookings_count = await db.bookings.count_documents({})
    if bookings_count == 0:
        logger.info("Seeding realistic Yakshagana bookings for demo...")
        now = datetime.now(timezone.utc)
        today = now.date()
        
        # 1. Pre-existing Confirmed Booking (starts tomorrow, locks 1 unit of Raja Vesha)
        raja_costume = await db.costumes.find_one({"sku": "YK-RAJA-001"})
        if raja_costume:
            start_date = today + timedelta(days=1)
            end_date = today + timedelta(days=3)
            booking_code_1 = f"YKB-{start_date.strftime('%Y%m%d')}-1021"
            booking_1 = {
                "booking_code": booking_code_1,
                "user_id": customer_id,
                "user_name": "Pratheek Shetty (Troupe Director)",
                "user_email": "customer@demo.com",
                "items": [
                    {
                        "costume_id": str(raja_costume["_id"]),
                        "name": raja_costume["name"],
                        "image": raja_costume["images"][0],
                        "size": "L",
                        "quantity": 1,
                        "unit_price": raja_costume["price_per_day"],
                        "rental_mode": "day",
                        "start_at": start_date.strftime("%Y-%m-%d"),
                        "end_at": end_date.strftime("%Y-%m-%d"),
                        "slot": "full_day",
                        "blocked_until": (datetime(end_date.year, end_date.month, end_date.day, 23, 59, tzinfo=timezone.utc) + timedelta(days=1)).isoformat(),
                        "days": 3,
                        "item_subtotal": raja_costume["price_per_day"] * 3,
                        "item_deposit": raja_costume["security_deposit"]
                    }
                ],
                "event_details": {
                    "event_name": "Kundapura Yakshothsava 2026",
                    "troupe_name": "Mandarthi Yakshagana Mela",
                    "venue": "Sharada Kalamandira",
                    "city": "Kundapura",
                    "contact_phone": "+91 99001 54321",
                    "notes": "Costume required for main Arjuna character role."
                },
                "pricing": {
                    "subtotal": raja_costume["price_per_day"] * 3,
                    "deposit": raja_costume["security_deposit"],
                    "taxes": round(raja_costume["price_per_day"] * 3 * 0.05, 2),
                    "discount": 0.0,
                    "total_payable": round((raja_costume["price_per_day"] * 3) + raja_costume["security_deposit"] + (raja_costume["price_per_day"] * 3 * 0.05), 2)
                },
                "status": "confirmed",
                "payment": {
                    "provider": "razorpay",
                    "order_id": "order_demo_1021",
                    "payment_id": "pay_demo_success_8832",
                    "status": "paid",
                    "paid_at": now - timedelta(hours=3)
                },
                "pickup_mode": "self_pickup",
                "notes": "Demo confirmed booking",
                "created_at": now - timedelta(hours=3),
                "updated_at": now - timedelta(hours=3)
            }
            await db.bookings.insert_one(booking_1)

        # 2. Picked-up Booking (Hanuman set currently in performance)
        hanuman_costume = await db.costumes.find_one({"sku": "YK-HAN-001"})
        if hanuman_costume:
            start_date_2 = today - timedelta(days=1)
            end_date_2 = today + timedelta(days=1)
            booking_code_2 = f"YKB-{start_date_2.strftime('%Y%m%d')}-2045"
            booking_2 = {
                "booking_code": booking_code_2,
                "user_id": customer_id,
                "user_name": "Pratheek Shetty (Troupe Director)",
                "user_email": "customer@demo.com",
                "items": [
                    {
                        "costume_id": str(hanuman_costume["_id"]),
                        "name": hanuman_costume["name"],
                        "image": hanuman_costume["images"][0],
                        "size": "Free",
                        "quantity": 1,
                        "unit_price": hanuman_costume["price_per_slot"]["night"],
                        "rental_mode": "slot",
                        "start_at": start_date_2.strftime("%Y-%m-%d"),
                        "end_at": end_date_2.strftime("%Y-%m-%d"),
                        "slot": "night",
                        "blocked_until": (datetime(end_date_2.year, end_date_2.month, end_date_2.day, 6, 0, tzinfo=timezone.utc) + timedelta(days=1)).isoformat(),
                        "days": 2,
                        "item_subtotal": hanuman_costume["price_per_slot"]["night"] * 2,
                        "item_deposit": hanuman_costume["security_deposit"]
                    }
                ],
                "event_details": {
                    "event_name": "Kodial Theru All-Night Yakshagana",
                    "troupe_name": "Dharmasthala Yakshagana Mandali",
                    "venue": "Venkataramana Temple Maidan",
                    "city": "Mangaluru",
                    "contact_phone": "+91 99001 54321",
                    "notes": "Overnight show 9 PM to 5 AM."
                },
                "pricing": {
                    "subtotal": hanuman_costume["price_per_slot"]["night"] * 2,
                    "deposit": hanuman_costume["security_deposit"],
                    "taxes": round(hanuman_costume["price_per_slot"]["night"] * 2 * 0.05, 2),
                    "discount": 0.0,
                    "total_payable": round((hanuman_costume["price_per_slot"]["night"] * 2) + hanuman_costume["security_deposit"] + (hanuman_costume["price_per_slot"]["night"] * 2 * 0.05), 2)
                },
                "status": "picked_up",
                "payment": {
                    "provider": "razorpay",
                    "order_id": "order_demo_2045",
                    "payment_id": "pay_demo_success_9912",
                    "status": "paid",
                    "paid_at": now - timedelta(days=1)
                },
                "pickup_mode": "self_pickup",
                "notes": "Picked up yesterday afternoon by troupe assistant.",
                "created_at": now - timedelta(days=2),
                "updated_at": now - timedelta(days=1)
            }
            await db.bookings.insert_one(booking_2)

        # 3. Returned Booking showing full refund lifecycle
        stree_costume = await db.costumes.find_one({"sku": "YK-STR-001"})
        if stree_costume:
            start_date_3 = today - timedelta(days=5)
            end_date_3 = today - timedelta(days=4)
            booking_code_3 = f"YKB-{start_date_3.strftime('%Y%m%d')}-3098"
            booking_3 = {
                "booking_code": booking_code_3,
                "user_id": customer_id,
                "user_name": "Pratheek Shetty (Troupe Director)",
                "user_email": "customer@demo.com",
                "items": [
                    {
                        "costume_id": str(stree_costume["_id"]),
                        "name": stree_costume["name"],
                        "image": stree_costume["images"][0],
                        "size": "M",
                        "quantity": 1,
                        "unit_price": stree_costume["price_per_day"],
                        "rental_mode": "day",
                        "start_at": start_date_3.strftime("%Y-%m-%d"),
                        "end_at": end_date_3.strftime("%Y-%m-%d"),
                        "slot": "full_day",
                        "blocked_until": (datetime(end_date_3.year, end_date_3.month, end_date_3.day, 23, 59, tzinfo=timezone.utc) + timedelta(days=1)).isoformat(),
                        "days": 2,
                        "item_subtotal": stree_costume["price_per_day"] * 2,
                        "item_deposit": stree_costume["security_deposit"]
                    }
                ],
                "event_details": {
                    "event_name": "Udupi Paryaya Mahotsava",
                    "troupe_name": "Saligrama Mela",
                    "venue": "Rajangana Hall",
                    "city": "Udupi",
                    "contact_phone": "+91 99001 54321",
                    "notes": "Damayanthi character presentation."
                },
                "pricing": {
                    "subtotal": stree_costume["price_per_day"] * 2,
                    "deposit": stree_costume["security_deposit"],
                    "taxes": round(stree_costume["price_per_day"] * 2 * 0.05, 2),
                    "discount": 0.0,
                    "total_payable": round((stree_costume["price_per_day"] * 2) + stree_costume["security_deposit"] + (stree_costume["price_per_day"] * 2 * 0.05), 2)
                },
                "status": "returned",
                "payment": {
                    "provider": "razorpay",
                    "order_id": "order_demo_3098",
                    "payment_id": "pay_demo_success_4411",
                    "status": "paid",
                    "paid_at": now - timedelta(days=6)
                },
                "return_details": {
                    "returned_at": now - timedelta(days=2),
                    "damage_fee": 0.0,
                    "late_fee": 0.0,
                    "deposit_refunded": stree_costume["security_deposit"],
                    "inspection_notes": "Returned in immaculate condition. Full deposit refunded back to bank account."
                },
                "pickup_mode": "self_pickup",
                "notes": "Successfully completed rental cycle.",
                "created_at": now - timedelta(days=6),
                "updated_at": now - timedelta(days=2)
            }
            await db.bookings.insert_one(booking_3)

        logger.info("Sample bookings seeded successfully.")
