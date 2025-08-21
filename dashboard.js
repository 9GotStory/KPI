// KPI Dashboard JavaScript
class KPIDashboard {
  constructor() {
    this.data = null
    this.filteredData = null
    this.currentPage = 1
    this.itemsPerPage = 10
    this.sortColumn = null
    this.sortDirection = "asc"

    this.init()
  }

  async init() {
    try {
      await this.loadData()
      this.setupEventListeners()
      this.renderDashboard()
    } catch (error) {
      console.error("Error initializing dashboard:", error)
      this.showError("เกิดข้อผิดพลาดในการโหลดข้อมูล")
    } finally {
      this.hideLoading()
    }
  }

  async loadData() {
    // Mock data - replace with actual Google Apps Script API call
    this.data = {
      timestamp: "21 สิงหาคม 2568 เวลา 15:02 น.",
      configuration: [
        {
          ประเด็นขับเคลื่อน: "สุขภาพจิตและยาเสพติด",
          ตัวชี้วัดหลัก: "หญิงตั้งครรภ์คุณภาพ และการดูแลพัฒนาการเด็กปฐมวัย",
          ตัวชี้วัดย่อย: "คัดกรอง 2Q+",
          กลุ่มเป้าหมาย: "กลุ่มโรคเรื้อรัง",
          ชื่อหน่วยบริการ: "รพ.สต.ทุ่งน้าว",
          เป้าหมาย: 2622,
          ผลงาน: 2278,
          ร้อยละ: 86.88,
          เกณฑ์ผ่าน: 80.0,
          ข้อมูลวันที่: "20 สิงหาคม 2568 เวลา 15:02 น.",
          sheet_source: "2Q+ กลุ่มโรคเรื้อรัง",
          service_code_ref: "10001",
        },
        {
          ประเด็นขับเคลื่อน: "มะเร็งครบวงจร",
          ตัวชี้วัดหลัก: "คัดกรองมะเร็ง",
          ตัวชี้วัดย่อย: "คัดกรอง มะเร็งลำไส้ใหญ่ ลำไส้ตรง",
          กลุ่มเป้าหมาย: "ประชาชนทั่วไป",
          ชื่อหน่วยบริการ: "รพ.สต.บ้านใหม่",
          เป้าหมาย: 1131,
          ผลงาน: 70,
          ร้อยละ: 6.19,
          เกณฑ์ผ่าน: 50.0,
          ข้อมูลวันที่: "20 สิงหาคม 2568 เวลา 15:15 น.",
          sheet_source: "คัดกรองมะเร็ง",
          service_code_ref: "10002",
        },
        {
          ประเด็นขับเคลื่อน: "โรคเรื้อรัง",
          ตัวชี้วัดหลัก: "คัดกรองเบาหวาน",
          ตัวชี้วัดย่อย: "คัดกรองเบาหวาน 35+",
          กลุ่มเป้าหมาย: "อายุ 35 ปีขึ้นไป",
          ชื่อหน่วยบริการ: "รพ.สต.วังทอง",
          เป้าหมาย: 850,
          ผลงาน: 756,
          ร้อยละ: 88.94,
          เกณฑ์ผ่าน: 85.0,
          ข้อมูลวันที่: "21 สิงหาคม 2568 เวลา 09:30 น.",
          sheet_source: "คัดกรองเบาหวาน 35+",
          service_code_ref: "10003",
        },
        {
          ประเด็นขับเคลื่อน: "สุขภาพจิตและยาเสพติด",
          ตัวชี้วัดหลัก: "หญิงตั้งครรภ์คุณภาพ และการดูแลพัฒนาการเด็กปฐมวัย",
          ตัวชี้วัดย่อย: "คัดกรอง 2Q+ หญิงตั้งครรภ์",
          กลุ่มเป้าหมาย: "หญิงตั้งครรภ์",
          ชื่อหน่วยบริการ: "รพ.สต.ดอนไผ่",
          เป้าหมาย: 45,
          ผลงาน: 42,
          ร้อยละ: 93.33,
          เกณฑ์ผ่าน: 90.0,
          ข้อมูลวันที่: "21 สิงหาคม 2568 เวลา 11:45 น.",
          sheet_source: "2Q+ กลุ่มหญิงตั้งครรภ์",
          service_code_ref: "10004",
        },
      ],
      sourceData: {
        "2Q+ กลุ่มโรคเรื้อรัง": [
          {
            รหัสหน่วยบริการ: "10001",
            ชื่อหน่วยบริการ: "รพ.สต.ทุ่งน้าว",
            รหัสพื้นที่: "001",
            วันที่รายงาน: "2568-08-20",
            ปีงบประมาณ: "2568",
            ประชากรกลุ่มโรคเรื้อรัง: 2622,
            "อายุ 15-19 ปี คัดกรอง 2Q ปกติ": 145,
            "อายุ 15-19 ปี คัดกรอง 2Q ผิดปกติ": 12,
            "อายุ 20-59 ปี คัดกรอง 2Q ปกติ": 1456,
            "อายุ 20-59 ปี คัดกรอง 2Q ผิดปกติ": 234,
            "อายุ 60+ ปี คัดกรอง 2Q ปกติ": 398,
            "อายุ 60+ ปี คัดกรอง 2Q ผิดปกติ": 33,
          },
        ],
      },
    }

    this.filteredData = [...this.data.configuration]
  }

