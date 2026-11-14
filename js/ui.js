/**
 * PRECIMETAL™ INDUSTRIAL METAL WEIGHT & COSTING OS
 * User Interface Controller & Interactive Event Harness
 */

(function (window) {
    'use strict';

    class PrecimetalUI {
        constructor() {
            this.storage = new window.StorageManager();
            if (this.storage.settings.rawMetalMarkup === 35 || this.storage.settings.rawMetalMarkup === 35.0 || !this.storage.settings.rawMetalMarkup) {
                this.storage.settings.rawMetalMarkup = 21.0;
                this.storage.saveSettings({ rawMetalMarkup: 21.0 });
            }
            this.calculator = new window.MetalCalculator(this.storage.settings);
            this.calculator.updateSettings({ rawMetalMarkup: 21.0 });

            this.currentStage = 1; // 1: Geometry, 2: Market Rates, 3: Production & Costing
            this.currentMode = 'wizard'; // 'wizard' | 'workbench'
            this.selectedGeometry = 'round';
            this.currentResult = null;

            this.initElements();
            this.applyCompanyBranding();
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

            // Header Brand
            this.appHeaderLogo = document.getElementById('app-header-logo');
            this.appHeaderTitle = document.getElementById('app-header-title');
            this.appHeaderSub = document.getElementById('app-header-sub');

            // Stage 1 Inputs
            this.geomCards = document.querySelectorAll('.geom-card');
            this.inputItemCode = document.getElementById('input-item-code');
            this.inputDrawingName = document.getElementById('input-drawing-name');
            this.inputRod = document.getElementById('input-rod');
            this.inputRod2 = document.getElementById('input-rod2');
            this.groupRod2 = document.getElementById('group-rod2');
            this.lblRod1 = document.getElementById('lbl-rod1');
            this.hintRod1 = document.getElementById('hint-rod1');
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
            this.btnSaveDefaultProfit = document.getElementById('btn-save-default-profit');
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
            this.settingCoeffRectangle = document.getElementById('setting-coeff-rectangle');
            this.selectDensityPreset = document.getElementById('select-density-preset');

            // Company Profile & Quotation Branding Settings
            this.settingCompanyName = document.getElementById('setting-company-name');
            this.settingCompanySub = document.getElementById('setting-company-sub');
            this.settingCompanyAddress = document.getElementById('setting-company-address');
            this.settingCompanyPhone = document.getElementById('setting-company-phone');
            this.settingCompanyEmail = document.getElementById('setting-company-email');
            this.settingCompanyWebsite = document.getElementById('setting-company-website');
            this.settingLogoFile = document.getElementById('setting-logo-file');
            this.btnResetLogo = document.getElementById('btn-reset-logo');
            this.settingQuoteValidity = document.getElementById('setting-quote-validity');

            // History Container
            this.historyTableBody = document.getElementById('history-table-body');
            this.historySearch = document.getElementById('history-search');
            this.historyCountBadge = document.getElementById('history-count-badge');

            // Quotation Modal Controls
            this.quoteFormatSelect = document.getElementById('quote-format-select');
            this.quoteJobSelect = document.getElementById('quote-job-select');
            this.quoteClientName = document.getElementById('quote-client-name');
            this.quoteItemName = document.getElementById('quote-item-name');
            this.quoteDrawingName = document.getElementById('quote-drawing-name');
            this.quoteBatchQty = document.getElementById('quote-batch-qty');
            this.quoteValidityDays = document.getElementById('quote-validity-days');
            this.quoteRefNo = document.getElementById('quote-ref-no');
            this.quoteSourceStatus = document.getElementById('quote-source-status');
            this.btnLoadQuoteToCalc = document.getElementById('btn-load-quote-to-calc');
            this.activeQuoteRecord = null;
            this.tempUploadedLogo = null;
        }

        /**
         * Apply company branding to top header and theme
         */
        applyCompanyBranding() {
            const profile = (this.storage.settings && this.storage.settings.companyProfile) ? this.storage.settings.companyProfile : {};
            if (this.appHeaderTitle) {
                this.appHeaderTitle.textContent = profile.name || 'Satyam Brass';
            }
            if (this.appHeaderSub) {
                this.appHeaderSub.textContent = profile.sub || 'Precision Turned & Machined Components';
            }
            if (this.appHeaderLogo) {
                this.appHeaderLogo.src = profile.logo || 'assets/satyam.jpeg';
                this.appHeaderLogo.alt = profile.name || 'Satyam Brass';
            }
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
                this.inputRod2,
                this.inputLength,
                this.inputHoney,
                this.inputActualWeight,
                this.inputLabour,
                this.inputProfitPercent,
                this.inputItemCode,
                this.inputDrawingName
            ];

            reactiveInputs.forEach(input => {
                if (input) {
                    input.addEventListener('input', () => this.recalculate());
                    input.addEventListener('change', () => this.recalculate());
                }
            });

            // Enter key flow navigation between inputs and stages
            if (this.inputRod) {
                this.inputRod.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (this.selectedGeometry === 'rectangle' && this.inputRod2) {
                            this.inputRod2.focus();
                        } else if (this.inputLength) {
                            this.inputLength.focus();
                        }
                    }
                });
            }
            if (this.inputRod2) {
                this.inputRod2.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (this.inputLength) this.inputLength.focus();
                    }
                });
            }
            if (this.inputLength) {
                this.inputLength.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.goToStage(2);
                    }
                });
            }
            if (this.inputHoney) {
                this.inputHoney.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.goToStage(3);
                    }
                });
            }

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

            // Save Current Profit Margin as New Default
            if (this.btnSaveDefaultProfit) {
                this.btnSaveDefaultProfit.addEventListener('click', () => {
                    const currentProfit = parseFloat(this.inputProfitPercent.value) || 0;
                    this.storage.saveSettings({ defaultProfitPercent: currentProfit });
                    this.calculator.updateSettings({ defaultProfitPercent: currentProfit });
                    this.showNotification(`Saved ${currentProfit.toFixed(1)}% as standard default profit margin.`);
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
                        if (this.settingCoeffRectangle) {
                            this.settingCoeffRectangle.value = preset.coefficients.rectangle || preset.coefficients.square;
                        }
                    }
                });
            }

            if (this.settingLogoFile) {
                this.settingLogoFile.addEventListener('change', (e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.tempUploadedLogo = event.target.result;
                        this.showNotification('Custom logo uploaded! Save settings to apply.');
                    };
                    reader.readAsDataURL(file);
                });
            }

            if (this.btnResetLogo) {
                this.btnResetLogo.addEventListener('click', () => {
                    this.tempUploadedLogo = 'assets/satyam.jpeg';
                    if (this.settingCompanyName) this.settingCompanyName.value = 'Satyam Brass';
                    if (this.settingCompanySub) this.settingCompanySub.value = 'Precision Turned & Machined Components';
                    if (this.settingCompanyAddress) this.settingCompanyAddress.value = '534, G.I.D.C., Phase-II, Dared, Jamnagar-361 004. (Guj.) India.';
                    if (this.settingCompanyPhone) this.settingCompanyPhone.value = '+91 9428888666, +91 9426229661';
                    if (this.settingCompanyEmail) this.settingCompanyEmail.value = 'info@satyambrass.com | satyambrass534@gmail.com';
                    if (this.settingCompanyWebsite) this.settingCompanyWebsite.value = 'www.satyambrass.com';
                    this.showNotification('Company branding reset to default Satyam Brass.');
                });
            }

            // Print / Quotation Sheet Modal
            const btnOpenPrint = document.getElementById('btn-open-print');
            const btnClosePrint = document.getElementById('btn-close-print');
            const btnTriggerPrint = document.getElementById('btn-trigger-print');

            if (btnOpenPrint) btnOpenPrint.addEventListener('click', () => this.openPrintModal());
            if (btnClosePrint) btnClosePrint.addEventListener('click', () => this.closePrintModal());
            if (btnTriggerPrint) btnTriggerPrint.addEventListener('click', () => window.print());

            if (this.quoteJobSelect) {
                this.quoteJobSelect.addEventListener('change', () => this.handleQuoteJobChange());
            }
            if (this.quoteFormatSelect) {
                this.quoteFormatSelect.addEventListener('change', () => this.renderCurrentQuoteSheet());
            }
            if (this.quoteItemName) {
                this.quoteItemName.addEventListener('input', () => this.renderCurrentQuoteSheet());
            }
            if (this.quoteDrawingName) {
                this.quoteDrawingName.addEventListener('input', () => this.renderCurrentQuoteSheet());
            }
            if (this.quoteValidityDays) {
                this.quoteValidityDays.addEventListener('input', () => this.renderCurrentQuoteSheet());
            }
            if (this.quoteBatchQty) {
                this.quoteBatchQty.addEventListener('input', () => this.renderCurrentQuoteSheet());
            }
            if (this.quoteClientName) {
                this.quoteClientName.addEventListener('input', () => this.renderCurrentQuoteSheet());
            }
            if (this.quoteRefNo) {
                this.quoteRefNo.addEventListener('input', () => this.renderCurrentQuoteSheet());
            }
            if (this.btnLoadQuoteToCalc) {
                this.btnLoadQuoteToCalc.addEventListener('click', () => this.loadActiveQuoteToCalculator());
            }

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
         * Load initial values (starts at clean zero state)
         */
        loadInitialData() {
            this.updateHistoryBadge();
            this.resetForm();
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
            if (this.inputDrawingName) this.inputDrawingName.value = 'DWG-001';
            this.selectGeometry('round');
            this.inputRod.value = '10.70';
            if (this.inputRod2) this.inputRod2.value = '';
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
            this.inputItemCode.value = 'Item A-1';
            if (this.inputDrawingName) this.inputDrawingName.value = 'DWG-001';
            this.selectGeometry('round');
            this.inputRod.value = '';
            if (this.inputRod2) this.inputRod2.value = '';
            this.inputLength.value = '';
            this.inputHoney.value = '';
            this.inputActualWeight.value = '';
            this.inputLabour.value = (this.storage.settings.defaultLabour !== undefined ? this.storage.settings.defaultLabour : 0.35).toFixed(2);
            this.inputProfitPercent.value = (this.storage.settings.defaultProfitPercent !== undefined ? this.storage.settings.defaultProfitPercent : 15.0).toFixed(1);
            this.goToStage(1);
            this.recalculate();
            if (this.inputRod) this.inputRod.focus();
        }

        /**
         * Select a geometry (round, square, hex, rectangle)
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

            if (this.selectedGeometry === 'rectangle') {
                if (this.groupRod2) this.groupRod2.style.display = 'flex';
                if (this.lblRod1) this.lblRod1.textContent = 'Width / Rod 1 (W)';
                if (this.hintRod1) this.hintRod1.textContent = 'Across flats / Width';
            } else {
                if (this.groupRod2) this.groupRod2.style.display = 'none';
                if (this.lblRod1) this.lblRod1.textContent = 'Rod Size (R)';
                if (this.hintRod1) {
                    this.hintRod1.textContent = (this.selectedGeometry === 'hex')
                        ? 'Across flats (HEX)'
                        : (this.selectedGeometry === 'square') ? 'Square dimension' : 'Across flats / Dia';
                }
            }

            this.updateFormulaPreview();
            this.recalculate();
        }

        /**
         * Update formula text preview in Stage 1
         */
        updateFormulaPreview() {
            if (!this.displayFormulaPreview) return;
            const geom = this.selectedGeometry;
            const coeff = (this.calculator.settings.coefficients && this.calculator.settings.coefficients[geom] !== undefined)
                ? this.calculator.settings.coefficients[geom]
                : (geom === 'rectangle' ? 0.0085 : 0);
            const allowance = this.calculator.settings.lengthAdjustment;

            let formulaText = '';
            if (geom === 'round') {
                formulaText = `Round: Rod² × (Length + ${allowance}) × ${coeff}`;
            } else if (geom === 'square') {
                formulaText = `Square: Rod² × (Length + ${allowance}) × ${coeff}`;
            } else if (geom === 'hex') {
                formulaText = `Hexagon: Rod² × (Length + ${allowance}) × ${coeff}`;
            } else if (geom === 'rectangle') {
                formulaText = `Rectangle: Width × Thickness × (Length + ${allowance}) × ${coeff}`;
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

            // Auto focus stage input for lightning fast shop-floor entry
            setTimeout(() => {
                if (target === 1 && this.inputRod) this.inputRod.focus();
                if (target === 2 && this.inputHoney) this.inputHoney.focus();
                if (target === 3 && this.inputActualWeight) this.inputActualWeight.focus();
            }, 60);
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
            const rod = parseFloat(this.inputRod ? this.inputRod.value : 0) || 0;
            const rod2 = parseFloat(this.inputRod2 ? this.inputRod2.value : 0) || 0;
            const length = parseFloat(this.inputLength ? this.inputLength.value : 0) || 0;
            const honey = parseFloat(this.inputHoney ? this.inputHoney.value : 0) || 0;
            const actualWeight = parseFloat(this.inputActualWeight ? this.inputActualWeight.value : 0) || 0;
            const labour = parseFloat(this.inputLabour ? this.inputLabour.value : 0) || 0;
            const profitPercent = parseFloat(this.inputProfitPercent ? this.inputProfitPercent.value : 0) || 0;
            const itemCode = (this.inputItemCode && this.inputItemCode.value) ? this.inputItemCode.value : 'Item A-1';
            const drawingName = (this.inputDrawingName && this.inputDrawingName.value) ? this.inputDrawingName.value : 'DWG-001';

            const result = this.calculator.calculate({
                geometry: this.selectedGeometry,
                rod: rod,
                rod2: rod2,
                length: length,
                honey: honey,
                actualProductWeight: actualWeight,
                labour: labour,
                profitPercent: profitPercent,
                itemCode: itemCode,
                drawingName: drawingName
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
                this.historyTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No calculation records found.</td></tr>`;
                return;
            }

            list.forEach(item => {
                const tr = document.createElement('tr');
                const sizeText = item.geometry === 'rectangle'
                    ? `${(item.rod || 0).toFixed(2)} × ${(item.rod2 || 0).toFixed(2)} × ${(item.length || 0).toFixed(2)} mm`
                    : `${(item.rod || 0).toFixed(2)} × ${(item.length || 0).toFixed(2)} mm`;

                tr.innerHTML = `
                    <td>
                        <strong>${this.escapeHTML(item.itemCode)}</strong>
                        ${item.drawingName ? `<br><small style="color: var(--text-secondary); font-family: var(--font-mono);">${this.escapeHTML(item.drawingName)}</small>` : ''}
                        <br><small style="color: var(--text-muted);">${new Date(item.createdAt).toLocaleDateString()} ${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                    </td>
                    <td><span class="badge-geom">${item.geometry.toUpperCase()}</span></td>
                    <td>${sizeText}</td>
                    <td>Exp: ${item.expectedWeight.toFixed(2)}g<br>Act: ${item.actualWeight.toFixed(2)}g</td>
                    <td>₹${item.padtar.toFixed(2)}</td>
                    <td><strong class="highlight-val">₹${item.finalSellingPrice.toFixed(2)}</strong></td>
                    <td class="history-actions">
                        <button class="btn-sm btn-outline btn-quote-record" data-id="${item.id}" title="Generate quotation sheet">📄 Quote</button>
                        <button class="btn-sm btn-outline btn-load-record" data-id="${item.id}" title="Load into calculator">Load</button>
                        <button class="btn-sm btn-danger btn-delete-record" data-id="${item.id}" title="Delete record">✕</button>
                    </td>
                `;

                tr.querySelector('.btn-quote-record').addEventListener('click', () => {
                    this.closeHistoryModal();
                    this.openPrintModal(item);
                });

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
            if (this.inputDrawingName) this.inputDrawingName.value = item.drawingName || 'DWG-001';
            this.selectGeometry(item.geometry);
            this.inputRod.value = item.rod || '';
            if (this.inputRod2) this.inputRod2.value = item.rod2 || '';
            this.inputLength.value = item.length || '';
            this.inputHoney.value = item.honey || '';
            this.inputActualWeight.value = item.actualWeight || '';
            this.inputLabour.value = (item.majuri !== undefined ? item.majuri : 0.35).toFixed(2);
            this.inputProfitPercent.value = (item.profitPercent !== undefined ? item.profitPercent : 15.0).toFixed(1);
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
            if (this.settingCoeffRectangle) this.settingCoeffRectangle.value = settings.coefficients.rectangle || 0.0085;
            if (this.selectDensityPreset) this.selectDensityPreset.value = settings.densityPreset || 'brass_standard';

            const profile = settings.companyProfile || {};
            if (this.settingCompanyName) this.settingCompanyName.value = profile.name || 'Satyam Brass';
            if (this.settingCompanySub) this.settingCompanySub.value = profile.sub || 'Precision Turned & Machined Components';
            if (this.settingCompanyAddress) this.settingCompanyAddress.value = profile.address || '534, G.I.D.C., Phase-II, Dared, Jamnagar-361 004. (Guj.) India.';
            if (this.settingCompanyPhone) this.settingCompanyPhone.value = profile.phone || '+91 9428888666, +91 9426229661';
            if (this.settingCompanyEmail) this.settingCompanyEmail.value = profile.email || 'info@satyambrass.com | satyambrass534@gmail.com';
            if (this.settingCompanyWebsite) this.settingCompanyWebsite.value = profile.website || 'www.satyambrass.com';
            if (this.settingQuoteValidity) this.settingQuoteValidity.value = settings.quoteValidityDays || 8;
            this.tempUploadedLogo = profile.logo || null;
        }

        handleSaveSettings() {
            const profile = {
                name: (this.settingCompanyName ? this.settingCompanyName.value : '').trim() || 'Satyam Brass',
                sub: (this.settingCompanySub ? this.settingCompanySub.value : '').trim() || 'Precision Turned & Machined Components',
                address: (this.settingCompanyAddress ? this.settingCompanyAddress.value : '').trim() || '534, G.I.D.C., Phase-II, Dared, Jamnagar-361 004. (Guj.) India.',
                phone: (this.settingCompanyPhone ? this.settingCompanyPhone.value : '').trim() || '+91 9428888666, +91 9426229661',
                email: (this.settingCompanyEmail ? this.settingCompanyEmail.value : '').trim() || 'info@satyambrass.com | satyambrass534@gmail.com',
                website: (this.settingCompanyWebsite ? this.settingCompanyWebsite.value : '').trim() || 'www.satyambrass.com',
                logo: this.tempUploadedLogo || (this.storage.settings.companyProfile ? this.storage.settings.companyProfile.logo : 'assets/satyam.jpeg')
            };

            const updated = {
                defaultLabour: parseFloat(this.settingDefaultLabour.value) || 0.35,
                defaultProfitPercent: parseFloat(this.settingDefaultProfit.value) || 15.0,
                rawMetalMarkup: parseFloat(this.settingRawMarkup.value) || 21.0,
                scrapDeductionPercent: parseFloat(this.settingScrapDeduction.value) || 5.0,
                lengthAdjustment: parseFloat(this.settingLengthAdjustment.value) || 4.0,
                densityPreset: this.selectDensityPreset ? this.selectDensityPreset.value : 'brass_standard',
                quoteValidityDays: parseInt(this.settingQuoteValidity ? this.settingQuoteValidity.value : 8, 10) || 8,
                companyProfile: profile,
                coefficients: {
                    round: parseFloat(this.settingCoeffRound.value) || 0.006676,
                    square: parseFloat(this.settingCoeffSquare.value) || 0.007361,
                    hex: parseFloat(this.settingCoeffHex.value) || 0.0085,
                    rectangle: parseFloat(this.settingCoeffRectangle ? this.settingCoeffRectangle.value : 0.0085) || 0.0085
                }
            };

            this.storage.saveSettings(updated);
            this.calculator.updateSettings(updated);
            this.applyCompanyBranding();
            this.updateFormulaPreview();
            this.recalculate();
            this.closeSettingsModal();
            this.showNotification('Application settings & company branding saved successfully.');
        }

        /**
         * Printable Quotation Sheet Modal
         * Supports passing an explicit history record or defaulting to current calculation / latest record
         */
        openPrintModal(selectedRecord = null) {
            // Populate Job Selector dropdown
            if (this.quoteJobSelect) {
                this.quoteJobSelect.innerHTML = '';

                // Option 1: Current Active Calculation
                const currentRes = this.currentResult;
                const hasCurrentData = currentRes && (currentRes.rod > 0 || currentRes.expectedWeight > 0);
                const optCurrent = document.createElement('option');
                optCurrent.value = 'current';
                optCurrent.textContent = hasCurrentData
                    ? `⚡ Current Active Calculation (${currentRes.itemCode || 'Untitled'} - ₹${currentRes.finalSellingPrice.toFixed(2)}/pc)`
                    : '⚡ Current Active Calculation (Empty)';
                this.quoteJobSelect.appendChild(optCurrent);

                // Option 2..N: Saved History records
                const historyList = this.storage.history || [];
                historyList.forEach(item => {
                    const opt = document.createElement('option');
                    opt.value = item.id;
                    const dateStr = new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                    const dimStr = item.geometry === 'rectangle'
                        ? `${(item.rod || 0).toFixed(2)}×${(item.rod2 || 0).toFixed(2)}×${(item.length || 0).toFixed(2)}mm`
                        : `${(item.rod || 0).toFixed(2)}×${(item.length || 0).toFixed(2)}mm`;
                    opt.textContent = `📋 Saved: ${item.itemCode || 'Part'} - ${item.geometry.toUpperCase()} ${dimStr} (₹${item.finalSellingPrice.toFixed(2)}) [${dateStr}]`;
                    this.quoteJobSelect.appendChild(opt);
                });

                // Decide which record is active:
                if (selectedRecord && selectedRecord.id) {
                    this.activeQuoteRecord = selectedRecord;
                    this.quoteJobSelect.value = selectedRecord.id;
                    if (this.quoteItemName) this.quoteItemName.value = selectedRecord.itemCode || 'Item A-1';
                    if (this.quoteDrawingName) this.quoteDrawingName.value = selectedRecord.drawingName || 'DWG-001';
                } else if (hasCurrentData) {
                    this.activeQuoteRecord = null; // 'current'
                    this.quoteJobSelect.value = 'current';
                    if (this.quoteItemName) this.quoteItemName.value = (this.inputItemCode && this.inputItemCode.value) ? this.inputItemCode.value : 'Item A-1';
                    if (this.quoteDrawingName) this.quoteDrawingName.value = (this.inputDrawingName && this.inputDrawingName.value) ? this.inputDrawingName.value : 'DWG-001';
                } else if (historyList.length > 0) {
                    // Default to most recent history item if current calculator is empty
                    this.activeQuoteRecord = historyList[0];
                    this.quoteJobSelect.value = historyList[0].id;
                    if (this.quoteItemName) this.quoteItemName.value = historyList[0].itemCode || 'Item A-1';
                    if (this.quoteDrawingName) this.quoteDrawingName.value = historyList[0].drawingName || 'DWG-001';
                } else {
                    this.activeQuoteRecord = null;
                    this.quoteJobSelect.value = 'current';
                    if (this.quoteItemName) this.quoteItemName.value = (this.inputItemCode && this.inputItemCode.value) ? this.inputItemCode.value : 'Item A-1';
                    if (this.quoteDrawingName) this.quoteDrawingName.value = (this.inputDrawingName && this.inputDrawingName.value) ? this.inputDrawingName.value : 'DWG-001';
                }
            }

            // Sync Batch Quantity with batch simulator input
            if (this.quoteBatchQty && this.inputBatchQty) {
                this.quoteBatchQty.value = this.inputBatchQty.value || 1000;
            }

            // Sync Validity Days with settings default
            if (this.quoteValidityDays) {
                this.quoteValidityDays.value = this.storage.settings.quoteValidityDays || 8;
            }

            // Default format to commercial client quotation
            if (this.quoteFormatSelect) {
                this.quoteFormatSelect.value = 'commercial';
            }

            this.renderCurrentQuoteSheet();

            if (this.modalPrint) this.modalPrint.classList.add('active');
        }

        handleQuoteJobChange() {
            if (!this.quoteJobSelect) return;
            const val = this.quoteJobSelect.value;
            if (val === 'current') {
                this.activeQuoteRecord = null;
                if (this.quoteItemName && this.inputItemCode) {
                    this.quoteItemName.value = this.inputItemCode.value || 'Item A-1';
                }
                if (this.quoteDrawingName && this.inputDrawingName) {
                    this.quoteDrawingName.value = this.inputDrawingName.value || 'DWG-001';
                }
            } else {
                this.activeQuoteRecord = this.storage.history.find(h => h.id === val) || null;
                if (this.activeQuoteRecord) {
                    if (this.quoteItemName) this.quoteItemName.value = this.activeQuoteRecord.itemCode || 'Item A-1';
                    if (this.quoteDrawingName) this.quoteDrawingName.value = this.activeQuoteRecord.drawingName || 'DWG-001';
                }
            }
            this.renderCurrentQuoteSheet();
        }

        loadActiveQuoteToCalculator() {
            if (!this.activeQuoteRecord) return;
            this.loadSavedRecord(this.activeQuoteRecord);
            this.closePrintModal();
            this.showNotification(`Loaded ${this.activeQuoteRecord.itemCode} into active calculator.`);
        }

        renderCurrentQuoteSheet() {
            const printContainer = document.getElementById('print-sheet-content');
            if (!printContainer) return;

            let res;

            if (this.activeQuoteRecord) {
                const rec = this.activeQuoteRecord;
                res = this.calculator.calculate({
                    geometry: rec.geometry,
                    rod: rec.rod,
                    rod2: rec.rod2 || 0,
                    length: rec.length,
                    honey: rec.honey,
                    actualProductWeight: rec.actualWeight,
                    labour: rec.majuri,
                    profitPercent: rec.profitPercent,
                    itemCode: rec.itemCode,
                    drawingName: rec.drawingName || 'DWG-001'
                });
                if (this.quoteSourceStatus) {
                    this.quoteSourceStatus.textContent = `Saved Record: ${rec.itemCode}`;
                }
                if (this.btnLoadQuoteToCalc) {
                    this.btnLoadQuoteToCalc.style.display = 'inline-flex';
                }
            } else {
                res = this.currentResult;
                if (this.quoteSourceStatus) {
                    this.quoteSourceStatus.textContent = 'Live Active Calculation';
                }
                if (this.btnLoadQuoteToCalc) {
                    this.btnLoadQuoteToCalc.style.display = 'none';
                }
            }

            // Check if calculation has inputs
            const hasInputs = res && (res.rod > 0 || res.expectedWeight > 0 || res.honey > 0);

            if (!hasInputs) {
                printContainer.innerHTML = `
                    <div class="quote-empty-state" style="text-align: center; padding: 48px 20px; background: var(--bg-surface); border: 2px dashed var(--border-subtle); border-radius: var(--radius-md);">
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">📄</div>
                        <h3 style="margin-bottom: 8px; color: var(--text-primary); font-size: 1.15rem;">No Active Calculation Entered</h3>
                        <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 480px; margin: 0 auto 20px; line-height: 1.5;">
                            The <strong>Technical Quotation Sheet</strong> generates a formal manufacturing commercial quote and client work order. Enter rod dimensions in <strong>Step 1</strong>, or select a saved part from your history above.
                        </p>
                        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                            <button type="button" class="main-btn" id="btn-quote-empty-sample">⚡ Load Factory Sample A-1</button>
                            <button type="button" class="outline-btn" id="btn-quote-empty-close">← Back to Calculator</button>
                        </div>
                    </div>
                `;

                const btnSample = printContainer.querySelector('#btn-quote-empty-sample');
                if (btnSample) {
                    btnSample.addEventListener('click', () => {
                        this.loadFactorySampleA1();
                        this.openPrintModal();
                    });
                }
                const btnClose = printContainer.querySelector('#btn-quote-empty-close');
                if (btnClose) {
                    btnClose.addEventListener('click', () => {
                        this.closePrintModal();
                        this.goToStage(1);
                    });
                }
                return;
            }

            const qty = parseInt(this.quoteBatchQty ? this.quoteBatchQty.value : 1000, 10) || 1000;
            const batch = this.calculator.calculateBatch(res, qty);
            const clientName = (this.quoteClientName ? this.quoteClientName.value : '').trim();
            const itemName = (this.quoteItemName && this.quoteItemName.value) ? this.quoteItemName.value.trim() : (res.itemCode || 'Item A-1');
            const drawingName = (this.quoteDrawingName && this.quoteDrawingName.value) ? this.quoteDrawingName.value.trim() : (res.drawingName || 'DWG-001');
            const validityDays = parseInt(this.quoteValidityDays ? this.quoteValidityDays.value : 8, 10) || 8;
            const quoteFormat = this.quoteFormatSelect ? this.quoteFormatSelect.value : 'commercial';

            const today = new Date();
            const validityDateObj = new Date(today.getTime() + validityDays * 24 * 60 * 60 * 1000);
            const formattedValidityDate = validityDateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const todayFormatted = today.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });

            const quoteRef = (this.quoteRefNo && this.quoteRefNo.value ? this.quoteRefNo.value.trim() : '') ||
                ('QUO-' + (itemName || 'PART').replace(/[^A-Za-z0-9_-]/g, '').toUpperCase() + '-' + String(today.getDate()).padStart(2, '0') + String(today.getMonth() + 1).padStart(2, '0'));

            const comp = (this.storage.settings && this.storage.settings.companyProfile) ? this.storage.settings.companyProfile : {
                name: 'Satyam Brass',
                sub: 'Precision Turned & Machined Components',
                address: '534, G.I.D.C., Phase-II, Dared, Jamnagar-361 004. (Guj.) India.',
                phone: '+91 9428888666, +91 9426229661',
                email: 'info@satyambrass.com | satyambrass534@gmail.com',
                website: 'www.satyambrass.com',
                logo: 'assets/satyam.jpeg'
            };

            let specText = '';
            if (res.geometry === 'round') {
                specText = `Round Rod (Dia ${res.rod.toFixed(2)} mm × L ${res.length.toFixed(2)} mm)`;
            } else if (res.geometry === 'square') {
                specText = `Square Rod (${res.rod.toFixed(2)} mm × ${res.rod.toFixed(2)} mm × L ${res.length.toFixed(2)} mm)`;
            } else if (res.geometry === 'hex') {
                specText = `Hexagon Rod (${res.rod.toFixed(2)} mm A/F × L ${res.length.toFixed(2)} mm)`;
            } else if (res.geometry === 'rectangle') {
                specText = `Rectangle Bar (${(res.rod || 0).toFixed(2)} mm W × ${(res.rod2 || 0).toFixed(2)} mm T × L ${res.length.toFixed(2)} mm)`;
            }

            // RENDER COMMERCIAL CLIENT QUOTATION (STRICT PRIVACY - NO INTERNAL COSTS)
            if (quoteFormat === 'commercial') {
                printContainer.innerHTML = `
                    <div class="quote-company-letterhead">
                        <div class="quote-brand-left">
                            <img src="${comp.logo || 'assets/satyam.jpeg'}" alt="${this.escapeHTML(comp.name)}" class="quote-brand-logo" onerror="this.src='assets/satyam.jpeg'">
                            <div>
                                <div class="quote-company-name">${this.escapeHTML(comp.name)}</div>
                                <div class="quote-company-tagline">${this.escapeHTML(comp.sub)}</div>
                            </div>
                        </div>
                        <div class="quote-company-contact">
                            <div>${this.escapeHTML(comp.address)}</div>
                            <div><strong>M:</strong> ${this.escapeHTML(comp.phone)}</div>
                            <div><strong>E-mail:</strong> ${this.escapeHTML(comp.email)}</div>
                            <div><strong>Web:</strong> ${this.escapeHTML(comp.website)}</div>
                        </div>
                    </div>

                    <div class="quote-title-bar">
                        <span class="quote-title-text">COMMERCIAL QUOTATION / RATE PROPOSAL</span>
                        <span style="font-size: 0.8rem; font-weight: 700; color: #555;">REF: ${this.escapeHTML(quoteRef)}</span>
                    </div>

                    <div class="quote-meta-grid">
                        <div class="quote-meta-item">
                            <span class="quote-meta-label">Quotation For / Buyer:</span>
                            <span class="quote-meta-val">${clientName ? this.escapeHTML(clientName) : 'M/s. Valued Customer'}</span>
                        </div>
                        <div class="quote-meta-item">
                            <span class="quote-meta-label">Quotation Date:</span>
                            <span class="quote-meta-val">${todayFormatted}</span>
                        </div>
                        <div class="quote-meta-item">
                            <span class="quote-meta-label">Market Benchmark (Honey):</span>
                            <span class="quote-meta-val">₹${res.formatted.honey} / kg</span>
                        </div>
                        <div class="quote-meta-item">
                            <span class="quote-meta-label">Rate Validity:</span>
                            <span class="quote-meta-val" style="color: #B65738;">Valid till ${formattedValidityDate} (${validityDays} Days)</span>
                        </div>
                    </div>

                    <table class="quote-commercial-table">
                        <thead>
                            <tr>
                                <th style="width: 36px; text-align: center;">Sr.</th>
                                <th>Item Name & Description</th>
                                <th style="width: 100px;">Drawing Ref</th>
                                <th>Raw Material Profile</th>
                                <th style="text-align: right; width: 105px;">Finished Wt</th>
                                <th style="text-align: right; width: 95px;">Quantity</th>
                                <th style="text-align: right; width: 110px;">Unit Rate</th>
                                <th style="text-align: right; width: 120px;">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align: center;">1</td>
                                <td>
                                    <strong>${this.escapeHTML(itemName)}</strong>
                                    <div style="font-size: 0.74rem; color: #666; margin-top: 2px;">Precision CNC Turned Component</div>
                                </td>
                                <td><code style="font-size: 0.82rem; font-weight: 700; background: #FAF7F2; padding: 2px 6px; border-radius: 3px; border: 1px solid #D5CCC0;">${this.escapeHTML(drawingName)}</code></td>
                                <td style="font-size: 0.8rem;">${this.escapeHTML(specText)}</td>
                                <td style="text-align: right; font-weight: 700;">${res.formatted.actualWeight} g</td>
                                <td style="text-align: right; font-weight: 700;">${batch.formatted.quantity} pcs</td>
                                <td style="text-align: right; font-weight: 800; font-size: 0.92rem;">₹${res.formatted.finalSellingPrice}</td>
                                <td style="text-align: right; font-weight: 800; font-size: 0.95rem;">₹${batch.formatted.totalOrderValue}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="5" style="text-align: right; font-weight: 800; font-size: 0.84rem; text-transform: uppercase; letter-spacing: 0.5px;">Total Net Order Value:</td>
                                <td style="text-align: right; font-weight: 800;">${batch.formatted.quantity} pcs</td>
                                <td style="text-align: right; font-size: 0.76rem; color: #666;">Ex-Works</td>
                                <td style="text-align: right; font-weight: 800; font-size: 1.05rem; font-family: monospace;">₹${batch.formatted.totalOrderValue}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="quote-terms-box">
                        <div class="quote-terms-title">Commercial Terms & Conditions:</div>
                        <ol style="margin: 0; padding-left: 18px;">
                            <li><strong>Market Pegged Validity:</strong> Quoted price is pegged to Honey brass market rate of <strong>₹${res.formatted.honey}/kg</strong> and is strictly <strong>valid till ${formattedValidityDate}</strong> (${validityDays} days). Fluctuations in raw metal rate prior to official order placement will adjust unit price proportionately.</li>
                            <li><strong>Order Lot:</strong> Unit rate is based on the scheduled batch run of <strong>${batch.formatted.quantity} pieces</strong>.</li>
                            <li><strong>Taxes & Duties:</strong> GST @ 18% extra as applicable at time of invoicing.</li>
                            <li><strong>Delivery & Freight:</strong> F.O.R. Jamnagar Factory. Transport, transit insurance, and special packing charges extra at actuals.</li>
                            <li><strong>Dimensional Standard:</strong> Machined strictly in compliance with specified drawing <strong>${this.escapeHTML(drawingName)}</strong> tolerances.</li>
                        </ol>
                    </div>

                    <div class="print-signatures" style="margin-top: 30px;">
                        <div>
                            <div class="sig-line">Customer Acceptance & Stamp</div>
                            <div style="text-align: center; font-size: 0.72rem; color: #777; margin-top: 4px;">Sign with company seal & date</div>
                        </div>
                        <div>
                            <div class="sig-line">For, ${this.escapeHTML(comp.name)}</div>
                            <div style="text-align: center; font-size: 0.72rem; color: #777; margin-top: 4px;">Authorized Signatory</div>
                        </div>
                    </div>
                `;
                return;
            }

            // RENDER INTERNAL FACTORY COSTING SHEET (FOR WORKS MANAGER / ESTIMATOR)
            printContainer.innerHTML = `
                <div class="quote-company-letterhead">
                    <div class="quote-brand-left">
                        <img src="${comp.logo || 'assets/satyam.jpeg'}" alt="${this.escapeHTML(comp.name)}" class="quote-brand-logo" onerror="this.src='assets/satyam.jpeg'">
                        <div>
                            <div class="quote-company-name">${this.escapeHTML(comp.name)}</div>
                            <div class="quote-company-tagline">INTERNAL FACTORY COSTING & TECHNICAL SHEET</div>
                        </div>
                    </div>
                    <div class="quote-company-contact">
                        <div><strong>Job Code:</strong> ${this.escapeHTML(itemName)}</div>
                        <div><strong>Drawing:</strong> ${this.escapeHTML(drawingName)}</div>
                        <div><strong>Date:</strong> ${todayFormatted}</div>
                        <div><strong>Validity:</strong> Valid till ${formattedValidityDate}</div>
                    </div>
                </div>

                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Technical Parameter</th>
                            <th>Shop Value</th>
                            <th>Manufacturing Formula & Basis</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Geometry Profile</td>
                            <td><strong>${res.geometry.toUpperCase()}</strong></td>
                            <td>${this.escapeHTML(specText)}</td>
                        </tr>
                        <tr>
                            <td>Rod Dimension × Length</td>
                            <td><strong>${res.geometry === 'rectangle' ? `${(res.rod || 0).toFixed(2)} × ${(res.rod2 || 0).toFixed(2)}` : res.rod.toFixed(2)} mm × ${res.length.toFixed(2)} mm</strong></td>
                            <td>Length includes +${res.lengthAdjustment.toFixed(1)} mm parting allowance</td>
                        </tr>
                        <tr>
                            <td>Geometry Multiplier Coeff</td>
                            <td><code>${res.coefficientUsed}</code></td>
                            <td>${res.geometry === 'rectangle' ? 'W × T × (L + allowance) × Coeff' : 'R² × (L + allowance) × Coeff'}</td>
                        </tr>
                        <tr>
                            <td>Expected Raw Rod Weight</td>
                            <td><strong>${res.formatted.expectedWeight} grams</strong></td>
                            <td>Gross metal requirement per piece</td>
                        </tr>
                        <tr>
                            <td>Finished Part Net Weight</td>
                            <td><strong>${res.formatted.actualWeight} grams</strong></td>
                            <td>Net piece weight on scale</td>
                        </tr>
                        <tr>
                            <td>Wastage / Chhol Weight</td>
                            <td><strong>${res.formatted.wastageWeight} grams</strong></td>
                            <td>Raw Material - Finished Part (Utilization: ${res.formatted.materialUtilizationPct}%)</td>
                        </tr>
                        <tr>
                            <td>Metal Honey Benchmark</td>
                            <td><strong>₹${res.formatted.honey} / kg</strong></td>
                            <td>Base raw market rate (Jamnagar)</td>
                        </tr>
                        <tr>
                            <td>Rod Purchase Rate</td>
                            <td><strong>₹${res.formatted.rodRate} / kg</strong></td>
                            <td>Honey + ₹${res.markup.toFixed(2)} surcharge</td>
                        </tr>
                        <tr>
                            <td>Chhol / Scrap Selling Rate</td>
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
                            <td>Net Metal Cost (Material Rs.)</td>
                            <td><strong>₹${res.formatted.netMaterialCost} / pc</strong></td>
                            <td>Gross Rod Cost - Scrap Recovery</td>
                        </tr>
                        <tr>
                            <td>Labour Charges (Majuri Rs.)</td>
                            <td>₹${res.formatted.majuri} / pc</td>
                            <td>Standard shop-floor turning rate</td>
                        </tr>
                        <tr class="key-row">
                            <td>Production Cost (Padtar Rs.)</td>
                            <td><strong>₹${res.formatted.padtar} / pc</strong></td>
                            <td>Net Material + Labour (Majuri)</td>
                        </tr>
                        <tr>
                            <td>Target Profit (${res.profitPercent.toFixed(1)}%)</td>
                            <td>₹${res.formatted.profitAmount} / pc</td>
                            <td>Padtar × ${res.profitPercent.toFixed(1)}%</td>
                        </tr>
                        <tr class="grand-total-row">
                            <td>FINAL SELLING PRICE</td>
                            <td><strong>₹${res.formatted.finalSellingPrice} / pc</strong></td>
                            <td>Padtar + Profit Amount</td>
                        </tr>
                    </tbody>
                </table>

                <div class="print-batch-box">
                    <h3>FACTORY BATCH PROJECTION (${batch.formatted.quantity} PIECES)</h3>
                    <div class="print-batch-grid">
                        <div>Total Raw Material Required: <strong>${batch.formatted.totalRawMaterialKg} kg</strong></div>
                        <div>Total Scrap Generated: <strong>${batch.formatted.totalScrapKg} kg</strong></div>
                        <div>Total Factory Net Cost: <strong>₹${batch.formatted.totalProductionCost}</strong></div>
                        <div>Total Projected Profit: <strong>₹${batch.formatted.totalProfit}</strong></div>
                        <div class="print-batch-hero">
                            <span>Total Batch Billing Value:</span>
                            <span style="font-size: 1.15rem; font-family: monospace;">₹${batch.formatted.totalOrderValue}</span>
                        </div>
                    </div>
                </div>

                <div class="print-signatures">
                    <div>
                        <div class="sig-line">Prepared By (Estimator / Operator)</div>
                    </div>
                    <div>
                        <div class="sig-line">Approved By (Works Director)</div>
                    </div>
                </div>
            `;
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
