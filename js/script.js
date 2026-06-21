// ==================== GLOBAL STATE ====================
        let allData = [];
        let filteredData = [];
        let chartTop10Instance = null;
        let chartDivisiInstance = null;

        // ==================== FILE HANDLING ====================
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');

        // Drag & drop events
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        });

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) processFile(file);
        }

        function processFile(file) {
    // ... validasi JSON seperti biasa ...
    
    // Simpan ke localStorage (MENIMPA, bukan nambah)
    localStorage.setItem('inventoriData', JSON.stringify(dataArray));
    localStorage.setItem('inventoriTimestamp', new Date().toISOString());
    localStorage.setItem('inventoriFileName', file.name);
    
    // Lanjut render dashboard
    allData = dataArray;
    // ... sisanya sama ...
}

// Saat halaman pertama kali dibuka, cek localStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('inventoriData');
    if (saved) {
        allData = JSON.parse(saved);
        const fileName = localStorage.getItem('inventoriFileName');
        const timestamp = localStorage.getItem('inventoriTimestamp');
        
        // Tampilkan info
        document.getElementById('fileInfo').textContent = 
            `💾 ${fileName} (${allData.length} item) • Tersimpan di browser`;
        document.getElementById('fileInfo').classList.add('show');
        document.getElementById('dataStatus').textContent = 
            `${allData.length} item • Lokal`;
        
        // Render dashboard
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
        document.getElementById('dataTimestamp').textContent = 
            `🕐 Data lokal: ${fileName} • ${new Date(timestamp).toLocaleString('id-ID')}`;
        
        populateFilterOptions();
        applyFilters();
    }
}

