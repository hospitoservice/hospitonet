// src/resources/Labtest.ts
export interface LabTest {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    preparation: string;
    resultsIn: string;
    popular: boolean;
}

export const LAB_TESTS: LabTest[] = [
    {
        id: 'LT001',
        name: 'Complete Blood Count (CBC)',
        category: 'Hematology',
        price: 399,
        description: 'Measures various components of blood including red blood cells, white blood cells, and platelets.',
        preparation: 'Fasting not required',
        resultsIn: '24 hours',
        popular: true
    },
    {
        id: 'LT002',
        name: 'Lipid Profile',
        category: 'Cardiac',
        price: 599,
        description: 'Measures cholesterol and triglyceride levels to assess heart disease risk.',
        preparation: 'Fasting for 10-12 hours required',
        resultsIn: '24 hours',
        popular: true
    },
    {
        id: 'LT003',
        name: 'Liver Function Test (LFT)',
        category: 'Liver',
        price: 799,
        description: 'Measures enzymes and proteins in your blood to assess liver health.',
        preparation: 'Fasting not required',
        resultsIn: '24-48 hours',
        popular: true
    },
    {
        id: 'LT004',
        name: 'Thyroid Profile (T3, T4, TSH)',
        category: 'Endocrine',
        price: 899,
        description: 'Measures thyroid hormone levels to diagnose thyroid disorders.',
        preparation: 'Fasting not required',
        resultsIn: '24 hours',
        popular: false
    },
    {
        id: 'LT005',
        name: 'HbA1c (Glycated Hemoglobin)',
        category: 'Diabetes',
        price: 499,
        description: 'Measures average blood sugar levels over the past 2-3 months.',
        preparation: 'Fasting not required',
        resultsIn: '24 hours',
        popular: true
    },
    {
        id: 'LT006',
        name: 'Vitamin D, 25-Hydroxy',
        category: 'Vitamins',
        price: 1299,
        description: 'Measures the level of vitamin D in your blood.',
        preparation: 'Fasting not required',
        resultsIn: '48-72 hours',
        popular: false
    }
];

export const TEST_CATEGORIES = [
    { id: 'all', name: 'All Tests' },
    { id: 'popular', name: 'Popular Tests' },
    { id: 'hematology', name: 'Hematology' },
    { id: 'cardiac', name: 'Cardiac' },
    { id: 'liver', name: 'Liver' },
    { id: 'diabetes', name: 'Diabetes' },
    { id: 'vitamins', name: 'Vitamins' },
    { id: 'endocrine', name: 'Endocrine' }
];