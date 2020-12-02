import React from 'react';
import 'here-js-api/scripts/mapsjs-core';
import 'here-js-api/scripts/mapsjs-service';
import 'here-js-api/scripts/mapsjs-ui';
import 'here-js-api/scripts/mapsjs-mapevents';
import 'here-js-api/scripts/mapsjs-clustering';
import 'here-js-api/styles/mapsjs-ui.css';
import './Anfahrt.css'
export default class MapRoute extends React.Component {
  constructor(props){
    super(props);
    this.drawRoute = this.drawRoute.bind(this);
    this.input = React.createRef();
    this.mapRef = React.createRef();
    this.platform= undefined;
    this.map = undefined;
    this.icon = undefined;
    this.state = {
      // The map instance to use during cleanup
      map: null,
      origin:props.origin,
      destination:props.destination,
      duration:""
    };
  }
  componentDidMount() {
    const H = window.H;
    const platform = new H.service.Platform({
      apikey: this.props.apiKey
    });
    this.platform= platform;
    const defaultLayers = platform.createDefaultLayers();
    let layer;
    if(this.props.mapLayer !== "Satellite"){
      layer =defaultLayers.vector.normal.map;
    }else{
      layer = defaultLayers.raster.satellite.map
    }
    // Create an instance of the map
    const map = new H.Map(
        this.mapRef.current,
        layer,
        {
          // This map is centered over Europe
          center: { lat: 50, lng: 5 },
          zoom: 4,
          pixelRatio: window.devicePixelRatio || 1
        }
    );
    this.map = map;
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map))
    if(this.props.uiLayer){
      var ui = H.ui.UI.createDefault(map, defaultLayers, 'de-DE');
    }
    this.setState({ map });
    if(this.props.icon){
      this.icon = new H.map.Icon(this.props.icon);
    }
    this.drawRoute("",this.state.origin);
  }
  drawRoute(oldOg, og){
    let platform = this.platform;
    let map = this.map;
    let H = window.H;
    let icon = this.icon;
    let adr = og;
    if(oldOg){
      for (let obj of map.getObjects()){
        if(obj.id === oldOg){
          map.removeObject(obj);
        }
      }
    }
      if (adr && adr.trim()){
          let origin;
          let destination;
          let onError = (error) => {
              alert(error.message);
          }
// create an instance of the routing service and make a request
          let router = platform.getRoutingService(null, 8);
          let color = this.props.lineColor!=undefined?this.props.lineColor:"blue";
// Define a callback function to process the routing response:
          let onResult = function (result) {
              // ensure that at least one route was found
              if (result.routes.length) {
                  result.routes[0].sections.forEach((section) => {
                      let duration = (new Date(section.arrival.time).getTime() - new Date(section.departure.time).getTime()) / 3600000;
                      duration = duration - (duration % 1) + "h " + Math.round((duration%1)*60) +"min";
                      this.setState({duration: <p className="overlay">{duration}</p>});
                      // Create a linestring to use as a point source for the route line
                      let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);
                      // Create a polyline to display the route:
                      let routeLine = new H.map.Polyline(linestring, {
                          style: {strokeColor: color, lineWidth: 3}
                      });
                      routeLine.id = adr;
                      // Create a marker for the start point:
                      let startMarker = new H.map.Marker(section.departure.place.location, {icon: icon});
                      startMarker.id = adr;
                      // Create a marker for the end point:
                      let endMarker = new H.map.Marker(section.arrival.place.location, {icon: icon});
                      endMarker.id = adr;
                      // Add the route polyline and the two markers to the map:
                      map.addObjects([routeLine, startMarker, endMarker]);
                      // Set the map's viewport to make the whole route visible:
                      map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
                  });
              }
          };
          let routingParameters = {
              'transportMode': 'car',
              // Include the route shape in the response
              'return': 'polyline'
          };
// Define a callback that calculates the route
          let calculateRoute = () => {
              // Make sure that both destination and origin are present
              if (!origin || !destination) return;
              // Add origin and destination to the routing parameters
              routingParameters.origin = origin;
              routingParameters.destination = destination;
              router.calculateRoute(routingParameters, onResult.bind(this), onError);
          }
// get the instance of the Search service
          var service = platform.getSearchService();
// geocode origin point
          service.geocode({
              q: adr
          }, (result) => {
              origin = result.items[0].position.lat + ',' + result.items[0].position.lng;
              calculateRoute();
          }, onError);
// geocode a destination point
          service.geocode({
              q: this.state.destination
          }, (result) => {
              destination = result.items[0].position.lat + ',' + result.items[0].position.lng;
              calculateRoute();
          }, onError)
      }else{
          this.setState({duration:""});
          let makeMarker = (goal) => {
              let endMarker = new H.map.Marker(goal,{icon:icon});
              endMarker.id = adr;
              map.addObject(endMarker);
              map.setCenter(goal);
          }
          let service = platform.getSearchService();
          service.geocode({
              q: this.state.destination
          }, (result) => {
              let center = result.items[0].position;
              this.map.setZoom(10);
              makeMarker(center);
          }, alert);
      }
  }
  componentWillUnmount() {
    // Cleanup after the map to avoid memory leaks when this component exits the page
    this.state.map.dispose();
  }
  handleSubmit(event){
    this.setState({oldOrigin: this.state.origin, origin:this.input.current.value});
    event.preventDefault();
    if(this.state.origin!==this.input.current.value){
        this.drawRoute(this.state.origin,this.input.current.value);
    }
  }
  render() {
    let startVal = "Startpunkt";
    if(this.props.origin){
      startVal = this.props.origin;
    }
    return (
        <div className="map w-100">
          <form onSubmit={this.handleSubmit.bind(this)} >
            <input className="form-control" ref={this.input}  type="text" name="name" defaultValue={startVal}/>
            <button type="submit" value="Route starten" >Route starten</button>
          </form>
            {this.state.duration}
          <div id="test" ref={this.mapRef} style={{ height: "500px", width:"100%" }} />
        </div>
    );
  }
}
