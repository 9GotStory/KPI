/**
 * KPI Dashboard Backend API - Google Apps Script
 * ระบบ API สำหรับจัดการข้อมูล KPI จาก Google Sheets
 */

// Configuration Constants
const CONFIG = {
  SPREADSHEET_ID: '1H9WCgtUHD_y63jWD_YVUl5sZdjiDto11KwjUUg7kj14', // Replace with your Google Sheets ID
  MASTER_SHEET: 'Data',
  KPI_INFO_SHEET: 'KPI_Info',
  CACHE_DURATION: 300, // 5 minutes in seconds
  API_VERSION: '1.0.0'
};

/**
 * Main API Endpoint Handler
 * รับ request และส่งต่อไปยัง function ที่เหมาะสม
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'getAllKPIData';
    const param = e.parameter.param || null;
    
    let result;
    
    switch (action) {
      case 'getKPIConfiguration':
        result = getKPIConfiguration();
        break;
      case 'getSourceSheetData':
        result = getSourceSheetData(param);
        break;
      case 'getAllKPIData':
        result = getAllKPIData();
        break;
      case 'getKPIByGroup':
        result = getKPIByGroup(param);
        break;
      case 'getKPIInfoByGroup':
        result = getKPIInfoByGroup(param);
        break;
      default:
        throw new Error('Invalid API action: ' + action);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        timestamp: new Date().toISOString(),
        version: CONFIG.API_VERSION,
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('API Error: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        message: error.toString(),
        data: null
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * อ่านข้อมูล configuration จาก Sheet[Data]
 * @return {Array} ข้อมูล configuration ทั้งหมด
 */
function getKPIConfiguration() {
  const cacheKey = 'kpi_configuration';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.MASTER_SHEET);
    if (!sheet) {
      throw new Error('ไม่พบ Sheet: ' + CONFIG.MASTER_SHEET);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      throw new Error('ไม่พบข้อมูลใน Sheet: ' + CONFIG.MASTER_SHEET);
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const configuration = rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    });
    
    setCachedData(cacheKey, configuration);
    return configuration;
    
  } catch (error) {
    Logger.log('Error in getKPIConfiguration: ' + error.toString());
    throw error;
  }
}

/**
 * ดึงข้อมูลจาก source sheet ที่ระบุ
 * @param {string} sheetName ชื่อ sheet ที่ต้องการดึงข้อมูล
 * @return {Array} ข้อมูลจาก sheet ที่ระบุ
 */
function getSourceSheetData(sheetName) {
  if (!sheetName) {
    throw new Error('กรุณาระบุชื่อ sheet');
  }
  
  const cacheKey = 'source_data_' + sheetName;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('ไม่พบ Sheet: ' + sheetName);
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) {
      return [];
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const sourceData = rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    });
    
    setCachedData(cacheKey, sourceData);
    return sourceData;
    
  } catch (error) {
    Logger.log('Error in getSourceSheetData for ' + sheetName + ': ' + error.toString());
    throw error;
  }
}

/**
 * ดึงข้อมูล KPI ทั้งหมดพร้อม source data
 * @return {Object} ข้อมูล KPI ครบชุด
 */
