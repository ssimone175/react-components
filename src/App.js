import React from 'react';
import './App.css';
import Kalender from "./Components/Kalender";
import Anfahrt from "./Components/Anfahrt";
import Wetter from "./Components/Wetter";
import icon from "./map_icon.png"

function App() {
    return (

        <main>
            <section id="kalender" className="container">
                <div className="row align-items-center">
                    <div className="col-md-5 text-md-right">
                        <h2>Jede Menge spannender Events</h2>
                        <div>hier Komponenten einfügen</div>
                    </div>
                    <div className="offset-md-1 col-md-6 mt-5 mt-md-0">
                        <div className="card h-100 mh-200">
                            <Kalender/>
                        </div>
                    </div>
                </div>
            </section>
            <div className="bg-lightgray">
                <section id="wetter" className="container">
                    <div className="row align-items-center">
                        <div className="col-md-5 offset-md-1 order-md-last">
                            <h2>Aktuelles Wetter</h2>
                            <div>hier Komponenten einfügen</div>
                        </div>
                        <div className="col-md-6 mt-md-0 mt-5">
                            <div className="card h-100 mh-200">
                                <Wetter/>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <section id="anfahrt" className="container">
                <div className="col-md-10 mx-auto text-center">
                    <h2>So finden Sie uns</h2>
                    <div>hier Komponenten einfügen</div>
                </div>
                <div className="col-md-8 mx-auto mt-5">
                    <div className="card mh-200">
                        <Anfahrt
                            origin="Pfaffenriederstraße 6 88410 Bad Wurzach"
                            destination="Hochgrat Bayern"
                            apiKey="om3n1r09-nhi9VtVkpc8mB6VbRghKiATYoeRxP-AjOc"
                            lineColor="green"
                            icon={icon}
                            uiLayer={true}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

export default App;