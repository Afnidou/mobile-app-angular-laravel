import { StorageService } from './../../storage.service';
import { Component, OnInit, AfterViewInit, Input,Output, ElementRef } from '@angular/core';
import 'ol/ol.css';
import Tooltip from  'ol-ext/Overlay/Tooltip';
import EditBar from 'ol-ext/control/EditBar' ;
import Notification from 'ol-ext/control/Notification';
import { ajax, css } from "jquery";
import getCenter from 'ol-ext';
import GeoJSON  from 'ol/format/GeoJSON';
import SearchNominatim from 'ol-ext/Control/SearchNominatim';
import {transform as ol_proj_transform} from 'ol/proj'
import ol_control_SearchJSON from "ol-ext/control/SearchJSON";
import Map from 'ol/Map';
import GeolocationButton from 'ol-ext/control/GeolocationButton';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import Overlay from 'ol/Overlay';
import Popup from 'ol-ext/Overlay/Popup';
import {Circle, LineString, Polygon} from 'ol/geom';
import {getArea, getLength} from 'ol/sphere';
import {unByKey} from 'ol/Observable';
import ol_ext_inherits from 'ol-ext/util/ext';
import ol_control_Geolocation  from 'ol-ext/util/ext';
import ol_control_Toggle from 'ol-ext/control/Toggle';
import ol_interaction_GeolocationDraw from 'ol-ext/interaction/GeolocationDraw';
import * as Proj from 'ol/proj';
import { defaults as defaultControls, Control  } from 'ol/control';
import Icon from 'ol/style/Icon';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {Draw, Modify, Snap} from 'ol/interaction';
import {OSM, Vector as VectorSource} from 'ol/source';
import GeometryType from 'ol/geom/GeometryType';
import WKT from 'ol/format/WKT';
import {shiftKeyOnly as ol_events_condition_shiftKeyOnly} from 'ol/events/condition'
import {click as ol_events_condition_click} from 'ol/events/condition'
import ol_interaction_Draw from 'ol/interaction/Draw'
import ol_geom_LineString from 'ol/geom/LineString'
import ol_geom_Polygon from 'ol/geom/Polygon'
import ol_interaction_Select from 'ol/interaction/Select'
import ol_control_Bar from 'ol-ext/control/Bar' ;
import ol_control_Button from 'ol-ext/control/Button'
import ol_control_TextButton from 'ol-ext/control/TextButton'
import ol_interaction_Delete from 'ol-ext/interaction/Delete' ;
import ol_ext_element from 'ol-ext/util/element'
import ol_interaction_Offset from 'ol-ext/interaction/Offset'
import ol_interaction_Split from 'ol-ext/interaction/Split'
import ol_interaction_Transform from 'ol-ext/interaction/Transform'
import ol_interaction_ModifyFeature from 'ol-ext/interaction/ModifyFeature'
import ol_interaction_DrawRegular from 'ol-ext/interaction/DrawRegular'
import ol_interaction_DrawHole from 'ol-ext/interaction/DrawHole'
import{Sphere}from 'ol-ext';
export const DEFAULT_HEIGHT = '500px';
export const DEFAULT_WIDTH = '500px';
export const DEFAULT_LAT = -34.603490361131385;
export const DEFAULT_LON = -58.382037891217465;
import {Router} from '@angular/router';
import { Feature } from 'ol';
import {concat} from 'ol-ext'
@Component({
  selector: 'ol-map',
  templateUrl: './ol-map.component.html',
  styleUrls: ['./ol-map.component.css']
})
export class OlMapComponent implements OnInit, AfterViewInit {
  @Input() lat: number = DEFAULT_LAT;
  @Input() lon: number = DEFAULT_LON;
  @Input() zoom: number;
  @Input() width: string | number = DEFAULT_WIDTH;
  @Input() height: string | number = DEFAULT_HEIGHT;

  target: string =  'map';
  map: Map;
  private mapEl: HTMLElement;

  constructor( private StorageService: StorageService ,private elementRef: ElementRef ,private route:Router )
   {

    }

