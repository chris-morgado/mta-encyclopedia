# mta-encyclopedia
Data visualization software for the MTA system. 

## Notes for future
Subway GTFS data is updated regularly throughout the year. In the future have this be updated automatically. 
In the frontend folder (have this pull from a zip INSIDE the repo, when automating in the future pull a zip and place it in the repo): 
```
gtfs-to-geojson --configPath ./gtfs-routes-config.json
gtfs-to-geojson --configPath ./gtfs-rstops-config.json
```

## Layout:
### Backend (mtae-backend/):
samconfig.toml              TODO
template.yaml               TODO
src/
└── functions/
    └── getProfile.ts       (Lambda: endpoint for getting public profile data)
    └── updateProfile.ts    (Lambda: endpoint for updating public profile data)
    └── getFavoriteStops.ts (Lambda: endpoint for getting data on a users favorite stops)
    └── updateFavoriteSt... (Lambda: endpoint for updating public profile data)

### Frontend (mtae-frontend/):
README.md                   (Frontend README.md, contains frontend specific documentation.)
geojson/
public/
└── data/
    └── TODO
src/
├── App.tsx                 (Main routing component)
├── App.css                 (Tailwind + DaisyUI config)
├── main.tsx                (React entry point)
├── index.css               (Global styles)
├── components/
│   └── StopPopup.tsx       (Popup component for map stops, when you press a stop on the map this component shows up)
├── context/
│   └── AuthContext.tsx     (Auth(entication) context provider)
├── data/
│   ├── stops.tsx           (Stop data & GeoJSON utilities)
│   └── routes.tsx          (Route data)
├── hooks/
│   └── useFavorites.ts     (Favorites management hook)
├── lib/
│   └── cognito.ts          (Cognito config)
├── pages/
│   ├── Login.tsx           (Login page)
│   ├── Signup.tsx          (Signup & email confirmation)
│   ├── MtaeMap.tsx         (Main map page)
│   └── Stop.tsx            (Individual stop detail page)
└── types/
    └── stop.tsx            (Stop & route types)