function getAllKPIData() {
  const cacheKey = 'all_kpi_data';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;
  
  try {
    // ดึง configuration หลัก
    const configuration = getKPIConfiguration();
    
    // หา unique source sheets
    const uniqueSheets = [...new Set(
      configuration
        .map(item => item.sheet_source)
        .filter(sheet => sheet && sheet.trim() !== '')
    )];
    
    // ดึงข้อมูลจากทุก source sheets
    const sourceData = {};
    for (const sheetName of uniqueSheets) {
      try {
        sourceData[sheetName] = getSourceSheetData(sheetName);
      } catch (error) {
        Logger.log('Warning: Could not load sheet ' + sheetName + ': ' + error.toString());
        sourceData[sheetName] = [];
      }
    }
    
    // จัดกลุ่มตาม "ประเด็นขับเคลื่อน"
    const groups = [...new Set(
      configuration
        .map(item => item['ประเด็นขับเคลื่อน'])
        .filter(group => group && group.trim() !== '')
    )];
    
    // คำนวณ summary statistics
    const summary = calculateSummaryStats(configuration);
    
    const result = {
      configuration,
      sourceData,
      groups,
      summary,
      metadata: {
        totalKPIs: configuration.length,
        totalSheets: uniqueSheets.length,
        lastUpdate: new Date().toLocaleString('th-TH', {
          timeZone: 'Asia/Bangkok',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    };
    
    setCachedData(cacheKey, result);
    return result;
    
  } catch (error) {
    Logger.log('Error in getAllKPIData: ' + error.toString());
    throw error;
  }
}

/**
 * ดึงข้อมูล KPI ตามกลุ่มที่ระบุ
 * @param {string} groupName ชื่อประเด็นขับเคลื่อน
 * @return {Object} ข้อมูล KPI ของกลุ่มที่ระบุ
 */
function getKPIByGroup(groupName) {
  if (!groupName) {
    throw new Error('กรุณาระบุชื่อกลุ่ม');
  }
  
  try {
    const allData = getAllKPIData();
    
    const filteredConfiguration = allData.configuration.filter(
      item => item['ประเด็นขับเคลื่อน'] === groupName
    );
    
    if (filteredConfiguration.length === 0) {
      return {
        configuration: [],
        sourceData: {},
        groups: [groupName],
        summary: {
          totalKPIs: 0,
          averagePercentage: 0,
          passedKPIs: 0,
          failedKPIs: 0
        }
      };
    }
    
    // หา relevant source sheets
    const relevantSheets = [...new Set(
      filteredConfiguration
        .map(item => item.sheet_source)
        .filter(sheet => sheet && sheet.trim() !== '')
    )];
    
    const relevantSourceData = {};
    relevantSheets.forEach(sheet => {
      relevantSourceData[sheet] = allData.sourceData[sheet] || [];
    });
    
    const summary = calculateSummaryStats(filteredConfiguration);
    
    return {
      configuration: filteredConfiguration,
      sourceData: relevantSourceData,
      groups: [groupName],
      summary
    };
    
  } catch (error) {
    Logger.log('Error in getKPIByGroup: ' + error.toString());
    throw error;
  }
}

/**
 * ดึงข้อมูล KPI_Info ตามประเด็นขับเคลื่อน
 * @param {string} groupName ชื่อประเด็นขับเคลื่อน
 * @return {Array} ข้อมูล KPI_Info ที่ตรงกับกลุ่ม
 */
function getKPIInfoByGroup(groupName) {
  if (!groupName) {
    throw new Error('กรุณาระบุชื่อประเด็นขับเคลื่อน');
  }

  const cacheKey = 'kpi_info_' + groupName;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.KPI_INFO_SHEET);
    if (!sheet) {
      throw new Error('ไม่พบ Sheet: ' + CONFIG.KPI_INFO_SHEET);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return {};
    }

    const headers = data[0];
    const rows = data.slice(1);

    const info = rows
      .map(row => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index] || '';
        });
        return record;
      })
      .filter(item => item['ประเด็นขับเคลื่อน'] === groupName);

    // จัดกลุ่มข้อมูลตามตัวชี้วัดหลัก > ตัวชี้วัดย่อย > กลุ่มเป้าหมาย
    // รองรับกรณีที่ตัวชี้วัดย่อยเดียวกันมีหลายแถวข้อมูล
    const grouped = {};
    info.forEach(item => {
      const main = item['ตัวชี้วัดหลัก'] || '-';
      const sub = item['ตัวชี้วัดย่อย'] || '-';
      const target = item['กลุ่มเป้าหมาย'] || '-';

      if (!grouped[main]) grouped[main] = {};
      if (!grouped[main][sub]) grouped[main][sub] = {};
      if (!grouped[main][sub][target]) grouped[main][sub][target] = [];
      grouped[main][sub][target].push(item);
    });

    setCachedData(cacheKey, grouped);
    return grouped;

  } catch (error) {
    Logger.log('Error in getKPIInfoByGroup: ' + error.toString());
    throw error;
  }
}

/**
 * คำนวณ summary statistics
 * @param {Array} configuration ข้อมูล configuration
 * @return {Object} สถิติสรุป
 */
