import * as L from 'leaflet';

export class RectangleZoom extends L.Control {
  private _map: L.Map | null = null;
  private _rectangle: L.Rectangle | null = null;
  private _startLatLng: L.LatLng | null = null;

  constructor(options: L.ControlOptions = {}) {
    super(options);
  }

  onAdd(map: L.Map): HTMLElement {
    this._map = map;
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-rectangle-zoom-control');
    const icon = L.DomUtil.create('a', 'leaflet-rectangle-zoom-icon', container);
    icon.setAttribute('role', 'button');
    icon.setAttribute('title', 'Box-zoom: drag a rectangle to zoom in');
    icon.setAttribute('aria-label', 'Box-zoom');
    icon.innerHTML = '⛶';

    L.DomEvent.on(icon, 'click', L.DomEvent.stop);
    L.DomEvent.on(icon, 'click', this._enableZoomMode, this);
    L.DomEvent.disableClickPropagation(container);

    return container;
  }

  private _enableZoomMode(): void {
    this._map!.getContainer().style.cursor = 'crosshair';

    this._map!.dragging.disable();
    this._map!.doubleClickZoom.disable();
    this._map!.scrollWheelZoom.disable();
    this._map!.keyboard.disable();
    document.body.style.userSelect = 'none';

    this._map!.on('mousedown', this._startZoom, this);
  }

  private _startZoom(e: L.LeafletMouseEvent): void {
    this._startLatLng = e.latlng;

    this._rectangle = L.rectangle(
      [
        [0, 0],
        [0, 0],
      ],
      { interactive: false, color: '#3388ff', fillColor: 'transparent' }
    ).addTo(this._map!);

    this._map!.on('mousemove', this._updateRectangle, this);
    this._map!.on('mouseup', this._finishZoom, this);
  }

  private _updateRectangle(e: L.LeafletMouseEvent): void {
    if (!this._startLatLng || !this._rectangle) return;
    const bounds = L.latLngBounds(this._startLatLng, e.latlng);
    this._rectangle.setBounds(bounds);
  }

  private _finishZoom(): void {
    if (!this._map) return;
    // Cleanup
    this._map.off('mousemove', this._updateRectangle, this);
    this._map.off('mouseup', this._finishZoom, this);
    this._map.off('mousedown', this._startZoom, this);
    this._map.getContainer().style.cursor = '';
    this._map.doubleClickZoom.enable();
    this._map.scrollWheelZoom.enable();
    document.body.style.userSelect = '';
    this._map.dragging.enable();
    this._map.keyboard.enable();

    if (this._rectangle) {
      const bounds = this._rectangle.getBounds();
      if (this._startLatLng && bounds.getCenter().lng !== 0) {
        this._map.flyToBounds(bounds);
      }
      this._map.removeLayer(this._rectangle);
    }
    this._rectangle = null;
    this._startLatLng = null;
  }
}

export function rectangleZoom(options?: L.ControlOptions): RectangleZoom {
  return new RectangleZoom(options);
}
