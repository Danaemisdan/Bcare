// Comprehensive Indian Medicines Catalog & Instant Search Service

export interface IndianMedicineItem {
  id: string;
  name: string;
  genericComposition: string;
  specification: string; // e.g. "Film-Coated Tablet", "Capsule", "Suspension 60ml"
  category: string;
  defaultDosage: string;
  defaultFrequency: string;
  defaultDuration: string;
  instructions: string;
  image: string;
}

export const INDIAN_MEDICINES_CATALOG: IndianMedicineItem[] = [
  {
    id: 'med-dolo650',
    name: 'Dolo 650',
    genericComposition: 'Paracetamol IP 650mg',
    specification: 'Oral Tablet (Strip of 15)',
    category: 'Antipyretic / Pain Relief',
    defaultDosage: '650mg',
    defaultFrequency: '1-0-1 After Food',
    defaultDuration: '3 to 5 Days',
    instructions: 'Take with warm water after food for fever or pain relief.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-pand',
    name: 'Pan-D',
    genericComposition: 'Pantoprazole 40mg + Domperidone 30mg SR',
    specification: 'Sustained-Release Capsule (Strip of 15)',
    category: 'Gastroenterology / PPI & Antiemetic',
    defaultDosage: '40mg / 30mg',
    defaultFrequency: '1-0-0 Before Food',
    defaultDuration: '14 Days',
    instructions: 'Take 30 minutes before morning breakfast with plain water.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-augmentin625',
    name: 'Augmentin 625 Duo',
    genericComposition: 'Amoxicillin 500mg + Potassium Clavulanate 125mg',
    specification: 'Film-Coated Tablet (Strip of 10)',
    category: 'Antibiotic / Respiratory & ENT',
    defaultDosage: '625mg',
    defaultFrequency: '1-0-1 After Food',
    defaultDuration: '5 Days',
    instructions: 'Complete full 5-day antibiotic course; take after meals.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-telma40',
    name: 'Telma 40',
    genericComposition: 'Telmisartan IP 40mg',
    specification: 'Uncoated Tablet (Strip of 15)',
    category: 'Cardiology / Antihypertensive',
    defaultDosage: '40mg',
    defaultFrequency: '1-0-0 Morning',
    defaultDuration: '30 Days',
    instructions: 'Take once daily at fixed morning time; monitor blood pressure.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-atorva20',
    name: 'Atorva 20',
    genericComposition: 'Atorvastatin IP 20mg',
    specification: 'Film-Coated Tablet (Strip of 15)',
    category: 'Cardiology / Lipid Lowering',
    defaultDosage: '20mg',
    defaultFrequency: '0-0-1 Night',
    defaultDuration: '30 Days',
    instructions: 'Take once daily at bedtime with water.',
    image: 'https://images.unsplash.com/photo-1550572017-ed06509f6b52?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-glycometgp1',
    name: 'Glycomet-GP 1',
    genericComposition: 'Metformin 500mg SR + Glimepiride 1mg',
    specification: 'Sustained-Release Tablet (Strip of 15)',
    category: 'Diabetology / Blood Sugar Control',
    defaultDosage: '500mg / 1mg',
    defaultFrequency: '1-0-0 Morning with Breakfast',
    defaultDuration: '30 Days',
    instructions: 'Take with first main meal of the day.',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-azithral500',
    name: 'Azithral 500',
    genericComposition: 'Azithromycin IP 500mg',
    specification: 'Film-Coated Tablet (Strip of 5)',
    category: 'Antibiotic / Throat & Chest Infection',
    defaultDosage: '500mg',
    defaultFrequency: '1-0-0 Once Daily',
    defaultDuration: '3 Days',
    instructions: 'Take once daily 1 hour before or 2 hours after food.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-allegra120',
    name: 'Allegra 120',
    genericComposition: 'Fexofenadine Hydrochloride 120mg',
    specification: 'Oral Tablet (Strip of 10)',
    category: 'Antihistamine / Allergy & Rhinitis',
    defaultDosage: '120mg',
    defaultFrequency: '0-0-1 Night',
    defaultDuration: '7 Days',
    instructions: 'Take with plain water for allergy and sneezing relief.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-montairlc',
    name: 'Montair-LC',
    genericComposition: 'Levocetirizine 5mg + Montelukast 10mg',
    specification: 'Film-Coated Tablet (Strip of 10)',
    category: 'Pulmonology / Asthma & Allergic Cough',
    defaultDosage: '5mg / 10mg',
    defaultFrequency: '0-0-1 Night',
    defaultDuration: '10 Days',
    instructions: 'Take once daily at bedtime.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-combiflam',
    name: 'Combiflam',
    genericComposition: 'Ibuprofen 400mg + Paracetamol 325mg',
    specification: 'Oral Tablet (Strip of 20)',
    category: 'Orthopedics / Joint Pain & Inflammation',
    defaultDosage: '400mg / 325mg',
    defaultFrequency: '1-0-1 SOS After Food',
    defaultDuration: '3 Days',
    instructions: 'Take strictly after food. Do not take on empty stomach.',
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-gelusil',
    name: 'Gelusil MPS Liquid',
    genericComposition: 'Aluminium Hydroxide + Magnesium Hydroxide + Dimethicone',
    specification: 'Oral Suspension 200ml Bottle',
    category: 'Gastroenterology / Immediate Antacid',
    defaultDosage: '10ml',
    defaultFrequency: '1-1-1 After Meals',
    defaultDuration: '7 Days',
    instructions: 'Shake well before use. Take 2 spoonfuls after meals.',
    image: 'https://images.unsplash.com/photo-1550572017-ed06509f6b52?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-cifran500',
    name: 'Cifran 500',
    genericComposition: 'Ciprofloxacin IP 500mg',
    specification: 'Film-Coated Tablet (Strip of 10)',
    category: 'Antibiotic / GI & Urinary Tract',
    defaultDosage: '500mg',
    defaultFrequency: '1-0-1 After Food',
    defaultDuration: '5 Days',
    instructions: 'Drink plenty of water throughout the day.',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-omez20',
    name: 'Omez 20',
    genericComposition: 'Omeprazole IP 20mg',
    specification: 'Enteric-Coated Capsule (Strip of 20)',
    category: 'Gastroenterology / Acid Reflux',
    defaultDosage: '20mg',
    defaultFrequency: '1-0-0 Before Breakfast',
    defaultDuration: '14 Days',
    instructions: 'Swallow whole with water 30 mins before first meal.',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-volini',
    name: 'Volini Gel',
    genericComposition: 'Diclofenac Diethylamine + Methyl Salicylate + Menthol',
    specification: 'Topical Gel 30g Tube',
    category: 'Orthopedics / Topical Pain Relief',
    defaultDosage: 'Apply gently',
    defaultFrequency: '2 to 3 times daily',
    defaultDuration: '7 Days',
    instructions: 'Apply thin film to affected joints; do not rub vigorously.',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'med-becosules',
    name: 'Becosules Z',
    genericComposition: 'Vitamin B-Complex with Vitamin C + Zinc',
    specification: 'Softgel Capsule (Strip of 20)',
    category: 'Vitamins & Supplements',
    defaultDosage: '1 Capsule',
    defaultFrequency: '1-0-0 After Lunch',
    defaultDuration: '30 Days',
    instructions: 'Take once daily after meals for general stamina.',
    image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=300&auto=format&fit=crop&q=80'
  }
];

export function searchIndianMedicines(query: string): IndianMedicineItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return INDIAN_MEDICINES_CATALOG.slice(0, 8);

  return INDIAN_MEDICINES_CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.genericComposition.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.specification.toLowerCase().includes(q)
  );
}
