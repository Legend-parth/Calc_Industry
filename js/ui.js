/**
 * PRECIMETAL™ INDUSTRIAL METAL WEIGHT & COSTING OS
 * User Interface Controller & Interactive Event Harness
 */

(function (window) {
    'use strict';

    class PrecimetalUI {
        constructor() {
            this.storage = new window.StorageManager();
            this.calculator = new window.MetalCalculator(this.storage.settings);

            this.currentStage = 1; // 1: Geometry, 2: Market Rates, 3: Production & Costing
            this.currentMode = 'wizard'; // 'wizard' | 'workbench'
            this.selectedGeometry = 'round';
            this.currentResult = null;

            this.initElements();
            this.attachEventListeners();
            this.loadInitialData();
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
        }

        /**
         * Cache DOM elements
         */
        initElements() {
            // Mode & Wizard Stepper
            this.stepperContainer = document.getElementById('wizard-stepper');
            this.stagePanels = document.querySelectorAll('.stage-panel');
            this.stepPills = document.querySelectorAll('.step-pill');
            this.btnModeToggle = document.getElementById('btn-mode-toggle');
            this.clockDisplay = document.getElementById('live-clock');

            // Stage 1 Inputs
            this.geomCards = document.querySelectorAll('.geom-card');
            this.inputItemCode = document.getElementById('input-item-code');
            this.inputRod = document.getElementById('input-rod');
            this.inputLength = document.getElementById('input-length');
            this.displayExpectedWeight = document.getElementById('disp-expected-weight');
            this.displayFormulaPreview = document.getElementById('disp-formula-preview');
            this.btnStage1Next = document.getElementById('btn-stage1-next');

            // Stage 2 Inputs
            this.inputHoney = document.getElementById('input-honey');
            this.dispRodRate = document.getElementById('disp-rod-rate');
            this.dispScrapRate = document.getElementById('disp-scrap-rate');
            this.dispMarkupBadge = document.getElementById('disp-markup-badge');
            this.dispScrapBadge = document.getElementById('disp-scrap-badge');
            this.btnStage2Back = document.getElementById('btn-stage2-back');
            this.btnStage2Next = document.getElementById('btn-stage2-next');

            // Stage 3 Inputs
            this.inputActualWeight = document.getElementById('input-actual-weight');
            this.inputLabour = document.getElementById('input-labour');
            this.inputProfitPercent = document.getElementById('input-profit-percent');
            this.btnSaveDefaultLabour = document.getElementById('btn-save-default-labour');
            this.btnStage3Back = document.getElementById('btn-stage3-back');
            this.weightAnomalyWarning = document.getElementById('weight-anomaly-warning');

            // Live Output & Summary Cards
            this.heroFinalPrice = document.getElementById('hero-final-price');
            this.heroMaterialCost = document.getElementById('hero-material-cost');
            this.heroPadtar = document.getElementById('hero-padtar');
            this.heroProfit = document.getElementById('hero-profit');
            this.heroScrapRecovery = document.getElementById('hero-scrap-recovery');
            this.heroWastageWeight = document.getElementById('hero-wastage-weight');
            this.heroUtilization = document.getElementById('hero-utilization');

            // Secondary Detailed Output Values
            this.valRawMaterialCost = document.getElementById('val-raw-material-cost');
            this.valScrapRecovery = document.getElementById('val-scrap-recovery');
            this.valNetMaterial = document.getElementById('val-net-material');
            this.valLabour = document.getElementById('val-labour');
            this.valPadtar = document.getElementById('val-padtar');
            this.valProfitAmount = document.getElementById('val-profit-amount');
            this.valFinalPrice = document.getElementById('val-final-price');

            // Canvases
            this.canvasCostDonut = document.getElementById('canvas-cost-donut');
            this.canvasWeightGauge = document.getElementById('canvas-weight-gauge');

            // Batch Simulator
            this.inputBatchQty = document.getElementById('input-batch-qty');
            this.dispBatchQty = document.getElementById('disp-batch-qty');
            this.dispBatchOrderValue = document.getElementById('disp-batch-order-value');
            this.dispBatchRawMaterialKg = document.getElementById('disp-batch-raw-kg');
            this.dispBatchScrapKg = document.getElementById('disp-batch-scrap-kg');
            this.dispBatchProfit = document.getElementById('disp-batch-profit');

            // Modals & Drawers
            this.modalSettings = document.getElementById('modal-settings');
            this.modalHistory = document.getElementById('modal-history');
            this.modalPrint = document.getElementById('modal-print');

            // Settings Fields
            this.settingDefaultLabour = document.getElementById('setting-default-labour');
            this.settingDefaultProfit = document.getElementById('setting-default-profit');
            this.settingRawMarkup = document.getElementById('setting-raw-markup');
            this.settingScrapDeduction = document.getElementById('setting-scrap-deduction');
            this.settingLengthAdjustment = document.getElementById('setting-length-adjustment');
            this.settingCoeffRound = document.getElementById('setting-coeff-round');
            this.settingCoeffSquare = document.getElementById('setting-coeff-square');
            this.settingCoeffHex = document.getElementById('setting-coeff-hex');
            this.selectDensityPreset = document.getElementById('select-density-preset');

            // History Container
            this.historyTableBody = document.getElementById('history-table-body');
            this.historySearch = document.getElementById('history-search');
            this.historyCountBadge = document.getElementById('history-count-badge');
        }

        /**
         * Update real-time shop floor clock
         */
        updateClock() {
            if (this.clockDisplay) {
                const now = new Date();
                this.clockDisplay.textContent = now.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }) + ' | ' + now.toLocaleTimeString('en-IN', {
                    hour12: false
                });
            }
        }

        /**
         * Attach event listeners
         */
        attachEventListeners() {
            // Geometry Card Selection
            this.geomCards.forEach(card => {
                card.addEventListener('click', () => {
                    const geom = card.dataset.geometry;
                    this.selectGeometry(geom);
                });
            });

            // Continuous Real-Time Calculation on Input
            const reactiveInputs = [
                this.inputRod,
                this.inputLength,
                this.inputHoney,
                this.inputActualWeight,
                this.inputLabour,
                this.inputProfitPercent,
                this.inputItemCode
            ];

            reactiveInputs.forEach(input => {
                if (input) {
                    input.addEventListener('input', () => this.recalculate());
                    input.addEventListener('change', () => this.recalculate());
                }
            });

            // Batch Simulator Input
            if (this.inputBatchQty) {
                this.inputBatchQty.addEventListener('input', () => this.updateBatchSummary());
                document.querySelectorAll('.batch-chip').forEach(chip => {
                    chip.addEventListener('click', () => {
                        const qty = chip.dataset.qty;
                        if (this.inputBatchQty) {
                            this.inputBatchQty.value = qty;
                            this.updateBatchSummary();
                        }
                    });
                });
            }

            // Quick Preset Loader (e.g. Factory Sample A-1)
            const btnLoadSample = document.getElementById('btn-load-sample');
            if (btnLoadSample) {
                btnLoadSample.addEventListener('click', () => this.loadFactorySampleA1());
            }

            // Reset Calculation
            const btnResetCalc = document.getElementById('btn-reset-calc');
            if (btnResetCalc) {
                btnResetCalc.addEventListener('click', () => this.resetForm());
            }

            // Save Calculation to History
            const btnSaveCalc = document.getElementById('btn-save-calc');
            if (btnSaveCalc) {
                btnSaveCalc.addEventListener('click', () => this.saveCurrentCalculation());
            }

            // Navigation Buttons (Stage Wizard)
            if (this.btnStage1Next) {
                this.btnStage1Next.addEventListener('click', () => this.goToStage(2));
            }
            if (this.btnStage2Back) {
                this.btnStage2Back.addEventListener('click', () => this.goToStage(1));
            }
            if (this.btnStage2Next) {
                this.btnStage2Next.addEventListener('click', () => this.goToStage(3));
            }
            if (this.btnStage3Back) {
                this.btnStage3Back.addEventListener('click', () => this.goToStage(2));
            }

            // Step Pill Direct Clicks
            this.stepPills.forEach(pill => {
                pill.addEventListener('click', () => {
                    const targetStage = parseInt(pill.dataset.stage, 10);
                    this.goToStage(targetStage);
                });
            });

            // Toggle Mode (Wizard vs Full Workbench)
            if (this.btnModeToggle) {
                this.btnModeToggle.addEventListener('click', () => this.toggleUIMode());
            }

            // Save Current Labour as New Default
            if (this.btnSaveDefaultLabour) {
                this.btnSaveDefaultLabour.addEventListener('click', () => {
                    const currentLabour = parseFloat(this.inputLabour.value) || 0;
                    this.storage.saveSettings({ defaultLabour: currentLabour });
                    this.calculator.updateSettings({ defaultLabour: currentLabour });
                    this.showNotification(`Saved ₹${currentLabour.toFixed(2)} as standard default labour (Majuri).`);
                });
            }

            // History Modal Actions
            const btnOpenHistory = document.getElementById('btn-open-history');
            const btnCloseHistory = document.getElementById('btn-close-history');
            const btnExportCSV = document.getElementById('btn-export-csv');
            const btnClearHistory = document.getElementById('btn-clear-history');

            if (btnOpenHistory) btnOpenHistory.addEventListener('click', () => this.openHistoryModal());
            if (btnCloseHistory) btnCloseHistory.addEventListener('click', () => this.closeHistoryModal());
            if (btnExportCSV) btnExportCSV.addEventListener('click', () => this.storage.exportToCSV());
            if (btnClearHistory) {
                btnClearHistory.addEventListener('click', () => {
                    if (confirm('Are you sure you want to clear all saved calculation history?')) {
                        this.storage.clearHistory();
                        this.renderHistoryTable();
                        this.updateHistoryBadge();
                    }
                });
            }
            if (this.historySearch) {
                this.historySearch.addEventListener('input', () => this.renderHistoryTable());
            }

            // Settings Modal Actions
            const btnOpenSettings = document.getElementById('btn-open-settings');
            const btnCloseSettings = document.getElementById('btn-close-settings');
            const btnSaveSettings = document.getElementById('btn-save-settings');
            const btnResetSettings = document.getElementById('btn-reset-settings');
            const btnBackupJSON = document.getElementById('btn-backup-json');
            const inputRestoreJSON = document.getElementById('input-restore-json');

            if (btnOpenSettings) btnOpenSettings.addEventListener('click', () => this.openSettingsModal());
            if (btnCloseSettings) btnCloseSettings.addEventListener('click', () => this.closeSettingsModal());
            if (btnSaveSettings) btnSaveSettings.addEventListener('click', () => this.handleSaveSettings());
            if (btnResetSettings) {
                btnResetSettings.addEventListener('click', () => {
                    if (confirm('Reset all rates, coefficients, and allowances to factory defaults?')) {
                        const def = this.storage.resetSettings();
                        this.calculator.resetSettings();
                        this.populateSettingsForm(def);
                        this.recalculate();
                        this.showNotification('All settings restored to factory defaults.');
                    }
                });
            }
            if (btnBackupJSON) btnBackupJSON.addEventListener('click', () => this.storage.exportBackupJSON());
            if (inputRestoreJSON) {
                inputRestoreJSON.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const res = this.storage.importBackupJSON(event.target.result);
                        if (res.success) {
                            this.calculator.updateSettings(this.storage.settings);
                            this.populateSettingsForm(this.storage.settings);
                            this.renderHistoryTable();
                            this.updateHistoryBadge();
                            this.recalculate();
                            alert(`Backup successfully restored (${res.count} records loaded).`);
                        } else {
                            alert('Failed to restore backup: ' + res.error);
                        }
                    };
                    reader.readAsText(file);
                });
            }

            if (this.selectDensityPreset) {
                this.selectDensityPreset.addEventListener('change', () => {
                    const presetKey = this.selectDensityPreset.value;
                    const preset = window.MATERIAL_PRESETS[presetKey];
                    if (preset) {
                        this.settingCoeffRound.value = preset.coefficients.round;
                        this.settingCoeffSquare.value = preset.coefficients.square;
                        this.settingCoeffHex.value = preset.coefficients.hex;
                    }
                });
            }

            // Print / Quotation Sheet Modal
            const btnOpenPrint = document.getElementById('btn-open-print');
            const btnClosePrint = document.getElementById('btn-close-print');
            const btnTriggerPrint = document.getElementById('btn-trigger-print');

            if (btnOpenPrint) btnOpenPrint.addEventListener('click', () => this.openPrintModal());
            if (btnClosePrint) btnClosePrint.addEventListener('click', () => this.closePrintModal());
            if (btnTriggerPrint) btnTriggerPrint.addEventListener('click', () => window.print());

            // Close modal on click outside
            window.addEventListener('click', (e) => {
                if (e.target === this.modalSettings) this.closeSettingsModal();
                if (e.target === this.modalHistory) this.closeHistoryModal();
                if (e.target === this.modalPrint) this.closePrintModal();
            });

            // Keyboard navigation shortcuts
            window.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeSettingsModal();
                    this.closeHistoryModal();
                    this.closePrintModal();
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                    e.preventDefault();
                    this.saveCurrentCalculation();
                }
                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
                    e.preventDefault();
                    this.openPrintModal();
                }
            });

            // Resize observer for charts
            window.addEventListener('resize', () => {
                if (this.currentResult) {
                    this.renderCharts(this.currentResult);
                }
            });
        }

        /**
         * Load initial values (default to factory sample A-1)
         */
        loadInitialData() {
            this.updateHistoryBadge();
            this.loadFactorySampleA1();
        }

        /**
         * Pre-load the exact factory sample values provided in the reference spreadsheet:
         * Item: A-1, Geometry: Round, Rod: 10.70, Length: 8.80
         * Honey: 870.00
         * Actual Product Wg: 4.20
         * Majuri: 0.35, Profit: 15%
         */
        loadFactorySampleA1() {
            this.inputItemCode.value = 'Item A-1';
            this.selectGeometry('round');
            this.inputRod.value = '10.70';
            this.inputLength.value = '8.80';
            this.inputHoney.value = '870.00';
            this.inputActualWeight.value = '4.20';
            this.inputLabour.value = (this.storage.settings.defaultLabour !== undefined ? this.storage.settings.defaultLabour : 0.35).toFixed(2);
            this.inputProfitPercent.value = (this.storage.settings.defaultProfitPercent !== undefined ? this.storage.settings.defaultProfitPercent : 15.0).toFixed(1);

            this.goToStage(1);
            this.recalculate();
            this.showNotification('Factory Reference Sample A-1 loaded.');
        }

        /**
         * Reset form inputs
         */
        resetForm() {
            this.inputItemCode.value = 'Item A-' + Math.floor(Math.random() * 900 + 100);
            this.selectGeometry('round');
            this.inputRod.value = '';
            this.inputLength.value = '';
            this.inputActualWeight.value = '';
            // keep honey and labour as default
            this.inputLabour.value = this.storage.settings.defaultLabour.toFixed(2);
            this.inputProfitPercent.value = this.storage.settings.defaultProfitPercent.toFixed(1);
            this.goToStage(1);
            this.recalculate();
            if (this.inputRod) this.inputRod.focus();
        }

        /**
         * Select a geometry (round, square, hex)
         */
        selectGeometry(geom) {
            this.selectedGeometry = (geom || 'round').toLowerCase();
            this.geomCards.forEach(card => {
                if (card.dataset.geometry === this.selectedGeometry) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });

            this.updateFormulaPreview();
            this.recalculate();
        }

        /**
         * Update formula text preview in Stage 1
         */
        updateFormulaPreview() {
            if (!this.displayFormulaPreview) return;
            const geom = this.selectedGeometry;
            const coeff = this.calculator.settings.coefficients[geom] || 0;
            const allowance = this.calculator.settings.lengthAdjustment;

            let formulaText = '';
            if (geom === 'round') {
                formulaText = `Round: Rod² × (Length + ${allowance}) × ${coeff}`;
            } else if (geom === 'square') {
                formulaText = `Square: Rod² × (Length + ${allowance}) × ${coeff}`;
            } else if (geom === 'hex') {
                formulaText = `Hexagon: Rod² × (Length + ${allowance}) × ${coeff}`;
            }
            this.displayFormulaPreview.textContent = formulaText;
        }

        /**
         * Stage Wizard Navigation
         */
        goToStage(stageNumber) {
            if (this.currentMode === 'workbench') return; // Workbench shows all stages

            const target = Math.max(1, Math.min(3, stageNumber));
            this.currentStage = target;

            this.stagePanels.forEach(panel => {
                const pStage = parseInt(panel.dataset.stage, 10);
                if (pStage === target) {
                    panel.classList.add('active');
                    panel.style.display = 'block';
                } else {
                    panel.classList.remove('active');
                    panel.style.display = 'none';
                }
            });

            this.stepPills.forEach(pill => {
                const sStage = parseInt(pill.dataset.stage, 10);
                if (sStage === target) {
                    pill.classList.add('active');
                    pill.classList.remove('completed');
                } else if (sStage < target) {
                    pill.classList.remove('active');
                    pill.classList.add('completed');
                } else {
                    pill.classList.remove('active');
                    pill.classList.remove('completed');
                }
            });

            // Smooth scroll to top of workspace
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        /**
         * Toggle between 3-Step Wizard mode and Full Industrial Workbench mode
         */
        toggleUIMode() {
            if (this.currentMode === 'wizard') {
                this.currentMode = 'workbench';
                this.btnModeToggle.textContent = 'Switch to Guided Wizard';
                this.stepperContainer.style.display = 'none';
                this.stagePanels.forEach(panel => {
                    panel.classList.add('workbench-visible');
                    panel.style.display = 'block';
                });
                document.querySelectorAll('.stage-nav-btn').forEach(b => b.style.display = 'none');
            } else {
                this.currentMode = 'wizard';
                this.btnModeToggle.textContent = 'Switch to Industrial Workbench';
                this.stepperContainer.style.display = 'flex';
                this.stagePanels.forEach(panel => {
                    panel.classList.remove('workbench-visible');
                });
                document.querySelectorAll('.stage-nav-btn').forEach(b => b.style.display = '');
                this.goToStage(this.currentStage);
            }
        }

        /**
         * Core Calculation Trigger
         */
        recalculate() {
            const rod = parseFloat(this.inputRod.value) || 0;
            const length = parseFloat(this.inputLength.value) || 0;
            const honey = parseFloat(this.inputHoney.value) || 0;
            const actualWeight = parseFloat(this.inputActualWeight.value) || 0;
            const labour = parseFloat(this.inputLabour.value) || 0;
            const profitPercent = parseFloat(this.inputProfitPercent.value) || 0;
            const itemCode = this.inputItemCode.value || 'Item A-1';

            const result = this.calculator.calculate({
                geometry: this.selectedGeometry,
                rod: rod,
                length: length,
                honey: honey,
                actualProductWeight: actualWeight,
                labour: labour,
                profitPercent: profitPercent,
                itemCode: itemCode
            });

            this.currentResult = result;
            this.renderResults(result);
            this.updateBatchSummary();
        }

        /**
         * Render calculated results to DOM
         */
        renderResults(res) {
            // Stage 1 Outputs
            if (this.displayExpectedWeight) {
                this.displayExpectedWeight.textContent = res.formatted.expectedWeight + ' g';
            }

            // Stage 2 Outputs
            if (this.dispRodRate) this.dispRodRate.textContent = '₹' + res.formatted.rodRate;
            if (this.dispScrapRate) this.dispScrapRate.textContent = '₹' + res.formatted.scrapRate;
            if (this.dispMarkupBadge) this.dispMarkupBadge.textContent = `+₹${res.markup.toFixed(2)}`;
            if (this.dispScrapBadge) this.dispScrapBadge.textContent = `-${res.scrapDeductionPercent.toFixed(1)}%`;

            // Stage 3 & Anomaly Warning
            if (this.weightAnomalyWarning) {
                if (res.isWeightOverload) {
                    this.weightAnomalyWarning.style.display = 'flex';
                    this.weightAnomalyWarning.querySelector('.anomaly-text').textContent =
                        `Warning: Actual piece weight (${res.formatted.actualWeight}g) exceeds raw material weight (${res.formatted.expectedWeight}g) by +${res.weightDiscrepancy.toFixed(2)}g!`;
                } else {
                    this.weightAnomalyWarning.style.display = 'none';
                }
            }

            // Executive Hero Outputs
            if (this.heroFinalPrice) this.heroFinalPrice.textContent = '₹' + res.formatted.finalSellingPrice;
            const mobHero = document.getElementById('mobile-hero-price');
            if (mobHero) mobHero.textContent = '₹' + res.formatted.finalSellingPrice + ' / pc';
            if (this.heroMaterialCost) this.heroMaterialCost.textContent = '₹' + res.formatted.netMaterialCost;
            if (this.heroPadtar) this.heroPadtar.textContent = '₹' + res.formatted.padtar;
            if (this.heroProfit) this.heroProfit.textContent = '₹' + res.formatted.profitAmount;
            if (this.heroScrapRecovery) this.heroScrapRecovery.textContent = '₹' + res.formatted.scrapRecoveryValue;
            if (this.heroWastageWeight) this.heroWastageWeight.textContent = res.formatted.wastageWeight + ' g';
            if (this.heroUtilization) this.heroUtilization.textContent = res.formatted.materialUtilizationPct + '%';

            // Detailed Breakdown
            if (this.valRawMaterialCost) this.valRawMaterialCost.textContent = '₹' + res.formatted.rawMaterialCost;
            if (this.valScrapRecovery) this.valScrapRecovery.textContent = '-₹' + res.formatted.scrapRecoveryValue;
            if (this.valNetMaterial) this.valNetMaterial.textContent = '₹' + res.formatted.netMaterialCost;
            if (this.valLabour) this.valLabour.textContent = '₹' + res.formatted.majuri;
            if (this.valPadtar) this.valPadtar.textContent = '₹' + res.formatted.padtar;
            if (this.valProfitAmount) this.valProfitAmount.textContent = '+₹' + res.formatted.profitAmount;
            if (this.valFinalPrice) this.valFinalPrice.textContent = '₹' + res.formatted.finalSellingPrice;

            // Visual Progress bars (Product vs Scrap)
            const pBar = document.getElementById('bar-product-weight');
            const sBar = document.getElementById('bar-scrap-weight');
            const utilPartText = document.getElementById('util-part-text');
            const utilScrapText = document.getElementById('util-scrap-text');

            if (pBar && sBar) {
                const util = Math.min(100, res.materialUtilizationPct);
                const wast = Math.min(100 - util, res.wastagePct);
                pBar.style.width = util + '%';
                sBar.style.width = wast + '%';
            }
            if (utilPartText) {
                utilPartText.textContent = `${res.formatted.actualWeight}g (${res.formatted.materialUtilizationPct}%)`;
            }
            if (utilScrapText) {
                utilScrapText.textContent = `${res.formatted.wastageWeight}g (${res.formatted.wastagePct}%)`;
            }

            // Render Charts
            this.renderCharts(res);
        }

        /**
         * Render Canvas Visualizations
         */
        renderCharts(res) {
            if (window.IndustrialCharts) {
                window.IndustrialCharts.renderCostDonut(this.canvasCostDonut, {
                    netMaterial: res.netMaterialCost,
                    labour: res.majuri,
                    profit: res.profitAmount,
                    scrapRecovery: res.scrapRecoveryValue
                });

                window.IndustrialCharts.renderWeightGauge(
                    this.canvasWeightGauge,
                    res.actualWeight,
                    res.expectedWeight
                );
            }
        }

        /**
         * Update Batch Production Simulator
         */
        updateBatchSummary() {
            if (!this.currentResult) return;
            const qty = parseInt(this.inputBatchQty ? this.inputBatchQty.value : 1000, 10) || 1000;
            const batch = this.calculator.calculateBatch(this.currentResult, qty);

            if (this.dispBatchQty) this.dispBatchQty.textContent = batch.formatted.quantity;
            if (this.dispBatchOrderValue) this.dispBatchOrderValue.textContent = '₹' + batch.formatted.totalOrderValue;
            if (this.dispBatchRawMaterialKg) this.dispBatchRawMaterialKg.textContent = batch.formatted.totalRawMaterialKg + ' kg';
            if (this.dispBatchScrapKg) this.dispBatchScrapKg.textContent = batch.formatted.totalScrapKg + ' kg';
            if (this.dispBatchProfit) this.dispBatchProfit.textContent = '₹' + batch.formatted.totalProfit;
        }

        /**
         * Save current calculation to local storage
         */
        saveCurrentCalculation() {
            if (!this.currentResult) return;
            const record = this.storage.saveCalculation(this.currentResult);
            if (record) {
                this.updateHistoryBadge();
                this.showNotification(`Calculation saved (${record.itemCode}) to history.`);
            }
        }

        /**
         * Update history count badge
         */
        updateHistoryBadge() {
            if (this.historyCountBadge) {
                const count = this.storage.history.length;
                this.historyCountBadge.textContent = count;
                this.historyCountBadge.style.display = count > 0 ? 'inline-flex' : 'none';
            }
        }

        /**
         * History Modal Management
         */
        openHistoryModal() {
            this.renderHistoryTable();
            if (this.modalHistory) this.modalHistory.classList.add('active');
        }

        closeHistoryModal() {
            if (this.modalHistory) this.modalHistory.classList.remove('active');
        }

        renderHistoryTable() {
            if (!this.historyTableBody) return;
            const search = (this.historySearch ? this.historySearch.value : '').toLowerCase().trim();
            const list = this.storage.history.filter(item => {
                if (!search) return true;
                return (item.itemCode || '').toLowerCase().includes(search) ||
                    (item.geometry || '').toLowerCase().includes(search) ||
                    (item.notes || '').toLowerCase().includes(search);
            });

            this.historyTableBody.innerHTML = '';

            if (list.length === 0) {
                this.historyTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 32px;">No calculation records found.</td></tr>`;
                return;
            }

            list.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${this.escapeHTML(item.itemCode)}</strong><br><small style="color: var(--text-muted);">${new Date(item.createdAt).toLocaleDateString()} ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></td>
                    <td><span class="badge-geom">${item.geometry.toUpperCase()}</span></td>
                    <td>Rod: ${item.rod.toFixed(2)} mm<br>L: ${item.length.toFixed(2)} mm</td>
                    <td>Exp: ${item.expectedWeight.toFixed(2)} g<br>Act: ${item.actualWeight.toFixed(2)} g</td>
                    <td>${item.wastageWeight.toFixed(2)} g (${item.materialUtilizationPct.toFixed(0)}% util)</td>
                    <td>₹${item.honey.toFixed(2)} /kg</td>
                    <td>₹${item.padtar.toFixed(2)}</td>
                    <td><strong class="highlight-val">₹${item.finalSellingPrice.toFixed(2)}</strong></td>
                    <td class="history-actions">
                        <button class="btn-sm btn-outline btn-load-record" data-id="${item.id}" title="Load into calculator">Load</button>
                        <button class="btn-sm btn-danger btn-delete-record" data-id="${item.id}" title="Delete record">✕</button>
                    </td>
                `;

                tr.querySelector('.btn-load-record').addEventListener('click', () => {
                    this.loadSavedRecord(item);
                    this.closeHistoryModal();
                });

                tr.querySelector('.btn-delete-record').addEventListener('click', () => {
                    this.storage.deleteCalculation(item.id);
                    this.renderHistoryTable();
                    this.updateHistoryBadge();
                });

                this.historyTableBody.appendChild(tr);
            });
        }

        loadSavedRecord(item) {
            this.inputItemCode.value = item.itemCode || '';
            this.selectGeometry(item.geometry);
            this.inputRod.value = item.rod;
            this.inputLength.value = item.length;
            this.inputHoney.value = item.honey;
            this.inputActualWeight.value = item.actualWeight;
            this.inputLabour.value = item.majuri;
            this.inputProfitPercent.value = item.profitPercent;
            this.recalculate();
            this.showNotification(`Loaded record: ${item.itemCode}`);
        }

        /**
         * Settings Modal Management
         */
        openSettingsModal() {
            this.populateSettingsForm(this.storage.settings);
            if (this.modalSettings) this.modalSettings.classList.add('active');
        }

        closeSettingsModal() {
            if (this.modalSettings) this.modalSettings.classList.remove('active');
        }

        populateSettingsForm(settings) {
            if (this.settingDefaultLabour) this.settingDefaultLabour.value = settings.defaultLabour;
            if (this.settingDefaultProfit) this.settingDefaultProfit.value = settings.defaultProfitPercent;
            if (this.settingRawMarkup) this.settingRawMarkup.value = settings.rawMetalMarkup;
            if (this.settingScrapDeduction) this.settingScrapDeduction.value = settings.scrapDeductionPercent;
            if (this.settingLengthAdjustment) this.settingLengthAdjustment.value = settings.lengthAdjustment;
            if (this.settingCoeffRound) this.settingCoeffRound.value = settings.coefficients.round;
            if (this.settingCoeffSquare) this.settingCoeffSquare.value = settings.coefficients.square;
            if (this.settingCoeffHex) this.settingCoeffHex.value = settings.coefficients.hex;
            if (this.selectDensityPreset) this.selectDensityPreset.value = settings.densityPreset || 'brass_standard';
        }

        handleSaveSettings() {
            const updated = {
                defaultLabour: parseFloat(this.settingDefaultLabour.value) || 0.35,
                defaultProfitPercent: parseFloat(this.settingDefaultProfit.value) || 15.0,
                rawMetalMarkup: parseFloat(this.settingRawMarkup.value) || 35.0,
                scrapDeductionPercent: parseFloat(this.settingScrapDeduction.value) || 5.0,
                lengthAdjustment: parseFloat(this.settingLengthAdjustment.value) || 4.0,
                densityPreset: this.selectDensityPreset ? this.selectDensityPreset.value : 'brass_standard',
                coefficients: {
                    round: parseFloat(this.settingCoeffRound.value) || 0.006676,
                    square: parseFloat(this.settingCoeffSquare.value) || 0.007361,
                    hex: parseFloat(this.settingCoeffHex.value) || 0.0085
                }
            };

            this.storage.saveSettings(updated);
            this.calculator.updateSettings(updated);
            this.updateFormulaPreview();
            this.recalculate();
            this.closeSettingsModal();
            this.showNotification('Application settings & default rates saved successfully.');
        }

        /**
         * Printable Quotation Sheet Modal
         */
        openPrintModal() {
            if (!this.currentResult) return;
            const res = this.currentResult;
            const qty = parseInt(this.inputBatchQty ? this.inputBatchQty.value : 1000, 10) || 1000;
            const batch = this.calculator.calculateBatch(res, qty);

            const printContainer = document.getElementById('print-sheet-content');
            if (printContainer) {
                printContainer.innerHTML = `
                    <div class="print-header">
                        <div>
                            <h2>PRECISION TURNED COMPONENTS COSTING REPORT</h2>
                            <p class="print-sub">Official Technical Calculation & Quotation Sheet</p>
                        </div>
                        <div class="print-meta">
                            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</div>
                            <div><strong>Job Ref:</strong> ${this.escapeHTML(res.itemCode)}</div>
                        </div>
                    </div>

                    <table class="print-table">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Specified Value</th>
                                <th>Calculation Reference & Formula</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Geometry & Rod Section</td>
                                <td><strong>${res.geometry.toUpperCase()}</strong></td>
                                <td>${res.geometry === 'round' ? 'Cylindrical Rod (Round)' : res.geometry === 'square' ? 'Square Section' : 'Hexagon Across Flats'}</td>
                            </tr>
                            <tr>
                                <td>Rod Dimension (R) × Length (L)</td>
                                <td><strong>${res.rod.toFixed(2)} mm × ${res.length.toFixed(2)} mm</strong></td>
                                <td>Length includes +${res.lengthAdjustment.toFixed(1)} mm parting allowance</td>
                            </tr>
                            <tr>
                                <td>Geometry Coefficient</td>
                                <td><code>${res.coefficientUsed}</code></td>
                                <td>W = R² × (L + ${res.lengthAdjustment}) × Coeff</td>
                            </tr>
                            <tr>
                                <td>Theoretical Expected Weight</td>
                                <td><strong>${res.formatted.expectedWeight} grams</strong></td>
                                <td>Raw rod required per piece</td>
                            </tr>
                            <tr>
                                <td>Actual Finished Part Weight</td>
                                <td><strong>${res.formatted.actualWeight} grams</strong></td>
                                <td>Finished product net piece weight</td>
                            </tr>
                            <tr>
                                <td>Wastage / Chhol Weight</td>
                                <td><strong>${res.formatted.wastageWeight} grams</strong></td>
                                <td>Material - Product (Utilization: ${res.formatted.materialUtilizationPct}%)</td>
                            </tr>
                            <tr>
                                <td>Metal Market Benchmark (Honey)</td>
                                <td><strong>₹${res.formatted.honey} / kg</strong></td>
                                <td>Base market rate</td>
                            </tr>
                            <tr>
                                <td>Raw Metal Purchase Rate (Rod)</td>
                                <td><strong>₹${res.formatted.rodRate} / kg</strong></td>
                                <td>Honey + ₹${res.markup.toFixed(2)} standard rod surcharge</td>
                            </tr>
                            <tr>
                                <td>Scrap / Chhol Selling Rate</td>
                                <td><strong>₹${res.formatted.scrapRate} / kg</strong></td>
                                <td>Honey - ${res.scrapDeductionPercent.toFixed(1)}% recovery credit</td>
                            </tr>
                            <tr class="highlight-row">
                                <td>Gross Raw Metal Cost</td>
                                <td>₹${res.formatted.rawMaterialCost} / pc</td>
                                <td>(${res.formatted.expectedWeight}g × ₹${res.formatted.rodRate}) / 1000</td>
                            </tr>
                            <tr class="highlight-row">
                                <td>Less: Scrap Recovery Credit</td>
                                <td>-₹${res.formatted.scrapRecoveryValue} / pc</td>
                                <td>(${res.formatted.wastageWeight}g × ₹${res.formatted.scrapRate}) / 1000</td>
                            </tr>
                            <tr class="key-row">
                                <td>Net Effective Metal Cost (Material Rs.)</td>
                                <td><strong>₹${res.formatted.netMaterialCost} / pc</strong></td>
                                <td>Gross Metal Cost - Scrap Recovery</td>
                            </tr>
                            <tr>
                                <td>Labour Charges (Majuri Rs.)</td>
                                <td>₹${res.formatted.majuri} / pc</td>
                                <td>Machining, tooling & labour charges</td>
                            </tr>
                            <tr class="key-row">
                                <td>Production Cost (Padtar Rs.)</td>
                                <td><strong>₹${res.formatted.padtar} / pc</strong></td>
                                <td>Net Material + Labour Charges</td>
                            </tr>
                            <tr>
                                <td>Target Profit Margin (${res.profitPercent.toFixed(1)}%)</td>
                                <td>₹${res.formatted.profitAmount} / pc</td>
                                <td>Padtar × ${res.profitPercent.toFixed(1)}%</td>
                            </tr>
                            <tr class="grand-total-row">
                                <td>FINAL PRODUCT SELLING PRICE</td>
                                <td><strong>₹${res.formatted.finalSellingPrice} / pc</strong></td>
                                <td>Padtar + Profit Amount</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="print-batch-box">
                        <h3>BATCH PRODUCTION PROJECTION (${batch.formatted.quantity} PIECES)</h3>
                        <div class="print-batch-grid">
                            <div>Total Raw Material Required: <strong>${batch.formatted.totalRawMaterialKg} kg</strong></div>
                            <div>Total Scrap / Chhol Generated: <strong>${batch.formatted.totalScrapKg} kg</strong></div>
                            <div>Total Net Production Cost: <strong>₹${batch.formatted.totalProductionCost}</strong></div>
                            <div>Total Projected Profit: <strong>₹${batch.formatted.totalProfit}</strong></div>
                            <div class="print-batch-hero">Total Order Quotation: <strong>₹${batch.formatted.totalOrderValue}</strong></div>
                        </div>
                    </div>

                    <div class="print-signatures">
                        <div>
                            <div class="sig-line">Prepared By (Operator)</div>
                        </div>
                        <div>
                            <div class="sig-line">Checked & Approved (Works Manager)</div>
                        </div>
                    </div>
                `;
            }

            if (this.modalPrint) this.modalPrint.classList.add('active');
        }

        closePrintModal() {
            if (this.modalPrint) this.modalPrint.classList.remove('active');
        }

        /**
         * Transient toast notification
         */
        showNotification(msg) {
            const toast = document.createElement('div');
            toast.className = 'precimetal-toast';
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 20);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        escapeHTML(str) {
            return String(str || '').replace(/[&<>'"]/g, tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag));
        }
    }

    window.PrecimetalUI = PrecimetalUI;

})(typeof window !== 'undefined' ? window : this);
