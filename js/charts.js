/**
 * PRECIMETAL™ INDUSTRIAL METAL WEIGHT & COSTING OS
 * High-Performance Pure Canvas Data Visualization Engine
 * 100% Zero-Dependency, Offline-First, Retina-Crisp Renderers
 */

(function (window) {
    'use strict';

    class IndustrialCharts {
        /**
         * Render a multi-segment Cost Structure Donut Chart on an HTML5 canvas
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {object} costData
         * @param {number} costData.netMaterial
         * @param {number} costData.labour
         * @param {number} costData.profit
         * @param {number} costData.scrapRecovery
         */
        static renderCostDonut(canvas, costData) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) return;

            // Handle high DPI retina display crispness
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(centerX, centerY) - 14;
            const innerRadius = radius * 0.68;

            ctx.clearRect(0, 0, width, height);

            const netMat = Math.max(0, costData.netMaterial || 0);
            const labour = Math.max(0, costData.labour || 0);
            const profit = Math.max(0, costData.profit || 0);
            const total = netMat + labour + profit;

            if (total <= 0) {
                // Empty state ring
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                ctx.fill();
                return;
            }

            const segments = [
                { label: 'Net Material', value: netMat, color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)' },
                { label: 'Labour / Majuri', value: labour, color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
                { label: 'Profit', value: profit, color: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' }
            ];

            let startAngle = -Math.PI / 2;

            segments.forEach(seg => {
                if (seg.value <= 0) return;
                const sliceAngle = (seg.value / total) * (Math.PI * 2);
                const endAngle = startAngle + sliceAngle;

                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
                ctx.closePath();
                ctx.fillStyle = seg.color;
                ctx.fill();

                // Clean segment separator gap
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#0f172a';
                ctx.stroke();
                ctx.restore();

                startAngle = endAngle;
            });

            // Center Text / Core
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#94a3b8';
            ctx.font = '500 11px system-ui, -apple-system, sans-serif';
            ctx.fillText('FINAL PRICE', centerX, centerY - 10);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 16px monospace';
            ctx.fillText('₹' + total.toFixed(2), centerX, centerY + 10);
            ctx.restore();
        }

        /**
         * Render Weight Utilization Gauge (Product vs Scrap/Chhol)
         * 
         * @param {HTMLCanvasElement} canvas
         * @param {number} productWeight Finished weight (g)
         * @param {number} expectedWeight Raw weight (g)
         */
        static renderWeightGauge(canvas, productWeight, expectedWeight) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            const centerX = width / 2;
            const centerY = height * 0.78;
            const radius = Math.min(width * 0.44, height * 0.65);
            const lineWidth = 16;

            ctx.clearRect(0, 0, width, height);

            const startAngle = Math.PI;
            const endAngle = Math.PI * 2;

            // Background arc (semi-circle)
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            const pWg = Math.max(0, productWeight || 0);
            const eWg = Math.max(0, expectedWeight || 0);
            const pct = eWg > 0 ? Math.min(100, (pWg / eWg) * 100) : 0;
            const activeAngle = startAngle + (pct / 100) * Math.PI;

            // Active Arc (Utilization)
            if (pct > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, activeAngle, false);
                ctx.lineWidth = lineWidth;

                // Color gradient based on utilization efficiency
                const grad = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
                grad.addColorStop(0, '#06b6d4');
                grad.addColorStop(0.5, '#3b82f6');
                grad.addColorStop(1, '#10b981');

                ctx.strokeStyle = grad;
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.restore();
            }

            // Percentage in Center
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 22px monospace';
            ctx.fillText(`${pct.toFixed(1)}%`, centerX, centerY - 24);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '500 11px system-ui, -apple-system, sans-serif';
            ctx.fillText('UTILIZATION', centerX, centerY - 6);
            ctx.restore();
        }
    }

    window.IndustrialCharts = IndustrialCharts;

})(typeof window !== 'undefined' ? window : this);
