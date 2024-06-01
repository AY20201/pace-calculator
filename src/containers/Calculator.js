import React, { useState } from "react";
import styles from '../styles.module.css'

const unitConversions = {
    "MILESMETERS": 1609.34,
    "METERSMILES": 0.000621371,
    "KMMETERS": 1000,
    "METERSKM": 0.001,
    "MILESKM": 1.60934,
    "KMMILES": 0.621371,
    "METERSMETERS" : 1,
    "MILESMILES" : 1,
    "KMKM" : 1
}

export default function Calculator(){

    const [time, setTime] = useState({"hours": 0, "minutes": 0, "seconds": 0});
    const [timeText, setTimeText] = useState("");
    const [distance, setDistance] = useState(0);
    const [customFieldPace, setCustomFieldPace] = useState({distance: 0, time: "-", unit: "MILES"})
    const [customFieldEq, setCustomFieldEq] = useState({distance: 0, time: "-", unit: "MILES"})
    const [unit, setUnit] = useState("MILES");
    const [lastInput, setLastInput] = useState({distance: 0, unit: "MILES"})
    const [calculatedPaces, setCalculatedPaces] = useState({
        "100m": "-",
        "200m": "-",
        "400m": "-",
        "600m": "-",
        "800m": "-",
        "1k": "-",
        "1mi": "-",
        "3k": "-",
        "2mi": "-",
        "5k": "-",
        "10k": "-",
        "Half Marathon": "-",
        "Marathon": "-",
    });
    const [equivalentTimes, setEquaivalentTimes] = useState({
        "400m": "-",
        "800m": "-",
        "1500m": "-",
        "1mi": "-",
        "3k": "-",
        "2mi": "-",
        "5k": "-",
        "8k": "-",
        "10k" : "-",
        "Half Marathon" : "-",
        "Marathon" : "-"
    });
    const [errorMessage, setErrorMessage] = useState("");

    function PaceTableRow({ distance, unit }){
        let timeRow = <div></div>
        let numericalDistance = Number(distance.replace(/\D/g,''))
        if(distance === "Half Marathon") { numericalDistance = 21097.5 }
        if(distance === "Marathon") { numericalDistance = 42195 }
        if(lastInput.distance > 0 && numericalDistance > lastInput.distance * unitConversions[lastInput.unit + unit]){
            timeRow = <td className={styles.timeColumn}><i>{calculatedPaces[distance]}</i></td>
        }else{
            timeRow = <td className={styles.timeColumn}>{calculatedPaces[distance]}</td>
        }

        return(
            <tr>
                <td className={styles.tableElement}>{distance}</td>
                {timeRow}
            </tr>
        )
    }

    function EquivalencyTableRow({ distance }) {
        return(
            <tr>
                <td className={styles.tableElement}>{distance}</td>
                <td className={styles.timeColumn}>{equivalentTimes[distance]}</td>
            </tr>
        )
    }

    function CheckInputIsValid(time, distance){
        return !(time.hours === 0 && time.minutes === 0 && time.seconds === 0) &&
        !(isNaN(time.hours) || isNaN(time.minutes) || isNaN(time.seconds)) &&
        distance > 0;
    }

    function FormatTime(time){
        let numericalTime = time;
        if(typeof numericalTime == "object"){
            numericalTime = time.hours.toString().padStart(2, '0') + time.minutes.toString().padStart(2, '0') + Math.floor(time.seconds).toString().padStart(2, '0');
            numericalTime = numericalTime.replace(/^0+(?=\d)/, '');
            if(numericalTime === "0") { numericalTime = "" }
        }
        //if(time.hours === 0 && time.minutes === 0 && time.se)
        let formattedText = "";

        for(var i = numericalTime.length - 1; i >= 0; i--){
            if(numericalTime[i] === ":") { continue; }
            if(i < numericalTime.length - 1 && (numericalTime.length - i) % 2 === 1){
                if(numericalTime.length - i < 6) {
                    formattedText = ":" + formattedText;
                }
            }
            formattedText = numericalTime[i] + formattedText;
        }
        
        let tenthSeconds = Math.floor((time.seconds - Math.floor(time.seconds)) * 100);
        if(tenthSeconds > 0){
            formattedText = formattedText + "." + tenthSeconds;
        }

        return formattedText;
    }

    function GetPace(time, distanceTraveled, distancePace, unit, unitToConvert){
        let conversion = unitConversions[unit + unitToConvert];

        let timeInSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;
        let secondsPer = timeInSeconds / (distanceTraveled * conversion);

        secondsPer *= distancePace;

        let hours = Math.floor(secondsPer / 3600);
        let minutes = Math.floor((secondsPer - hours * 3600) / 60);
        let seconds = Math.floor((secondsPer - hours * 3600 - minutes * 60) * 100) / 100;

        //console.log({"hours": hours, "minutes": minutes, "seconds": seconds});

        return {"hours": hours, "minutes": minutes, "seconds": seconds};
    }

    function GetEquivalentTime(time, distanceTraveled, newDistance, unit, unitToConvert, exponent){
        let timeInSeconds = time.hours * 3600 + time.minutes * 60 + time.seconds;
        //let exponent = 1.06;
        //if(newDistance * unitConversions[unitToConvert + "MILES"] <= 1 || distanceTraveled * unitConversions[unit + "MILES"] <= 1){
            //exponent = 1.06;
        //}
        //Pete Riegel formula
        let newTime = timeInSeconds * Math.pow((newDistance / (distanceTraveled * unitConversions[unit + unitToConvert])), exponent);

        let hours = Math.floor(newTime / 3600);
        let minutes = Math.floor((newTime - hours * 3600) / 60);
        let seconds = Math.floor((newTime - hours * 3600 - minutes * 60) * 100) / 100;

        return {"hours": hours, "minutes": minutes, "seconds": seconds};
    }

    function FillCustomField(distance, paceOrEq, time, distanceTraveled, unit, customUnit){
        if(distance <= 0 || distance === ""){ return "-" }
        if(paceOrEq === "pace"){
            return FormatTime(GetPace(time, distanceTraveled, distance, unit, customUnit))
        } else if (paceOrEq === "eq"){
            return FormatTime(GetEquivalentTime(time, distanceTraveled, distance, unit, customUnit, 1.06))
        }
    }

    function GetPaces(time, distanceTraveled, unit){
        if(!CheckInputIsValid(time, distanceTraveled)){
            setErrorMessage("Please enter a valid time and distance to find paces");
            return;
        }
        setErrorMessage("");
        setLastInput({distance: distanceTraveled, unit: unit});
        //console.log(GetEquivalentTime({hours: 0, minutes: 4, seconds: 32}, 1500, 1, "METERS", "MILES"));

        let paces = {
            "100m": FormatTime(GetPace(time, distanceTraveled, 100, unit, "METERS")),
            "200m": FormatTime(GetPace(time, distanceTraveled, 200, unit, "METERS")),
            "400m": FormatTime(GetPace(time, distanceTraveled, 400, unit, "METERS")),
            "600m": FormatTime(GetPace(time, distanceTraveled, 600, unit, "METERS")),
            "800m": FormatTime(GetPace(time, distanceTraveled, 800, unit, "METERS")),
            "1k": FormatTime(GetPace(time, distanceTraveled, 1, unit, "KM")),
            "1mi": FormatTime(GetPace(time, distanceTraveled, 1, unit, "MILES")),
            "3k": FormatTime(GetPace(time, distanceTraveled, 3, unit, "KM")),
            "2mi": FormatTime(GetPace(time, distanceTraveled, 2, unit, "MILES")),
            "5k": FormatTime(GetPace(time, distanceTraveled, 5, unit, "KM")),
            "10k": FormatTime(GetPace(time, distanceTraveled, 10, unit, "KM")),
            "Half Marathon": FormatTime(GetPace(time, distanceTraveled, 21097.5, unit, "METERS")),
            "Marathon": FormatTime(GetPace(time, distanceTraveled, 42195, unit, "METERS"))
        };
        setCustomFieldPace({...customFieldPace, time: FillCustomField(customFieldPace.distance, "pace", time, distanceTraveled, unit, customFieldPace.unit)});

        let equivalencies = {
            "400m": FormatTime(GetEquivalentTime(time, distanceTraveled, 400, unit, "METERS", 1.13)),
            "800m": FormatTime(GetEquivalentTime(time, distanceTraveled, 800, unit, "METERS", 1.11)),
            "1500m": FormatTime(GetEquivalentTime(time, distanceTraveled, 1500, unit, "METERS", 1.1)),
            "1mi": FormatTime(GetEquivalentTime(time, distanceTraveled, 1, unit, "MILES", 1.1)),
            "3k": FormatTime(GetEquivalentTime(time, distanceTraveled, 3, unit, "KM", 1.1)),
            "2mi": FormatTime(GetEquivalentTime(time, distanceTraveled, 2, unit, "MILES", 1.1)),
            "5k": FormatTime(GetEquivalentTime(time, distanceTraveled, 5, unit, "KM", 1.09)),
            "8k": FormatTime(GetEquivalentTime(time, distanceTraveled, 8, unit, "KM", 1.07)),
            "10k" : FormatTime(GetEquivalentTime(time, distanceTraveled, 10, unit, "KM", 1.07)),
            "Half Marathon" : FormatTime(GetEquivalentTime(time, distanceTraveled, 21097.5, unit, "METERS", 1.07)),
            "Marathon" : FormatTime(GetEquivalentTime(time, distanceTraveled, 42195, unit, "METERS", 1.07))
        };
        setCustomFieldEq({...customFieldEq, time: FillCustomField(customFieldEq.distance, "eq", time, distanceTraveled, unit, customFieldEq.unit)});

        setCalculatedPaces(paces);
        setEquaivalentTimes(equivalencies);
    }

    const handleOnChange = (e) => {
        let numericalString = e.target.value.replaceAll(":", "");
        numericalString = numericalString.replace(/\D/g,'');

        let timeString = numericalString.padStart(5, '0')

        let seconds = Number(timeString.slice(-2));
        let minutes = Number(timeString.slice(-4, -2));
        let hours = Number(timeString.slice(0, -4));
        setTime({hours: hours, minutes: minutes, seconds: seconds});

        //console.log({hours: hours, minutes: minutes, seconds: seconds});

        //if(e.target.value.slice(-1) === ":") { 
            //numericalString += ":"
        //}
        let formattedText = FormatTime(numericalString);
        
        setTimeText(formattedText)
    }

    const handleUnitSelect = (e) => {
        setUnit(e.target.value);
    }

    const errorText = errorMessage === "" ? (<div></div>) : (<div className={styles.container}><p className={styles.errorText}>{errorMessage}</p></div>);

    return(
        <div>
            <div className={styles.titleContainer}>
                <i><b className={styles.title}>PACE & SPLIT CALCULATOR</b></i>
            </div>
            <div className={styles.container}>
                <input className={styles.timeField} value={timeText} placeholder="Time (hh:mm:ss)" onChange={e => handleOnChange(e)}></input>
                <input type="number" className={styles.inputField} placeholder="Distance" onChange={e => setDistance(e.target.value)}></input>
                <select name="units" id="units" onChange={(e) => handleUnitSelect(e)} className={styles.dropdown}>
                    <option value="MILES">MI</option> 
                    <option value="KM">KM</option> 
                    <option value="METERS">M</option> 
                </select>
                <button className={styles.button} onClick={() => GetPaces(time, distance, unit)}>Get Pace</button>
            </div>
            {errorText}
            <div style={{textAlign: 'center', marginTop: 20}}>
                <b><i className={styles.labelText}>Paces</i></b>
            </div>
            <div className={styles.container}>
                <table className={styles.paceTable}>
                    <tbody>
                        <tr>
                            <th className={styles.tableElement}>Distance:</th>
                            <th className={styles.tableElement}>Time:</th>
                        </tr>
                        <PaceTableRow distance={"100m"} unit={"METERS"}/>
                        <PaceTableRow distance={"200m"} unit={"METERS"}/>
                        <PaceTableRow distance={"400m"} unit={"METERS"}/>
                        <PaceTableRow distance={"600m"} unit={"METERS"}/>
                        <PaceTableRow distance={"800m"} unit={"METERS"}/>
                        <PaceTableRow distance={"1k"} unit={"KM"}/>
                        <PaceTableRow distance={"1mi"} unit={"MILES"}/>
                        <PaceTableRow distance={"3k"} unit={"KM"}/>
                        <PaceTableRow distance={"2mi"} unit={"MILES"}/>
                        <PaceTableRow distance={"5k"} unit={"KM"}/>
                        <PaceTableRow distance={"10k"} unit={"KM"}/>
                        <PaceTableRow distance={"Half Marathon"} unit={"METERS"}/>
                        <PaceTableRow distance={"Marathon"} unit={"METERS"}/>
                        <tr>
                            <td className={styles.tableElement}>
                                <input className={styles.customDistanceField} placeholder="Custom" type="number" onChange={e => setCustomFieldPace({...customFieldPace, distance: e.target.value})}/>
                                <select name="units" id="units" className={styles.customUnitDropdown} onChange={(e) => setCustomFieldPace({...customFieldPace, unit: e.target.value})}>
                                    <option value="MILES">MI</option> 
                                    <option value="KM">KM</option> 
                                    <option value="METERS">M</option> 
                                </select>
                            </td>
                            <td className={styles.tableElement}>{customFieldPace.time}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{textAlign: 'center', marginTop: 20}}>
                <b><i className={styles.labelText}>Equivalent Times</i></b>
            </div>
            <div className={styles.container}>
                <table className={styles.paceTable}>
                    <tbody>
                        <tr>
                            <th className={styles.tableElement}>Distance:</th>
                            <th className={styles.tableElement}>Time:</th>
                        </tr>
                        <EquivalencyTableRow distance={"400m"}/>
                        <EquivalencyTableRow distance={"800m"}/>
                        <EquivalencyTableRow distance={"1500m"}/>
                        <EquivalencyTableRow distance={"1mi"}/>
                        <EquivalencyTableRow distance={"3k"}/>
                        <EquivalencyTableRow distance={"2mi"}/>
                        <EquivalencyTableRow distance={"5k"}/>
                        <EquivalencyTableRow distance={"8k"}/>
                        <EquivalencyTableRow distance={"10k"}/>
                        <EquivalencyTableRow distance={"Half Marathon"}/>
                        <EquivalencyTableRow distance={"Marathon"}/>
                        <tr>
                            <td className={styles.tableElement}>
                                <input className={styles.customDistanceField} placeholder="Custom" type="number" onChange={e => setCustomFieldEq({...customFieldEq, distance: e.target.value})}/>
                                <select name="units" id="units" className={styles.customUnitDropdown} onChange={(e) => setCustomFieldEq({...customFieldEq, unit: e.target.value})}>
                                    <option value="MILES">MI</option> 
                                    <option value="KM">KM</option> 
                                    <option value="METERS">M</option> 
                                </select>
                            </td>
                            <td className={styles.tableElement}>{customFieldEq.time}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div style={{display: 'flex', justifyContent: "center", alignItems: "center"}}>
                <div style={{width: 800, textAlign: 'left', marginTop: 10, marginBottom: 100}}>
                    <p className={styles.descriptionText}>
                        Equalivalent race times are estimated with the equation T2 = T1 * (D2 / D1)^B.
                        This simple formula was devised by Pete Riegel and published in Runner's World in 1997. Riegel
                        used 1.06 as the exponent. This calculator uses a slighly different value (close to 1.06) for each distance.
                        Keep in mind that this formula can produce misleading results, especially for 400m.
                    </p>
                    <p className={styles.descriptionText}>Other similar calculators:</p>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <a href="https://vdoto2.com/calculator" className={styles.linkText}>VDOT Calculator</a>
                        <a href="https://wismuth.com/running/calculator.html" className={styles.linkText}>Race Equivalency Calculator</a>
                        <a href="https://www.strava.com/running-pace-calculator" className={styles.linkText}>Strava Calculator</a>
                    </div>
                </div>
            </div>
        </div>
    );
}