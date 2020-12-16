import React from 'react';
import './App.css';
import Kalender from "./Components/Kalender";
import Anfahrt from "./Components/Anfahrt";
import Wetter from "./Components/Wetter";
import icon from "./map_icon.png"

export default class App extends React.Component {
    constructor(props){
        super(props);
        this.state={
            response:[],
        }
    }
    componentDidMount() {
        this.setState({response: [{name:"Wegen Corona geschlossen",day:"1",month:"12",year:"2020",
                description:"Bahn auf behördliche Anordnung wegen Corona nicht in Betrieb", link:"https://hochgrat.de"}]});

        fetch('http://localhost:3030/events')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.setState({response: data.events});
            });
    }
    render(){
        return <main>
            <section id="wetter" className="container">
                <div className="row align-items-center">
                    <div className="col-md-5 offset-md-1 order-md-last">
                        <h2>Aktuelles Wetter</h2>
                        <div>Touren auf dem Hochgrat sollten an die Wetterverhältnisse angepasst werden</div>
                    </div>
                    <div className="col-md-6 mt-md-0 mt-5">
                        <div className="card h-100 mh-200">
                            <Wetter
                                lat="47.554192"
                                lon="10.022790"
                                apikey="751b6ffac26be0a1d11e0531a245bab0"
                                lang="de"
                                units="metric"
                            />
                        </div>
                    </div>
                </div>
            </section>
            <div className="bg-lightgray">
                <section id="kalender" className="container">
                    <div className="row align-items-center">
                        <div className="col-md-5 text-md-right">
                            <h2>Einzigartige Erlebnisse</h2>
                            <div>Diese Events finden in nächster Zeit auf dem Hochgrat statt</div>
                        </div>
                        <div className="offset-md-1 col-md-6 mt-5 mt-md-0">
                            <div className="card h-100 mh-200">
                                <Kalender
                                    events={this.state.response}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <section id="anfahrt" className="container">
                <div className="col-md-10 mx-auto text-center">
                    <h2>So finden Sie uns</h2>
                    <p>Besuchen Sie uns im Allgäu</p>
                </div>
                <div className="col-md-8 mx-auto mt-5">
                    <div className="card h-500">
                        <Anfahrt
                            destination="Steibis Bayern"
                            apiKey="om3n1r09-nhi9VtVkpc8mB6VbRghKiATYoeRxP-AjOc"
                            lineColor="green"
                            icon={icon}
                            uiLayer={true}
                            height="428px"
                        />
                    </div>
                </div>
            </section>
        </main>
    }
}