  ngOnInit(): void {
     this.StorageService.getData().subscribe((res)=>{
      console.log(res);
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(res,{ dataProjection: "EPSG:4326" }),
        });
        const vectorLayerA = new VectorLayer({
          source: vectorSource,

        });
      this.mapEl = this.elementRef.nativeElement.querySelector('#' + this.target);
    this.setSize();
    const raster = new TileLayer({source: new OSM(), });
    const source = new VectorSource();
    const sLayer = new VectorLayer({
      source:  new VectorSource(), style: new Style({ image: new CircleStyle({
          radius: 5,
          stroke: new Stroke ({ color: 'rgb(255,165,0)', width: 3 }),
          fill: new Fill({color: 'rgba(255,165,0,.3)' }) }),
        stroke: new Stroke ({ color: 'rgb(255,165,0)', width: 3}),
        fill: new Fill({ color: 'rgba(255,165,0,.3)' })
      })
    }   );

    //const vectorSource = new VectorSource({
    // features: new GeoJSON().readFeatures(this.StorageService.geojson,{ dataProjection: "EPSG:4326" }),
    //});

    // const vectorLayerA = new VectorLayer({
    //   source: vectorSource,

    // });

    const vector = new VectorLayer({ source: source, style: new Style({
        fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)',}),
        stroke: new Stroke({color: '#ffcc33', width: 2, }),
        image: new CircleStyle({ radius: 7, fill: new Fill({color: '#ffcc33',}), }), }),  });
 let sketch ,helpTooltipElement,helpTooltip,measureTooltipElement,measureTooltip;
 const continuePolygonMsg = 'Click to continue drawing the polygon',continueLineMsg = 'Click to continue drawing the line';

    const map = new Map({
      target: this.target,
      layers:  [raster, vector],
      view: new View({
        center: Proj.fromLonLat([this.lon, this.lat]),
        zoom: this.zoom
      }),
      controls: defaultControls({attribution: true, zoom: true}).extend([])
    });
    map.addLayer(sLayer);
     map.addLayer(vectorLayerA);



// Set the search control
var search = new SearchNominatim (
  {	//target: $(".options").get(0), *s

    polygon:($("#polygon").prop("checked")),

    reverse: true,
    position: true,	// Search, with priority to geo position,

  });

// Select feature when click on the reference index
  search.on('select', function(e)
  {	// console.log(e);


    sLayer.getSource().clear();
    // Check if we get a geojson to describe the search
    if (e.search.geojson) {
      var format = new GeoJSON();
      var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
      sLayer.getSource().addFeature(f);
      var view = map.getView();
      var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), map.getSize());
      var zoom = view.getZoomForResolution(resolution);
      var center = getCenter(f.getGeometry().getExtent());
      // redraw before zoom
      setTimeout(function(){
          view.animate({
          center: center,
          zoom: Math.min (zoom, 16)
        });
      }, 100);
    }
    else {
      map.getView().animate({
        center:e.coordinate,
        zoom: Math.max (map.getView().getZoom(),16)
      });
    }
  });
    if (location.protocol == 'http:' && !/^localhost/.test(location.host)) {
      location.href = window.location.href.replace(/^http:/,"https:");
    }
    const geoloc = new GeolocationButton({
      title: 'Where am I?',
      delay: 2000 // 2s
    });
    map.addControl(geoloc);
    map.addControl (search);
    // Show position
    var here = new Popup({ positioning: 'bottom-right' });
    map.addOverlay(here);
    geoloc.on('position', function(e) {
      if (e.coordinate) here.show(e.coordinate, "You are<br/>here!");
      else here.hide();
    });

    function addInteractions() {


    createMeasureTooltip();
    createHelpTooltip();


    }

 function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'ol-tooltip hidden';
  helpTooltip = new Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
     positioning: 'center-left',
  });
  map.addOverlay(helpTooltip);
}

 function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
  measureTooltip = new Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
     positioning: 'bottom-center',
    stopEvent: false,
    insertFirst: false,
  });
  map.addOverlay(measureTooltip);
}
var note = new Notification();
map.addControl(note)
// Add the editbar
var edit = new EditBar({ source: vector.getSource() });
map.addControl(edit);
edit.setPosition("bottom")
// Add a tooltip
var tooltip = new Tooltip();
map.addOverlay(tooltip);

