/**
 * PRECIMETAL™ INDUSTRIAL METAL WEIGHT & COSTING OS
 * Mathematical Calculation Engine
 * 
 * Based on factory verified spreadsheet methodology:
 * - Round formula: Rod² × (Length + 4) × 0.006676
 * - Square formula: Rod² × (Length + 4) × 0.007361
 * - Hexagon formula: Rod² × (Length + 4) × 0.0085
 * - Raw Metal Rate (Rod): Honey + ₹35
 * - Scrap Selling Rate (Chhol): Honey × (1 - 5%)
 * - Wastage Weight: Expected Material Weight - Actual Product Weight
 * - Raw Material Cost: (Material Wg [g] × Rod Rate [₹/kg]) / 1000
 * - Scrap Recovery Value: (Wastage Wg [g] × Scrap Rate [₹/kg]) / 1000
 * - Net Material Cost (Material Rs.): Raw Material Cost - Scrap Recovery
 * - Production Cost (Padtar Rs.): Material Cost + Labour (Majuri)
 * - Profit Amount: Padtar × Profit% / 100
 * - Final Selling Price: Padtar + Profit
 */

(function (window) {
    'use strict';

    // Default System Settings
    const DEFAULT_SETTINGS = {
        coefficients: {
            round: 0.006676,
            square: 0.007361,
            hex: 0.0085
        },
        lengthAdjustment: 4.0, // Fixed allowance for parting/facing in mm
        rawMetalMarkup: 21.0,  // ₹21 added to Honey market price (Rod = Honey + 21)
        scrapDeductionPercent: 5.0, // 5% deducted from Honey market price
        defaultLabour: 0.35,   // Majuri Rs. per piece
        defaultProfitPercent: 15.0, // Standard target margin
        currencySymbol: '₹',
        weightUnit: 'g',
        dimensionUnit: 'mm',
        densityPreset: 'brass_standard'
    };

    // Material Presets Library
    const MATERIAL_PRESETS = {
        brass_standard: {
            name: 'Brass Standard (Jamnagar Alloy / CuZn40Pb2)',
            density: 8.50,
            coefficients: { round: 0.006676, square: 0.007361, hex: 0.0085 },
            description: 'Industry standard for precision turned brass electrical and hardware components.'
        },
        copper: {
            name: 'Pure Copper (Electrolytic ETP)',
            density: 8.96,
            coefficients: { round: 0.007037, square: 0.007759, hex: 0.008960 },
            description: 'High conductivity copper rods for terminals and heavy electrical fasteners.'
        },
        mild_steel: {
            name: 'Mild Steel / EN1A (Free Cutting)',
            density: 7.85,
            coefficients: { round: 0.006165, square: 0.006798, hex: 0.007850 },
            description: 'Automotive and general engineering turned pins, screws, and studs.'
        },
        ss304: {
            name: 'Stainless Steel 304 / 316',
            density: 7.93,
            coefficients: { round: 0.006228, square: 0.006867, hex: 0.007930 },
            description: 'Corrosion resistant industrial valves, medical and marine fittings.'
        },
        aluminium: {
            name: 'Aluminium 6061 / 6082',
            density: 2.70,
            coefficients: { round: 0.002121, square: 0.002338, hex: 0.002700 },
            description: 'Lightweight aerospace and thermal precision CNC turned parts.'
        }
    };

    class MetalCalculator {
        constructor(customSettings = {}) {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, customSettings);
            if (customSettings.coefficients) {
                this.settings.coefficients = Object.assign({}, DEFAULT_SETTINGS.coefficients, customSettings.coefficients);
            }
        }

        /**
         * Update engine settings at runtime
         */
        updateSettings(newSettings) {
            this.settings = Object.assign({}, this.settings, newSettings);
            if (newSettings.coefficients) {
                this.settings.coefficients = Object.assign({}, this.settings.coefficients, newSettings.coefficients);
            }
        }

        /**
         * Reset settings to factory defaults
         */
        resetSettings() {
            this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            return this.settings;
        }

        /**
         * Calculate theoretical expected material weight per piece (in grams)
         * Formula: W = Rod² × (Length + FixedAdjustment) × Coefficient
         * 
         * @param {string} geometry 'round' | 'square' | 'hex'
         * @param {number} rod Diameter or across-flats dimension (mm)
         * @param {number} length Component length (mm)
         * @returns {number} Expected weight in grams (unrounded)
         */
        calculateExpectedWeight(geometry, rod, length) {
            const r = parseFloat(rod) || 0;
            const l = parseFloat(length) || 0;
            const allowance = parseFloat(this.settings.lengthAdjustment) || 0;
            const geom = (geometry || 'round').toLowerCase();

            if (r <= 0 || l <= 0) return 0;

            const coeff = this.settings.coefficients[geom] !== undefined 
                ? this.settings.coefficients[geom] 
                : DEFAULT_SETTINGS.coefficients.round;

            // W = R² × (L + 4) × coeff
            return r * r * (l + allowance) * coeff;
        }

        /**
         * Calculate metal pricing rates based on market benchmark Honey
         * 
         * @param {number} honey Current market price in ₹/kg
         * @returns {object} { honey, rodRate, scrapRate, markup, scrapDeductionPercent }
         */
        calculateRates(honey) {
            const h = parseFloat(honey) || 0;
            const markup = parseFloat(this.settings.rawMetalMarkup) || 0;
            const scrapDiscount = parseFloat(this.settings.scrapDeductionPercent) || 0;

            const rodRate = h > 0 ? h + markup : 0;
            const scrapRate = h > 0 ? h * (1 - scrapDiscount / 100) : 0;

            return {
                honey: h,
                rodRate: rodRate,
                scrapRate: scrapRate,
                markup: markup,
                scrapDeductionPercent: scrapDiscount
            };
        }

        /**
         * Perform complete industrial metal calculation and costing
         * Matches the Excel formula sheet with exact precision.
         * 
         * @param {object} params
         * @param {string} params.geometry 'round' | 'square' | 'hex'
         * @param {number} params.rod Rod dimension in mm
         * @param {number} params.length Length in mm
         * @param {number} params.honey Market price ₹/kg
         * @param {number} params.actualProductWeight Finished product weight in grams
         * @param {number} [params.labour] Labour charge (Majuri) ₹/pc (defaults to settings)
         * @param {number} [params.profitPercent] Target profit percentage (defaults to settings)
         * @param {string} [params.itemCode] Optional job/part identifier
         * @returns {object} Full calculation result object with raw and formatted metrics
         */
        calculate(params) {
            const {
                geometry = 'round',
                rod = 0,
                length = 0,
                honey = 0,
                actualProductWeight = 0,
                labour = this.settings.defaultLabour,
                profitPercent = this.settings.defaultProfitPercent,
                itemCode = 'A-1'
            } = params;

            const geom = (geometry || 'round').toLowerCase();
            const r = Math.max(0, parseFloat(rod) || 0);
            const l = Math.max(0, parseFloat(length) || 0);
            const h = Math.max(0, parseFloat(honey) || 0);
            const actualWeight = Math.max(0, parseFloat(actualProductWeight) || 0);
            const majuri = Math.max(0, parseFloat(labour !== undefined && labour !== null && labour !== '' ? labour : this.settings.defaultLabour) || 0);
            const targetProfitPct = Math.max(0, parseFloat(profitPercent !== undefined && profitPercent !== null && profitPercent !== '' ? profitPercent : this.settings.defaultProfitPercent) || 0);

            // 1. Expected Material Weight (g)
            const expectedWeight = this.calculateExpectedWeight(geom, r, l);

            // 2. Market Rates
            const rates = this.calculateRates(h);

            // 3. Wastage (Chhol) Weight (g)
            // Wastage = Material Wg - Actual Product Wg
            const wastageWeight = Math.max(0, expectedWeight - actualWeight);

            // Anomaly Check: Is finished weight higher than raw material?
            const isWeightOverload = expectedWeight > 0 && actualWeight > expectedWeight;
            const weightDiscrepancy = isWeightOverload ? actualWeight - expectedWeight : 0;

            // 4. Material Utilization & Wastage Percentage
            const materialUtilizationPct = expectedWeight > 0 ? (actualWeight / expectedWeight) * 100 : 0;
            const wastagePct = expectedWeight > 0 ? (wastageWeight / expectedWeight) * 100 : 0;

            // 5. Raw Material Purchase Cost per piece (E18 in Excel)
            // Raw Material Cost = (Material Wg [g] * Rod Rate [₹/kg]) / 1000
            const rawMaterialCost = (expectedWeight * rates.rodRate) / 1000.0;

            // 6. Scrap (Chhol) Recovery Value per piece (E20 in Excel)
            // Scrap Recovery = (Wastage Wg [g] * Scrap Rate [₹/kg]) / 1000
            const scrapRecoveryValue = (wastageWeight * rates.scrapRate) / 1000.0;

            // 7. Net Material Cost (E18 - E20 in Excel, Material Rs.)
            // Material Cost = Raw Material Purchase Cost - Scrap Recovery Value
            const netMaterialCost = rawMaterialCost - scrapRecoveryValue;

            // 8. Total Production Cost / Padtar Rs. (SUM(E22:E23) in Excel)
            // Padtar = Net Material Cost + Majuri (Labour)
            const hasInputs = (expectedWeight > 0 || h > 0 || actualWeight > 0);
            const padtar = hasInputs ? (netMaterialCost + majuri) : 0;

            // 9. Profit Amount in ₹ (E24 * B25 / 100 in Excel)
            // Profit = Padtar × Profit% / 100
            const profitAmount = hasInputs ? ((padtar * targetProfitPct) / 100.0) : 0;

            // 10. Final Product Selling Price (E24 + E25 in Excel)
            // Final Price = Padtar + Profit
            const finalSellingPrice = hasInputs ? (padtar + profitAmount) : 0;

            // Effective scrap recovery percentage of raw metal cost
            const scrapRecoveryPct = rawMaterialCost > 0 ? (scrapRecoveryValue / rawMaterialCost) * 100 : 0;

            return {
                timestamp: Date.now(),
                itemCode: itemCode || 'A-1',
                geometry: geom,
                rod: r,
                length: l,
                lengthAdjustment: this.settings.lengthAdjustment,
                coefficientUsed: this.settings.coefficients[geom] || 0,
                honey: h,
                rodRate: rates.rodRate,
                scrapRate: rates.scrapRate,
                markup: rates.markup,
                scrapDeductionPercent: rates.scrapDeductionPercent,
                expectedWeight: expectedWeight,
                actualWeight: actualWeight,
                wastageWeight: wastageWeight,
                isWeightOverload: isWeightOverload,
                weightDiscrepancy: weightDiscrepancy,
                materialUtilizationPct: materialUtilizationPct,
                wastagePct: wastagePct,
                rawMaterialCost: rawMaterialCost,
                scrapRecoveryValue: scrapRecoveryValue,
                scrapRecoveryPct: scrapRecoveryPct,
                netMaterialCost: netMaterialCost,
                majuri: majuri,
                padtar: padtar,
                profitPercent: targetProfitPct,
                profitAmount: profitAmount,
                finalSellingPrice: finalSellingPrice,

                // Formatted string representations (2 decimal places standard for currency)
                formatted: {
                    expectedWeight: expectedWeight.toFixed(2),
                    expectedWeightExact: expectedWeight.toFixed(4),
                    actualWeight: actualWeight.toFixed(2),
                    wastageWeight: wastageWeight.toFixed(2),
                    honey: rates.honey.toFixed(2),
                    rodRate: rates.rodRate.toFixed(2),
                    scrapRate: rates.scrapRate.toFixed(2),
                    rawMaterialCost: rawMaterialCost.toFixed(2),
                    scrapRecoveryValue: scrapRecoveryValue.toFixed(2),
                    netMaterialCost: netMaterialCost.toFixed(2),
                    majuri: majuri.toFixed(2),
                    padtar: padtar.toFixed(2),
                    profitAmount: profitAmount.toFixed(2),
                    finalSellingPrice: finalSellingPrice.toFixed(2),
                    materialUtilizationPct: materialUtilizationPct.toFixed(1),
                    wastagePct: wastagePct.toFixed(1),
                    scrapRecoveryPct: scrapRecoveryPct.toFixed(1)
                }
            };
        }

        /**
         * Calculate batch metrics for industrial production runs (e.g. 1000 pcs)
         * 
         * @param {object} singleResult Output from calculate()
         * @param {number} quantity Batch quantity in pieces
         * @returns {object} Batch summary
         */
        calculateBatch(singleResult, quantity) {
            const qty = Math.max(1, parseInt(quantity, 10) || 1);
            const sr = singleResult;

            const totalRawMaterialKg = (sr.expectedWeight * qty) / 1000.0;
            const totalFinishedWeightKg = (sr.actualWeight * qty) / 1000.0;
            const totalScrapKg = (sr.wastageWeight * qty) / 1000.0;

            const totalRawMaterialCost = sr.rawMaterialCost * qty;
            const totalScrapRecoveryValue = sr.scrapRecoveryValue * qty;
            const totalNetMaterialCost = sr.netMaterialCost * qty;
            const totalLabourCost = sr.majuri * qty;
            const totalProductionCost = sr.padtar * qty;
            const totalProfit = sr.profitAmount * qty;
            const totalOrderValue = sr.finalSellingPrice * qty;

            return {
                quantity: qty,
                totalRawMaterialKg: totalRawMaterialKg,
                totalFinishedWeightKg: totalFinishedWeightKg,
                totalScrapKg: totalScrapKg,
                totalRawMaterialCost: totalRawMaterialCost,
                totalScrapRecoveryValue: totalScrapRecoveryValue,
                totalNetMaterialCost: totalNetMaterialCost,
                totalLabourCost: totalLabourCost,
                totalProductionCost: totalProductionCost,
                totalProfit: totalProfit,
                totalOrderValue: totalOrderValue,
                formatted: {
                    quantity: qty.toLocaleString(),
                    totalRawMaterialKg: totalRawMaterialKg.toFixed(2),
                    totalFinishedWeightKg: totalFinishedWeightKg.toFixed(2),
                    totalScrapKg: totalScrapKg.toFixed(2),
                    totalRawMaterialCost: totalRawMaterialCost.toFixed(2),
                    totalScrapRecoveryValue: totalScrapRecoveryValue.toFixed(2),
                    totalNetMaterialCost: totalNetMaterialCost.toFixed(2),
                    totalLabourCost: totalLabourCost.toFixed(2),
                    totalProductionCost: totalProductionCost.toFixed(2),
                    totalProfit: totalProfit.toFixed(2),
                    totalOrderValue: totalOrderValue.toFixed(2)
                }
            };
        }
    }

    // Export globally
    window.MetalCalculator = MetalCalculator;
    window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
    window.MATERIAL_PRESETS = MATERIAL_PRESETS;

})(typeof window !== 'undefined' ? window : this);
