import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import {transform as ol_proj_transform} from 'ol/proj'
import ol_control_SearchJSON from "ol-ext/control/SearchJSON";
import ol_ext_inherits from 'ol-ext/util/ext';
import { OlMapComponent } from '../ol-map/ol-map.component';
import {
  defaults as defaultControls,
  FullScreen,
  MousePosition,
  OverviewMap,
  ScaleLine,
  ZoomSlider,
  ZoomToExtent,
  Zoom,
  Attribution,
  Control
} from 'ol/control';



@Component({
  selector: 'ol-control',
  templateUrl: './ol-control.component.html',
  styleUrls: ['./ol-control.component.css']
})
export class OlControlComponent implements OnInit, OnDestroy {
  @Input() control = '';
  @Input() options: any = {};

  chooseControl: Control;

  constructor(private olMap: OlMapComponent) { }

  ngOnInit(): void {
    switch (this.control.toLocaleLowerCase()) {
      case 'fullscreen':
        this.chooseControl = new FullScreen(this.options);
        break;
      case 'mouseposition':
        this.chooseControl = new MousePosition(this.options);
        break;
      case 'overviewmap':
        this.chooseControl = new OverviewMap(this.options);
        break;
      case 'scaleline':
        this.chooseControl = new ScaleLine(this.options);
        break;
      case 'zoomslider':
        this.chooseControl = new ZoomSlider(this.options);
        break;
      case 'zoomtoextend':
        this.chooseControl = new ZoomToExtent(this.options);
        break;
      case 'attribution':
        this.chooseControl = new Attribution(this.options);
        break;
      default:
        this.chooseControl = new Zoom(this.options);
        break;
    }

    if (this.olMap.map) {
      this.olMap.setControl(this.chooseControl);
    } else {
      setTimeout(() => {
        this.ngOnInit();
      }, 10);
    }

  }

  ngOnDestroy() {}

}
var ol_control_SearchNominatim = function(options) {
  options = options || {};
  options.className = options.className || 'nominatim';
  options.typing = options.typing || 500;
  options.url = options.url || 'https://nominatim.openstreetmap.org/search';
  options.copy = '<a href="http://www.openstreetmap.org/copyright" target="new">&copy; OpenStreetMap contributors</a>';
  ol_control_SearchJSON.call(this, options);
  this.set('polygon', options.polygon);
  this.set('viewbox', options.viewbox);
  this.set('bounded', options.bounded);
};
ol_ext_inherits(ol_control_SearchNominatim, ol_control_SearchJSON);

ol_control_SearchNominatim.prototype.getTitle = function (f) {
  var info = [];
  if (f.class) info.push(f.class);
  if (f.type) info.push(f.type);
  var title = f.display_name+(info.length ? "<i>"+info.join(' - ')+"</i>" : '');
  if (f.icon) title = "<img src='"+f.icon+"' />" + title;
  return (title);
};

ol_control_SearchNominatim.prototype.requestData = function (s) {
  var data = {
    format: "json",
    addressdetails: 1,
    q: s,
    polygon_geojson: 1,
    bounded: this.get('bounded') ? 1:0,
    limit: this.get('maxItems'),
    viewbox :this.get('viewbox')
  };
  if (this.get('viewbox')) data.viewbox = this.get('viewbox');
  return data;
};
ol_control_SearchNominatim.prototype.select = function (f){
  var c = [Number(f.lon), Number(f.lat)];
  // Add coordinate to the event
  try {
    c = ol_proj_transform (c, 'EPSG:4326', this.getMap().getView().getProjection());
  } catch(e) { /* ok */}
  this.dispatchEvent({ type:"select", search:f, coordinate: c });
};
ol_control_SearchJSON.prototype.handleResponse = function (response) {
  return response.results || response;
};
ol_control_SearchNominatim.prototype.reverseGeocode = function (coord, cback) {
  var lonlat = ol_proj_transform (coord, this.getMap().getView().getProjection(), 'EPSG:4326');
  this.ajax(
    this.get('url').replace('search', 'reverse'),
    { lon: lonlat[0], lat: lonlat[1], format: 'json' },
    function(resp) {
      if (cback) {
        cback.call(this, [resp]);
      } else {
        if (resp && !resp.error) {
          this._handleSelect(resp, true);
        }
        //this.setInput('', true);
      }
    }.bind(this)
  );
};
export default ol_control_SearchNominatim