edit.getInteraction('Select').on('select', function(e){
  if (this.getFeatures().getLength()) {
    tooltip.setInfo('Drag points on features to edit...');
  }
  else tooltip.setInfo();
});
edit.getInteraction('Select').on('change:active', function(e){
  tooltip.setInfo('');
});
edit.getInteraction('ModifySelect').on('modifystart', function(e){
  if (e.features.length===1) tooltip.setFeature(e.features[0]);
});
edit.getInteraction('ModifySelect').on('modifyend', function(e){

  tooltip.setFeature();
});
edit.getInteraction('DrawPoint').on('change:active', function(e){

  tooltip.setInfo(e.oldValue ? '' : 'Click map to place a point...');
});
edit.getInteraction('DrawLine').on(['change:active','drawend'], function(e){


  var format = new WKT(),
  wkt = format.writeGeometry(e.feature.getGeometry())

  $('#wktgeom').html(wkt);
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing line...');
});


edit.getInteraction('DrawLine').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing line...');
});
edit.getInteraction('DrawPolygon').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing shape...');
});

edit.getInteraction('DrawPolygon').on(['change:active','drawend'], function(e){
  var format = new WKT(),


  wkt = format.writeGeometry(e.feature.getGeometry(), { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() })
  $('#wktgeom').val(wkt);

  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
});
edit.getInteraction('DrawHole').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing hole...');
});
edit.getInteraction('DrawHole').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click polygon to start drawing hole...');
});
edit.getInteraction('DrawRegular').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Move and click map to finish drawing...');
});
edit.getInteraction('DrawRegular').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
});
edit.on('info', function(e){


  note.show('<i class="fa fa-info-circle"></i> '+e.features.getLength()+' feature(s) selected');
});

    addInteractions();
})

  }

  ngAfterViewInit(): void
  {


  }



  private setSize() {
    if (this.mapEl) {
      const styles = this.mapEl.style;
      styles.height = coerceCssPixelValue(this.height) || DEFAULT_HEIGHT;
      styles.width = coerceCssPixelValue(this.width) || DEFAULT_WIDTH;
    }
  }
  public setControl(control: Control) {
    this.map.addControl(control);
  }
}
var ol_control_GeolocationButton = function(options) {
  if (!options) options = {};
  // Geolocation draw interaction
  options.followTrack = options.followTrack || 'auto';
  options.zoom = options.zoom || 20;
  options.minZoom = options.minZoom || 16;
  var interaction = new ol_interaction_GeolocationDraw(options);

  ol_control_Toggle.call (this, {
    className: options.className = ((options.className || '') + ' ol-geobt').trim(),
    interaction: interaction,
    title: options.title || 'Geolocation',
    onToggle: function() {
      interaction.pause(true);
      interaction.setFollowTrack(options.followTrack || 'auto');
    }
  });
  this.setActive(false);
  interaction.on('tracking', function(e) {
    this.dispatchEvent({ type: 'position', coordinate: e.geolocation.getPosition() });
  }.bind(this));
  // Timeout delay
  var tout;
  interaction.on('change:active', function() {
    this.dispatchEvent({ type:'position' });
    if (tout) {
      clearTimeout(tout);
      tout = null;
    }
    if (interaction.getActive()) {
      tout = setTimeout(function() {
        interaction.setActive(false);
        tout = null;
      }.bind(this), options.delay || 3000);
    }
  }.bind(this));
};
ol_ext_inherits(ol_control_GeolocationButton, ol_control_Toggle);
export default ol_control_GeolocationButton
const cssUnitsPattern = /([A-Za-z%]+)$/;
function coerceCssPixelValue(value: any): string {
  if (value == null) {
    return '';
  }

  return cssUnitsPattern.test(value) ? value : `${value}px`;
}
var ol_control_EditBar = function(options) {
  options = options || {};
  options.interactions = options.interactions || {};
  // New bar
	ol_control_Bar.call(this, {
    className: (options.className ? options.className+' ': '') + 'ol-editbar',
    toggleOne: true,
		target: options.target
  });
  this._source = options.source;
  // Add buttons / interaction
  this._interactions = {};
  this._setSelectInteraction(options);
  if (options.edition!==false) this._setEditInteraction(options);
  this._setModifyInteraction(options);
};
ol_ext_inherits(ol_control_EditBar, ol_control_Bar);
ol_control_EditBar.prototype.setMap = function (map) {
  if (this.getMap()) {
    if (this._interactions.Delete) this.getMap().removeInteraction(this._interactions.Delete);
    if (this._interactions.ModifySelect) this.getMap().removeInteraction(this._interactions.ModifySelect);
  }
  ol_control_Bar.prototype.setMap.call(this, map);

  if (this.getMap()) {
    if (this._interactions.Delete) this.getMap().addInteraction(this._interactions.Delete);
    if (this._interactions.ModifySelect) this.getMap().addInteraction(this._interactions.ModifySelect);
  }
};
ol_control_EditBar.prototype.getInteraction = function (name) {
  return this._interactions[name];
};
ol_control_EditBar.prototype._getTitle = function (option) {
  return (option && option.title) ? option.title : option;
};
ol_control_EditBar.prototype._setSelectInteraction = function (options) {
  var self = this;

  // Sub bar
  var sbar = new ol_control_Bar();
  var selectCtrl;

  // Delete button
  if (options.interactions.Delete !== false) {
    if (options.interactions.Delete instanceof ol_interaction_Delete) {
      this._interactions.Delete = options.interactions.Delete;
    } else {
      this._interactions.Delete = new ol_interaction_Delete();
    }
    var del = this._interactions.Delete;
    del.setActive(false);
    if (this.getMap()) this.getMap().addInteraction(del);
    sbar.addControl (new ol_control_Button({
      className: 'ol-delete',
      title: this._getTitle(options.interactions.Delete) || "Delete",
      name: 'Delete',
      handleClick: function(e) {
        // Delete selection
        del.delete(selectCtrl.getInteraction().getFeatures());
        var evt = {
          type: 'select',
          selected: [],
          deselected: selectCtrl.getInteraction().getFeatures().getArray().slice(),
          mapBrowserEvent: e.mapBrowserEvent
        };
        selectCtrl.getInteraction().getFeatures().clear();
        selectCtrl.getInteraction().dispatchEvent(evt);
      }
    }));
  }

  // Info button
  if (options.interactions.Info !== false) {
    sbar.addControl (new ol_control_Button({
      className: 'ol-info',
      name: 'Info',
      title: this._getTitle(options.interactions.Info) || "Show informations",
      handleClick: function() {
        self.dispatchEvent({
          type: 'info',
          features: selectCtrl.getInteraction().getFeatures()
        });
      }
    }));
  }

  // Select button
  if (options.interactions.Select !== false) {
    if (options.interactions.Select instanceof ol_interaction_Select) {
      this._interactions.Select = options.interactions.Select
    } else {
      this._interactions.Select = new ol_interaction_Select({
        condition: ol_events_condition_click
      });
    }
    var sel = this._interactions.Select;
    selectCtrl = new ol_control_Toggle({
      className: 'ol-selection',
      name: 'Select',
      title: this._getTitle(options.interactions.Select) || "Select",
      interaction: sel,
      bar: sbar.getControls().length ? sbar : undefined,
      autoActivate:true,
      active:true
    });

    this.addControl(selectCtrl);
    sel.on('change:active', function() {
      sel.getFeatures().clear();
    });
  }
};
ol_control_EditBar.prototype._setEditInteraction = function (options) {
  if (options.interactions.DrawPoint !== false) {
    if (options.interactions.DrawPoint instanceof ol_interaction_Draw) {
      this._interactions.DrawPoint = options.interactions.DrawPoint;
    } else {
      this._interactions.DrawPoint = new ol_interaction_Draw({
        type: 'Point',
        source: this._source
      });
    }
    var pedit = new ol_control_Toggle({
      className: 'ol-drawpoint',
      name: 'DrawPoint',
      title: this._getTitle(options.interactions.DrawPoint) || 'Point',
      interaction: this._interactions.DrawPoint
    });
    this.addControl ( pedit );
  }

  if (options.interactions.DrawLine !== false) {
    if (options.interactions.DrawLine instanceof ol_interaction_Draw) {
      this._interactions.DrawLine = options.interactions.DrawLine
    } else {
      this._interactions.DrawLine = new ol_interaction_Draw ({
        type: 'LineString',
        source: this._source,
        // Count inserted points
        // geometryFunction: function(coordinates, geometry) {
        //   if (geometry) geometry.setCoordinates(coordinates);
        //   else geometry = new ol_geom_LineString(coordinates);
        //   this.nbpts = geometry.getCoordinates().length;
        //   return geometry;
        // }
      });
    }
    var ledit = new ol_control_Toggle({
      className: 'ol-drawline',
      title: this._getTitle(options.interactions.DrawLine) || 'LineString',
      name: 'DrawLine',
      interaction: this._interactions.DrawLine,
      // Options bar associated with the control
      bar: new ol_control_Bar ({
        controls:[
          new ol_control_TextButton({
            html: this._getTitle(options.interactions.UndoDraw) || 'undo',
            title: this._getTitle(options.interactions.UndoDraw) || "delete last point",
            handleClick: function() {
              if (ledit.getInteraction().nbpts>1) ledit.getInteraction().removeLastPoint();
            }
          }),
          new ol_control_TextButton ({
            html: this._getTitle(options.interactions.FinishDraw) || 'finish',
            title: this._getTitle(options.interactions.FinishDraw) || "finish",
            handleClick: function() {
              // Prevent null objects on finishDrawing
              if (ledit.getInteraction().nbpts>2) ledit.getInteraction().finishDrawing();
            }
          })
        ]
      })
    });

    this.addControl ( ledit );
  }

  if (options.interactions.DrawPolygon !== false) {
    if (options.interactions.DrawPolygon instanceof ol_interaction_Draw){
      this._interactions.DrawPolygon = options.interactions.DrawPolygon
    } else {
      this._interactions.DrawPolygon = new ol_interaction_Draw ({
        type: 'Polygon',
        source: this._source,
        // Count inserted points
        geometryFunction: function(coordinates :any[], geometry) {
          this.nbpts = coordinates[0].length;

          if (geometry) geometry.setCoordinates(coordinates[0].concat(coordinates[0][0]));
          else geometry = new ol_geom_Polygon(coordinates);
          return geometry;
        }
      });
    }
    this._setDrawPolygon(
      'ol-drawpolygon',
      this._interactions.DrawPolygon,
      this._getTitle(options.interactions.DrawPolygon) || 'Polygon',
      'DrawPolygon',
      options
    );
  }
  // Draw hole
  if (options.interactions.DrawHole !== false) {
    if (options.interactions.DrawHole instanceof ol_interaction_DrawHole){
      this._interactions.DrawHole = options.interactions.DrawHole;
    } else {
      this._interactions.DrawHole = new ol_interaction_DrawHole ();
    }
    this._setDrawPolygon(
      'ol-drawhole',
      this._interactions.DrawHole,
      this._getTitle(options.interactions.DrawHole) || 'Hole',
      'DrawHole',
      options
    );
  }
  // Draw regular
  if (options.interactions.DrawRegular !== false) {
    if (options.interactions.DrawRegular instanceof ol_interaction_DrawRegular) {
      this._interactions.DrawRegular = options.interactions.DrawRegular
    } else {
      this._interactions.DrawRegular = new ol_interaction_DrawRegular ({
        source: this._source,
        sides: 4
      });
    }
    var regular = this._interactions.DrawRegular;

    var div = document.createElement('DIV');

    var down = ol_ext_element.create('DIV', { parent: div });
    ol_ext_element.addListener(down, ['click', 'touchstart'], function() {
      var sides = regular.getSides() -1;
      if (sides < 2) sides = 2;
      regular.setSides (sides);
      text.textContent = sides>2 ? sides+' pts' : 'circle';
    }.bind(this));

    var text = ol_ext_element.create('TEXT', { html:'4 pts', parent: div });

    var up = ol_ext_element.create('DIV', { parent: div });
    ol_ext_element.addListener(up, ['click', 'touchstart'], function() {
      var sides = regular.getSides() +1;
      if (sides<3) sides=3;
      regular.setSides(sides);
      text.textContent = sides+' pts';
    }.bind(this));

    var ctrl = new ol_control_Toggle({
      className: 'ol-drawregular',
      title: this._getTitle(options.interactions.DrawRegular) || 'Regular',
      name: 'DrawRegular',
      interaction: this._interactions.DrawRegular,
      // Options bar associated with the control
      bar: new ol_control_Bar ({
        controls:[
          new ol_control_TextButton({
            html: div
          })
        ]
      })
    });
    this.addControl (ctrl);
  }
};
ol_control_EditBar.prototype._setDrawPolygon = function (className, interaction, title, name, options) {
  var fedit = new ol_control_Toggle ({
    className: className,
    name: name,
    title: title,
    interaction: interaction,
    // Options bar associated with the control
    bar: new ol_control_Bar({
      controls:[
        new ol_control_TextButton ({
          html: this._getTitle(options.interactions.UndoDraw) || 'undo',
          title: this._getTitle(options.interactions.UndoDraw) || 'undo last point',
          handleClick: function(){
            if (fedit.getInteraction().nbpts>1) fedit.getInteraction().removeLastPoint();
          }
        }),
        new ol_control_TextButton({
          html: this._getTitle(options.interactions.FinishDraw) || 'finish',
          title: this._getTitle(options.interactions.FinishDraw) || 'finish',
          handleClick: function() {
            // Prevent null objects on finishDrawing
            if (fedit.getInteraction().nbpts>3) fedit.getInteraction().finishDrawing();
          }
        })
      ]
    })
  });
  this.addControl (fedit);
  return fedit;
};
ol_control_EditBar.prototype._setModifyInteraction = function (options) {
  // Modify on selected features
  if (options.interactions.ModifySelect !== false && options.interactions.Select !== false) {
    if (options.interactions.ModifySelect instanceof ol_interaction_ModifyFeature) {
      this._interactions.ModifySelect = options.interactions.ModifySelect;
    } else {
      this._interactions.ModifySelect = new ol_interaction_ModifyFeature({
        features: this.getInteraction('Select').getFeatures()
      });
    }
    if (this.getMap()) this.getMap().addInteraction(this._interactions.ModifySelect);
    // Activate with select
    this._interactions.ModifySelect.setActive(this._interactions.Select.getActive());
    this._interactions.Select.on('change:active', function() {
      this._interactions.ModifySelect.setActive(this._interactions.Select.getActive());
    }.bind(this));
  }

  if (options.interactions.Transform !== false) {
    if (options.interactions.Transform instanceof ol_interaction_Transform) {
      this._interactions.Transform = options.interactions.Transform;
    } else {
      this._interactions.Transform = new ol_interaction_Transform ({
        addCondition: ol_events_condition_shiftKeyOnly
      });
    }
    var transform = new ol_control_Toggle ({
      html: '<i></i>',
      className: 'ol-transform',
      title: this._getTitle(options.interactions.Transform) || 'Transform',
      name: 'Transform',
      interaction: this._interactions.Transform
    });
    this.addControl (transform);
  }

  if (options.interactions.Split !== false) {
    if (options.interactions.Split instanceof ol_interaction_Split) {
      this._interactions.Split = options.interactions.Split;
    } else {
      this._interactions.Split = new ol_interaction_Split ({
          sources: this._source
      });
    }
    var split = new ol_control_Toggle ({
      className: 'ol-split',
      title: this._getTitle(options.interactions.Split) || 'Split',
      name: 'Split',
      interaction: this._interactions.Split
    });
    this.addControl (split);
  }

  if (options.interactions.Offset !== false) {
    if (options.interactions.Offset instanceof ol_interaction_Offset) {
      this._interactions.Offset = options.interactions.Offset;
    } else {
      this._interactions.Offset = new ol_interaction_Offset ({
          source: this._source
      });
    }
    var offset = new ol_control_Toggle ({
      html: '<i></i>',
      className: 'ol-offset',
      title: this._getTitle(options.interactions.Offset) || 'Offset',
      name: 'Offset',
      interaction: this._interactions.Offset
    });
    this.addControl (offset);
  }

};


