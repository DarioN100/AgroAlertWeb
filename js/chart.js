/* ============================================
   CHART - Gráfico con estilo de monitoreo
   ============================================ */

const ChartManager = {
  instance: null,

  render(readings, warningThreshold, criticalThreshold) {
    const ctx = document.getElementById('temp-chart').getContext('2d');
    const validReadings = readings.filter(r => r.tempAire !== null);

    const labels = validReadings.map(r =>
      r.timestamp.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );

    const tempData = validReadings.map(r => r.tempAire);

    if (this.instance) {
      this.instance.data.labels = labels;
      this.instance.data.datasets[0].data = tempData;
      this.instance.data.datasets[1].data = new Array(labels.length).fill(warningThreshold);
      this.instance.data.datasets[2].data = new Array(labels.length).fill(criticalThreshold);
      this.instance.update('none');
      return;
    }

    // Gradiente sutil
    const gradient = ctx.createLinearGradient(0, 0, 0, 320);
    gradient.addColorStop(0, 'rgba(52, 211, 153, 0.15)');
    gradient.addColorStop(1, 'rgba(52, 211, 153, 0)');

    this.instance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Temperatura',
            data: tempData,
            borderColor: '#34D399',
            backgroundColor: gradient,
            borderWidth: 1.5,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#34D399',
            pointHoverBorderColor: '#0A0F0D',
            pointHoverBorderWidth: 2,
          },
          {
            label: 'Atención',
            data: new Array(labels.length).fill(warningThreshold),
            borderColor: '#F59E0B',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0,
          },
          {
            label: 'Crítico',
            data: new Array(labels.length).fill(criticalThreshold),
            borderColor: '#EF4444',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [4, 4],
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400,
          easing: 'easeOutQuart',
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              color: '#94A3B8',
              font: {
                size: 11,
                family: "'JetBrains Mono', monospace",
                weight: '500',
              },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'line',
              boxWidth: 24,
              boxHeight: 1,
            },
          },
          tooltip: {
            backgroundColor: '#11181A',
            titleColor: '#34D399',
            bodyColor: '#E6EDEF',
            borderColor: '#1F2A2E',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
            displayColors: false,
            titleFont: {
              family: "'JetBrains Mono', monospace",
              size: 11,
              weight: '600',
            },
            bodyFont: {
              family: "'JetBrains Mono', monospace",
              size: 12,
            },
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${value.toFixed(1)}°C`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#475569',
              font: {
                family: "'JetBrains Mono', monospace",
                size: 10,
              },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
            },
            grid: {
              color: 'rgba(31, 42, 46, 0.5)',
              drawBorder: false,
            },
            border: { display: false },
          },
          y: {
            ticks: {
              color: '#475569',
              font: {
                family: "'JetBrains Mono', monospace",
                size: 10,
              },
              callback: function (value) {
                return value.toFixed(0) + '°C';
              },
            },
            grid: {
              color: 'rgba(31, 42, 46, 0.5)',
              drawBorder: false,
            },
            border: { display: false },
          },
        },
      },
    });
  },

  getStats(readings) {
    const valid = readings.filter(r => r.tempAire !== null);
    if (valid.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const temps = valid.map(r => r.tempAire);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;

    return { min, max, avg };
  },
};
