function getMonthName(number){
    let month = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
    return month[number];
}

function getWeekdayName(number){
    let weekdays = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];
    return weekdays[number];
}

let tmpl = document.createElement('template');
tmpl.innerHTML = `<style>
:host{
    display:block;
}
.calendar{
    display:flex;
    width:100%;
    max-width:100%;
    align-items: center;
    flex-wrap:wrap;
    position: relative;
    padding: 2em 1em;
    box-sizing:border-box;
}
.calendar header{
    background:var(--header-background,#8D99AE);
    height: auto;
    width:100%;
    display:flex;
    justify-content: space-between;
    align-items: center;
    padding: .5em;
}
.calendar header button{
    width:auto;
    content:none;
}
.calendar header p{
    margin:0 !important;
    font-size:1.3em;
    color:white;
}
button.before, button.next, button.before:hover, button.next:hover{
    background:transparent;
    border:none;
}
.date{
    padding:0.4em;
    min-width: 14%;
    font-size: 1.3em;
    text-align: center;
    display:flex;
    justify-content: center;
    align-content: end;
    position:relative;
    box-sizing:border-box;
}
.date.today{
    color:red;
}
.date.week-day{
    font-size: 0.8em;
    margin-top: 1.5em;
}
.date.event{
    background: var(--event-background, #8D99AE);
}
.date.event:hover{
    background: var(--event-hover-background, #8D9999);
    cursor:pointer;
}
calendar-event p{
    margin-top:0;
}
calendar-event .description{
    font-size: 0.7em;
    text-align: left;
}
.btn-dark {
    color: #fff;
    background-color: var(--btn, #8D99AE);
    border-color: var(--btn, #8D99AE);
}
.btn-dark:hover {
    color: #fff;
    background-color: var(--btn-hover, #5D6B83);
    border-color: var(--btn-hover, #5D6B83);
    text-decoration: none;
}
.btn {
    border: 1px solid transparent;
    padding: .375rem .75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: .25rem;
    text-decoration: none;
}
.month .date.oldMonth{
    color:rgba(0,0,0,0.3);
}
.day.calendar .date{
    width:100%;
    font-size:4em;
    padding:1em;
}

.day.calendar .date.week-day{
    font-size:1.5em;
    position: absolute;
    left:0%;
    top:15%;
    z-index:100;
}
.day.calendar .date .name{
    top:auto;
    bottom:0%;
    margin-bottom:0.5em;
}
@media(max-width:376px){
    .date{
        font-size:1em;
    }
    .date.week-day{
        font-size: 0.6em;
    }
    .calendar header p{
        font-size: 1.1em;
    }
}
@media(max-width:285px){
    .date{
        font-size:0.8em;
    }
    .date.week-day{
        font-size: 0.5em;
    }
    .calendar header p{
        font-size: 1em;
    }
}
</style>
<div class="calendar">
      <header>
        <button class="before">
          <svg height="25" width="15">
            <polygon points="15,25 0,12 15,0" style="fill: #fff" />
            Before
          </svg>
        </button>
        <p id="month">Monat Jahr</p>
        <button class="next">
          <svg height="25" width="15">
            <polygon points="0,25 15,12 0,0" style="fill: #fff" />
            Next
          </svg>
        </button>
      </header>
    </div>`;
