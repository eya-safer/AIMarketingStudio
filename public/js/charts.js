/* Premium SVG Chart Engine - AI Marketing Studio */

class SvgChartEngine {
    static renderLineChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const width = container.clientWidth || 600;
        const height = container.clientHeight || 280;
        const pad = { top: 20, right: 20, bottom: 40, left: 40 };
        const cw = width - pad.left - pad.right;
        const ch = height - pad.top - pad.bottom;

        const allVals = data.datasets.flatMap(d => d.data);
        const maxVal = Math.ceil(Math.max(...allVals, 5) * 1.15);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.overflow = 'visible';

        // Defs
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        data.datasets.forEach((ds, i) => {
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            grad.setAttribute('id', `${containerId}-g${i}`);
            grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
            grad.setAttribute('x2', '0'); grad.setAttribute('y2', '1');
            const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', ds.color); s1.setAttribute('stop-opacity', '0.2');
            const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', ds.color); s2.setAttribute('stop-opacity', '0');
            grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad);
        });
        svg.appendChild(defs);

        // Grid lines & Y labels
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + ch * (1 - i / 4);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pad.left); line.setAttribute('y1', y);
            line.setAttribute('x2', width - pad.right); line.setAttribute('y2', y);
            line.setAttribute('stroke', 'var(--border-color)'); line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', pad.left - 8); txt.setAttribute('y', y + 4);
            txt.setAttribute('text-anchor', 'end'); txt.setAttribute('fill', 'var(--text-muted)');
            txt.setAttribute('font-size', '10'); txt.textContent = Math.round(maxVal * i / 4);
            svg.appendChild(txt);
        }

        const stepX = cw / Math.max(data.labels.length - 1, 1);

        // X Labels
        data.labels.forEach((label, i) => {
            const x = pad.left + i * stepX;
            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', x); txt.setAttribute('y', height - pad.bottom + 20);
            txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('fill', 'var(--text-muted)');
            txt.setAttribute('font-size', '10'); txt.textContent = label;
            svg.appendChild(txt);
        });

        // Tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        container.appendChild(tooltip);

        data.datasets.forEach((ds, si) => {
            const pts = ds.data.map((val, i) => ({
                x: pad.left + i * stepX,
                y: pad.top + ch * (1 - val / maxVal),
                val, label: data.labels[i]
            }));

            // Bezier path
            let dStr = `M ${pts[0].x} ${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
                const cp1x = pts[i].x + stepX / 2;
                const cp2x = pts[i + 1].x - stepX / 2;
                dStr += ` C ${cp1x} ${pts[i].y}, ${cp2x} ${pts[i+1].y}, ${pts[i+1].x} ${pts[i+1].y}`;
            }

            // Area fill
            const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            area.setAttribute('d', `${dStr} L ${pts[pts.length-1].x} ${pad.top + ch} L ${pts[0].x} ${pad.top + ch} Z`);
            area.setAttribute('fill', `url(#${containerId}-g${si})`);
            svg.appendChild(area);

            // Line
            const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            linePath.setAttribute('d', dStr);
            linePath.setAttribute('fill', 'none');
            linePath.setAttribute('stroke', ds.color);
            linePath.setAttribute('stroke-width', '2.5');
            linePath.setAttribute('stroke-linecap', 'round');
            svg.appendChild(linePath);

            // Dots
            pts.forEach(pt => {
                const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); dot.setAttribute('r', '4');
                dot.setAttribute('fill', ds.color); dot.setAttribute('stroke', 'var(--bg-card)'); dot.setAttribute('stroke-width', '2');
                dot.setAttribute('opacity', '0');
                dot.style.transition = 'opacity 0.15s';

                const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                hit.setAttribute('cx', pt.x); hit.setAttribute('cy', pt.y); hit.setAttribute('r', '14');
                hit.setAttribute('fill', 'transparent'); hit.style.cursor = 'pointer';

                hit.addEventListener('mouseenter', () => {
                    dot.setAttribute('opacity', '1');
                    tooltip.style.opacity = '1';
                    tooltip.style.left = `${pt.x}px`;
                    tooltip.style.top = `${pt.y - 10}px`;
                    tooltip.style.borderColor = ds.color;
                    tooltip.innerHTML = `<strong style="color:var(--text-primary)">${ds.label}</strong><br><span style="color:var(--text-secondary)">${pt.label}: <strong style="color:var(--text-primary)">${pt.val}</strong></span>`;
                });
                hit.addEventListener('mouseleave', () => {
                    dot.setAttribute('opacity', '0');
                    tooltip.style.opacity = '0';
                });
                svg.appendChild(dot);
                svg.appendChild(hit);
            });
        });

        container.appendChild(svg);
    }

    static renderBarChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        const width = container.clientWidth || 400;
        const height = container.clientHeight || 280;
        const pad = { top: 20, right: 20, bottom: 40, left: 40 };
        const cw = width - pad.left - pad.right;
        const ch = height - pad.top - pad.bottom;
        const maxVal = Math.max(...data.data, 1);

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.width = '100%'; svg.style.height = '100%';

        const barCount = data.data.length;
        const barSpacing = 12;
        const totalSpacing = barSpacing * (barCount + 1);
        const barWidth = (cw - totalSpacing) / barCount;

        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        container.appendChild(tooltip);

        data.data.forEach((val, i) => {
            const bh = ch * (val / maxVal);
            const x = pad.left + barSpacing + i * (barWidth + barSpacing);
            const y = pad.top + ch - bh;

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x); rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth); rect.setAttribute('height', bh);
            rect.setAttribute('rx', '4'); rect.setAttribute('fill', data.color || 'var(--primary)');
            rect.style.cursor = 'pointer';
            rect.style.transition = 'fill 0.15s';

            rect.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], {
                duration: 700, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards',
                transformOrigin: `${x + barWidth/2}px ${pad.top + ch}px`
            });

            rect.addEventListener('mouseenter', () => {
                rect.setAttribute('fill', data.hoverColor || 'var(--secondary)');
                tooltip.style.opacity = '1';
                tooltip.style.left = `${x + barWidth/2}px`;
                tooltip.style.top = `${y}px`;
                tooltip.innerHTML = `<strong style="color:var(--text-primary)">${data.labels[i]}</strong><br><span style="color:var(--text-secondary)">Count: <strong style="color:var(--text-primary)">${val}</strong></span>`;
            });
            rect.addEventListener('mouseleave', () => {
                rect.setAttribute('fill', data.color || 'var(--primary)');
                tooltip.style.opacity = '0';
            });
            svg.appendChild(rect);

            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', x + barWidth/2); txt.setAttribute('y', height - pad.bottom + 20);
            txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('fill', 'var(--text-muted)');
            txt.setAttribute('font-size', '10');
            txt.textContent = data.labels[i].length > 8 ? data.labels[i].substring(0, 7) + '..' : data.labels[i];
            svg.appendChild(txt);
        });

        container.appendChild(svg);
    }
}

