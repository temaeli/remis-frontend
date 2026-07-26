import * as L from 'leaflet';
import * as proj4 from 'proj4';

export class CoordinateDisplay extends L.Control {
  private container!: HTMLElement;

  constructor(options?: L.ControlOptions) {
    super(options);
  }

  onAdd(map: L.Map): HTMLElement {
    this.container = L.DomUtil.create('div', 'leaflet-coordinates-display');

    map.getContainer().appendChild(this.container);

    map.on('mousemove', this._updateCoordinates, this);
    map.on('mouseout', this._hideCoordinates, this);

    return this.container;
  }

  private _updateCoordinates(e: L.LeafletMouseEvent): void {
    const latlng = e.latlng;
    const utmZone = this._getUTMZone(latlng);

    if (utmZone >= 35 && utmZone <= 37) {
      const projected = this._transformToUTM(utmZone, latlng);
      const utmLine =
        `E ${projected.easting.toFixed(0).padStart(7, '0')}` +
        `   N ${projected.northing.toFixed(0).padStart(7, '0')}` +
        `   UTM ${utmZone}S`;
      const llLine = `${latlng.lat.toFixed(5)}°  ${latlng.lng.toFixed(5)}°`;

      this.container.innerHTML = `
        <div class="pm-coord">
          <span class="pm-coord__utm">${utmLine}</span>
          <span class="pm-coord__ll">${llLine}</span>
        </div>`;
    } else this._hideCoordinates();
  }

  private _hideCoordinates(): void {
    this.container.innerHTML = '';
  }

  private _getUTMZone(latlng: L.LatLng): number {
    return Math.floor((latlng.lng + 180) / 6) + 1;
  }

  private _transformToUTM(zone: number, latlng: L.LatLng): { easting: number; northing: number } {
    const sourceEspg = '+proj=longlat +datum=WGS84 +no_defs';
    const getZoneStr = (zones: number) =>
      `+proj=utm +zone=${zones} +south +datum=WGS84 +units=m +no_defs`;

    const wgs84ToUtm = proj4.default(sourceEspg, getZoneStr(zone));
    const transformCords = (coord: [number, number]) => wgs84ToUtm.forward(coord);
    const utmPoint = transformCords([latlng.lng, latlng.lat]);

    const easting = utmPoint[0];
    const northing = utmPoint[1];

    return { easting, northing };
  }
}

export function coordinateDisplay(options?: L.ControlOptions): CoordinateDisplay {
  return new CoordinateDisplay(options);
}