class Calendar extends HTMLElement {
    constructor() {
        super();
        const shadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.appendChild(tmpl.content.cloneNode(true));
    }
    connectedCallback(){
        this.startDate = new Date();
        this.calendar= this.shadowRoot.querySelector(".calendar");
        this.calendar.setAttribute("class", "calendar " + this.mode.toString() + " firstDay-" + this.firstWeekDay);
        this.shadowRoot.getElementById("month").innerText=getMonthName(this.startDate.getMonth()) + " " + this.startDate.getFullYear();
        this.shadowRoot.querySelector(".next").onclick= this.onCalendarChange.bind(this,true);
        this.shadowRoot.querySelector(".before").onclick= this.onCalendarChange.bind(this,false);
        this.events = [{name:"Wegen Corona geschlossen",day:"1",month:"12",year:"2020",
            description:"Bahn auf behördliche Anordnung wegen Corona nicht in Betrieb", link:"https://hochgrat.de"}];
        if(this.getAttribute("eventLink")){
            fetch(this.getAttribute("eventLink"))
                .then(response => response.json())
                .then(data => {
                    if(data.events){
                        this.events = data.events;
                    }
                    this.deleteDays();
                    this.createDays();
                });
        }
        this.createDays();
    }
    onCalendarChange(next){
        let tmp = new Date(this.startDate.getTime());
        let factor = (next ? 1 : -1);
        switch(this.mode){
            case "day":
                this.startDate = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate() + 1*factor);
                break;
            case "week":
                this.startDate = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate() + 7*factor);
                break;
            case "month":
            default:
                this.startDate = new Date(tmp.getFullYear(), tmp.getMonth()+1*factor);
                break;
        }
        this.changeHeader();
        this.deleteDays();
        this.createDays();
    }
    get mode() {
        return this.getAttribute('mode') || "month";
    }
    set mode(val){
        this.setAttribute('mode',val);
    }
    get firstWeekDay() {
        return (this.getAttribute('first')?parseInt(this.getAttribute('first')):1);
    }
    set firstWeekDay(val){
        this.setAttribute('first',val);
    }
    changeHeader(){
        this.shadowRoot.getElementById("month").innerText=getMonthName(this.startDate.getMonth()) + " " + this.startDate.getFullYear();
    }
    deleteDays(){
        let oldDays = this.shadowRoot.querySelectorAll('.date, calendar-event');
        for(let i=0; i< oldDays.length; i++){
            oldDays[i].remove();
        }
    }
    createDays(){
        const days = [];
        switch(this.mode){
            case "day":
                days.push(this.startDate);
                break;
            case "week":
                let firstDay = new Date(this.startDate.getTime());
                while(firstDay.getDay()!== this.firstWeekDay){
                    firstDay.setDate(firstDay.getDate() - 1);
                }
                while(days.length < 7){
                    days.push(new Date(firstDay.getTime()));
                    firstDay.setDate(firstDay.getDate()+1);
                }
                break;
            case "month":
            default:
                let first = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1);
                while(first.getDay()!== this.firstWeekDay){
                    first.setDate(first.getDate() - 1);
                }
                while(first.getMonth()===this.startDate.getMonth() || first.getMonth()===(this.startDate.getMonth()>0?this.startDate.getMonth()-1:11)){
                    days.push(new Date(first.getTime()));
                    first.setDate(first.getDate()+1);
                }
                break;
        }
        for(let i=0; i < (this.mode==="day"?1:7); i++){
            let weekday = document.createElement('div');
            weekday.setAttribute("class", "date week-day");
            weekday.textContent=getWeekdayName(days[i].getDay());
            this.calendar.appendChild(weekday);
        }
        let today = new Date();
        for(let i =0; i < days.length; i ++){
            let dayClass = "date ";
            if(days[i].getDate() === today.getDate() && days[i].getMonth() === today.getMonth()){
                dayClass += " today";
            }
            if(days[i].getMonth() < this.startDate.getMonth() || (this.startDate.getMonth()===0 && days[i].getMonth()===11)){
                dayClass +=" oldMonth"
            }
            let ev = [];
            for(let j = 0; j< this.events.length; j++){
                if(days[i].getDate()=== parseInt(this.events[j].day) && (days[i].getMonth()+1)=== parseInt(this.events[j].month) && days[i].getFullYear()=== parseInt(this.events[j].year)){
                    ev.push(this.events[j]);
                }
            }
            if(ev.length>0){
                dayClass += " " + this.mode + " firstDay-" + this.firstWeekDay;
                let event = document.createElement('calendar-event');
                event.setAttribute("weekday",days[i].getDay());
                event.setAttribute("classes",dayClass);
                let date = document.createElement("p");
                date.setAttribute("slot","date");
                date.innerText=ev[0].day;
                event.appendChild(date);
                let name = "";
                let info = document.createElement("div");
                info.setAttribute("slot","info");
                for(let j=0; j<ev.length;j++){
                    name+= " " + ev[j].name + " ";
                    let eventInfo = document.createElement("event-info");
                    let title = document.createElement("p");
                    title.setAttribute("slot","title");
                    title.innerText=ev[j].name;
                    eventInfo.appendChild(title);
                    if(ev[j].description.trim()){
                        let description = document.createElement("p");
                        description.setAttribute("slot","description");
                        description.innerText=ev[j].description;
                        if(ev[j].link.trim()){
                            description.appendChild(document.createElement("br"));
                            description.appendChild(document.createElement("br"));
                        }
                        eventInfo.appendChild(description);
                    }
                    if(ev[j].link.trim()){
                        let link = document.createElement("a");
                        link.setAttribute("slot","link");
                        link.setAttribute("href",ev[j].link);
                        link.setAttribute("target","_blank");
                        link.setAttribute("rel", "noopener norefferer");
                        link.setAttribute("class","btn btn-dark");
                        link.innerText="Mehr erfahren";
                        eventInfo.appendChild(link);
                    }
                    info.appendChild(eventInfo);
                }
                event.appendChild(info);
                if(name.length>14){
                    name=name.slice(0,14)+"...";
                };
                let nameSlotable = document.createElement("p");
                nameSlotable.innerText= name;
                nameSlotable.setAttribute("slot","name");
                event.appendChild(nameSlotable);
                this.calendar.appendChild(event);
            }else{
                let day = document.createElement('div');
                day.setAttribute("class", dayClass);
                day.textContent = days[i].getDate();
                this.calendar.appendChild(day);
            }
        }
    }
}
window.customElements.define('event-calendar', Calendar);
let evTempl = document.createElement('template');
evTempl.innerHTML= `
<style>
.date{
    padding:0.4em;
    min-width: 14%;
    font-size: 1.3em;
    text-align: center;
    display:flex;
    justify-content: center;
    align-content: end;
    position:relative;
    box-sizing:border-box;
}
.date.today{
    color:var(--today,blue);
}
.date.week-day{
    font-size: 0.8em;
    margin-top: 1.5em;
}
.date.event{
    background: var(--event-background);
}
.date.event:hover{
    background: var(--event-hover-background);
    cursor:pointer;
}
:host(.date.event) .info{
    color:black;
    font-weight:normal;
    display:none;
    position:absolute;
    min-width:200px;
    top:100%;
    z-index:1000;
    font-size:1em;
    line-height:1.1em;
    padding:1em;
    background:white;
    border-radius:3px;
    box-shadow: 0px 0px 10px 10px rgba(0,0,0,0.05);
    box-sizing:border-box;
}
:host(.date.event) p{
    margin-top:0;
}
:host(.date.event) .name{
    color:black;
    position:absolute;
    font-size:0.5em;
    top:100%;
    max-width:100%;
    line-height:1em;
    text-overflow: ellipsis;
}
:host(.date.event) .info.show{
    display:table;
}
:host(.date.event.month) .name{
    display:none;
}
:host(.date.oldMonth){
    color:rgba(0,0,0,0.3);
}
:host(.date.day) .name{
    top:auto;
    bottom:0%;
    margin-bottom:0.5em;
}
:host(.date.event.day) .info{
    width:100%;
    height:fit-content;
    font-size:0.3em;
    bottom:0;
}
::slotted(p){
margin:0;
}
p{
margin-top:0;
}
@media(max-width:567px){  /*Bootstrap Size S*/
    :host(.date.event.weekday-1.firstDay-1) .info.show,
    :host(.date.event.weekday-0.firstDay-0) .info.show{
        left:0;
    }
    :host(.date.event.weekday-0.firstDay-1) .info.show,
    :host(.date.event.weekday-6.firstDay-0) .info.show{
        right:0
    }
}
@media(max-width:285px){
    :host(.date.event.weekday-2.firstDay-1) .info.show,
    :host(.date.event.weekday-1.firstDay-0) .info.show{
        left:0;
    }
    :host(.date.event.weekday-6.firstDay-1) .info.show,
    :host(.date.event.weekday-5.firstDay-0) .info.show{
        right:0
    }
}
@media(min-width:1200px){
    :host(.date.event) .info.show{
        min-width:400px;
    }
</style>
 <span><slot name="date">0</slot></span>
      <p class="name"><slot name="name">Name needed</slot></p>
      <slot name="info" class="info">
      </slot>`;
