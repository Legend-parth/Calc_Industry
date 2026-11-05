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
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);

            const width = rect.width;
            const height = rect.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(centerX, centerY) - 10;
            const innerRadius = radius * 0.70;

            ctx.clearRect(0, 0, width, height);

            const netMat = Math.max(0, costData.netMaterial || 0);
            const labour = Math.max(0, costData.labour || 0);
            const profit = Math.max(0, costData.profit || 0);
            const total = netMat + labour + profit;

            if (total <= 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.arc(centerX, centerY, innerRadius, Math.PI * 2, 0, true);
                ctx.fillStyle = '#EBE7DF';
                ctx.fill();
                return;
            }

            const segments = [
                { label: 'Net Metal', value: netMat, color: '#1A1A1A' }, // Deep charcoal
                { label: 'Labour', value: labour, color: '#8C8275' },    // Warm stone
                { label: 'Profit', value: profit, color: '#B85D36' }     // Warm terracotta / clay
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

                // Crisp clean white separator
                ctx.lineWidth = 2;
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
            ctx.font = '700 15px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
            ctx.fillText('₹' + total.toFixed(2), centerX, centerY + 8);
            ctx.restore();
        }

        /**
         * Render clean minimal Material Utilization Gauge
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
            const lineWidth = 12;

            ctx.clearRect(0, 0, width, height);

            const startAngle = Math.PI;
            const endAngle = Math.PI * 2;

            // Background Track
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = '#EBE7DF';
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();

            const pWg = Math.max(0, productWeight || 0);
            const eWg = Math.max(0, expectedWeight || 0);
            const pct = eWg > 0 ? Math.min(100, (pWg / eWg) * 100) : 0;
            const activeAngle = startAngle + (pct / 100) * Math.PI;

            // Active Arc
            if (pct > 0) {
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
            ctx.font = '700 20px -apple-system, BlinkMacSystemFont, "Segoe UI", monospace';
            ctx.fillText(`${pct.toFixed(1)}%`, centerX, centerY - 20);

            ctx.fillStyle = '#76726B';
            ctx.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            ctx.fillText('UTILIZATION', centerX, centerY - 4);
            ctx.restore();
        }
    }

    window.IndustrialCharts = IndustrialCharts;

})(typeof window !== 'undefined' ? window : this);
