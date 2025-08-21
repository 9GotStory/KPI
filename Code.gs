const CONFIG_SHEET_NAME = 'Data';

/**
 * Returns master KPI configuration from the Data sheet.
 * @returns {Object} API response containing configuration list
 */
function getKPIConfiguration() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET_NAME);
  if (!sheet) {
    return buildError('Configuration sheet not found');
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const configuration = data.map(row => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });
  return buildResponse({ configuration });
}

/**
 * Returns raw data from a given source sheet name.
 * @param {String} sheetName The name of the source sheet
 * @returns {Object} API response containing sheet data
 */
function getSourceSheetData(sheetName) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return buildError('Source sheet not found: ' + sheetName);
  }
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const rows = data.map(r => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i]));
    return obj;
  });
  return buildResponse(rows);
}

/**
 * Returns all KPI configuration and related source data.
 * @returns {Object} API response containing configuration and source data
 */
function getAllKPIData() {
  const confResp = getKPIConfiguration();
  if (confResp.status === 'error') {
    return confResp;
  }
  const configuration = confResp.data.configuration;
  const sourceData = {};
  const groups = new Set();
  configuration.forEach(item => {
    const sheetName = item['sheet_source'];
    groups.add(item['ประเด็นขับเคลื่อน']);
    if (sheetName && !sourceData[sheetName]) {
      const resp = getSourceSheetData(sheetName);
      sourceData[sheetName] = resp.data;
    }
  });
  return buildResponse({
    configuration,
    sourceData,
    groups: Array.from(groups)
  });
}

/**
 * Returns KPI data filtered by driving issue (group name).
 * @param {String} groupName The driving issue to filter by
 * @returns {Object} API response containing filtered configuration
 */
function getKPIByGroup(groupName) {
  const confResp = getKPIConfiguration();
  if (confResp.status === 'error') {
    return confResp;
  }
  const configuration = confResp.data.configuration.filter(item => item['ประเด็นขับเคลื่อน'] === groupName);
  return buildResponse({ configuration });
}

/**
 * Helper to build consistent API response.
 */
function buildResponse(data) {
  return {
    status: 'success',
    timestamp: new Date().toISOString(),
    data
  };
}

/**
 * Helper to build error responses.
 */
function buildError(message) {
  return {
    status: 'error',
    timestamp: new Date().toISOString(),
    message
  };
}