class Event extends HTMLElement{
    constructor(props){
        super(props);
        const shadowRoot = this.attachShadow({mode:'open'});
        shadowRoot.appendChild(evTempl.content.cloneNode(true));
    }
    get classes(){
        return this.getAttribute("classes")||"";
    }
    set classes(val){
        this.setAttribute('classes',val);
    }
    get weekday(){
        return this.getAttribute("weekday")||"";
    }
    set weekday(val){
        this.setAttribute('weekday',val);
    }
    connectedCallback(){
        this.setAttribute('class', this.classes + " event weekday-"+ this.weekday);
        this.onclick=this.toggleInfo;
    }
    toggleInfo(){
        if(this.shadowRoot.querySelector('.info').getAttribute('class').includes("show",0)){
            this.shadowRoot.querySelector('.info').setAttribute('class','info');
        }else{
            this.shadowRoot.querySelector('.info').setAttribute('class','info show');
        }
    }
}
window.customElements.define('calendar-event', Event);
let infoTempl = document.createElement('template');
infoTempl.innerHTML = `
    <style>
    .description{
        font-size: 0.7em;
        text-align: left;
    }
    .btn-dark {
        color: #fff;
        background-color: var(--btn);
        border-color: var(--btn);
    }
    .btn-dark:hover {
        color: #fff;
        background-color: var(--btn-hover);
        border-color: var(--btn-hover);
        text-decoration: none;
    }
    .btn {
        border: 1px solid transparent;
        padding: .375rem .75rem;
        font-size: 1rem;
        line-height: 1.5;
        border-radius: .25rem;
        text-decoration: none;
    }
    ::slotted(p){
        margin:0;
    }
    p{
    margin-top:0;
    }  
    </style>
    <p class="title"><slot name="title"></slot></p>
    <p class="description">
        <slot name="description"></slot>
        <slot name="link" class="btn btn-dark"></slot>
    </p>`;
class Info extends HTMLElement{
    constructor(props){
        super(props);
        const shadowRoot = this.attachShadow({mode:'open'});
        shadowRoot.appendChild(infoTempl.content.cloneNode(true));
    }
}
window.customElements.define('event-info', Info);