function calculateSummaryStats(configuration) {
  if (!configuration || configuration.length === 0) {
    return {
      totalKPIs: 0,
      averagePercentage: 0,
      passedKPIs: 0,
      failedKPIs: 0,
      groupStats: {}
    };
  }
  
  const stats = {
    totalKPIs: configuration.length,
    averagePercentage: 0,
    passedKPIs: 0,
    failedKPIs: 0,
    groupStats: {}
  };
  
  let totalPercentage = 0;
  
  // คำนวณสถิติรวม
  configuration.forEach(item => {
    const percentage = parseFloat(item['ร้อยละ (%)']) || 0;
    const threshold = parseFloat(item['เกณฑ์ผ่าน (%)']) || 0;
    
    totalPercentage += percentage;
    
    if (percentage >= threshold) {
      stats.passedKPIs++;
    } else {
      stats.failedKPIs++;
    }
  });
  
  stats.averagePercentage = stats.totalKPIs > 0 ? 
    Math.round((totalPercentage / stats.totalKPIs) * 100) / 100 : 0;
  
  // คำนวณสถิติตามกลุ่ม
  const groups = {};
  configuration.forEach(item => {
    const groupName = item['ประเด็นขับเคลื่อน'];
    if (!groupName) return;
    
    if (!groups[groupName]) {
      groups[groupName] = {
        count: 0,
        totalPercentage: 0,
        passed: 0,
        failed: 0
      };
    }
    
    const percentage = parseFloat(item['ร้อยละ (%)']) || 0;
    const threshold = parseFloat(item['เกณฑ์ผ่าน (%)']) || 0;
    
    groups[groupName].count++;
    groups[groupName].totalPercentage += percentage;
    
    if (percentage >= threshold) {
      groups[groupName].passed++;
    } else {
      groups[groupName].failed++;
    }
  });
  
  // คำนวณค่าเฉลี่ยของแต่ละกลุ่ม
  Object.keys(groups).forEach(groupName => {
    const group = groups[groupName];
    group.averagePercentage = group.count > 0 ? 
      Math.round((group.totalPercentage / group.count) * 100) / 100 : 0;
  });
  
  stats.groupStats = groups;
  
  return stats;
}

/**
 * ดึงข้อมูลจาก cache
 * @param {string} key cache key
 * @return {*} ข้อมูลจาก cache หรือ null
 */
function getCachedData(key) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    Logger.log('Cache get error for key ' + key + ': ' + error.toString());
    return null;
  }
}

/**
 * บันทึกข้อมูลลง cache
 * @param {string} key cache key
 * @param {*} data ข้อมูลที่ต้องการ cache
 */
function setCachedData(key, data) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(data), CONFIG.CACHE_DURATION);
  } catch (error) {
    Logger.log('Cache set error for key ' + key + ': ' + error.toString());
  }
}

/**
 * ล้าง cache ทั้งหมด (ใช้สำหรับ maintenance)
 */
function clearAllCache() {
  try {
    const cache = CacheService.getScriptCache();
    cache.flushAll();
    return 'Cache cleared successfully';
  } catch (error) {
    Logger.log('Error clearing cache: ' + error.toString());
    throw error;
  }
}

/**
 * ตั้งค่า Spreadsheet ID
 * @param {string} spreadsheetId Google Sheets ID
 */
function setSpreadsheetId(spreadsheetId) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SPREADSHEET_ID', spreadsheetId);
  return 'Spreadsheet ID updated successfully';
}

/**
 * ดึง Spreadsheet ID จาก Properties
 * @return {string} Spreadsheet ID
 */
function getSpreadsheetId() {
  const properties = PropertiesService.getScriptProperties();
  const storedId = properties.getProperty('SPREADSHEET_ID');
  return storedId || CONFIG.SPREADSHEET_ID;
}

/**
 * ทดสอบ API functions
 */
function testAPI() {
  try {
    console.log('Testing spreadsheet connection...');
    const spreadsheetId = getSpreadsheetId();
    console.log('Using Spreadsheet ID:', spreadsheetId);
    
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('Spreadsheet name:', spreadsheet.getName());
    
    console.log('Testing getKPIConfiguration...');
    const config = getKPIConfiguration();
    console.log('Configuration loaded:', config.length, 'records');
    
    console.log('Testing getAllKPIData...');
    const allData = getAllKPIData();
    console.log('All data loaded:', allData.metadata);
    
    return 'API test completed successfully';
  } catch (error) {
    console.error('API test failed:', error.toString());
    throw error;
  }
}

/**
 * ดึงรายชื่อ sheets ทั้งหมดใน spreadsheet
 * @return {Array} รายชื่อ sheets
 */
function listAllSheets() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheets = spreadsheet.getSheets();
    
    return sheets.map(sheet => ({
      name: sheet.getName(),
      index: sheet.getIndex(),
      rowCount: sheet.getLastRow(),
      colCount: sheet.getLastColumn()
    }));
  } catch (error) {
    Logger.log('Error listing sheets: ' + error.toString());
    throw error;
  }
}