  setupEventListeners() {
    // Filter event listeners
    document.getElementById("groupFilter").addEventListener("change", () => this.applyFilters())
    document.getElementById("kpiFilter").addEventListener("change", () => this.applyFilters())
    document.getElementById("serviceFilter").addEventListener("change", () => this.applyFilters())
    document.getElementById("resetFilter").addEventListener("click", () => this.resetFilters())

    // Modal event listeners
    document.getElementById("closeModal").addEventListener("click", () => this.closeModal())
    document.getElementById("rawDataModal").addEventListener("click", (e) => {
      if (e.target.id === "rawDataModal") this.closeModal()
    })

    // Pagination event listeners
    document.getElementById("prevPageMobile").addEventListener("click", () => this.previousPage())
    document.getElementById("nextPageMobile").addEventListener("click", () => this.nextPage())
  }

  renderDashboard() {
    this.updateHeader()
    this.populateFilters()
    this.renderSummaryCards()
    this.renderKPIGroups()
    this.renderKPITable()
  }

  updateHeader() {
    document.getElementById("lastUpdate").textContent = this.data.timestamp
    document.getElementById("totalKPIs").textContent = this.data.configuration.length
  }

  populateFilters() {
    const groups = [...new Set(this.data.configuration.map((item) => item["ประเด็นขับเคลื่อน"]))]
    const kpis = [...new Set(this.data.configuration.map((item) => item["ตัวชี้วัดหลัก"]))]
    const services = [...new Set(this.data.configuration.map((item) => item["ชื่อหน่วยบริการ"]))]

    this.populateSelect("groupFilter", groups)
    this.populateSelect("kpiFilter", kpis)
    this.populateSelect("serviceFilter", services)
  }

