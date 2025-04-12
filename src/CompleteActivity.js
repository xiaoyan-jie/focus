import { useRef, useState, useEffect } from 'react'
// import ReactPlayer from 'react-player';
import { Link } from 'react-router-dom'
import cosplayvid from './laoshi-cosplay.mov';
import wiseworm from './wiseworm.mp4';
import tungtung from './tungtung.mp4';
import shark from './shark.mp4';
import cactus from './cactuselephant.mp4';
import cappucino from './cappucino.mp4';
import chimp from './chimpanzini.mp4';
import './CompleteActivity.css'
import thumbsup from './thumbs-up.png'
import fivemin from './5-min-left.png';
import lsfail from './fail.png'
function CompleteActivity() {
    const finalScreenImgRef = useRef();
    const videoPlayerRef = useRef();
    const videoList = [cosplayvid, wiseworm, tungtung, shark, cactus, cappucino, chimp];
    const [ currentVideo, setCurrentVideo ] = useState(cosplayvid);
    const tasksRef = useRef([]); //holds refs to every task display element
    const finalScreenRef = useRef(); //holds ref to the final screen element (you're finished! screen)
    const resultsPRef = useRef(); //holds ref to the <p> element showing results (you finished x out of y activites in time)
    var activity = JSON.parse(localStorage.getItem("in-progress-activity")) //get the activity from local storage
    var list_from_json = JSON.parse(activity.tasks); //convert the task list from the activity to its own list
    const [taskList, setTaskList] = useState(list_from_json); //convert it into a state
    const secondsToMinutes = (seconds) => { //this changes the elapsed_seconds number to a timer format (00:00)
        return Math.floor(seconds/60) + ":" + ((seconds % 60).toString().length === 1 ? "0" : "") + (seconds % 60);
    }
    useEffect(() => {
        setInterval(() => { updateTimer() }, 1000); //run updateTimer() every 1s to create the timer.
        //react.strictmode in I think the app.js file needed to be deleted because it made every one of these functions run twice
    }, [])

    useEffect(() => {
        setFocusCSS(); //every time the task list is changed redo the focus css on the elements
    }, [taskList])
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
    const updateTimer = () => { //change the state to be the previous state but with focused elements' elapsed_seconds property incremented by one
        setTaskList((prevState) => {
            return prevState.map((item) => {
                return {
                    index: item.index, 
                    input: item.input, 
                    total_minutes: item.total_minutes, 
                    elapsed_seconds: item.elapsed_seconds+(item.isFocused), //if the item is focused, increment the timer by 1 (boolean value of true)
                    isFinished: item.isFinished, isFocused: item.isFocused
                }
            })
        })
    }
    
    const setFocus = (focusIndex) => {
        tasksRef.current[focusIndex].style.borderColor = "#000000" //reset css denoting finished ones
        setTaskList((prevState) => {
            return prevState.map((item, index) => {
                return {
                    index: item.index, 
                    input: item.input, 
                    total_minutes: item.total_minutes, 
                    elapsed_seconds: item.elapsed_seconds, 
                    isFinished: item.isFinished && (index !== focusIndex), //if you press run on an element, it should be marked not finished
                    isFocused: (index === focusIndex ? true : false)
                }
            })
        })
    }
    const removeFocus = () => {
        setTaskList((prevState) => {
            return prevState.map((item, index) => {
                return {
                    index: item.index, 
                    input: item.input, 
                    total_minutes: item.total_minutes, 
                    elapsed_seconds: item.elapsed_seconds, 
                    isFinished: item.isFinished, 
                    isFocused: false //reset every single element to not be focused (effectively pause all timers)
                }
            })
        })
    }
    const changeFocusAndFinish = (focusIndex, finishIndex) => { //both marks the current index as finished and also changes the focus index 
        setTaskList((prevState) => {
            return prevState.map((item, index) => {
                return {
                    index: item.index, 
                    input: item.input, 
                    total_minutes: item.total_minutes, 
                    elapsed_seconds: item.elapsed_seconds, 
                    isFinished: item.isFinished || (item.index === finishIndex), 
                    isFocused: (index === focusIndex ? true : false)}
            })
        })
    }
    const finishTask = (finishIndex) => {
        tasksRef.current[finishIndex].style.borderColor = "#00FF00"
        var fullyCompleted = true;
        //idea here is to fidn the first incomplete task that isn't the current one and mark that as completed
        for (var i = 0; i < taskList.length; i++) {
            if (i === finishIndex) continue;
            let item = taskList[i];
            console.log(item);
            if (!item.isFinished) {
                changeFocusAndFinish(item.index, finishIndex);
                fullyCompleted = false;
                break;
            }
        }
        if (fullyCompleted) {
            //all of the tasks are finished, open the end result screen
            setTaskList((prevState) => {
                return prevState.map((item, index) => {
                    return index === finishIndex ? 
                        {index: item.index, 
                            input: item.input, 
                            total_minutes: item.total_minutes, 
                            elapsed_seconds: item.elapsed_seconds, 
                            isFinished: true, isFocused: item.isFocused} 
                        :
                        item
                })
            })
            removeFocus();
            finalScreenRef.current.style.display = "block";
            var completedOverTime = 0;
            for (var j = 0; j < taskList.length; j++) {
                if (taskList[j].elapsed_seconds >= taskList[j].total_minutes * 60) {
                    completedOverTime += 1;
                }
            } //get a color based on how many of the tasks were done in the time they set
            var color = "";
            let fraction = completedOverTime / taskList.length;
            finalScreenImgRef.current.src = getProgressImage(completedOverTime, taskList.length)
            if (fraction <= 0.50) {
                fraction = fraction / 0.50
                color = "#" + rgbToHex(Math.floor(255 * fraction)) + rgbToHex(255) + rgbToHex(0);
            } else {
                fraction = (fraction - 0.50) / 0.50;
                color = "#" + rgbToHex(255) + rgbToHex(Math.floor(255 - (255 * fraction))) + rgbToHex(0);
            }
            console.log("COLOR: ", color);
            finalScreenRef.current.style.backgroundColor = color + "80";
            console.log( completedOverTime);
            resultsPRef.current.textContent = "You completed " + (taskList.length - completedOverTime) + " out of " + taskList.length + " tasks in time.";
        }
    }
    const setFocusCSS = () => {//fills some % of the task div with the color based on its progress
        //ie. 10% of the timer woudl be green with the tiniest bit of yellow, 50% is yellow, 100% is red
        for (var i = 0; i < taskList.length; i++) {
            let elapsed = taskList[i].elapsed_seconds;
            let total = taskList[i].total_minutes * 60;
            let css = "linear-gradient(to right, " + 
                    colorGradient(elapsed, total) + " 0% " + Math.floor(100 * elapsed/total) + "%, transparent " + Math.floor(100 * elapsed/total) + "% 100%)"
            tasksRef.current[i].style.background = css;
            if (taskList[i].isFocused) {
                tasksRef.current[i].className = 'focused';
            } else {
                tasksRef.current[i].className = "";
            }
        }
    }
    const handleResume = () => {
        removeFocus();
        finalScreenRef.current.style.display = "none";
    }
    const portToHome = (event) => {
        let totalList = localStorage.getItem("activities-list");
        console.log(totalList);
        //get fraction of completed tasks on time
        var completedOverTime = 0;
        for (var j = 0; j < taskList.length; j++) {
            if (taskList[j].elapsed_seconds >= taskList[j].total_minutes * 60) {
                completedOverTime += 1;
            }
        }
        var color = "";
        let fraction = completedOverTime / taskList.length;
        if (fraction <= 0.50) {
            fraction = fraction / 0.50
            color = "#" + rgbToHex(Math.floor(255 * fraction)) + rgbToHex(255) + rgbToHex(0);
        } else {
            fraction = (fraction - 0.50) / 0.50;
            color = "#" + rgbToHex(255) + rgbToHex(Math.floor(255 - (255 * fraction))) + rgbToHex(0);
        } //get this color so it looks red if you consistently can't do things on time on the front page

        //if there's nothing in localstorage here, just put it in.
        //if there is something already, take it out, unpack it, and then add the current one and stuff it all back into local storage
        if (!totalList) {
            localStorage.setItem("activities-list", JSON.stringify([{name: activity.name, description: activity.description, tasks: JSON.stringify(taskList), color: color}]))
            console.log("going");
        } else {
            console.log(totalList);
            let parsedList = JSON.parse(totalList);
            console.log(parsedList);
            parsedList = [...parsedList, {name: activity.name, description: activity.description, tasks: JSON.stringify(taskList), color: color}]
            console.log(parsedList);
            localStorage.setItem("activities-list", JSON.stringify(parsedList));
            // event.preventDefault()
        }
    }
    const videoPlayerButtonOnClick = () => {
        let min = 0; let max = 6;
        let index = Math.floor(Math.random() * (max - min + 1) + min);
        setCurrentVideo(videoList[index]);
        console.log(currentVideo);
        videoPlayerRef.current.src = currentVideo
        videoPlayerRef.current.play();
    }
    const getProgressImage = (elapsed, total) => {
        let frac = (1.0 * elapsed) / total;
        if (frac < 0.33) {
            return thumbsup;
        } else if (frac < 0.66) {
            return fivemin;
        } else {
            return lsfail;
        }
    }
    return (
    <div>
        <h1>Activity In Progress</h1>
        <h3>Name: {activity.name}</h3>
        <p>{activity.description}</p>
        <div id="video-player">
            <button id="video-button" onClick={videoPlayerButtonOnClick}>change brainrot</button>
            <br></br>
            <video onEnded={videoPlayerButtonOnClick} ref={videoPlayerRef} src={cosplayvid} width="500px" height="500px" controls></video>
        </div>
        <div>
            {taskList.map((item, index) => {
                return <div id="complete-activity-task-container" key={index} ref={(el) => {(tasksRef.current[index] = el); return el}}>
                    <p id="complete-activity-task-name">{item.input}</p>
                    <p id="complete-activity-task-timer">{secondsToMinutes(item.elapsed_seconds)} / {item.total_minutes}:00</p>
                    <img style={{width: 'auto', height: 'auto'}} src={getProgressImage(item.elapsed_seconds, item.total_minutes*60)}></img>
                    <br></br><br></br>
                    <button onClick={() => { setFocus(item.index); }}>▶️</button>
                    <button onClick={removeFocus}>⏹️</button>
                    <button onClick={() => { finishTask(item.index) }}>✔️</button>
                </div>
            })}
        </div>
        <div ref={finalScreenRef} id="all-tasks-finished-screen">
            <h1>You're Finished!</h1>
            <p ref={resultsPRef}>placeholder</p>
            <img ref={finalScreenImgRef}/>
            <br></br>
            <button onClick={handleResume}>Resume</button>
            <Link onClick={portToHome} id="complete-activity-home" to="/">Home</Link>
        </div>
    </div>
    )
}
export default CompleteActivity