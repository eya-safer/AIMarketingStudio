/* Premium Interactive SVG Chart Engine for AI Marketing Studio */

class SvgChartEngine {
    // Render a Vercel-like smooth line chart
    static renderLineChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const width = container.clientWidth || 600;
        const height = container.clientHeight || 280;
        const padding = { top: 20, right: 30, bottom: 40, left: 40 };
        
        // Find min/max values
        const allValues = data.datasets.flatMap(d => d.data);
        const maxVal = Math.ceil(Math.max(...allValues, 10) * 1.15);
        const minVal = 0;
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chart-svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.style.width = '100%';
        svg.style.height = '100%';
        
        // Define Gradients and Filters
        let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        data.datasets.forEach((dataset, idx) => {
            const gradId = `${containerId}-gradient-${idx}`;
            const linearGrad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            linearGrad.setAttribute('id', gradId);
            linearGrad.setAttribute('x1', '0');
            linearGrad.setAttribute('y1', '0');
            linearGrad.setAttribute('x2', '0');
            linearGrad.setAttribute('y2', '1');
            
            const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop1.setAttribute('offset', '0%');
            stop1.setAttribute('stop-color', dataset.color);
            stop1.setAttribute('stop-opacity', '0.25');
            
            const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            stop2.setAttribute('offset', '100%');
            stop2.setAttribute('stop-color', dataset.color);
            stop2.setAttribute('stop-opacity', '0');
            
            linearGrad.appendChild(stop1);
            linearGrad.appendChild(stop2);
            defs.appendChild(linearGrad);
        });
        svg.appendChild(defs);
        
        // Render Grid Lines
        const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const gridTicks = 4;
        for (let i = 0; i <= gridTicks; i++) {
            const y = padding.top + (chartHeight * (1 - i / gridTicks));
            const val = Math.round(minVal + (maxVal - minVal) * (i / gridTicks));
            
            // Grid Line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width - padding.right);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'var(--border-color)');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '4 4');
            gridGroup.appendChild(line);
            
            // Y Axis Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', padding.left - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('fill', 'var(--text-muted)');
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', '500');
            text.textContent = val;
            gridGroup.appendChild(text);
        }
        svg.appendChild(gridGroup);
        