// Panggil saat halaman load
window.addEventListener('DOMContentLoaded', loadFromLocalStorage);
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    // Handle both array and single object
                    const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];

                    if (dataArray.length === 0) {
                        alert('⚠️ File JSON kosong, Mas Bro!');
                        return;
                    }

                    allData = dataArray;
                    fileInfo.textContent = `✅ ${file.name} (${dataArray.length} item)`;
                    fileInfo.classList.add('show');
                    document.getElementById('dataStatus').textContent =
                        `${dataArray.length} item • ${new Date().toLocaleDateString('id-ID')}`;

                    // Show dashboard, hide empty state
                    document.getElementById('emptyState').style.display = 'none';
                    document.getElementById('dashboardContent').style.display = 'block';
                    document.getElementById('dataTimestamp').textContent =
                        `🕐 Data: ${file.name} • ${new Date().toLocaleString('id-ID')}`;

                    // Populate filters dynamically
                    populateFilterOptions();
                    // Render everything
                    applyFilters();
                } catch (err) {
                    alert('❌ Gagal parse JSON! Pastikan formatnya valid.\n\nError: ' + err.message);
                    console.error(err);
                }
            };
            reader.readAsText(file);
        }

        function clearData() {
            if (confirm('Yakin mau hapus semua data, Mas Bro?')) {
                allData = [];
                filteredData = [];
                fileInfo.classList.remove('show');
                fileInfo.textContent = '';
                document.getElementById('dataStatus').textContent = 'Belum ada data';
                document.getElementById('emptyState').style.display = 'flex';
                document.getElementById('dashboardContent').style.display = 'none';
                fileInput.value = '';
                destroyCharts();
            }
        }

        // ==================== DATA PARSING ====================
        function parseNumeric(val) {
            if (val === null || val === undefined || val === '') return 0;
            if (typeof val === 'number') return val;
            // Remove commas, then parse
            const cleaned = String(val).replace(/,/g, '').trim();
            const num = parseFloat(cleaned);
            return isNaN(num) ? 0 : num;
        }

        function getProductStatus(item) {
            const onHand = parseNumeric(item.on_hand);
            const minStok = parseNumeric(item.min_stok);
            const maxStok = parseNumeric(item.max_stok);

            if (onHand === 0) return 'oos';
            if (minStok > 0 && onHand < minStok) return 'below';
            if (maxStok > 0 && onHand > maxStok) return 'over';
            return 'normal';
        }

        function getStatusBadge(status) {
            switch (status) {
                case 'oos':
                    return '<span class="badge badge-danger">🚫 Out of Stock</span>';
                case 'below':
                    return '<span class="badge badge-warning">🟡 Below Min</span>';
                case 'over':
                    return '<span class="badge badge-info">⚠️ Overstock</span>';
                case 'normal':
                    return '<span class="badge badge-success">✅ Normal</span>';
                default:
                    return '-';
            }
        }

        function formatRupiah(num) {
            return 'Rp ' + Math.round(num).toLocaleString('id-ID');
        }

        // ==================== FILTERS ====================
        function populateFilterOptions() {
            const divisiSelect = document.getElementById('filterDivisi');
            const divisiSet = new Set(allData.map(d => d.nama_div).filter(Boolean));

            // Keep default options
            divisiSelect.innerHTML = '<option value="">🏢 Semua Divisi</option>';
            divisiSet.forEach(div => {
                const option = document.createElement('option');
                option.value = div;
                option.textContent = div;
                divisiSelect.appendChild(option);
            });
        }

        function setFilter(filterType, element) {
            // Update nav active
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            element.classList.add('active');

            // Apply to filter dropdowns
            if (['FOOD', 'NON FOOD', 'FRESH'].includes(filterType)) {
                document.getElementById('filterDivisi').value = filterType;
                document.getElementById('filterStatus').value = '';
            } else if (filterType === 'critical') {
                document.getElementById('filterDivisi').value = '';
                document.getElementById('filterStatus').value = 'below';
            } else if (filterType === 'overstock') {
                document.getElementById('filterDivisi').value = '';
                document.getElementById('filterStatus').value = 'over';
            } else {
                document.getElementById('filterDivisi').value = '';
                document.getElementById('filterStatus').value = '';
            }
            document.getElementById('searchInput').value = '';
            applyFilters();
        }

        function resetFilters() {
            document.getElementById('filterDivisi').value = '';
            document.getElementById('filterStatus').value = '';
            document.getElementById('searchInput').value = '';
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            document.querySelector('.nav-item[data-filter="all"]').classList.add('active');
            applyFilters();
        }

        function applyFilters() {
            if (allData.length === 0) return;

            const filterDivisi = document.getElementById('filterDivisi').value;
            const filterStatus = document.getElementById('filterStatus').value;
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

            filteredData = allData.filter(item => {
                // Divisi filter
                if (filterDivisi && item.nama_div !== filterDivisi) return false;

                // Status filter
                if (filterStatus) {
                    const status = getProductStatus(item);
                    if (filterStatus === 'oos' && status !== 'oos') return false;
                    if (filterStatus === 'below' && !['oos', 'below'].includes(status)) return false;
                    if (filterStatus === 'over' && status !== 'over') return false;
                    if (filterStatus === 'normal' && status !== 'normal') return false;
                }

                // Search filter
                if (searchTerm) {
                    const searchFields = [
                        item.plu, item.descp, item.s_descp, item.barcode,
                        item.nama_supp, item.nama_div, item.departemen
                    ].filter(Boolean).map(f => String(f).toLowerCase());
                    if (!searchFields.some(f => f.includes(searchTerm))) return false;
                }

                return true;
            });

            updateKPIs();
            updateTable();
            updateCharts();
        }

        // ==================== KPI UPDATES ====================
        function updateKPIs() {
            const data = filteredData.length > 0 ? filteredData : allData;
            const allForCalc = allData;

            document.getElementById('totalSku').textContent = data.length;
            document.getElementById('totalStok').textContent = data.reduce((sum, d) => sum + parseNumeric(d
                .on_hand), 0).toLocaleString('id-ID');

            const totalNilai = data.reduce((sum, d) => sum + (parseNumeric(d.on_hand) * parseNumeric(d.avg_cost)),
                0);
            document.getElementById('totalNilai').textContent = formatRupiah(totalNilai);

            const criticalCount = allForCalc.filter(d => {
                const status = getProductStatus(d);
                return ['oos', 'below'].includes(status);
            }).length;
            const oosCount = allForCalc.filter(d => getProductStatus(d) === 'oos').length;
            const overCount = allForCalc.filter(d => getProductStatus(d) === 'over').length;

            document.getElementById('skuCritical').textContent = criticalCount;
            document.getElementById('skuOos').textContent = `(${oosCount} out of stock)`;
            document.getElementById('skuOver').textContent = overCount;
        }

        // ==================== TABLE ====================
        function updateTable() {
            const tbody = document.getElementById('tableBody');
            document.getElementById('tableCount').textContent = filteredData.length;

            if (filteredData.length === 0) {
                tbody.innerHTML =
                    '<tr><td colspan="11" style="text-align:center; padding:2rem; color: var(--text-secondary);">Tidak ada data yang cocok dengan filter 🔍</td></tr>';
                return;
            }

            tbody.innerHTML = filteredData.map(d => {
                const status = getProductStatus(d);
                const nilaiTotal = parseNumeric(d.on_hand) * parseNumeric(d.avg_cost);
                const onHandClass = status === 'over' ? 'highlight-overstock' : '';

                return `
                    <tr>
                        <td>${d.plu || '-'}</td>
                        <td title="${d.descp || ''}"><strong>${d.s_descp || d.descp || '-'}</strong></td>
                        <td>${d.nama_div || '-'}</td>
                        <td class="${onHandClass}"><strong>${parseNumeric(d.on_hand).toLocaleString('id-ID')}</strong></td>
                        <td>${parseNumeric(d.min_stok) || '-'}</td>
                        <td>${parseNumeric(d.max_stok) || '-'}</td>
                        <td>${getStatusBadge(status)}</td>
                        <td>${formatRupiah(parseNumeric(d.avg_cost))}</td>
                        <td><strong>${formatRupiah(nilaiTotal)}</strong></td>
                        <td>${d.last_receipt || '-'}</td>
                        <td>${d.nama_supp || '-'}</td>
                    </tr>
                `;
            }).join('');
        }

        // ==================== CHARTS ====================
        function destroyCharts() {
            if (chartTop10Instance) { chartTop10Instance.destroy();
                chartTop10Instance = null; }
            if (chartDivisiInstance) { chartDivisiInstance.destroy();
                chartDivisiInstance = null; }
        }

        function updateCharts() {
            destroyCharts();
            if (filteredData.length === 0) return;

            // Chart 1: Top 10 Nilai Inventori
            const top10 = [...filteredData]
                .map(d => ({
                    name: d.s_descp || d.descp || d.plu,
                    value: parseNumeric(d.on_hand) * parseNumeric(d.avg_cost)
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);

            const ctx1 = document.getElementById('chartTop10').getContext('2d');
            chartTop10Instance = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: top10.map(d => d.name.length > 25 ? d.name.substring(0, 25) + '...' : d.name),
                    datasets: [{
                        label: 'Nilai Inventori (Rp)',
                        data: top10.map(d => d.value),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1,
                        borderRadius: 6,
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (ctx) => formatRupiah(ctx.raw)
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#94a3b8', callback: (v) => formatRupiah(v) },
                            grid: { color: 'rgba(51,65,85,0.3)' }
                        },
                        y: {
                            ticks: { color: '#94a3b8', font: { size: 10 } },
                            grid: { display: false }
                        }
                    }
                }
            });

            // Chart 2: Komposisi Stok per Divisi
            const divisiMap = {};
            filteredData.forEach(d => {
                const div = d.nama_div || 'Unknown';
                divisiMap[div] = (divisiMap[div] || 0) + parseNumeric(d.on_hand);
            });

            const divisiLabels = Object.keys(divisiMap);
            const divisiValues = Object.values(divisiMap);
            const colors = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

            const ctx2 = document.getElementById('chartDivisi').getContext('2d');
            chartDivisiInstance = new Chart(ctx2, {
                type: 'doughnut',
                data: {
                    labels: divisiLabels,
                    datasets: [{
                        data: divisiValues,
                        backgroundColor: divisiLabels.map((_, i) => colors[i % colors.length]),
                        borderWidth: 2,
                        borderColor: '#1e293b',
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#94a3b8', padding: 15 }
                        },
                        tooltip: {
                            callbacks: {
                                label: (ctx) =>
                                    ` ${ctx.label}: ${ctx.raw.toLocaleString('id-ID')} pcs (${((ctx.raw / divisiValues.reduce((a,b) => a+b,0)) * 100).toFixed(1)}%)`
                            }
                        }
                    }
                }
            });
        }

        // ==================== EXPORT CSV ====================
        function exportCSV() {
            if (filteredData.length === 0) {
                alert('⚠️ Tidak ada data untuk di-export!');
                return;
            }

            const headers = ['PLU', 'Nama Produk', 'Divisi', 'On Hand', 'Min Stok', 'Max Stok', 'Status',
                'Avg Cost', 'Nilai Total', 'Last Receipt', 'Supplier'
            ];
            const rows = filteredData.map(d => [
                d.plu || '',
                d.s_descp || d.descp || '',
                d.nama_div || '',
                parseNumeric(d.on_hand),
                parseNumeric(d.min_stok),
                parseNumeric(d.max_stok),
                getProductStatus(d),
                Math.round(parseNumeric(d.avg_cost)),
                Math.round(parseNumeric(d.on_hand) * parseNumeric(d.avg_cost)),
                d.last_receipt || '',
                d.nama_supp || ''
            ]);

            let csvContent = '\uFEFF'; // BOM for Excel
            csvContent += headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(cell => {
                    const str = String(cell);
                    return str.includes(',') ? `"${str}"` : str;
                }).join(',') + '\n';
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inventori_export_${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        }

        // ==================== INITIAL STATE ====================
        // Dashboard is hidden until JSON is uploaded
        document.getElementById('dashboardContent').style.display = 'none';
        document.getElementById('emptyState').style.display = 'flex';

        console.log('✅ Dashboard InventoriOS siap!');
        console.log('📤 Upload file JSON melalui sidebar atau drag & drop');
        console.log('📋 Format JSON: Array of objects dengan field plu, on_hand, avg_cost, nama_div, dll.');
