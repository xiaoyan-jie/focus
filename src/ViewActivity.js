import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom"
import "./CompleteActivity.css"
import "./ViewActivity.css"
function ViewActivity() {
    const tasksRef = useRef([]);
    const location = useLocation();
    const { item } = location.state;
    const [activity, setActivity] = useState(item);
    const progressBarRef = useRef();
    useEffect(() => {
        console.log(item);
        let taskList = JSON.parse(activity.tasks);
        progressBarRef.current.style.backgroundColor = activity.color;
        for (var i = 0; i < taskList.length; i++) { //copied logic from completeactivity.js
            let elapsed = taskList[i].elapsed_seconds;
            let total = taskList[i].total_minutes * 60;
            let css = "linear-gradient(to right, " + 
                    colorGradient(elapsed, total) + " 0% " + Math.floor(100 * elapsed/total) + "%, transparent " + Math.floor(100 * elapsed/total) + "% 100%)"
            tasksRef.current[i].style.background = css;
            
        }
    }, [activity])
    const secondsToMinutes = (seconds) => { //this changes the elapsed_seconds number to a timer format (00:00)
        return Math.floor(seconds/60) + ":" + ((seconds % 60).toString().length === 1 ? "0" : "") + (seconds % 60);
    }
    function colorGradient(elapsed, total) { //takes the fraction of the time elapsed and converts it to a color
        //green for lots of time left, red for no time left
        let fadeFraction = elapsed / total;
        if (fadeFraction > 1) return "#FF0000"
        var gradient;
        if (fadeFraction < 0.66) {
            gradient = {red: Math.round((255 * (fadeFraction / (2/3)))), green: 255, blue: 0}
        } else {
            gradient = {red: 255, green: Math.round(255 - (255 * ((fadeFraction-(2/3)) / (1/3)))), blue: 0}
        }
    
    
        return "#" + rgbToHex(gradient.red) + rgbToHex(gradient.green) + rgbToHex(gradient.blue);
    }
    //takes a single integer (0-255) and converts it to a hex code (00-FF)
    const rgbToHex = (c) => {
        var h = c.toString(16);
        return h.length === 1 ? "0" + h : h;
    }
    return <div >
        <h1>Name: {activity.name}</h1>
        <h3>Description: {activity.description || "(none)"}</h3>
        <div id="progress-bar-container">
            <h3>Progress: </h3>
            <div id="progress-bar" ref={progressBarRef}></div>
        </div>
        {JSON.parse(activity.tasks).map((item, index) => {
            return <div id="complete-activity-task-container" key={index} ref={(el) => {(tasksRef.current[index] = el); return el}}>
                <p id="complete-activity-task-name">{item.input}</p>
                <p id="complete-activity-task-timer">{secondsToMinutes(item.elapsed_seconds)} / {item.total_minutes}:00</p>
            </div>
        })}
    </div>
}
export default ViewActivity