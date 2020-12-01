import React from 'react';
import './Wetter.css';
function getWeekdayName(number){
  let weekdays = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
  return weekdays[number];
}
export default class Weather extends React.Component{
  constructor(props){
    super(props);
    this.state={
      days:1,
      dayClass:"current",
      response: [],
      chosenItem: undefined
    }
  }
  componentDidMount(){
    if(this.props.lat && this.props.lon && this.props.apikey){
      let unit = (this.props.units?this.props.units:"metric");
      let lang = (this.props.lang?this.props.lang:"en");
      let url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + this.props.lat + "&lon=" + this.props.lon + "&exclude=hourly,minutely&appid=" + this.props.apikey + "&units=" + unit +"&lang=" + lang;
      fetch(url)
          .then(response => response.json())
          .then((res) => {this.setState({response:res.daily, chosenItem: res.daily[0]});}
          )
          .catch(err => {
            console.error(err);
          });
    }
  }
  updateDays(e,number){
    this.setState({days: number, dayClass: e.target.id});
    if(this.state.response.indexOf(this.state.chosenItem)<0 || this.state.response.indexOf(this.state.chosenItem)>=number){
      this.setState({chosenItem: this.state.response[0]})
    }
  }
  render(){
    let forecasts = [];
    let iconBase = this.props.iconBase?this.props.iconBase:"http://localhost:3030/";
    if(this.state.response.length >0){
      for (let i =0; i < this.state.days; i ++){
        forecasts.push(
            <Daily
                key={this.state.response[i].dt}
                className={"daily-forecast " + (this.state.chosenItem === this.state.response[i] ? "chosen" : "")}
                item ={this.state.response[i]}
                onClick={()=> {
                  this.setState({chosenItem: this.state.response[i]})
                }}
                exclude={this.props.exclude}
                iconBase={iconBase}
            />);
      }
      forecasts.push(<Daily
          key ="show"
          className="daily-forecast"
          id="show"
          iconBase={iconBase}
          item={this.state.chosenItem}
          exclude={this.props.exclude}
      />);
    }
    return <div className={"weather " + this.state.dayClass}>
      <div className="btn-group">
      <button onClick={(e) => {this.updateDays(e, 1)}} className={this.state.days ===1? "active": ""} id="current">
        Heute
      </button>
      <button onClick={(e)=> {this.updateDays(e, 3)}} className={this.state.days ===3? "active": ""} id="three">
        3-Tage
      </button>
      <button onClick={(e)=> {this.updateDays( e, 5)}} className={this.state.days ===5? "active": ""} id="five">
        5-Tage
      </button>
      <button onClick={(e)=> {this.updateDays(e, 8)}} className={this.state.days ===8? "active": ""} id="eight">
        8-Tage
      </button>
    </div>
      <div id="weather">
        {forecasts}
      </div>
    </div>;
  }
}
class Daily extends React.Component{
  render(){
    let sunrise = new Date(parseInt(this.props.item.sunrise)*1000);
    let sunset = new Date(parseInt(this.props.item.sunset)*1000);
    let date =new Date(parseInt(this.props.item.dt)*1000);
    let tempIcon ="temperature-warm.svg";
    if(parseFloat(this.props.item.temp.max) >= 25){
      tempIcon = "temperature-hot.svg";
    }
    if(parseFloat(this.props.item.temp.min) <= 10){
      tempIcon = "temperature-cold.svg";
    }
    return <div className={this.props.className} id={this.props.id} onClick={this.props.onClick}>
      <div className="weather-day">
        <div className="base">
          <img alt={this.props.item.weather[0].description} id="icon" src={this.props.iconBase+this.props.item.weather[0].icon + ".png"}/>
          <p id="date">{getWeekdayName(date.getDay())}</p>
        </div>
        <div className="extra">
          <p>
            <img alt={this.props.item.weather[0].description} className="icon" src={this.props.iconBase+this.props.item.weather[0].icon + ".png"}/>
            {this.props.item.weather[0].description}
          </p>
          {!this.props.exclude.includes("temperature")?
              <p><img alt="Temperature Icon" className="icon" src={this.props.iconBase + tempIcon}/>
                {this.props.item.temp.min + "° / " + this.props.item.temp.max + "°"}
              </p>
              :""}
          {!this.props.exclude.includes("rain")?
              <p><img alt="Rain Icon" className="icon" src={this.props.iconBase + "rain.svg"}/>
                {parseInt(parseFloat(this.props.item.pop)*100) + "%" +
                (this.props.item.rain?", " + this.props.item.rain+"mm":"")
                +(this.props.item.snow?", " + this.props.item.snow+"mm":"")}
              </p>
              :""}
          {!this.props.exclude.includes("wind")?
              <p><img alt="Wind Icon" className="icon" src={this.props.iconBase + "wind.svg"}/>
                {this.props.item.wind_speed + "m/s"}
              </p>
              :""}
          {!this.props.exclude.includes("sun")?
              <div>
              <p><img alt="Sunrise Icon" className="icon" src={this.props.iconBase + "sunrise.svg"}/>
                {sunrise.getHours() + ":" + (sunrise.getMinutes() <10? "0":"") + sunrise.getMinutes()}
              </p>
              <p><img alt="Sunset Icon" className="icon" src={this.props.iconBase + "sunset.svg"}/>
                {sunset.getHours() + ":" + (sunset.getMinutes() <10? "0":"")+ sunset.getMinutes()}
              </p>
              </div>
              :""}
        </div>
      </div>
    </div>
  }
}