        // Render X Axis Labels
        const labelsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const stepX = chartWidth / (data.labels.length - 1);
        data.labels.forEach((label, idx) => {
            const x = padding.left + (idx * stepX);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', height - padding.bottom + 22);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text-muted)');
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', '500');
            text.textContent = label;
            labelsGroup.appendChild(text);
        });
        svg.appendChild(labelsGroup);
        
        // Create Tooltip Overlay Element
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        container.appendChild(tooltip);
        
        const activeDotsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Plot Datasets
        data.datasets.forEach((dataset, setIdx) => {
            const points = dataset.data.map((val, idx) => {
                const x = padding.left + (idx * stepX);
                const y = padding.top + chartHeight * (1 - (val - minVal) / (maxVal - minVal));
                return { x, y, val, label: data.labels[idx] };
            });
            
            // Generate Bezier Curve String
            let dPath = `M ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const cpX1 = points[i].x + stepX / 2;
                const cpY1 = points[i].y;
                const cpX2 = points[i + 1].x - stepX / 2;
                const cpY2 = points[i + 1].y;
                dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i+1].x} ${points[i+1].y}`;
            }
            
            // Render Area Path (Gradient fill)
            const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const dArea = `${dPath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
            areaPath.setAttribute('d', dArea);
            areaPath.setAttribute('fill', `url(#${containerId}-gradient-${setIdx})`);
            svg.appendChild(areaPath);
            
            // Render Line Path
            const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            linePath.setAttribute('d', dPath);
            linePath.setAttribute('fill', 'none');
            linePath.setAttribute('stroke', dataset.color);
            linePath.setAttribute('stroke-width', '3');
            linePath.setAttribute('stroke-linecap', 'round');
            
            // Animate line path
            const pathLength = 1000; 
            linePath.style.strokeDasharray = pathLength;
            linePath.style.strokeDashoffset = pathLength;
            linePath.style.animation = `draw-chart-line 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
            
            svg.appendChild(linePath);
            
            // Render hover triggers
            points.forEach((pt) => {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('cx', pt.x);
                circle.setAttribute('cy', pt.y);
                circle.setAttribute('r', '5');
                circle.setAttribute('fill', dataset.color);
                circle.setAttribute('stroke', 'var(--bg-card)');
                circle.setAttribute('stroke-width', '2');
                circle.setAttribute('opacity', '0');
                circle.style.transition = 'opacity 0.15s, r 0.15s';
                circle.style.cursor = 'pointer';
                
                // Invisible larger hit target
                const hitTarget = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                hitTarget.setAttribute('cx', pt.x);
                hitTarget.setAttribute('cy', pt.y);
                hitTarget.setAttribute('r', '15');
                hitTarget.setAttribute('fill', 'transparent');
                hitTarget.style.cursor = 'pointer';
                
                hitTarget.addEventListener('mouseenter', (e) => {
                    circle.setAttribute('opacity', '1');
                    circle.setAttribute('r', '7');
                    
                    const rect = container.getBoundingClientRect();
                    tooltip.style.opacity = '1';
                    tooltip.style.left = `${pt.x}px`;
                    tooltip.style.top = `${pt.y}px`;
                    tooltip.style.borderColor = dataset.color;
                    tooltip.innerHTML = `
                        <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${dataset.label}</div>
                        <div style="display: flex; justify-content: space-between; gap: 8px; color: var(--text-secondary);">
                            <span>${pt.label}:</span>
                            <strong style="color: var(--text-primary); font-weight: 700;">${pt.val}</strong>
                        </div>
                    `;
                });
                
                hitTarget.addEventListener('mouseleave', () => {
                    circle.setAttribute('opacity', '0');
                    circle.setAttribute('r', '5');
                    tooltip.style.opacity = '0';
                });
                
                activeDotsGroup.appendChild(circle);
                activeDotsGroup.appendChild(hitTarget);
            });
        });
        
        svg.appendChild(activeDotsGroup);
        container.appendChild(svg);
        
        // Add dynamic CSS rule for animation if it doesn't exist
        if (!document.getElementById('chart-animation-style')) {
            const style = document.createElement('style');
            style.id = 'chart-animation-style';
            style.innerHTML = `
                @keyframes draw-chart-line {
                    to { stroke-dashoffset: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Render a premium vertical bar chart
    static renderBarChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 280;
        const padding = { top: 20, right: 20, bottom: 40, left: 40 };
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        const maxVal = Math.ceil(Math.max(...data.data, 5) * 1.15);
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'chart-svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        // Grid Lines
        const gridTicks = 4;
        for (let i = 0; i <= gridTicks; i++) {
            const y = padding.top + (chartHeight * (1 - i / gridTicks));
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', padding.left);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width - padding.right);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', 'var(--border-color)');
            line.setAttribute('stroke-width', '1');
            svg.appendChild(line);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', padding.left - 10);
            text.setAttribute('y', y + 4);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('fill', 'var(--text-muted)');
            text.setAttribute('font-size', '10px');
            text.textContent = Math.round(maxVal * (i / gridTicks));
            svg.appendChild(text);
        }
        
        // Bars
        const barCount = data.data.length;
        const barSpacing = 16;
        const totalSpacing = barSpacing * (barCount + 1);
        const barWidth = (chartWidth - totalSpacing) / barCount;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        container.appendChild(tooltip);
        
        data.data.forEach((val, idx) => {
            const barHeight = chartHeight * (val / maxVal);
            const x = padding.left + barSpacing + (idx * (barWidth + barSpacing));
            const y = padding.top + chartHeight - barHeight;
            
            // Bar Rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('rx', '4');
            rect.setAttribute('ry', '4');
            rect.setAttribute('fill', data.color || 'var(--primary)');
            rect.style.transition = 'fill var(--transition-fast), transform var(--transition-fast)';
            rect.style.cursor = 'pointer';
            rect.style.transformOrigin = `${x + barWidth / 2}px ${padding.top + chartHeight}px`;
            
            // Initial animation scale
            rect.animate([
                { transform: 'scaleY(0)' },
                { transform: 'scaleY(1)' }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                fill: 'forwards'
            });
            
            rect.addEventListener('mouseenter', () => {
                rect.setAttribute('fill', data.hoverColor || 'var(--secondary)');
                
                tooltip.style.opacity = '1';
                tooltip.style.left = `${x + barWidth/2}px`;
                tooltip.style.top = `${y}px`;
                tooltip.style.borderColor = data.color || 'var(--primary)';
                tooltip.innerHTML = `
                    <div style="font-weight: 600; color: var(--text-primary);">${data.labels[idx]}</div>
                    <div style="color: var(--text-secondary); font-size: 11px;">Volume: <strong style="color: var(--text-primary); font-weight: 700;">${val}</strong></div>
                `;
            });
            
            rect.addEventListener('mouseleave', () => {
                rect.setAttribute('fill', data.color || 'var(--primary)');
                tooltip.style.opacity = '0';
            });
            
            svg.appendChild(rect);
            
            // X Axis Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + barWidth / 2);
            text.setAttribute('y', height - padding.bottom + 22);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--text-muted)');
            text.setAttribute('font-size', '10px');
            text.setAttribute('font-weight', '500');
            
            // Truncate text if it's too long
            let labelText = data.labels[idx];
            if (labelText.length > 8) labelText = labelText.substring(0, 7) + '..';
            text.textContent = labelText;
            
            svg.appendChild(text);
        });
        
        container.appendChild(svg);
    }
}

// Initialise Dashboard Analytics Data and render them
export function initDashboardCharts() {
    // Main Activity Line Chart
    const dashboardActivityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Images Generated',
                data: [12, 19, 15, 28, 22, 35, 25],
                color: '#6C63FF'
            },
            {
                label: 'Posts Generated',
                data: [8, 14, 18, 12, 29, 21, 30],
                color: '#00C9A7'
            }
        ]
    };
    
    SvgChartEngine.renderLineChart('dashboard-activity-chart', dashboardActivityData);
}

export function initAnalyticsCharts() {
    // 1. Generation trends (monthly)
    const trendsData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Images',
                data: [110, 145, 130, 210, 195, 280, 310],
                color: '#6C63FF'
            },
            {
                label: 'Posts',
                data: [75, 120, 140, 175, 220, 185, 245],
                color: '#9D8CFF'
            }
        ]
    };
    SvgChartEngine.renderLineChart('analytics-trends-chart', trendsData);
    
    // 2. Top Performing templates volume
    const templatesData = {
        labels: ['Cosmetics', 'Modern Tech', 'Skincare', 'Chronograph'],
        data: [142, 98, 88, 54],
        color: '#00C9A7',
        hoverColor: '#02E4BD'
    };
    SvgChartEngine.renderBarChart('analytics-templates-chart', templatesData);
}

// Global Resize listener to redraw charts and keep them responsive
window.addEventListener('resize', () => {
    // Only update if elements exist and are currently visible
    const dbChart = document.getElementById('dashboard-activity-chart');
    if (dbChart && dbChart.getBoundingClientRect().height > 0) {
        initDashboardCharts();
    }
    
    const anChart = document.getElementById('analytics-trends-chart');
    if (anChart && anChart.getBoundingClientRect().height > 0) {
        initAnalyticsCharts();
    }
});
