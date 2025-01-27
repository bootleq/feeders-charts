import fs from 'node:fs/promises';
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";
import { format } from "date-fns";

// https://data.gov.tw/dataset/41771
const API_URL = "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=ccezNvv4oYbO";

const BUILD_DIR = 'scripts/build';
const LOCAL_FILE = path.resolve(`${BUILD_DIR}/country.json`);
const HASH_FILE = path.resolve(`${BUILD_DIR}/country_hash`);
const TIME_FILE = path.resolve(`${BUILD_DIR}/country_time`);

async function calculateHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function fetchData() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
  return response.text();
}

async function writeTimestamp() {
  const now = new Date();
  const text = format(now, "yyyyMMdd_HHmm");
  await fs.writeFile(TIME_FILE, text);
}

async function checkForUpdate(remoteData) {
  const remoteHash = await calculateHash(remoteData);

  try {
    const localHash = await fs.readFile(HASH_FILE, "utf-8");
    if (localHash === remoteHash) {
      console.log("遠端資料沒有更新");
      return false;
    }
  } catch {
    // 沒有本地 hash 可以比對，應視為需要更新
  }

  await fs.writeFile(HASH_FILE, remoteHash);
  await writeTimestamp();
  return true;
}

async function saveData(data) {
  try {
    const parsed = JSON.parse(data); // 確保 JSON 格式正確

    await fs.writeFile(LOCAL_FILE, JSON.stringify(parsed, null, 2));
    console.log(`資料已儲存於 ${LOCAL_FILE}`);
  } catch (error) {
    console.error("儲存失敗：", error.message);
    throw error;
  }
}

(async function main() {
  try {
    const remoteData = await fetchData();
    const needsUpdate = await checkForUpdate(remoteData);

    if (needsUpdate) {
      await saveData(remoteData);
    }
  } catch (error) {
    console.error("處理失敗：", error.message);
  }
})();
