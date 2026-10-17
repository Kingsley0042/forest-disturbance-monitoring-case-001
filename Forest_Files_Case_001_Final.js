
/************************************************************
 THE FOREST FILES — CASE 001
 Forest Disturbance Monitoring and Verification

 Optical screening: Sentinel-2 NDVI
 Radar comparison: Sentinel-1 VV/VH
 Historical reference: Hansen Global Forest Change
************************************************************/


// ==========================================================
// 1. STUDY AREA
// ==========================================================

var studyArea = ee.Geometry.Rectangle([
  23.45, 2.45,
  23.55, 2.55
]);

Map.centerObject(studyArea, 12);

Map.addLayer(
  studyArea,
  {color: 'yellow'},
  'Study Area'
);

print(
  'Study area (ha):',
  studyArea.area(1).divide(10000)
);


// ==========================================================
// 2. BASELINE LAND COVER
// ==========================================================

var worldCover = ee.ImageCollection(
  'ESA/WorldCover/v200'
).first().select('Map').clip(studyArea);

var treeCover = worldCover.eq(10);

Map.addLayer(
  worldCover,
  {
    min: 10,
    max: 100,
    palette: [
      '006400', 'ffbb22', 'ffff4c', 'f096ff',
      'fa0000', 'b4b4b4', 'f0f0f0', '0064c8',
      '0096a0', '00cf75', 'fae6a0'
    ]
  },
  'ESA WorldCover 2021',
  false
);

function areaHa(mask, geometry, scale) {
  var result = ee.Image.pixelArea()
    .rename('area')
    .updateMask(mask)
    .reduceRegion({
      reducer: ee.Reducer.sum(),
      geometry: geometry,
      scale: scale,
      maxPixels: 1e9,
      tileScale: 4
    })
    .get('area');

  return ee.Number(
    ee.Algorithms.If(
      ee.Algorithms.IsEqual(result, null),
      0,
      result
    )
  ).divide(10000);
}

print(
  'WorldCover tree-cover area (ha):',
  areaHa(treeCover, studyArea, 10)
);


// ==========================================================
// 3. SENTINEL-2 OPTICAL ANALYSIS
// ==========================================================

function prepareNDVI(image) {
  var scl = image.select('SCL');

  var clear = scl.neq(3)
    .and(scl.neq(7))
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));

  return image
    .normalizedDifference(['B8', 'B4'])
    .rename('NDVI')
    .updateMask(clear)
    .copyProperties(image, ['system:time_start']);
}

function opticalSeason(start, end) {
  var collection = ee.ImageCollection(
    'COPERNICUS/S2_SR_HARMONIZED'
  )
    .filterBounds(studyArea)
    .filterDate(start, end)
    .filter(
      ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 80)
    )
    .map(prepareNDVI);

  return {
    collection: collection,
    count: collection.size(),
    median: collection.median().clip(studyArea),
    observations: collection.count().clip(studyArea)
  };
}

var s2_2023 = opticalSeason(
  '2023-01-01',
  '2023-04-01'
);

var s2_2025 = opticalSeason(
  '2025-01-01',
  '2025-04-01'
);

var validOptical = s2_2023.observations.gte(3)
  .and(s2_2025.observations.gte(3));

var ndvi2023 = s2_2023.median;
var ndvi2025 = s2_2025.median;

var ndviChange = ndvi2025
  .subtract(ndvi2023)
  .rename('NDVI_Change')
  .updateMask(validOptical);

// Potential loss is restricted to baseline tree-cover pixels.
var potentialLoss = ndviChange
  .lt(-0.15)
  .and(treeCover)
  .selfMask();

// Potential gain is a greenness increase, not proof of forest recovery.
var potentialGain = ndviChange
  .gt(0.15)
  .selfMask();

Map.addLayer(
  ndvi2023,
  {
    min: 0,
    max: 0.9,
    palette: ['brown', 'yellow', 'green']
  },
  'NDVI 2023',
  false
);

Map.addLayer(
  ndvi2025,
  {
    min: 0,
    max: 0.9,
    palette: ['brown', 'yellow', 'green']
  },
  'NDVI 2025',
  false
);

Map.addLayer(
  ndviChange,
  {
    min: -0.5,
    max: 0.5,
    palette: ['red', 'white', 'blue']
  },
  'NDVI Change 2023–2025'
);

Map.addLayer(
  potentialLoss,
  {palette: ['red']},
  'Potential Vegetation Loss'
);

