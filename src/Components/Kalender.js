import React from 'react';
import './Kalender.css';

function getMonthName(number){
  let month = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return month[number];
}

function getWeekdayName(number){
  let weekdays = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
  return weekdays[number];
}

export default class Calendar extends React.Component{
  constructor(props){
    super(props);
    this.state={
      startDate: new Date(),
    }
  }

  onCalendarChange(next){
    let tmp = new Date(this.state.startDate.getTime());
    let factor = (next ? 1 : -1);
    switch(this.props.mode){
      case "day":
        this.setState({startDate: new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate() + 1*factor)});
        break;
      case "week":
        this.setState({startDate: new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate() + 7*factor)});
        break;
      case "month":
        this.setState({startDate: new Date(tmp.getFullYear(), tmp.getMonth()+1*factor)});
        break;
      default:
        this.setState({startDate: new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate() + 1*factor)});
        break;
    }
  }

  render(){
    let firstWeekDay = (this.props.firstDay!==undefined?this.props.firstDay:1);
    const days = [];
    switch(this.props.mode){
      case "day":
        days.push(this.state.startDate);
        break;
      case "week":
        let firstDay = new Date(this.state.startDate.getTime());
        while(firstDay.getDay()!== firstWeekDay){
          firstDay.setDate(firstDay.getDate() - 1);
        }
        while(days.length < 7){
          days.push(new Date(firstDay.getTime()));
          firstDay.setDate(firstDay.getDate()+1);
        }
        break;
      case "month":
        let first = new Date(this.state.startDate.getFullYear(), this.state.startDate.getMonth(), 1);
        while(first.getDay()!== firstWeekDay){
          first.setDate(first.getDate() - 1);
        }
        while(first.getMonth()===this.state.startDate.getMonth() || first.getMonth()===(this.state.startDate.getMonth()>0?this.state.startDate.getMonth()-1:11)){
          days.push(new Date(first.getTime()));
          first.setDate(first.getDate()+1);
        }
        break;
      default:
        days.push(this.state.startDate);
        break;
    }
    let calendar = days.map((date) =>
        <Day
            key={date.getDate().toString()+"-"+date.getMonth().toString()}
            events ={this.props.events}
            date={date}
            oldMonth={date.getMonth() < this.state.startDate.getMonth() || (this.state.startDate.getMonth()===0 && date.getMonth()===11)}
        />
    );
    let weekdays = [];
    for(let i=0; i < (this.props.mode==="day"?1:7); i++){
      weekdays.push(<div key={getWeekdayName(days[i].getDay())} className="date week-day">{getWeekdayName(days[i].getDay())}</div>);
    }
    return<div className={"calendar " + this.props.mode + " firstDay-" + firstWeekDay}>
      <header>
        <button className="before" onClick={this.onCalendarChange.bind(this,false)}>
          <svg height="25" width="15">
            <polygon points="15,25 0,12 15,0" style={{fill:"#fff"}} />
            Before
          </svg>
        </button>
        <p>{getMonthName(this.state.startDate.getMonth()) + " " + this.state.startDate.getFullYear()}</p>
        <button className="next" onClick={this.onCalendarChange.bind(this,true)}>
          <svg height="25" width="15">
            <polygon points="0,25 15,12 0,0" style={{fill:"#fff"}} />
            Next
          </svg>
        </button>
      </header>
      {weekdays}
      {calendar}
    </div>;
  }
}
class Day extends React.Component{

  render(){
    const date = this.props.date;
    const events = this.props.events;

    let today = new Date();
    let dayClass = "date " + (this.props.oldMonth?"oldMonth ":" ");
    if(date.getDate() === today.getDate() && date.getMonth() === today.getMonth()){
      dayClass += " today";
    }
    for(let i = 0; i< events.length; i++){
      if(date.getDate()=== parseInt(events[i].day) && date.getMonth()+1=== parseInt(events[i].month) && date.getFullYear()=== parseInt(events[i].year)){
        dayClass += " event";
        return <Event classes={dayClass} info={events[i]} date={date}/>;
      }
    }
    return <div className={dayClass}>{this.props.date.getDate()}</div>;
  }
}
class Event extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      infoShow : false
    }
  }
  render(){
    let infoClass = "info ";
    if(this.state.infoShow){
      infoClass += "show";
    }
    return <div onClick={()=> this.setState({infoShow: !this.state.infoShow})}
                className={this.props.classes + " weekday-" + this.props.date.getDay()}> {this.props.info.day}
      <p className="name">{this.props.info.name}</p>
      <div className={infoClass}>
        <p className="title">{this.props.info.name}</p>
        {this.props.info.description.trim()?
            <p className="description">
              {this.props.info.description}<br/><br/>
              {this.props.info.link.trim()? <a className="btn btn-dark" href={this.props.info.link} target="_blank" rel="noopener noreferrer">Mehr erfahren</a>: " "}
            </p>
            : <p className="description">
              {this.props.info.link.trim()?
                  <a className="btn btn-dark" href={this.props.info.link} target="_blank" rel="noopener noreferrer">
                    Mehr erfahren
                  </a>
                  : " "}
            </p>}
      </div>
    </div>
  }
}