export function initDashboardCharts(history = []) {
    // Build weekly data from history
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const images = new Array(7).fill(0);
    const posts = new Array(7).fill(0);
    const now = new Date();

    history.forEach(item => {
        const d = new Date(item.created_at);
        const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        if (diff < 7) {
            const dayIndex = d.getDay();
            if (item.type === 'image') images[dayIndex]++;
            else if (item.type === 'post') posts[dayIndex]++;
        }
    });

    const rotatedDays = [...days.slice(now.getDay() + 1), ...days.slice(0, now.getDay() + 1)];
    const rotatedImages = [...images.slice(now.getDay() + 1), ...images.slice(0, now.getDay() + 1)];
    const rotatedPosts = [...posts.slice(now.getDay() + 1), ...posts.slice(0, now.getDay() + 1)];

    // Add some base data if empty for visual
    const hasData = rotatedImages.some(v => v > 0) || rotatedPosts.some(v => v > 0);
    const displayImages = hasData ? rotatedImages : [0, 2, 1, 3, 2, 4, 3];
    const displayPosts  = hasData ? rotatedPosts  : [0, 1, 2, 1, 3, 2, 4];

    SvgChartEngine.renderLineChart('dashboard-activity-chart', {
        labels: rotatedDays,
        datasets: [
            { label: 'Images', data: displayImages, color: '#6C63FF' },
            { label: 'Posts', data: displayPosts, color: '#00C9A7' }
        ]
    });
}

export function initAnalyticsCharts(monthly = null, categories = null) {
    // Monthly trends chart
    if (monthly && monthly.length > 0) {
        SvgChartEngine.renderLineChart('analytics-trends-chart', {
            labels: monthly.map(m => m.month.substring(5)),
            datasets: [
                { label: 'Images', data: monthly.map(m => m.images || 0), color: '#6C63FF' },
                { label: 'Posts', data: monthly.map(m => m.posts || 0), color: '#9D8CFF' }
            ]
        });
    } else {
        SvgChartEngine.renderLineChart('analytics-trends-chart', {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            datasets: [
                { label: 'Images', data: [0, 0, 0, 0, 0, 0, 0], color: '#6C63FF' },
                { label: 'Posts', data: [0, 0, 0, 0, 0, 0, 0], color: '#9D8CFF' }
            ]
        });
    }

    // Categories bar chart
    if (categories && categories.length > 0) {
        SvgChartEngine.renderBarChart('analytics-templates-chart', {
            labels: categories.map(c => c.category),
            data: categories.map(c => c.count),
            color: '#00C9A7',
            hoverColor: '#02E4BD'
        });
    } else {
        SvgChartEngine.renderBarChart('analytics-templates-chart', {
            labels: ['No data'],
            data: [0],
            color: '#00C9A7'
        });
    }
}

window.addEventListener('resize', () => {
    if (window.App?.activeView === 'home') initDashboardCharts(window.App?.history || []);
    if (window.App?.activeView === 'analytics') window.App?.loadAndRenderAnalytics();
});
