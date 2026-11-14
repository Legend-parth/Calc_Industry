/**
 * PRECIMETAL™ INDUSTRIAL CALCULATOR
 * Minimalist Pure Canvas Visualizer
 * Natural Cream, Charcoal & Warm Earth Tones
 */

(function (window) {
    'use strict';

    class IndustrialCharts {
        /**
         * Render clean minimal Cost Split Donut Chart
         */
        static renderCostDonut(canvas, costData) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            let width = rect.width;
            let height = rect.height;
            if (!width || width === 0) {
                width = canvas.parentElement ? canvas.parentElement.clientWidth : 160;
            }
            if (!height || height === 0) {
                height = 120;
            }
            if (!width || width === 0) width = 160;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.max(10, Math.min(centerX, centerY) - 8);
            const innerRadius = radius * 0.68;

            ctx.clearRect(0, 0, width, height);

            const netMat = Math.max(0, costData ? (costData.netMaterial || 0) : 0);
            const labour = Math.max(0, costData ? (costData.labour || 0) : 0);
            const profit = Math.max(0, costData ? (costData.profit || 0) : 0);
            const total = netMat + labour + profit;

            if (total <= 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
                ctx.fillStyle = '#EBE7DF';
                ctx.fill();

                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#76726B';
                ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
                ctx.fillText('FINAL PRICE', centerX, centerY - 9);

                ctx.fillStyle = '#1A1A1A';
                ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
                ctx.fillText('₹0.00', centerX, centerY + 8);
                ctx.restore();
                return;
            }

            const segments = [
                { label: 'Net Metal', value: netMat, color: '#1A1A1A' }, // Deep charcoal
                { label: 'Labour', value: labour, color: '#8C8275' },    // Warm stone
                { label: 'Profit', value: profit, color: '#B65738' }     // Warm terracotta
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

                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();
                ctx.restore();

                startAngle = endAngle;
            });

            // Clean Minimal Center Text
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#76726B';
            ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillText('FINAL PRICE', centerX, centerY - 9);

            ctx.fillStyle = '#1A1A1A';
            ctx.font = '700 14px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
            ctx.fillText('₹' + total.toFixed(2), centerX, centerY + 8);
            ctx.restore();
        }

        /**
         * Render clean minimal Material Utilization Gauge
         */
        static renderWeightGauge(canvas, productWeight, expectedWeight) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            let width = rect.width;
            let height = rect.height;
            if (!width || width === 0) {
                width = canvas.parentElement ? canvas.parentElement.clientWidth : 160;
            }
            if (!height || height === 0) {
                height = 120;
            }
            if (!width || width === 0) width = 160;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const centerX = width / 2;
            const centerY = height * 0.82;
            const radius = Math.max(15, Math.min(width * 0.40, height * 0.60));
            const lineWidth = 12;

            ctx.clearRect(0, 0, width, height);

            const startAngle = Math.PI;
            const endAngle = Math.PI * 2;

            // Background Track Arc
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = '#EBE7DF';
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            const pWg = Math.max(0, parseFloat(productWeight) || 0);
            const eWg = Math.max(0, parseFloat(expectedWeight) || 0);
            const pct = eWg > 0 ? Math.min(100, (pWg / eWg) * 100) : 0;

            // Active Arc
            if (pct > 0) {
                const activeAngle = startAngle + (pct / 100) * Math.PI;
                ctx.save();
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, activeAngle, false);
                ctx.lineWidth = lineWidth;
                ctx.strokeStyle = '#1A1A1A';
                ctx.lineCap = 'round';
                ctx.stroke();
                ctx.restore();
            }

            // Percentage in Center
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1A1A1A';
            ctx.font = '700 18px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
            ctx.fillText(`${pct.toFixed(1)}%`, centerX, centerY - 20);

            ctx.fillStyle = '#76726B';
            ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillText('UTILIZATION', centerX, centerY - 4);
            ctx.restore();
        }
    }

    window.IndustrialCharts = IndustrialCharts;

})(typeof window !== 'undefined' ? window : this);
