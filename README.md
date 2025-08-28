# Celestial – AI Energy Farm Site Selector

**Welcome to Celestial**,  
An AI-powered system that analyzes satellite imagery and planetary data to identify optimal locations for setting up energy farms on Earth, the Moon, and beyond.

## What Powers Celestial?

* **YOLOv8 by Ultralytics**: Advanced computer vision for analyzing satellite imagery to detect terrain features, solar exposure patterns, and environmental conditions
* **Satellite Data Processing**: Integration with satellite imagery APIs and planetary datasets for comprehensive site analysis
* **Machine Learning Models**: Trained models that evaluate multiple factors including solar irradiance, terrain slope, dust coverage, and accessibility

## How It Works

Celestial processes satellite imagery and planetary data to:

1. **Analyze Solar Potential**: Calculate solar irradiance levels and optimal panel orientations
2. **Assess Terrain Suitability**: Evaluate slope, elevation, and surface stability for energy infrastructure
3. **Environmental Factors**: Consider dust storms, temperature variations, and seasonal changes
4. **Accessibility Analysis**: Determine proximity to existing infrastructure and transportation routes
5. **Risk Assessment**: Identify potential hazards like dust accumulation or geological instability

## Key Features

### Energy Farm Site Selection
- **Solar Farm Identification**: Pinpoint locations with maximum solar exposure and minimal shading
- **Wind Farm Potential**: Analyze wind patterns and terrain for optimal turbine placement
- **Geothermal Prospects**: Identify areas with potential geothermal energy sources
- **Hybrid Systems**: Recommend combinations of renewable energy sources

### Data Sources
- **Satellite Imagery**: High-resolution images from Mars Reconnaissance Orbiter, Lunar Reconnaissance Orbiter
- **Topographical Data**: Digital elevation models and terrain analysis
- **Environmental Data**: Temperature, radiation, and atmospheric conditions
- **Geological Surveys**: Surface composition and stability assessments

### Analysis Capabilities
- **Real-time Processing**: Analyze new satellite data as it becomes available
- **Multi-criteria Evaluation**: Weighted scoring system for site suitability
- **Predictive Modeling**: Forecast long-term energy generation potential
- **Interactive Mapping**: Visual site selection with detailed reports

## Use Case: Mars Energy Infrastructure

Celestial is designed to support the establishment of renewable energy infrastructure on Mars by:

- **Solar Array Placement**: Identifying flat, stable surfaces with maximum sun exposure
- **Dust Storm Mitigation**: Locating sites with natural wind barriers or minimal dust accumulation
- **Temperature Optimization**: Finding areas with optimal thermal conditions for equipment longevity
- **Resource Proximity**: Ensuring proximity to water sources and existing settlements
- **Expansion Planning**: Scalable site selection for future energy needs

## Technical Architecture

### Backend Services
- **Satellite Data API**: Integration with planetary data repositories
- **Image Processing Pipeline**: Automated analysis of satellite imagery
- **Machine Learning Models**: Site suitability prediction algorithms
- **Geospatial Analysis**: Advanced terrain and environmental modeling

### Frontend Interface
- **Interactive Maps**: Visual site selection with overlay data
- **Detailed Reports**: Comprehensive site analysis and recommendations
- **Export Capabilities**: Generate site reports for mission planning
- **Real-time Updates**: Live data integration and analysis updates

## Getting Started

### Prerequisites
- Python 3.8+
- pip
- Git
- Satellite data access credentials (optional)

### Installation
```bash
git clone https://github.com/Oansa/Celestial.git
cd Celestial
run start-all.bat
```

### Running frontend on ICP
If you are using a windows computer ensure wsl is installed and then:
```bash
cd frontend
run wsl terminal
run dfx start
open another terminal
run dfx deploy
```
## We are using ICP for:
Frontend Hosting
Data storage

## Here is our live frontend link:
```bash
https://t7ozk-kyaaa-aaaan-qz6cq-cai.icp0.io/
```

## Here is our  Backend canister via Candid interface:
```bash
    UserAuth: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=twnsw-4qaaa-aaaan-qz6da-cai
    internet_identity: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=rdmx6-jaaaa-aaaaa-aaadq-cai
    ```
    
### Usage
```bash
upload an image for analysis and give a prompt for the AI to give back relevant output. 
you can also interact with the AI via speech just click the button to the left of the text input field and the agent will ask for microphone access and take your speech input and it will also take a photo with your webcam and then give a response based on all these entries.
```

## Future Enhancements
- **Multi-planet Analysis**: Expand to additional celestial bodies
- **Real-time Satellite Integration**: Direct data feeds from active missions
- **Collaborative Planning**: Multi-user site selection and planning tools
- **Energy Grid Simulation**: Model energy distribution networks

## Here is our website
https://celestial-energy-5qhwsvj.gamma.site/

## Here is our pitch video
https://x.com/CelestialA20735/status/1960236594486522207

## Here is our demo video
https://mega.nz/file/StRBjYwT#Gfo7P9qrWPvc-ilbatNoGEPVy5xgL700RGre6pU350s

## Contributing
We welcome contributions from the space exploration and renewable energy communities.

## Disclaimer
The yolo model currntly in use is trained on common objects, things such as people, cars, trees.

The AI tool might hallucinate in events where not a clear object is identified in the image under analysis or if it doesn't "see" anything at all.

Despite this, the AI will give a good reponse in relation to the object identified, i.e; How the object "seen" will influence green energy set up on Earth and Mars.

The team is working on a custom data set to train a more appropriate yolo model for the AI tool, Helios.

---
**Celestial: Powering the future of space-based renewable energy**
