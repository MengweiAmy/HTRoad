  window.app = {};
  var app = window.app;
  var layers = [];
  function init()
  {
  	app.switchMapControl = function(opt_options)
  	{
  		var options = opt_options || {};
        this.extent_ = options.extent;

        var anchor = document.createElement('a');
        anchor.href = '#switch-to';
        anchor.className = 'switch-to';
        anchor.innerHTML = 'S';

        var this_ = this;
        var handleSwitchTo = function (e) {
            this_.handleSwitchTo(e);
        };

        anchor.addEventListener('click', handleSwitchTo, false);
        anchor.addEventListener('touchstart', handleSwitchTo, false);

        var element = document.createElement('div');
        element.className = 'zoom-extent ol-unselectable';// 
        element.style = 'margin-top: 100px';
        element.appendChild(anchor);

        ol.control.Control.call(this, {
            element: element,
            map: options.map,
            target: options.target
        });
  	};
  	ol.inherits(app.switchMapControl, ol.control.Control);

  	 /**
     * @param {Event} e Browser event.
     */
    app.switchMapControl.prototype.handleSwitchTo = function (e) {
        // prevent #zoomTo anchor from getting appended to the url
        e.preventDefault();
        if(currentVisiblePage == layers[2]) 
        {
          layers[2].setVisible(false);
          layers[0].setVisible(true);
          currentVisiblePage = layers[0];
        }else 
        {
          layers[2].setVisible(true);
          layers[0].setVisible(false);
          currentVisiblePage = layers[2];
        }

        //var map = this.getMap();
        //var view = map.getView();
        //view.fit(this.extent_, map.getSize());
    };

    /**
     * Overload setMap to use the view projection's validity extent
     * if no extent was passed to the constructor.
     * @param {ol.Map} map Map.
     */
    app.switchMapControl.prototype.setMap = function (map) {
        ol.control.Control.prototype.setMap.call(this, map);
        if (map && !this.extent_) {
            this.extent_ = map.getView().getProjection().getExtent();
        }
    };

    var vectorSource = new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url:function(extent) {
          //return 'http://192.168.2.2:8080/geoserver/hots/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hots:coverage&maxFeatures=50&outputFormat=application%2Fjson&srsname=EPSG:3857&' +
             // 'bbox=12.4830761,55.751412,12.5381576,55.7965966';
              
          return 'http://192.168.2.2:8080/geoserver/hots/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=hots:coverage&&maxFeatures=10000&outputFormat=application%2Fjson'
        },
        strategy: ol.loadingstrategy.bbox
  	});

    var vector = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 255, 0.3)',
            width: 1
          }),
        })
      });

    var featureLayer = new ol.layer.Tile({
            title: 'Global Imagery',
            source: new ol.source.TileWMS({
              url: 'https://ahocevar.com/geoserver/wms',
              params: {LAYERS: 'nasa:bluemarble', TILED: true}
            })
    })



      layers.push(new ol.layer.Tile({
          visible: false,
          preload: Infinity,
          source: new ol.source.BingMaps({
            key: 'IwtMQYdndTHkOEOUVuK8~HvVz2da1-fBboISbDIDtpQ~AiF65iPwGSBmUXejSa0Za0vkXyCAYP5rULM8KW0IikKZJUWARW9OpDMxBxmA8W4f',
            imagerySet: 'Aerial'
            // use maxZoom 19 to see stretched tiles instead of the BingMaps
            // "no photos at this zoom level" tiles
            // maxZoom: 19
          })
      }),vector);

      layers.push(new ol.layer.Tile({
          visible: false,
          preload: Infinity,
          source: new ol.source.OSM()
      }),vector);

      var wms_source = new ol.source.TileWMS({
          url: 'http://192.168.2.2:8080/geoserver/hots/wms',
          params: {
              'LAYERS': 'hots:lyngby2_badness_raster'
          }
      });
      var wms_layer = new ol.layer.Tile({
          source:  wms_source
      });
      
      layers.push(wms_layer);   

    var map = new ol.Map({
  	   controls: ol.control.defaults({}, []),
       layers: layers,
        target: 'map',
        view: new ol.View({
          center: ol.proj.transform([12.568337,55.676097], 'EPSG:4326', 'EPSG:3857'),
          zoom: 11,
          maxZoom: 18,
          minZoom: 3
        })
    });

     map.addControl(
    	new app.switchMapControl({
        extent: [1424939.0812922558, 6857318.681519732, 1571392.4274866534, 6918468.304147873]
     }));

     layers[2].setVisible(true);
     currentVisiblePage = layers[2];
     // generate a GetFeature request
      
     var featureRequest = new ol.format.WFS().writeGetFeature({
        srsName: 'EPSG:3857',
        featureNS: 'http://openstreemap.org',
        featurePrefix: 'osm',
        featureTypes: ['coverage'],//'residential','unclassified','secondary','motorway','tertiary'
        outputFormat: 'application/json',
        //filter: ol.format.filter.like('score', '1')
         // ol.format.filter.like('score', '1'),// filter the score
         // ol.format.filter.like('type', 'residential') 'residential','unclassified','secondary','motorway','tertiary'
        //)
      });
      
      // then post the request and add the received features to a layer
      fetch('https://ahocevar.com/geoserver/wfs', {//
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
      }).then(function(response) {
        return response.json();
      }).then(function(json) {
        var features = new ol.format.GeoJSON().readFeatures(json);
        vectorSource.addFeatures(features);
        map.getView().fit(vectorSource.getExtent(), /** @type {ol.Size} */ (map.getSize()));
      });
  }