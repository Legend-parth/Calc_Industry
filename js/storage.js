/**
 * PRECIMETAL™ INDUSTRIAL METAL WEIGHT & COSTING OS
 * Local Storage, Settings, and History Manager
 */

(function (window) {
    'use strict';

    const SETTINGS_KEY = 'precimetal_settings_v2';
    const LEGACY_KEY_V1 = 'precimetal_settings_v1';
    const HISTORY_KEY = 'precimetal_history_v1';

    class StorageManager {
        constructor() {
            this.settings = this.loadSettings();
            this.history = this.loadHistory();
        }

        /**
         * Load persistent settings from localStorage or fallback to defaults
         */
        loadSettings() {
            try {
                // Clean up legacy v1 key if present
                if (localStorage.getItem(LEGACY_KEY_V1)) {
                    localStorage.removeItem(LEGACY_KEY_V1);
                }

                const stored = localStorage.getItem(SETTINGS_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed.rawMetalMarkup === 35 || parsed.rawMetalMarkup === 35.0 || !parsed.rawMetalMarkup) {
                        parsed.rawMetalMarkup = 21.0;
                    }
                    const merged = Object.assign({}, window.DEFAULT_SETTINGS, parsed, {
                        rawMetalMarkup: (parsed.rawMetalMarkup === 35 || parsed.rawMetalMarkup === 35.0 || !parsed.rawMetalMarkup) ? 21.0 : parsed.rawMetalMarkup,
                        coefficients: Object.assign({}, window.DEFAULT_SETTINGS.coefficients, parsed.coefficients || {})
                    });
                    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
                    return merged;
                }
            } catch (err) {
                console.warn('Failed to load settings from storage:', err);
            }
            const defaults = JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS));
            defaults.rawMetalMarkup = 21.0;
            return defaults;
        }

        /**
         * Save settings to localStorage
         */
        saveSettings(newSettings) {
            try {
                this.settings = Object.assign({}, this.settings, newSettings);
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
                return true;
            } catch (err) {
                console.error('Failed to save settings:', err);
                return false;
            }
        }

        /**
         * Reset settings to factory defaults
         */
        resetSettings() {
            try {
                localStorage.removeItem(SETTINGS_KEY);
                localStorage.removeItem(LEGACY_KEY_V1);
                this.settings = JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS));
                this.settings.rawMetalMarkup = 21.0;
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
                return this.settings;
            } catch (err) {
                console.error('Failed to reset settings:', err);
                return window.DEFAULT_SETTINGS;
            }
        }

        /**
         * Load calculation history array
         */
        loadHistory() {
            try {
                const stored = localStorage.getItem(HISTORY_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (err) {
                console.warn('Failed to load history from storage:', err);
            }
            return [];
        }

        /**
         * Save a calculation record to history
         */
        saveCalculation(calcResult, notes = '') {
            try {
                const record = {
                    id: 'calc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    createdAt: new Date().toISOString(),
                    itemCode: calcResult.itemCode || 'Untitled Part',
                    geometry: calcResult.geometry,
                    rod: calcResult.rod,
                    length: calcResult.length,
                    honey: calcResult.honey,
                    rodRate: calcResult.rodRate,
                    scrapRate: calcResult.scrapRate,
                    expectedWeight: calcResult.expectedWeight,
                    actualWeight: calcResult.actualWeight,
                    wastageWeight: calcResult.wastageWeight,
                    rawMaterialCost: calcResult.rawMaterialCost,
                    scrapRecoveryValue: calcResult.scrapRecoveryValue,
                    netMaterialCost: calcResult.netMaterialCost,
                    majuri: calcResult.majuri,
                    padtar: calcResult.padtar,
                    profitPercent: calcResult.profitPercent,
                    profitAmount: calcResult.profitAmount,
                    finalSellingPrice: calcResult.finalSellingPrice,
                    materialUtilizationPct: calcResult.materialUtilizationPct,
                    notes: notes || '',
                    snapshotSettings: {
                        coefficients: Object.assign({}, calcResult.coefficientUsed ? { [calcResult.geometry]: calcResult.coefficientUsed } : {}),
                        markup: calcResult.markup,
                        scrapDeduction: calcResult.scrapDeductionPercent,
                        lengthAdjustment: calcResult.lengthAdjustment
                    }
                };

                this.history.unshift(record); // Prepend newest first
                // Keep max 200 records in browser storage
                if (this.history.length > 200) {
                    this.history = this.history.slice(0, 200);
                }
                localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
                return record;
            } catch (err) {
                console.error('Failed to save calculation to history:', err);
                return null;
            }
        }

        /**
         * Delete a record by ID
         */
        deleteCalculation(id) {
            try {
                this.history = this.history.filter(item => item.id !== id);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
                return true;
            } catch (err) {
                console.error('Failed to delete calculation:', err);
                return false;
            }
        }

        /**
         * Clear all history
         */
        clearHistory() {
            try {
                this.history = [];
                localStorage.removeItem(HISTORY_KEY);
                return true;
            } catch (err) {
                console.error('Failed to clear history:', err);
                return false;
            }
        }

        /**
         * Export history to CSV format matching industrial spreadsheet columns
         */
        exportToCSV() {
            if (!this.history || this.history.length === 0) {
                alert('No calculation records to export.');
                return;
            }

            const headers = [
                'ID',
                'Date & Time',
                'Item / Part Code',
                'Geometry',
                'Rod Dimension (mm)',
                'Length (mm)',
                'Theoretical Weight (g)',
                'Actual Product Weight (g)',
                'Wastage Scrap Weight (g)',
                'Utilization (%)',
                'Honey Market Rate (Rs/kg)',
                'Rod Purchase Rate (Rs/kg)',
                'Scrap Selling Rate (Rs/kg)',
                'Raw Material Cost (Rs/pc)',
                'Scrap Recovery Value (Rs/pc)',
                'Net Material Cost (Rs/pc)',
                'Labour Majuri (Rs/pc)',
                'Padtar Production Cost (Rs/pc)',
                'Profit (%)',
                'Profit Amount (Rs/pc)',
                'Final Selling Price (Rs/pc)',
                'Notes'
            ];

            const rows = this.history.map(item => [
                `"${item.id}"`,
                `"${new Date(item.createdAt).toLocaleString()}"`,
                `"${(item.itemCode || '').replace(/"/g, '""')}"`,
                `"${item.geometry.toUpperCase()}"`,
                item.rod.toFixed(2),
                item.length.toFixed(2),
                item.expectedWeight.toFixed(2),
                item.actualWeight.toFixed(2),
                item.wastageWeight.toFixed(2),
                item.materialUtilizationPct.toFixed(1) + '%',
                item.honey.toFixed(2),
                item.rodRate.toFixed(2),
                item.scrapRate.toFixed(2),
                item.rawMaterialCost.toFixed(2),
                item.scrapRecoveryValue.toFixed(2),
                item.netMaterialCost.toFixed(2),
                item.majuri.toFixed(2),
                item.padtar.toFixed(2),
                item.profitPercent.toFixed(1) + '%',
                item.profitAmount.toFixed(2),
                item.finalSellingPrice.toFixed(2),
                `"${(item.notes || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `precimetal_costing_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        /**
         * Export full data backup (settings + history) as JSON
         */
        exportBackupJSON() {
            const backup = {
                app: 'PRECIMETAL_INDUSTRIAL_OS',
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                settings: this.settings,
                history: this.history
            };

            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `precimetal_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        /**
         * Import backup JSON
         */
        importBackupJSON(jsonString) {
            try {
                const data = JSON.parse(jsonString);
                if (data.settings) {
                    this.saveSettings(data.settings);
                }
                if (Array.isArray(data.history)) {
                    this.history = data.history;
                    localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
                }
                return { success: true, count: data.history ? data.history.length : 0 };
            } catch (err) {
                console.error('Import failed:', err);
                return { success: false, error: err.message };
            }
        }
    }

    window.StorageManager = StorageManager;

})(typeof window !== 'undefined' ? window : this);
