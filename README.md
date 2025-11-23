# mta-encyclopedia
Data visualization software for the MTA system. 

## Notes for future
Subway GTFS data is updated regularly throughout the year. In the future have this be updated automatically. 
In the frontend folder (have this pull from a zip INSIDE the repo, when automating in the future pull a zip and place it in the repo): 
```
gtfs-to-geojson --configPath ./gtfs-routes-config.json
gtfs-to-geojson --configPath ./gtfs-rstops-config.json
```
