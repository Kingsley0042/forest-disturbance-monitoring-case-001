# THE FOREST FILES
## Case 001: Forest Disturbance Monitoring and Verification

**Project type:** Satellite-based forest disturbance screening  
**Study period:** January–March 2023 versus January–March 2025  
**Tools:** Google Earth Engine, Sentinel-2, Sentinel-1, QGIS  
**Status:** Preliminary screening and candidate verification

---

## 1. Executive Summary

This case study uses satellite imagery to identify potential vegetation disturbance within a study area and investigate one candidate disturbance patch using optical imagery, radar data and historical forest-loss information.

The workflow combines Sentinel-2 vegetation indices, Sentinel-1 radar observations and a historical loss dataset. Results are mapped in QGIS to support visual interpretation and transparent reporting.

The analysis identifies areas that warrant further investigation. It does not establish that all detected changes are deforestation or that a specific land-clearing event has been independently verified.

## 2. Study Area

The study area is a rectangular region defined in Google Earth Engine using the following approximate coordinates:

- West: 23.45°
- South: 2.45°
- East: 23.55°
- North: 2.55°

The calculated area is approximately **12,352.57 hectares**, or **123.53 km²**.

ESA WorldCover tree-cover data indicate approximately **11,650.05 hectares** of tree cover within the study area. This is a baseline land-cover estimate, not a direct measurement of tree cover in 2025.

## 3. Data and Methods

### Sentinel-2 optical imagery

Sentinel-2 surface-reflectance imagery was used to compare vegetation conditions during January–March 2023 and January–March 2025.

The analysis used the Normalized Difference Vegetation Index (NDVI) to identify changes in vegetation greenness.

- Sentinel-2 scenes in the 2023 period: 11
- Sentinel-2 scenes in the 2025 period: 10
- Mean NDVI change: approximately -0.017

A negative NDVI change indicates a reduction in vegetation greenness, but can also reflect seasonal, atmospheric, soil-moisture or other environmental differences.

### Sentinel-1 radar imagery

Sentinel-1 radar observations were used as an additional source of evidence.

- Sentinel-1 scenes in the 2023 period: 7
- Sentinel-1 scenes in the 2025 period: 7
- Mean VV change: approximately -0.074 dB
- Mean VH change: approximately -0.079 dB

Radar changes can be influenced by vegetation structure, surface moisture, viewing geometry and other factors. They are supporting evidence rather than proof of forest clearing.

### Potential vegetation-loss screening

A change-detection mask was generated to highlight pixels meeting the project's potential-loss criteria.

The estimated potential vegetation-loss area was:

- **647.42 hectares at 10 m**
- **637.15 hectares at 20 m**

Potential vegetation gain at 10 m was approximately **233.86 hectares**.

The difference between the 10 m and 20 m estimates demonstrates that area calculations depend on analysis scale and processing choices. These figures represent candidate change detected by the workflow, not confirmed deforestation.

### Candidate disturbance verification

A candidate patch was examined using optical and radar changes alongside historical forest-loss information.

The candidate patch had:

- Geometric area: approximately 0.120 hectares
- Median NDVI change: approximately -0.485
- Median VV change: approximately -5.68 dB
- Median VH change: approximately -3.16 dB
- Overlap with historical loss data: approximately 0.073 hectares
- Historical-loss overlap: approximately 61.0%

The historical-loss overlap provides useful contextual evidence. However, the historical dataset cannot independently confirm a disturbance event in 2025 when its available loss-year codes cover only 2021–2024.

## 4. Map Outputs

Three maps accompany this report:

1. **Study Area Overview** — displays the study area and mapped potential vegetation change.
2. **Vegetation Change Analysis, 2023–2025** — visualises NDVI change across the study area.
3. **Candidate Disturbance Verification** — presents the selected candidate patch for further investigation.

See the `maps/` folder for the exported maps.

## 5. Limitations and Uncertainty

Several factors limit interpretation:

- The comparison uses two seasonal windows and may be affected by differences in image acquisition dates and conditions.
- Potential-loss estimates are sensitive to pixel resolution and detection thresholds.
- Optical vegetation indices can change because of factors other than deforestation.
- Radar backscatter is affected by surface moisture, vegetation structure and acquisition conditions.
- Historical loss overlap is supporting evidence, not independent confirmation of the timing or cause of disturbance.
- The candidate patch requires further investigation using higher-resolution imagery, additional dates, local knowledge or field verification.

## 6. Conclusion

This case study demonstrates a repeatable geospatial workflow for screening potential vegetation disturbance, examining a candidate patch and communicating uncertainty through maps and written reporting.

The results are best treated as a **prioritisation tool for further verification**, not a definitive forest-loss inventory.

The next stage would be to inspect additional dates, review higher-resolution imagery where available, and obtain independent evidence before classifying any candidate as confirmed deforestation.

---

**Prepared for:** The Forest Files — Geospatial Case Study Series  
**Case ID:** FF-001  
**Disclaimer:** Preliminary satellite-based analysis. Findings are not a substitute for independent field verification.
