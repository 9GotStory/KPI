// Google Apps Script Backend Code
// Deploy this as a web app with execute permissions set to "Anyone"

function doGet(e) {
  const action = e.parameter.action || "getAllIndicatorData"
  const callback = e.parameter.callback
  let result

  try {
    switch (action) {
      case "getIndicatorConfiguration":
        result = getIndicatorConfiguration()
        break

      case "getSourceSheetData":
        const sheetName = e.parameter.sheetName
        result = getSourceSheetData(sheetName)
        break

      case "getAllIndicatorData":
        result = getAllIndicatorData()
        break

      case "getIndicatorByGroup":
        const groupName = e.parameter.groupName
        result = getIndicatorByGroup(groupName)
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

  const output = ContentService.createTextOutput()
  const json = JSON.stringify(result)

  if (callback) {
    output.setMimeType(ContentService.MimeType.JAVASCRIPT)
    output.setContent(`${callback}(${json})`)
  } else {
    output.setMimeType(ContentService.MimeType.JSON)
    output.setContent(json)
    output
      .setHeader("Access-Control-Allow-Origin", "*")
      .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
      .setHeader("Access-Control-Allow-Headers", "Content-Type")
  }

  return output
}

function getIndicatorConfiguration() {
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
    throw new Error(`Error getting ตัวชี้วัด configuration: ${error.toString()}`)
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

function getAllIndicatorData() {
  try {
    // Get configuration from Data sheet
    const configResult = getIndicatorConfiguration()
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
    throw new Error(`Error getting all ตัวชี้วัด data: ${error.toString()}`)
  }
}

function getIndicatorByGroup(groupName) {
  try {
    if (!groupName) {
      throw new Error("Group name parameter is required")
    }

    const allData = getAllIndicatorData()
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
    throw new Error(`Error getting ตัวชี้วัด by group: ${error.toString()}`)
  }
}

// Utility function to refresh data cache (call this when data is updated)
function refreshDataCache() {
  try {
    // Clear any cached data
    const cache = CacheService.getScriptCache()
    cache.removeAll(["indicator_configuration", "all_indicator_data"])

    // Pre-load fresh data
    getAllIndicatorData()

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
