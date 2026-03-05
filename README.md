![JMeter](https://img.shields.io/badge/Apache_JMeter-5.6-red?style=flat-square&logo=apache)
![Test Type](https://img.shields.io/badge/Test_Type-Load_·_Endurance_·_Spike-orange?style=flat-square)
![Samplers](https://img.shields.io/badge/Total_Samplers-18%2C836-blue?style=flat-square)
![API](https://img.shields.io/badge/Target_API-The_Cat_API-ff69b4?style=flat-square)
![Non-GUI](https://img.shields.io/badge/Execution-Non--GUI_CMD-black?style=flat-square)
# ⚡ The Cat API — Performance Testing with Apache JMeter

Performance testing project evaluating the stability and load capacity of [The Cat API](https://api.thecatapi.com/v1) across three test scenarios using Apache JMeter in Non-GUI mode.

<img width="1343" height="661" alt="image" src="https://github.com/user-attachments/assets/a0941dc4-4c55-470e-9b21-44355c484cac" />

---

<img width="1327" height="663" alt="image" src="https://github.com/user-attachments/assets/4b374173-fc08-4e30-9e77-9aefeec66855" />

---

<img width="1335" height="655" alt="image" src="https://github.com/user-attachments/assets/bacbdc16-dee7-4df1-9004-57daf2ecd488" />

---

## 📋 Project Overview

| Item | Detail |
|---|---|
| **Target API** | https://api.thecatapi.com/v1 |
| **Tool** | Apache JMeter (Non-GUI mode via CMD) |
| **Test Period** | October 26 – October 31, 2025 |
| **Test Types** | Load Test · Endurance Test · Spike Test |
| **Total Samplers** | 18,836 across all 3 scenarios |

---

## 🧪 Test Scenarios

### 🔵 Load Test
Simulates normal to peak traffic to evaluate API performance under expected load conditions.
![Load Test - Config - Thread Group](https://github.com/user-attachments/assets/5f6625ce-87d3-4490-ba0a-da14edd99b22)

### 🟢 Endurance Test
Runs sustained traffic over an extended period to detect memory leaks, degradation, or slowdowns over time.
![Endurance Test - Config - Thread Group](https://github.com/user-attachments/assets/803af355-04b5-46b9-b646-068b52077b33)

### 🔴 Spike Test
Sends sudden bursts of high traffic to evaluate how the API handles unexpected load spikes.
![Spike Test - Config - Ultimate Thread Group](https://github.com/user-attachments/assets/de57e50a-fe21-47f6-ab47-ff972a562776)

---

## 🔄 Test Flow & API Endpoints

The project covers 4 API endpoints grouped into 2 Transaction Controllers:

```
Transaction Controller 1 — Add Image Favorite
    ├── GET  /images/search        → Retrieve image list, extract {image_id}
    └── POST /favourites           → Add image to favorites, extract {favourite_id}

Transaction Controller 2 — Delete Image Favorite
    ├── GET  /favourites/{id}      → Retrieve favorited image info
    └── DELETE /favourites/{id}   → Remove image from favorites
```

---

## 🛠️ JMeter Techniques Applied

| Technique | Purpose |
|---|---|
| **User Defined Variables** | Centralize config (protocol, base_url) for easy maintenance |
| **JSON Extractor** | Extract dynamic values: `image_id`, `favourite_id` for correlation |
| **CSV Data Set Config** | Parameterize search queries from `Search_image_parameters.csv` |
| **Constant Throughput Timer** | Limit requests to ≤120 req/min (free plan constraint) |
| **Transaction Controllers** | Group related requests for end-to-end latency measurement |
| **Custom Thread Group** | Required plugin for Spike Test ramp-up/ramp-down patterns |
| **Non-GUI Execution** | Run via CMD for accurate results without UI overhead |

---

## 📊 Results Summary

| Test Type | Samples | Error % | Avg Response (ms) | 95th Percentile (ms) | Throughput (req/s) |
|---|:---:|:---:|:---:|:---:|:---:|
| **Load Test** | 3,634 | 51.9% | ~567 | ~1,181 | ~2.0 |
| **Endurance Test** | 14,436 | 51.8% | ~544 | ~1,159 | ~2.0 |
| **Spike Test** | 766 | 52.3% | ~719 | ~1,788 | ~2.1 |

### Breakdown by Endpoint

| Endpoint | Load Error % | Endurance Error % | Spike Error % |
|---|:---:|:---:|:---:|
| GET /images/search | **1.2%** ✅ | **0.7%** ✅ | **3.0%** ✅ |
| POST /favourites | 68.5% ❌ | 68.7% ❌ | 70.4% ❌ |
| GET /favourites/{id} | 68.9% ❌ | 69.0% ❌ | 71.3% ❌ |
| DELETE /favourites/{id} | 69.0% ❌ | 68.9% ❌ | 70.7% ❌ |
| **TC1: Add Favorite** | 98.9% ❌ | 99.7% ❌ | 74.3% ❌ |
| **TC2: Delete Favorite** | 99.7% ❌ | 99.9% ❌ | 72.8% ❌ |

---

## 🔍 Analysis & Observations

**✅ Stable endpoint:**
- `GET /images/search` performed reliably across all 3 test types with error rates below 3% and average response time under 870ms.

**❌ Unstable endpoints:**
- All write operations (POST, GET by ID, DELETE) showed 68–99% error rates with average latency reaching up to ~20 seconds on transaction level.
- High latency on Transaction Controllers (avg ~19,000–20,000ms) indicates server-side bottlenecks or rate limiting on write operations under the free plan.

**Root cause assessment:**
- The Cat API free plan enforces strict rate limits on write endpoints. The observed errors are consistent with HTTP 429 (Too Many Requests) or server-side throttling — not a framework issue.
- `GET /images/search` (read-only) is not subject to the same restrictions, explaining its low error rate.

---

## 🏁 Conclusion

The Cat API handles **read requests reliably** under sustained and spike load. However, **write endpoints (favorites CRUD)** show significant instability under any load beyond minimal traffic — consistent with free-tier API limitations rather than inherent system failure.

**Recommendation:** Production-grade testing of write endpoints would require a paid API plan with higher rate limits to obtain meaningful performance baselines.

---

## 📁 Project Structure

```
📦 The-Cat-API-JMeter-Performance-Test
├── 📂 CSV data sets/
│   └── Search_image_parameters.csv     # Parameterized search data
├── 📂 HtmlReport/
│   ├── Load Test/                      # HTML report - Load Test
│   ├── Endurance Test/                 # HTML report - Endurance Test
│   └── Spike Test/                     # HTML report - Spike Test
├── 📂 Results/
│   ├── Loadtest_result.jtl             # Raw JMeter results - Load Test
│   ├── EnduranceTest_result.jtl        # Raw JMeter results - Endurance Test
│   └── Spiketest_result.jtl            # Raw JMeter results - Spike Test
├── 📂 Screenshots/
│   ├── Thread Group Config/            # Thread group configurations
│   ├── Request API/                    # API request screenshots
│   └── ...                            # Other config screenshots
├── LoadTest_CRUD_TheCatAPI.jmx         # JMeter script - Load Test
├── EnduranceTest_CRUD_TheCatAPI.jmx    # JMeter script - Endurance Test
├── SpikeTest_CRUD_TheCatAPI.jmx        # JMeter script - Spike Test
├── Test Flow.xlsx                      # Full test flow documentation
├── cmd-run-load test.jpg               # CMD execution screenshot
├── cmd-run-endurance test.jpg          # CMD execution screenshot
└── cmd-run-spike test.jpg              # CMD execution screenshot
```

---

## ⚙️ How to Run

### Prerequisites
- Apache JMeter installed
- **Custom Thread Group** plugin installed (JMeter Plugin Manager → install `Custom Thread Group`)
- Valid API key from [thecatapi.com](https://thecatapi.com)

### Update API Key
Open any `.jmx` file → find **User Defined Variables** → update `api_key` value.

### Run via Non-GUI mode (recommended)

```bash
# Load Test
jmeter -n -t LoadTest_CRUD_TheCatAPI.jmx -l Results/Loadtest_result.jtl -e -o HtmlReport/Load\ Test/

# Endurance Test
jmeter -n -t EnduranceTest_CRUD_TheCatAPI.jmx -l Results/EnduranceTest_result.jtl -e -o HtmlReport/Endurance\ Test/

# Spike Test
jmeter -n -t SpikeTest_CRUD_TheCatAPI.jmx -l Results/Spiketest_result.jtl -e -o HtmlReport/Spike\ Test/
```

---

## 📌 Notes

- Testing conducted under the **free plan** of The Cat API — maximum throughput limited to **≤120 requests/minute**.
- Spike Test requires the **Custom Thread Group** plugin to configure ramp-up/ramp-down patterns properly.
- All tests executed in **Non-GUI mode** for accurate, unbiased results.

---

*By Phan Hoàng Đỉnh | Performance Testing Portfolio*
