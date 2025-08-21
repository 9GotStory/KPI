// Google Apps Script Backend Code
// Deploy this as a web app with execute permissions set to "Anyone"

const ContentService = google.script.content
const SpreadsheetApp = google.script.spreadsheet
const CacheService = google.script.cache
const google = {
  script: {
    content: ContentService,
    spreadsheet: SpreadsheetApp,
    cache: CacheService,
  },
}

function doGet(e) {
  const action = e.parameter.action || "getAllKPIData"
  let result

  try {
    switch (action) {
      case "getKPIConfiguration":
        result = getKPIConfiguration()
        break

      case "getSourceSheetData":
        const sheetName = e.parameter.sheetName
        result = getSourceSheetData(sheetName)
        break

      case "getAllKPIData":
        result = getAllKPIData()
        break

      case "getKPIByGroup":
        const groupName = e.parameter.groupName
        result = getKPIByGroup(groupName)
        break

      default:
        throw new Error("Invalid action parameter")
    }
  } catch (error) {
    result = {
      status: "error",
      message: error.toString(),
      timestamp: new Date().toISOString(),
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*")
}

function getKPIConfiguration() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data")
    if (!sheet) {
      throw new Error('Sheet "Data" not found')
    }

    const data = sheet.getDataRange().getValues()
    const headers = data[0]
    const rows = data.slice(1)

    const configuration = rows.map((row) => {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })

    return {
      status: "success",
      timestamp: new Date().toISOString(),
      data: configuration,
    }
  } catch (error) {
    throw new Error(`Error getting KPI configuration: ${error.toString()}`)
  }
}

function getSourceSheetData(sheetName) {
  try {
    if (!sheetName) {
      throw new Error("Sheet name parameter is required")
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }

    const data = sheet.getDataRange().getValues()
    const headers = data[0]
    const rows = data.slice(1)

    const sourceData = rows.map((row) => {
      const obj = {}
      headers.forEach((header, index) => {
        obj[header] = row[index]
      })
      return obj
    })

    return {
      status: "success",
      timestamp: new Date().toISOString(),
      sheetName: sheetName,
      data: sourceData,
    }
  } catch (error) {
    throw new Error(`Error getting source sheet data: ${error.toString()}`)
  }
}

function getAllKPIData() {
  try {
    // Get configuration from Data sheet
    const configResult = getKPIConfiguration()
    const configuration = configResult.data

    // Get unique source sheets
    const sourceSheets = [...new Set(configuration.map((item) => item.sheet_source))]

    // Get data from all source sheets
    const sourceData = {}
    sourceSheets.forEach((sheetName) => {
      if (sheetName) {
        try {
          const sheetResult = getSourceSheetData(sheetName)
          sourceData[sheetName] = sheetResult.data
        } catch (error) {
          console.error(`Error loading sheet ${sheetName}:`, error)
          sourceData[sheetName] = []
        }
      }
    })

    // Get unique groups
    const groups = [...new Set(configuration.map((item) => item["ประเด็นขับเคลื่อน"]))]

    return {
      status: "success",
      timestamp: new Date().toISOString(),
      data: {
        configuration: configuration,
        sourceData: sourceData,
        groups: groups,
      },
    }
  } catch (error) {
    throw new Error(`Error getting all KPI data: ${error.toString()}`)
  }
}

function getKPIByGroup(groupName) {
  try {
    if (!groupName) {
      throw new Error("Group name parameter is required")
    }

    const allData = getAllKPIData()
    const filteredConfiguration = allData.data.configuration.filter((item) => item["ประเด็นขับเคลื่อน"] === groupName)

    return {
      status: "success",
      timestamp: new Date().toISOString(),
      groupName: groupName,
      data: {
        configuration: filteredConfiguration,
        sourceData: allData.data.sourceData,
      },
    }
  } catch (error) {
    throw new Error(`Error getting KPI by group: ${error.toString()}`)
  }
}

// Utility function to refresh data cache (call this when data is updated)
function refreshDataCache() {
  try {
    // Clear any cached data
    const cache = CacheService.getScriptCache()
    cache.removeAll(["kpi_configuration", "all_kpi_data"])

    // Pre-load fresh data
    getAllKPIData()

    return {
      status: "success",
      message: "Data cache refreshed successfully",
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    throw new Error(`Error refreshing data cache: ${error.toString()}`)
  }
}

// Function to validate sheet structure
function validateSheetStructure() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
    const sheets = spreadsheet.getSheets()
    const sheetNames = sheets.map((sheet) => sheet.getName())

    const requiredSheets = ["Data"]
    const missingSheets = requiredSheets.filter((name) => !sheetNames.includes(name))

    if (missingSheets.length > 0) {
      throw new Error(`Missing required sheets: ${missingSheets.join(", ")}`)
    }

    // Validate Data sheet structure
    const dataSheet = spreadsheet.getSheetByName("Data")
    const headers = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getValues()[0]

    const requiredColumns = [
      "ประเด็นขับเคลื่อน",
      "ตัวชี้วัดหลัก",
      "ตัวชี้วัดย่อย",
      "กลุ่มเป้าหมาย",
      "ชื่อหน่วยบริการ",
      "เป้าหมาย",
      "ผลงาน",
      "ร้อยละ (%)",
      "เกณฑ์ผ่าน (%)",
      "ข้อมูลวันที่",
      "sheet_source",
      "service_code_ref",
    ]

    const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

    return {
      status: "success",
      message: "Sheet structure validation completed",
      timestamp: new Date().toISOString(),
      sheets: sheetNames,
      missingSheets: missingSheets,
      missingColumns: missingColumns,
      isValid: missingSheets.length === 0 && missingColumns.length === 0,
    }
  } catch (error) {
    throw new Error(`Error validating sheet structure: ${error.toString()}`)
  }
}