Map.addLayer(
  potentialGain,
  {palette: ['cyan']},
  'Potential Greenness Gain'
);

print(
  'Sentinel-2 scenes Jan–Mar 2023:',
  s2_2023.count
);

print(
  'Sentinel-2 scenes Jan–Mar 2025:',
  s2_2025.count
);

print(
  'Potential loss at 10 m (ha):',
  areaHa(potentialLoss, studyArea, 10)
);

print(
  'Potential loss at 20 m (ha):',
  areaHa(potentialLoss, studyArea, 20)
);

print(
  'Potential gain at 10 m (ha):',
  areaHa(potentialGain, studyArea, 10)
);

var meanNDVIChange = ndviChange.reduceRegion({
  reducer: ee.Reducer.mean(),
  geometry: studyArea,
  scale: 10,
  maxPixels: 1e9,
  tileScale: 4
});

print(
  'Mean NDVI change:',
  meanNDVIChange.get('NDVI_Change')
);


// ==========================================================
// 4. SENTINEL-1 RADAR ANALYSIS
// ==========================================================

function radarSeason(start, end) {
  var collection = ee.ImageCollection(
    'COPERNICUS/S1_GRD'
  )
    .filterBounds(studyArea)
    .filterDate(start, end)
    .filter(
      ee.Filter.eq('instrumentMode', 'IW')
    )
    .filter(
      ee.Filter.listContains(
        'transmitterReceiverPolarisation',
        'VV'
      )
    )
    .filter(
      ee.Filter.listContains(
        'transmitterReceiverPolarisation',
        'VH'
      )
    )
    .select(['VV', 'VH']);

  return {
    collection: collection,
    count: collection.size(),
    median: collection.median().clip(studyArea)
  };
}

var s1_2023 = radarSeason(
  '2023-01-01',
  '2023-04-01'
);

var s1_2025 = radarSeason(
  '2025-01-01',
  '2025-04-01'
);

var radarChange = s1_2025.median
  .subtract(s1_2023.median)
  .rename(['VV_Change_dB', 'VH_Change_dB']);

Map.addLayer(
  radarChange.select('VV_Change_dB'),
  {
    min: -5,
    max: 5,
    palette: ['red', 'white', 'blue']
  },
  'VV Change',
  false
);

Map.addLayer(
  radarChange.select('VH_Change_dB'),
  {
    min: -5,
    max: 5,
    palette: ['red', 'white', 'blue']
  },
  'VH Change',
  false
);

print(
  'Sentinel-1 scenes Jan–Mar 2023:',
  s1_2023.count
);

print(
  'Sentinel-1 scenes Jan–Mar 2025:',
  s1_2025.count
);

var meanVVChange = radarChange
  .select('VV_Change_dB')
  .reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: studyArea,
    scale: 20,
    maxPixels: 1e9,
    tileScale: 4
  });

var meanVHChange = radarChange
  .select('VH_Change_dB')
  .reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: studyArea,
    scale: 20,
    maxPixels: 1e9,
    tileScale: 4
  });

print(
  'Mean VV change (dB):',
  meanVVChange.get('VV_Change_dB')
);

print(
  'Mean VH change (dB):',
  meanVHChange.get('VH_Change_dB')
);


// ==========================================================
// 5. CANDIDATE DISTURBANCE PATCH
// ==========================================================

var candidatePatch = ee.Geometry.Polygon([[
  [23.479550962594686, 2.455789410164087],
  [23.479910288708340, 2.455789410164087],
  [23.479910288708340, 2.456148736277740],
  [23.479730625651513, 2.456148736277740],
  [23.479730625651513, 2.455969073220913],
  [23.479550962594686, 2.455969073220913],
  [23.479550962594686, 2.455789410164087]
]]);

Map.addLayer(
  candidatePatch,
  {color: 'orange'},
  'Candidate Verification Patch'
);

var candidateAreaHa = candidatePatch
  .area(1)
  .divide(10000);

print(
  'Candidate patch geometric area (ha):',
  candidateAreaHa
);

var candidateNDVI = ndviChange.reduceRegion({
  reducer: ee.Reducer.median(),
  geometry: candidatePatch,
  scale: 10,
  maxPixels: 1e7,
  tileScale: 4
});

print(
  'Candidate median NDVI change:',
  candidateNDVI.get('NDVI_Change')
);

