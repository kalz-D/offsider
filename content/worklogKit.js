// Work-log quick-add presets for a geotech lab. Workers tap these to record their day.
module.exports = {
  "categories": [
    {
      "id": "lab_testing",
      "label": "Lab Testing",
      "icon": "🔬",
      "unit": "count"
    },
    {
      "id": "field_work",
      "label": "Field Work",
      "icon": "🚜",
      "unit": "hours"
    },
    {
      "id": "sample_prep",
      "label": "Sample Prep & Logging",
      "icon": "🪣",
      "unit": "count"
    },
    {
      "id": "concrete",
      "label": "Concrete & Materials",
      "icon": "🧱",
      "unit": "count"
    },
    {
      "id": "reporting",
      "label": "Reporting & Results",
      "icon": "📊",
      "unit": "hours"
    },
    {
      "id": "equipment",
      "label": "Equipment & Calibration",
      "icon": "🛠️",
      "unit": "count"
    },
    {
      "id": "admin",
      "label": "Admin & Coordination",
      "icon": "🗂️",
      "unit": "hours"
    },
    {
      "id": "training",
      "label": "Training & Safety",
      "icon": "🎓",
      "unit": "hours"
    }
  ],
  "presets": [
    {
      "label": "Moisture content tests",
      "category": "lab_testing",
      "unit": "count",
      "hint": "Oven-dry moisture content (AS 1289.2.1.1) — number of specimens tested"
    },
    {
      "label": "Particle size distribution",
      "category": "lab_testing",
      "unit": "count",
      "hint": "Wet/dry sieve PSD analyses — count of samples graded"
    },
    {
      "label": "Atterberg limits",
      "category": "lab_testing",
      "unit": "count",
      "hint": "Liquid limit, plastic limit & plasticity index — number of samples"
    },
    {
      "label": "Compaction (Proctor) tests",
      "category": "lab_testing",
      "unit": "count",
      "hint": "Standard or modified compaction / MDD-OMC curves run"
    },
    {
      "label": "CBR tests",
      "category": "lab_testing",
      "unit": "count",
      "hint": "California Bearing Ratio specimens tested"
    },
    {
      "label": "Field density (nuclear gauge)",
      "category": "field_work",
      "unit": "hours",
      "hint": "On-site density/compaction testing with nuclear gauge — hours on site"
    },
    {
      "label": "Site visit / sampling run",
      "category": "field_work",
      "unit": "hours",
      "hint": "Travel and on-site sampling, inspection or supervision — total hours"
    },
    {
      "label": "Borehole / test pit logging",
      "category": "field_work",
      "unit": "hours",
      "hint": "Logging soil profiles, geo descriptions on site — hours"
    },
    {
      "label": "Concrete cylinders cast",
      "category": "concrete",
      "unit": "count",
      "hint": "Fresh concrete cylinders moulded on site or in lab — number cast"
    },
    {
      "label": "Concrete cylinders tested",
      "category": "concrete",
      "unit": "count",
      "hint": "Compressive strength breaks on cured cylinders — number tested"
    },
    {
      "label": "Concrete slump / fresh tests",
      "category": "concrete",
      "unit": "count",
      "hint": "Slump, air content or temperature checks — number of batches"
    },
    {
      "label": "Sample prep / logging",
      "category": "sample_prep",
      "unit": "count",
      "hint": "Receiving, splitting, drying, labelling & registering samples — count"
    },
    {
      "label": "Sample disposal / cleanup",
      "category": "sample_prep",
      "unit": "count",
      "hint": "Disposing of finished samples and resetting benches — batches handled"
    },
    {
      "label": "Report / results entry",
      "category": "reporting",
      "unit": "hours",
      "hint": "Entering test data into LIMS and drafting reports — hours"
    },
    {
      "label": "Report checking / review",
      "category": "reporting",
      "unit": "hours",
      "hint": "Reviewing or signing off colleagues' results before issue — hours"
    },
    {
      "label": "Equipment calibration check",
      "category": "equipment",
      "unit": "count",
      "hint": "Verifying or calibrating gauges, ovens, sieves, scales — items checked"
    },
    {
      "label": "Equipment maintenance / repair",
      "category": "equipment",
      "unit": "count",
      "hint": "Cleaning, servicing or fixing lab/field gear — items serviced"
    },
    {
      "label": "Admin / coordination",
      "category": "admin",
      "unit": "hours",
      "hint": "Job scheduling, emails, client calls, paperwork — hours"
    },
    {
      "label": "Toolbox talk / safety",
      "category": "training",
      "unit": "hours",
      "hint": "Toolbox meetings, inductions, JSAs or training sessions — hours"
    }
  ]
};
