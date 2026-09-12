import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './CampusMap.css';

// Default campus center (IIITDM Jabalpur from map.geojson)
const CAMPUS_CENTER = [23.1750415, 80.029215];
const DEFAULT_ZOOM = 16;

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function CampusMap({
  pins = [],
  userProfile,
  theme = 'dark',
  onOpenRoom,
  onOpenMarketplace,
  onOpenLostFound,
  isPlacingPin = false,
  onCancelPlacingPin,
  onMapClickToPlace
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const clusterGroupRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const currentTileLayerRef = useRef(null);

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'room' | 'marketplace' | 'lostfound'
  const [geojsonData, setGeojsonData] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [basemapProvider, setBasemapProvider] = useState('carto'); // 'carto' | 'esri'

  // 1. Fetch map.geojson once
  useEffect(() => {
    let isMounted = true;
    fetch('/map.geojson')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load map.geojson');
        return res.json();
      })
      .then(data => {
        if (isMounted) setGeojsonData(data);
      })
      .catch(err => {
        console.warn('Could not load /map.geojson:', err);
      });
    return () => { isMounted = false; };
  }, []);

  // 2. Initialize Leaflet Map with Smooth Inertia & Physics
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CAMPUS_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 14,
      maxZoom: 19,
      zoomControl: false,
      attributionControl: true,
      inertia: true,
      inertiaDeceleration: 3500,
      wheelDebounceTime: 30,
      zoomSnap: 0.5,
      zoomDelta: 0.5
    });

    // Helper to get tile URL matching theme and provider
    const tileUrl = theme === 'light'
      ? (basemapProvider === 'esri'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')
      : (basemapProvider === 'esri'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');

    const attribution = basemapProvider === 'esri'
      ? '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution
    }).addTo(map);

    currentTileLayerRef.current = tileLayer;

    // Initialize Marker Cluster Group styled matching Blood Void (Dark) & Cream Noir (Light)
    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40,
      spiderfyOnMaxZoom: true,
      animate: true,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        const badgeClass = theme === 'light' ? 'custom-cluster-badge cluster-light' : 'custom-cluster-badge cluster-dark';
        return L.divIcon({
          html: `<div class="${badgeClass}" style="width: 36px; height: 36px;"><span>${count}</span></div>`,
          className: 'cluster-marker-wrap',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
      }
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    mapRef.current = map;
    setMapReady(true);

    // Resize observer to handle container changes
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Update Basemap Tile when Provider or Theme Changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileUrl = theme === 'light'
      ? (basemapProvider === 'esri'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png')
      : (basemapProvider === 'esri'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');

    const attribution = basemapProvider === 'esri'
      ? '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution
    }).addTo(map);

    currentTileLayerRef.current = newTileLayer;
  }, [basemapProvider, theme]);

  // 4. Render GeoJSON Vector Layer (Blood Void Red in Dark, Cream Noir Black in Light)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geojsonData) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const isLight = theme === 'light';

    const geojsonLayer = L.geoJSON(geojsonData, {
      style: (feature) => {
        const geomType = feature.geometry?.type;
        const props = feature.properties || {};

        if (geomType === 'Polygon' || geomType === 'MultiPolygon') {
          return {
            fillColor: isLight ? '#eae4d6' : '#140e10',
            fillOpacity: isLight ? 0.75 : 0.75,
            color: isLight ? 'rgba(26, 26, 26, 0.22)' : 'rgba(255, 59, 59, 0.28)',
            weight: 1.2,
            opacity: 0.9
          };
        }

        if (geomType === 'LineString' || geomType === 'MultiLineString') {
          const isFootway = props.highway === 'footway' || props.highway === 'path';
          return {
            color: isLight
              ? (isFootway ? 'rgba(26, 26, 26, 0.22)' : 'rgba(26, 26, 26, 0.45)')
              : (isFootway ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 59, 59, 0.45)'),
            weight: isFootway ? 1.8 : 2.5,
            opacity: 0.8,
            dashArray: isFootway ? '4, 4' : null
          };
        }

        return {
          color: isLight ? '#a31d24' : '#ff3b3b',
          weight: 2
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties || {};
        const title = props.name || props.tourism || props.building || (feature.geometry?.type === 'LineString' ? 'Campus Pathway' : 'Campus Building');

        if (title && title !== 'yes') {
          layer.bindTooltip(title, {
            className: isLight ? 'geojson-feature-tooltip tooltip-light' : 'geojson-feature-tooltip tooltip-dark',
            direction: 'center',
            permanent: false
          });
        }

        layer.on({
          click: (e) => {
            if (e.latlng) {
              map.flyTo(e.latlng, Math.max(map.getZoom(), 16.5), { duration: 0.6, easeLinearity: 0.25 });
            }
          },
          mouseover: (e) => {
            const l = e.target;
            if (l.setStyle) {
              l.setStyle({
                fillColor: isLight ? '#ded5c2' : '#2b1519',
                fillOpacity: 0.9,
                color: isLight ? '#18181b' : '#ff3b3b',
                weight: 1.8
              });
            }
          },
          mouseout: (e) => {
            geojsonLayer.resetStyle(e.target);
          }
        });
      }
    });

    geojsonLayer.addTo(map);
    geojsonLayerRef.current = geojsonLayer;
  }, [geojsonData, theme]);

  // 5. Click on Map to Drop Pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (isPlacingPin && typeof onMapClickToPlace === 'function') {
        onMapClickToPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isPlacingPin, onMapClickToPlace]);

  // 6. Filter pins based on active tab
  const filteredPins = useMemo(() => {
    if (activeFilter === 'all') return pins;
    return pins.filter(p => p.type === activeFilter);
  }, [pins, activeFilter]);

  // Counts for top bar
  const counts = useMemo(() => {
    return {
      all: pins.length,
      room: pins.filter(p => p.type === 'room').length,
      marketplace: pins.filter(p => p.type === 'marketplace').length,
      lostfound: pins.filter(p => p.type === 'lostfound').length
    };
  }, [pins]);

  // 7. Update Markers in Cluster Group
  useEffect(() => {
    const map = mapRef.current;
    const clusterGroup = clusterGroupRef.current;
    if (!map || !clusterGroup) return;

    clusterGroup.clearLayers();
    const isLight = theme === 'light';

    filteredPins.forEach(pin => {
      const lat = Number(pin.lat);
      const lng = Number(pin.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      // Icon HTML with Sleek Capsule Markers
      let iconInnerHtml = '';
      if (pin.type === 'room') {
        iconInnerHtml = `
          <div class="pin-marker-pill pin-type-room ${isLight ? 'pin-light-room' : 'pin-dark-room'}">
            <div class="pin-icon-avatar">🗣️</div>
            <span class="pin-label-title">${escapeHtml(pin.title)}</span>
            <span class="pin-pulse-dot" title="Live lounge"></span>
          </div>
        `;
      } else if (pin.type === 'marketplace') {
        const price = pin.marketData?.price ? String(pin.marketData.price) : '$0';
        iconInnerHtml = `
          <div class="pin-marker-pill pin-type-marketplace ${isLight ? 'pin-light-market' : 'pin-dark-market'}">
            <div class="pin-icon-avatar">🏷️</div>
            <span class="pin-label-title">${escapeHtml(pin.title)}</span>
            <span class="pin-price-chip-tag">${escapeHtml(price)}</span>
          </div>
        `;
      } else if (pin.type === 'lostfound') {
        const cat = (pin.lostFoundData?.category || 'lost').toUpperCase();
        iconInnerHtml = `
          <div class="pin-marker-pill pin-type-lostfound ${isLight ? 'pin-light-lf' : 'pin-dark-lf'}">
            <div class="pin-icon-avatar">📝</div>
            <span class="pin-label-title">${escapeHtml(pin.title)}</span>
            <span class="pin-lf-status-chip">${cat}</span>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: iconInnerHtml,
        className: 'custom-map-pin',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -28]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Click on pin flies smoothly to center it
      marker.on('click', () => {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 16.5), { duration: 0.6, easeLinearity: 0.25 });
      });

      // Popup Content Card styled with glass-panel design tokens
      const popupContainer = document.createElement('div');
      popupContainer.className = `pin-popup-card ${isLight ? 'popup-light' : 'popup-dark'}`;

      let headerIconBg = isLight ? 'rgba(24, 24, 27, 0.08)' : 'rgba(255, 59, 59, 0.15)';
      let headerIconColor = isLight ? '#18181b' : '#ff3b3b';
      let emoji = '🗣️';

      if (pin.type === 'marketplace') {
        headerIconBg = isLight ? 'rgba(5, 150, 105, 0.12)' : 'rgba(16, 185, 129, 0.15)';
        headerIconColor = isLight ? '#059669' : '#10b981';
        emoji = '🏷️';
      } else if (pin.type === 'lostfound') {
        headerIconBg = isLight ? 'rgba(217, 119, 6, 0.12)' : 'rgba(245, 158, 11, 0.15)';
        headerIconColor = isLight ? '#d97706' : '#f59e0b';
        emoji = '📝';
      }

      let extraContentHtml = '';
      let ctaBtnHtml = '';

      if (pin.type === 'room') {
        const catBadge = pin.category || 'General';
        extraContentHtml = `
          <p class="pin-popup-desc">${escapeHtml(pin.description || 'A cozy campus lounge pin.')}</p>
          <div class="pin-popup-meta">
            <span>🏷️ ${escapeHtml(catBadge)}</span>
            <span>•</span>
            <span>By ${escapeHtml(pin.createdBy?.name || 'Student')}</span>
          </div>
        `;
        ctaBtnHtml = `<button class="btn-pill-primary pin-popup-cta-btn" style="width: 100%; justify-content: center; padding: 8px 14px; font-size: 0.84rem;" id="btn-open-room-${pin.id}">Step Inside ➔</button>`;
      } else if (pin.type === 'marketplace') {
        const price = pin.marketData?.price || '$0';
        const mktType = (pin.marketData?.listingType || 'sell').toUpperCase();
        const commentsCount = pin.marketData?.comments ? pin.marketData.comments.length : 0;
        const photo = pin.marketData?.photoUrl ? `<img src="${escapeHtml(pin.marketData.photoUrl)}" alt="${escapeHtml(pin.title)}" class="pin-popup-img-thumb" />` : '';
        extraContentHtml = `
          <div style="display: flex; gap: 6px; align-items: center;">
            <span class="pin-popup-price-tag">${escapeHtml(price)}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">(${mktType})</span>
          </div>
          ${photo}
          <p class="pin-popup-desc" style="font-size: 0.8rem;">${escapeHtml(pin.description || 'Listed on campus market.')}</p>
          <div class="pin-popup-meta">
            <span>💬 ${commentsCount} offers / comments</span>
            <span>•</span>
            <span>By ${escapeHtml(pin.createdBy?.name || 'Student')}</span>
          </div>
        `;
        ctaBtnHtml = `
          <button class="btn-pill-primary pin-popup-cta-btn" style="width: 100%; justify-content: center; padding: 8px 14px; font-size: 0.84rem;" id="btn-open-mkt-${pin.id}">Trade Comments & Offers (${commentsCount}) 💬</button>
          ${pin.roomId ? `<button class="btn-pill-secondary pin-popup-cta-btn" style="width: 100%; justify-content: center; padding: 6px 12px; font-size: 0.78rem; margin-top: 6px;" id="btn-room-mkt-${pin.id}">🚪 Negotiation Room</button>` : ''}
        `;
      } else if (pin.type === 'lostfound') {
        const lfCat = (pin.lostFoundData?.category || 'lost').toUpperCase();
        const commentCount = pin.lostFoundData?.comments ? pin.lostFoundData.comments.length : 0;
        const photo = pin.lostFoundData?.photoUrl ? `<img src="${escapeHtml(pin.lostFoundData.photoUrl)}" alt="${escapeHtml(pin.title)}" class="pin-popup-img-thumb" />` : '';
        extraContentHtml = `
          <div>
            <span class="pin-popup-lf-tag">${lfCat} ITEM</span>
          </div>
          ${photo}
          <p class="pin-popup-desc" style="font-size: 0.8rem;">${escapeHtml(pin.lostFoundData?.description || pin.description || 'Lost & Found post on campus.')}</p>
          <div class="pin-popup-meta">
            <span>💬 ${commentCount} comments</span>
            <span>•</span>
            <span>By ${escapeHtml(pin.createdBy?.name || 'Student')}</span>
          </div>
        `;
        ctaBtnHtml = `<button class="btn-pill-primary pin-popup-cta-btn" style="width: 100%; justify-content: center; padding: 8px 14px; font-size: 0.84rem;" id="btn-open-lf-${pin.id}">View Post & Comments (${commentCount}) 📝</button>`;
      }

      popupContainer.innerHTML = `
        <div class="pin-popup-header">
          <div class="pin-popup-icon-box" style="background: ${headerIconBg}; color: ${headerIconColor};">
            ${emoji}
          </div>
          <div style="flex: 1; min-width: 0;">
            <h4 class="pin-popup-title">${escapeHtml(pin.title)}</h4>
          </div>
        </div>
        ${extraContentHtml}
        <div class="pin-popup-actions" style="margin-top: 10px;">
          ${ctaBtnHtml}
        </div>
      `;

      marker.bindPopup(popupContainer);

      marker.on('popupopen', () => {
        const btnRoom = document.getElementById(`btn-open-room-${pin.id}`);
        if (btnRoom) {
          btnRoom.onclick = () => {
            marker.closePopup();
            if (typeof onOpenRoom === 'function') {
              onOpenRoom(pin.roomId || pin.id);
            }
          };
        }

        const btnMkt = document.getElementById(`btn-open-mkt-${pin.id}`);
        if (btnMkt) {
          btnMkt.onclick = () => {
            marker.closePopup();
            if (typeof onOpenMarketplace === 'function') {
              onOpenMarketplace(pin);
            }
          };
        }

        const btnMktRoom = document.getElementById(`btn-room-mkt-${pin.id}`);
        if (btnMktRoom) {
          btnMktRoom.onclick = () => {
            marker.closePopup();
            if (typeof onOpenRoom === 'function' && pin.roomId) {
              onOpenRoom(pin.roomId);
            }
          };
        }

        const btnLf = document.getElementById(`btn-open-lf-${pin.id}`);
        if (btnLf) {
          btnLf.onclick = () => {
            marker.closePopup();
            if (typeof onOpenLostFound === 'function') {
              onOpenLostFound(pin);
            }
          };
        }
      });

      clusterGroup.addLayer(marker);
    });
  }, [filteredPins, theme, onOpenRoom, onOpenMarketplace, onOpenLostFound]);

  // Recenter map smoothly
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(CAMPUS_CENTER, DEFAULT_ZOOM, { duration: 0.7, easeLinearity: 0.25 });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  // Toggle basemap between Carto and Esri
  const toggleBasemap = () => {
    setBasemapProvider(prev => prev === 'carto' ? 'esri' : 'carto');
  };

  return (
    <div className={`campus-map-wrapper ${isPlacingPin ? 'placing-mode' : ''}`} data-theme={theme}>
      {/* Top Filter Chips */}
      <div className="map-overlay-topbar">
        <div className="map-filter-chips">
          <button
            type="button"
            className={`map-chip-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            <span>🌐 All Pins</span>
            <span className="map-chip-count">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`map-chip-btn chip-room ${activeFilter === 'room' ? 'active' : ''}`}
            onClick={() => setActiveFilter('room')}
          >
            <span>🗣️ Social Lounges</span>
            <span className="map-chip-count">{counts.room}</span>
          </button>
          <button
            type="button"
            className={`map-chip-btn chip-market ${activeFilter === 'marketplace' ? 'active' : ''}`}
            onClick={() => setActiveFilter('marketplace')}
          >
            <span>🏷️ Campus Market</span>
            <span className="map-chip-count">{counts.marketplace}</span>
          </button>
          <button
            type="button"
            className={`map-chip-btn chip-lostfound ${activeFilter === 'lostfound' ? 'active' : ''}`}
            onClick={() => setActiveFilter('lostfound')}
          >
            <span>📝 Lost & Found</span>
            <span className="map-chip-count">{counts.lostfound}</span>
          </button>
        </div>
      </div>

      {/* Placing Pin Active Banner */}
      {isPlacingPin && (
        <div className="map-placing-banner">
          <span>📍 Tap anywhere on campus to drop your pin</span>
          <button
            type="button"
            className="map-placing-cancel-btn"
            onClick={onCancelPlacingPin}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Floating HUD Controls */}
      <div className="map-floating-hud">
        <button
          type="button"
          className="map-hud-btn"
          onClick={toggleBasemap}
          title={basemapProvider === 'carto' ? 'Switch to Esri Basemap' : 'Switch to CARTO Basemap'}
        >
          {basemapProvider === 'carto' ? '🗺️' : '🛰️'}
        </button>
        <button
          type="button"
          className="map-hud-btn"
          onClick={handleRecenter}
          title="Recenter Campus Map"
        >
          🎯
        </button>
        <div className="map-hud-group">
          <button
            type="button"
            className="map-hud-btn"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            className="map-hud-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            −
          </button>
        </div>
      </div>

      {/* Main Leaflet Container */}
      <div ref={mapContainerRef} className="campus-leaflet-container" />
    </div>
  );
}