var candidateRadar = radarChange.reduceRegion({
  reducer: ee.Reducer.median(),
  geometry: candidatePatch,
  scale: 20,
  maxPixels: 1e7,
  tileScale: 4
});

print(
  'Candidate median radar change (dB):',
  candidateRadar
);


// ==========================================================
// 6. HANSEN HISTORICAL FOREST LOSS
// ==========================================================

var hansen = ee.Image(
  'UMD/hansen/global_forest_change_2024_v1_12'
);

var lossYear = hansen.select('lossyear');

// Hansen loss-year codes 21–24 mean 2021–2024.
var historicalLoss = lossYear.gte(21)
  .and(lossYear.lte(24))
  .unmask(0)
  .clip(studyArea);

Map.addLayer(
  historicalLoss.selfMask(),
  {palette: ['magenta']},
  'Hansen Forest Loss 2021–2024',
  false
);

// Use Hansen's native projection and grid.
var hansenProjection = lossYear.projection();

// Set the default projection before reduceResolution.
// The candidate geometry is rasterized to estimate the
// fraction of each Hansen pixel covered by the polygon.
var candidateCoverage = ee.Image.constant(1)
  .setDefaultProjection(hansenProjection)
  .clip(candidatePatch)
  .unmask(0)
  .toFloat()
  .reduceResolution({
    reducer: ee.Reducer.mean(),
    maxPixels: 1024
  })
  .reproject({
    crs: hansenProjection
  });

// Calculate historical loss area in the candidate patch.
var overlapAreaImage = ee.Image.pixelArea()
  .reproject({
    crs: hansenProjection
  })
  .multiply(historicalLoss)
  .multiply(candidateCoverage)
  .rename('overlap_area');

var overlapResult = overlapAreaImage.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: candidatePatch,
  scale: 30,
  maxPixels: 1e7,
  tileScale: 4
});

var overlapValue = overlapResult.get('overlap_area');

var hansenOverlapHa = ee.Number(
  ee.Algorithms.If(
    ee.Algorithms.IsEqual(overlapValue, null),
    0,
    overlapValue
  )
).divide(10000);

print(
  'Hansen loss overlap within candidate (ha):',
  hansenOverlapHa
);

print(
  'Hansen overlap percentage (%):',
  hansenOverlapHa
    .divide(candidateAreaHa)
    .multiply(100)
);


// ==========================================================
// 7. SUMMARY NOTE
// ==========================================================

print(
  'CASE 001 INTERPRETATION',
  'Potential disturbance screening only. NDVI decline, ' +
  'radar change and historical forest-loss data provide ' +
  'evidence for prioritising verification. They do not ' +
  'independently prove the cause or date of disturbance.'
);

print(
  'Hansen date limitation',
  'This dataset provides historical loss information ' +
  'through 2024; it cannot independently confirm a 2025 event.'
);


 // ==========================================================
// 8. EXPORT MAP DATA FOR THE PORTFOLIO
// ==========================================================

// Export 1: NDVI change, January–March 2023 vs 2025
Export.image.toDrive({
  image: ndviChange,
  description: 'Forest_Files_Case_001_NDVI_Change_2023_2025',
  folder: 'Forest_Files_Case_001',
  fileNamePrefix: 'NDVI_Change_2023_2025',
  region: studyArea,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

// Export 2: Potential vegetation loss screening layer
Export.image.toDrive({
  image: potentialLoss.unmask(0).toByte(),
  description: 'Forest_Files_Case_001_Potential_Loss',
  folder: 'Forest_Files_Case_001',
  fileNamePrefix: 'Potential_Vegetation_Loss',
  region: studyArea,
  scale: 10,
  maxPixels: 1e13,
  fileFormat: 'GeoTIFF'
});

// Export 3: Candidate verification patch as a shapefile
var candidateFeature = ee.Feature(candidatePatch, {
  case_id: 'FOREST_FILES_CASE_001',
  feature_type: 'candidate_disturbance',
  ndvi_change: candidateNDVI.get('NDVI_Change'),
  vv_change_db: candidateRadar.get('VV_Change_dB'),
  vh_change_db: candidateRadar.get('VH_Change_dB'),
  hansen_overlap_ha: hansenOverlapHa
});

Export.table.toDrive({
  collection: ee.FeatureCollection([candidateFeature]),
  description: 'Forest_Files_Case_001_Candidate_Patch',
  folder: 'Forest_Files_Case_001',
  fileNamePrefix: 'Candidate_Verification_Patch',
  fileFormat: 'SHP'
});
