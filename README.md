🐈 The Cat API Performance Testing Project - https://api.thecatapi.com/v1

Execution Period: October 26, 2025 – October 31, 2025

Tester: Hoàng Đỉnh

Tool used: Apache JMeter (Non-GUI mode, executed via CMD)

Objective: Evaluate the performance of The Cat API through 3 testing scenarios:
 + Load Test
 + Endurance Test
 + Spike Test

---
OVERVIEW

Hello, this is my performance testing project for The Cat API. I carried out this project with the goal of evaluating 

the stability and performance of the API under different conditions.

---
JMETER TECHNIQUES:

**User Defined Variables**: Store common settings (like **protocol**, **base_url**) to simplify test maintenance.

**Correlation**: Extract dynamic values (image_id, favourite_id) with **JSON/Regex Extractor**.

**Parameterization**: Use **CSV Data Set** (Search_image_parameters.csv) for data-driven tests.

**Throughput Control**: Limit requests to ≤120 req/min with **Constant Throughput Timer**.

**Transaction Controllers**: Group Add Favorite & Delete Favorite for end-to-end measurement.

**Non-GUI Execution**: Run tests via CMD for accuracy and efficiency.

---
NOTE

Testing was conducted using the free plan of The Cat API.

Due to plan restrictions, the maximum sample rate was limited to 120 requests per minute.

Required plugin **Custom Thread Group** in JMeter plugin manager to executed spike test.

---
TEST LOGICAL

The Cat API specification here: https://documenter.getpostman.com/view/5578104/RWgqUxxh#8606c7c6-338e-46aa-8f1a-3335ed2b8127

The project focuses on 4 main request APIs, grouped into 2 Transaction Controllers:

**Transaction Controller 1**: Add Image Favorite

	1.GET – Search Image
	
		-> Retrieve image list, extract **image_id**.
		
	2.POST – Favourites Image
	
		-> Send **image_id** to add an image to favorites, extract **favourite_id**.

**Transaction Controller 2**: Delete Image Favorite

	1.GET – Image Favourited_ID
	
		-> Retrieve information of the favorited image using **favourite_id**.
		
	2.DELETE – Image Favourited
	
		-> Remove the favorited image using **favourite_id**.

---
DIRECTORY STRUCTURE

- **CSV data sets**
    - Contains all necessary CSV data files for the tests.
- **HtmlReport**
    - Stores HTML reports generated after each test run.
- **Results**
    - Holds the raw JMeter result logs (.jtl files).
- **Screenshots**
    - Contains screenshots for Load, Endurance, and Spike tests.
- **cmd-run-endurance test.jpg**
    - Screenshot of the Endurance Test execution run in Command Prompt (CMD).
- **cmd-run-load test.jpg**
    - Screenshot of the Load Test execution run in Command Prompt (CMD).
- **cmd-run-spike test.jpg**
    - Screenshot of the Spike Test execution run in Command Prompt (CMD).
- **EnduranceTest_CRUD_TheCatAPI.jmx**
    - The JMeter script for the Endurance Test.
- **LoadTest_CRUD_TheCatAPI.jmx**
    - The JMeter script for the Load Test.
- **SpikeTest_CRUD_TheCatAPI.jmx**
    - The JMeter script for the Spike Test.
- **Test Flow.xlsx**
    - Documentation detailing the overall test flow and logic.

---
RESULT ANALYSIS

| Test type | Samples | Error % | Avg Resp (ms) | 95th %ile (ms) | Throughput (req/s) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Load Test | 3,634 | 51.9% | ~567 | ~1181 | ~2.0 |
| Endurance Test | 14,436 | 51.8% | ~544 | ~1159 | ~2.0 |
| Spike Test | 766 | 52.3% | ~719 | ~1788 | ~2.1 |

Observation:

- **GET-SEARCH-IMAGE** is stable (error <3%).
  
- **Transaction controler 1: Add/Delete Favorite** is unstable (70–99% errors, high latency ~20s).
  
- Indicates The Cat API limitations or backend bottlenecks under load.

---
CONCLUSION

The Cat API can handle search requests reliably, but the favorite-related endpoints show significant instability under load.

Further optimization or backend improvements are required to ensure consistent performance.