  populateSelect(selectId, options) {
    const select = document.getElementById(selectId)
    const currentValue = select.value

    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild)
    }

    options.forEach((option) => {
      const optionElement = document.createElement("option")
      optionElement.value = option
      optionElement.textContent = option
      select.appendChild(optionElement)
    })

    select.value = currentValue
  }

  renderSummaryCards() {
    const container = document.getElementById("summaryCards")
    const totalKPIs = this.filteredData.length
    const passedKPIs = this.filteredData.filter((item) => item["ร้อยละ"] >= item["เกณฑ์ผ่าน"]).length
    const avgPercentage = this.filteredData.reduce((sum, item) => sum + item["ร้อยละ"], 0) / totalKPIs
    const totalTarget = this.filteredData.reduce((sum, item) => sum + item["เป้าหมาย"], 0)

    const cards = [
      {
        title: "ตัวชี้วัดทั้งหมด",
        value: totalKPIs,
        icon: "fas fa-chart-bar",
        color: "blue",
      },
      {
        title: "ผ่านเกณฑ์",
        value: passedKPIs,
        icon: "fas fa-check-circle",
        color: "green",
      },
      {
        title: "ร้อยละเฉลี่ย",
        value: `${avgPercentage.toFixed(2)}%`,
        icon: "fas fa-percentage",
        color: "purple",
      },
      {
        title: "เป้าหมายรวม",
        value: totalTarget.toLocaleString(),
        icon: "fas fa-target",
        color: "orange",
      },
    ]

    container.innerHTML = cards
      .map(
        (card) => `
            <div class="bg-white rounded-lg shadow-sm p-6 card-hover">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="bg-${card.color}-100 p-3 rounded-lg">
                            <i class="${card.icon} text-${card.color}-600 text-xl"></i>
                        </div>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-gray-500">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${card.value}</p>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  renderKPIGroups() {
    const container = document.getElementById("kpiGroups")
    const groups = this.groupBy(this.filteredData, "ประเด็นขับเคลื่อน")

    container.innerHTML = Object.entries(groups)
      .map(([groupName, items]) => {
        const avgPercentage = items.reduce((sum, item) => sum + item["ร้อยละ"], 0) / items.length
        const passedCount = items.filter((item) => item["ร้อยละ"] >= item["เกณฑ์ผ่าน"]).length
        const statusColor = avgPercentage >= 80 ? "green" : avgPercentage >= 60 ? "yellow" : "red"
        const icon = this.getGroupIcon(groupName)

        return `
                <div class="bg-white rounded-lg shadow-sm p-6 card-hover">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-3">
                            <div class="bg-${statusColor}-100 p-2 rounded-lg">
                                <i class="${icon} text-${statusColor}-600"></i>
                            </div>
                            <h3 class="text-lg font-semibold text-gray-900">${groupName}</h3>
                        </div>
                        <span class="text-sm text-gray-500">${items.length} ตัวชี้วัด</span>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-sm text-gray-600">ร้อยละเฉลี่ย</span>
                            <span class="text-lg font-bold text-${statusColor}-600">${avgPercentage.toFixed(2)}%</span>
                        </div>
                        
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-${statusColor}-600 h-2 rounded-full progress-bar" style="width: ${Math.min(avgPercentage, 100)}%"></div>
                        </div>
                        
                        <div class="flex justify-between text-sm">
                            <span class="text-green-600">ผ่าน: ${passedCount}</span>
                            <span class="text-red-600">ไม่ผ่าน: ${items.length - passedCount}</span>
                        </div>
                    </div>
                </div>
            `
      })
      .join("")
  }

  renderKPITable() {
    const tbody = document.getElementById("kpiTableBody")
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const pageData = this.filteredData.slice(startIndex, endIndex)

    tbody.innerHTML = pageData
      .map((item) => {
        const statusColor = item["ร้อยละ"] >= item["เกณฑ์ผ่าน"] ? "green" : "red"
        const statusText = item["ร้อยละ"] >= item["เกณฑ์ผ่าน"] ? "ผ่าน" : "ไม่ผ่าน"
        const statusIcon = item["ร้อยละ"] >= item["เกณฑ์ผ่าน"] ? "fa-check-circle" : "fa-times-circle"

        return `
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item["ตัวชี้วัดย่อย"]}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item["ชื่อหน่วยบริการ"]}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item["เป้าหมาย"].toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item["ผลงาน"].toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div class="bg-${statusColor}-600 h-2 rounded-full progress-bar" style="width: ${Math.min(item["ร้อยละ"], 100)}%"></div>
                            </div>
                            <span class="text-sm font-medium text-gray-900">${item["ร้อยละ"].toFixed(2)}%</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800">
                            <i class="fas ${statusIcon} mr-1"></i>
                            ${statusText}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item["ข้อมูลวันที่"]}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="dashboard.showRawData('${item.sheet_source}', '${item.service_code_ref}')" 
                                class="text-blue-600 hover:text-blue-900">
                            <i class="fas fa-eye mr-1"></i>ดูข้อมูลดิบ
                        </button>
                    </td>
                </tr>
            `
      })
      .join("")

    this.updatePagination()
  }

  updatePagination() {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage)
    const startIndex = (this.currentPage - 1) * this.itemsPerPage
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredData.length)

    document.getElementById("showingFrom").textContent = startIndex + 1
    document.getElementById("showingTo").textContent = endIndex
    document.getElementById("totalItems").textContent = this.filteredData.length

    // Update pagination buttons
    const pagination = document.getElementById("pagination")
    pagination.innerHTML = ""

    // Previous button
    const prevButton = document.createElement("button")
    prevButton.className = `relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${this.currentPage === 1 ? "cursor-not-allowed opacity-50" : ""}`
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>'
    prevButton.disabled = this.currentPage === 1
    prevButton.onclick = () => this.previousPage()
    pagination.appendChild(prevButton)

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
        const pageButton = document.createElement("button")
        pageButton.className = `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
          i === this.currentPage
            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
        }`
        pageButton.textContent = i
        pageButton.onclick = () => this.goToPage(i)
        pagination.appendChild(pageButton)
      } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
        const ellipsis = document.createElement("span")
        ellipsis.className =
          "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
        ellipsis.textContent = "..."
        pagination.appendChild(ellipsis)
      }
    }

    // Next button
    const nextButton = document.createElement("button")
    nextButton.className = `relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${this.currentPage === totalPages ? "cursor-not-allowed opacity-50" : ""}`
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>'
    nextButton.disabled = this.currentPage === totalPages
    nextButton.onclick = () => this.nextPage()
    pagination.appendChild(nextButton)
  }

  applyFilters() {
    const groupFilter = document.getElementById("groupFilter").value
    const kpiFilter = document.getElementById("kpiFilter").value
    const serviceFilter = document.getElementById("serviceFilter").value

    this.filteredData = this.data.configuration.filter((item) => {
      return (
        (!groupFilter || item["ประเด็นขับเคลื่อน"] === groupFilter) &&
        (!kpiFilter || item["ตัวชี้วัดหลัก"] === kpiFilter) &&
        (!serviceFilter || item["ชื่อหน่วยบริการ"] === serviceFilter)
      )
    })

    this.currentPage = 1
    this.renderSummaryCards()
    this.renderKPIGroups()
    this.renderKPITable()
  }

  resetFilters() {
    document.getElementById("groupFilter").value = ""
    document.getElementById("kpiFilter").value = ""
    document.getElementById("serviceFilter").value = ""
    this.applyFilters()
  }

  sortTable(column) {
    const columnMap = {
      indicator: "ตัวชี้วัดย่อย",
      service: "ชื่อหน่วยบริการ",
      target: "เป้าหมาย",
      result: "ผลงาน",
      percentage: "ร้อยละ",
    }

    const sortKey = columnMap[column]
    if (this.sortColumn === sortKey) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortColumn = sortKey
      this.sortDirection = "asc"
    }

    this.filteredData.sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]

      if (typeof aVal === "number" && typeof bVal === "number") {
        return this.sortDirection === "asc" ? aVal - bVal : bVal - aVal
      } else {
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
        if (this.sortDirection === "asc") {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
      }
    })

    this.renderKPITable()
  }

  showRawData(sheetSource, serviceCode) {
    const sourceData = this.data.sourceData[sheetSource]
    if (!sourceData || sourceData.length === 0) {
      alert("ไม่พบข้อมูลดิบสำหรับรายการนี้")
      return
    }

    const relevantData = sourceData.filter((item) => item["รหัสหน่วยบริการ"] === serviceCode)

    document.getElementById("modalTitle").textContent = `ข้อมูลดิบ: ${sheetSource}`

    const headers = Object.keys(relevantData[0] || {})
    const modalTableHead = document.getElementById("modalTableHead")
    modalTableHead.innerHTML = `
            <tr>
                ${headers.map((header) => `<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${header}</th>`).join("")}
            </tr>
        `

    const modalTableBody = document.getElementById("modalTableBody")
    modalTableBody.innerHTML = relevantData
      .map(
        (row) => `
            <tr>
                ${headers.map((header) => `<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${row[header] || "-"}</td>`).join("")}
            </tr>
        `,
      )
      .join("")

    document.getElementById("rawDataModal").classList.remove("hidden")
  }

  closeModal() {
    document.getElementById("rawDataModal").classList.add("hidden")
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.renderKPITable()
    }
  }

  nextPage() {
    const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage)
    if (this.currentPage < totalPages) {
      this.currentPage++
      this.renderKPITable()
    }
  }

  goToPage(page) {
    this.currentPage = page
    this.renderKPITable()
  }

  hideLoading() {
    document.getElementById("loadingOverlay").classList.add("hidden")
  }

  showError(message) {
    alert(message) // Replace with better error handling
  }

  groupBy(array, key) {
    return array.reduce((result, currentValue) => {
      ;(result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue)
      return result
    }, {})
  }

  getGroupIcon(groupName) {
    const iconMap = {
      สุขภาพจิตและยาเสพติด: "fas fa-brain",
      มะเร็งครบวงจร: "fas fa-ribbon",
      โรคเรื้อรัง: "fas fa-heartbeat",
      default: "fas fa-chart-line",
    }
    return iconMap[groupName] || iconMap["default"]
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new KPIDashboard()
})
