document.addEventListener('DOMContentLoaded', () => {
  // --- Global State ---
  let fullData = null;
  let filteredData = [];

  // --- DOM Elements ---
  const loadingOverlay = document.getElementById('loading-overlay');
  const dashboardContainer = document.getElementById('dashboard-container');
  const lastUpdatedEl = document.getElementById('last-updated');
  const totalKpiEl = document.getElementById('total-kpi');
  const filterGroupEl = document.getElementById('filter-group');
  const filterIndicatorEl = document.getElementById('filter-indicator');
  const filterServiceEl = document.getElementById('filter-service');
  const resetFilterBtn = document.getElementById('reset-filter');
  const kpiGroupCardsContainer = document.getElementById('kpi-group-cards');
  const kpiDetailTableBody = document.getElementById('kpi-detail-table');

  // Modal elements
  const modal = document.getElementById('raw-data-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalTableHead = document.getElementById('modal-table-head');
  const modalTableBody = document.getElementById('modal-table-body');

  const apiUrl =
    'https://script.google.com/macros/s/ABCDEFG12345/exec?action=getAllKPIData';

  async function fetchData() {
    showLoading(true);
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      onDataReceived(data);
    } catch (error) {
      onDataError(error);
    }
  }

  function onDataReceived(response) {
    if (response.status === 'success') {
      fullData = response.data;
      filteredData = [...fullData.configuration];
      initializeDashboard();
    } else {
      onDataError({ message: response.message });
    }
    showLoading(false);
  }

  function onDataError(error) {
    console.error('Failed to fetch data:', error);
    alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + error.message);
    showLoading(false);
  }

  // --- Initialization ---
  function initializeDashboard() {
    populateFilters();
    updateDashboard();
  }

  // --- UI Update Functions ---
  function updateDashboard() {
    renderHeader();
    renderGroupCards();
    renderDetailTable();
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingOverlay.classList.remove('hidden');
      dashboardContainer.classList.add('hidden');
    } else {
      loadingOverlay.classList.add('hidden');
      dashboardContainer.classList.remove('hidden');
    }
  }

  function renderHeader() {
    const latestDate = fullData.configuration.reduce(
      (max, p) => (p['ข้อมูลวันที่'] > max ? p['ข้อมูลวันที่'] : max),
      fullData.configuration[0]['ข้อมูลวันที่']
    );
    lastUpdatedEl.textContent = latestDate || 'N/A';
    totalKpiEl.textContent = fullData.configuration.length;
  }

  function populateFilters() {
    const groups = [
      ...new Set(
        fullData.configuration.map((item) => item['ประเด็นขับเคลื่อน'])
      ),
    ];
    const indicators = [
      ...new Set(fullData.configuration.map((item) => item['ตัวชี้วัดหลัก'])),
    ];
    const services = [
      ...new Set(fullData.configuration.map((item) => item['ชื่อหน่วยบริการ'])),
    ];

    populateSelect(filterGroupEl, groups);
    populateSelect(filterIndicatorEl, indicators);
    populateSelect(filterServiceEl, services);
  }

  function populateSelect(selectElement, options) {
    selectElement.innerHTML = '<option value="">ทั้งหมด</option>';
    options.forEach((option) => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      selectElement.appendChild(opt);
    });
  }

  function renderGroupCards() {
    kpiGroupCardsContainer.innerHTML = '';
    const groupedData = fullData.groups
      .map((groupName) => {
        const kpisInGroup = filteredData.filter(
          (kpi) => kpi['ประเด็นขับเคลื่อน'] === groupName
        );
        if (kpisInGroup.length === 0) return null;

        const totalKpis = kpisInGroup.length;
        const passedKpis = kpisInGroup.filter(
          (kpi) =>
            parseFloat(kpi['ร้อยละ (%)']) >= parseFloat(kpi['เกณฑ์ผ่าน (%)'])
        ).length;
        const avgSuccessRate =
          kpisInGroup.reduce(
            (sum, kpi) => sum + parseFloat(kpi['ร้อยละ (%)']),
            0
          ) / totalKpis;

        return { groupName, totalKpis, passedKpis, avgSuccessRate };
      })
      .filter(Boolean);

    if (groupedData.length === 0) {
      kpiGroupCardsContainer.innerHTML =
        '<p class="text-center text-gray-500 col-span-full">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>';
      return;
    }

    groupedData.forEach(
      ({ groupName, totalKpis, passedKpis, avgSuccessRate }) => {
        const card = document.createElement('div');
        card.className =
          'bg-white shadow-lg rounded-xl p-6 transform hover:scale-105 transition-transform duration-300';
        const passRate = totalKpis > 0 ? (passedKpis / totalKpis) * 100 : 0;
        const statusColor =
          passRate >= 80 ? 'green' : passRate >= 50 ? 'orange' : 'red';

        card.innerHTML = `
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-bold text-gray-700">${groupName}</h3>
                    <span class="px-3 py-1 text-sm font-semibold text-${statusColor}-800 bg-${statusColor}-200 rounded-full">${passedKpis}/${totalKpis} ผ่านเกณฑ์</span>
                </div>
                <p class="text-sm text-gray-500 mt-1">มี ${totalKpis} ตัวชี้วัดในกลุ่มนี้</p>
                <div class="mt-4">
                    <p class="text-sm font-medium text-gray-600 mb-1">ความสำเร็จเฉลี่ย</p>
                    <div class="w-full bg-gray-200 rounded-full h-4">
                        <div class="bg-blue-600 h-4 rounded-full" style="width: ${avgSuccessRate.toFixed(
                          2
                        )}%"></div>
                    </div>
                    <p class="text-right text-lg font-semibold text-blue-700 mt-1">${avgSuccessRate.toFixed(
                      2
                    )}%</p>
                </div>
            `;
        kpiGroupCardsContainer.appendChild(card);
      }
    );
  }

  function renderDetailTable() {
    kpiDetailTableBody.innerHTML = '';
    if (filteredData.length === 0) {
      kpiDetailTableBody.innerHTML =
        '<tr><td colspan="4" class="text-center py-10 text-gray-500">ไม่พบข้อมูล</td></tr>';
      return;
    }

    filteredData.forEach((kpi, index) => {
      const isPass =
        parseFloat(kpi['ร้อยละ (%)']) >= parseFloat(kpi['เกณฑ์ผ่าน (%)']);
      const percentage = parseFloat(kpi['ร้อยละ (%)']);
      const progressColor = isPass ? 'bg-green-500' : 'bg-red-500';

      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50 cursor-pointer';
      row.setAttribute('data-index', index); // Use index from filteredData

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${
                      kpi['ตัวชี้วัดย่อย']
                    }</div>
                    <div class="text-sm text-gray-500">${
                      kpi['ตัวชี้วัดหลัก']
                    }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${
                      kpi['ชื่อหน่วยบริการ']
                    }</div>
                    <div class="text-sm text-gray-500">เป้าหมาย: ${
                      kpi['กลุ่มเป้าหมาย']
                    }</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>${Number(kpi['ผลงาน']).toLocaleString()} / ${Number(
        kpi['เป้าหมาย']
      ).toLocaleString()}</div>
                    <div class="text-xs text-gray-500">เกณฑ์ผ่าน: ${parseFloat(
                      kpi['เกณฑ์ผ่าน (%)']
                    ).toFixed(2)}%</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2.5 mr-3">
                            <div class="${progressColor} h-2.5 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                        <span class="font-medium text-sm ${
                          isPass ? 'text-green-600' : 'text-red-600'
                        }">${percentage.toFixed(2)}%</span>
                    </div>
                </td>
            `;
      row.addEventListener('click', () => showRawDataModal(kpi));
      kpiDetailTableBody.appendChild(row);
    });
  }

  // --- Filtering Logic ---
  function applyFilters() {
    const groupFilter = filterGroupEl.value;
    const indicatorFilter = filterIndicatorEl.value;
    const serviceFilter = filterServiceEl.value;

    filteredData = fullData.configuration.filter((item) => {
      const groupMatch =
        !groupFilter || item['ประเด็นขับเคลื่อน'] === groupFilter;
      const indicatorMatch =
        !indicatorFilter || item['ตัวชี้วัดหลัก'] === indicatorFilter;
      const serviceMatch =
        !serviceFilter || item['ชื่อหน่วยบริการ'] === serviceFilter;
      return groupMatch && indicatorMatch && serviceMatch;
    });
    updateDashboard();
  }

  // --- Modal Logic ---
  function showRawDataModal(kpiItem) {
    modalTitle.textContent = `${kpiItem['ตัวชี้วัดย่อย']} (${kpiItem['ชื่อหน่วยบริการ']})`;
    const sourceSheetName = kpiItem['sheet_source'];
    const serviceCode = kpiItem['service_code_ref'];

    const rawData = fullData.sourceData[sourceSheetName]?.filter(
      (row) => row['รหัสหน่วยบริการ'] == serviceCode
    );

    modalTableHead.innerHTML = '';
    modalTableBody.innerHTML = '';

    if (rawData && rawData.length > 0) {
      const headers = Object.keys(rawData[0]);

      const headerRow = document.createElement('tr');
      headers.forEach((header) => {
        const th = document.createElement('th');
        th.className =
          'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
        th.textContent = header;
        headerRow.appendChild(th);
      });
      modalTableHead.appendChild(headerRow);

      rawData.forEach((rowData) => {
        const row = document.createElement('tr');
        headers.forEach((header) => {
          const td = document.createElement('td');
          td.className = 'px-4 py-2 whitespace-nowrap text-sm text-gray-700';
          td.textContent = rowData[header];
          row.appendChild(td);
        });
        modalTableBody.appendChild(row);
      });
    } else {
      modalTableBody.innerHTML =
        '<tr><td class="text-center py-4">ไม่พบข้อมูลดิบ</td></tr>';
    }

    modal.classList.remove('hidden');
  }

  function closeModal() {
    modal.classList.add('hidden');
  }

  // --- Event Listeners ---
  filterGroupEl.addEventListener('change', applyFilters);
  filterIndicatorEl.addEventListener('change', applyFilters);
  filterServiceEl.addEventListener('change', applyFilters);
  resetFilterBtn.addEventListener('click', () => {
    filterGroupEl.value = '';
    filterIndicatorEl.value = '';
    filterServiceEl.value = '';
    applyFilters();
  });
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'raw-data-modal') {
      closeModal();
    }
  });

  // --- Initial Load ---
  fetchData();
});
