import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import './CreateActivity.css'
function CreateActivity() {
    const [activitiesInput, setActivitiesInput] = useState([{index: 0, input: "", minutes: 5}]); // stores the task names and durations from user input
    const [focusInput, setFocusInput] = useState(0); //index of the input box to keep the typing cursor in
    const [isName, setIsName] = useState(true); //boolean for whether the focus is in the text box or the duration box
    const textAreaRef = useRef() //ref holding the description input
    const noNameWarningRef = useRef(); //ref holding some text in red to be shown when the user submits with an empty name box
    const noTaskWarningRef = useRef(); //ref holding some text in red to be shown when the user submits without completing a task name/duration box
    // localStorage.clear();
    useEffect(() => { //whenever any variables change update the focused box accordingly
        var lastEditedElement = document.getElementById("activity-input-" + (isName? "" : "minutes-") + focusInput)
        lastEditedElement?.focus();
    }, [activitiesInput, focusInput, isName])
    const handleOnFocus = (event) => { //this was made change the focus input when the user manually changed the focused box.
        let eventIDNumber = (Number(event.target.id[event.target.id.length - 1]))
        if (event.target.id === "activity-input-minutes-" + eventIDNumber) {
            setIsName(false)
        } else {
            setIsName(true)
        }
        setFocusInput(eventIDNumber)
    }
    const handleKeyPress = (event) => {
        //get the index where the key was pressed in
        let eventTargetID = Number(event.target.id[event.target.id.length - 1]);
        let inputValue;
        let minutesValue;
        //get both name and duration of the task and put it into the above variables
        if (!isName) {
            minutesValue = event.target.value;
            inputValue = document.getElementById("activity-input-"+ eventTargetID).value
        } else {
            inputValue = event.target.value;
            minutesValue = document.getElementById("activity-input-minutes-" + eventTargetID).value;
        }
        //if there's a change, update the state holding the task names/durations. if not, don't reupdate as that will cause focus issues
        if (inputValue !== activitiesInput[focusInput].input || minutesValue !== activitiesInput[focusInput].minutes) {
            setActivitiesInput(prevState => {
                let before = prevState.slice(0, eventTargetID);
                let current = {index: eventTargetID, input: inputValue, minutes: removeLeadingZeros(minutesValue)}
                let after = prevState.slice(eventTargetID+1, prevState.length)
                if (eventTargetID === 0) {
                    if (prevState.length - eventTargetID - 1 === 0) {
                        return [current]
                    }
                    return [current, ...after]
                }
                return [...before, current, ...after]
            })
        }
        
        if (event.key === "Backspace") {
            //if we're not on the first one, change focus to the input before and then set the focus to the minute box
            if (eventTargetID !== 0 && inputValue.length === 0) {
                event.preventDefault();
                setActivitiesInput(prevState => {
                    let before = prevState.slice(0, focusInput);
                    let after = prevState.slice(focusInput+1, prevState.length);
                    after = after.map(item => {return {index: item.index-1, input:item.input, minutes:item.minutes}});
                    if (before.length === 0 && after.length === 0) return [{index: 0, input: "", minutes: 0}]; //theoretically can't happen but just in case
                    else if (before.length === 0) return [...after]
                    else if (after.length === 0) return [...before]
                    else return [...before, ...after]
                })
                setIsName(false);
                setFocusInput(prevState => prevState - 1);
            } //if we are on any minute box simply change the focus to the text box at the same input
            if (!isName && minutesValue.length === 0) {
                event.preventDefault();
                setIsName(true);
            }
            //event.preventDefault() prevents the deletion from going through in this case, so when the focus changes to the new text box no characters are deleted
            //those two if statements cover every scenario except for when delete is pressed on an empty very first text box, where there kind of isn't anywhere to go so nothing gets run here
        } //same idea here, when enter is pressed move forward a box
        if (event.key === "Enter") {
            let lastIndex = Number(activitiesInput[activitiesInput.length-1].index)
            if (eventTargetID === lastIndex && !isName) {
                setActivitiesInput(prevState => [...prevState, {index: lastIndex+1, input: ""}]);
                setFocusInput(lastIndex+1);
                setIsName(true)
            } else {
                if (isName) {
                    setIsName(false)
                } else {
                    setFocusInput(eventTargetID + 1)
                    setIsName(true)
                }
            }
        }
    }
    //these two lines are called every keydown on the text area and changes its size to fit the input
    const textAreaOnInputHandler = (event) => {
        textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 3 + "px";
        textAreaRef.current.style.height = "";
    }
    //this is called for every key press to remove leading zeros on the minute input
    //prevents timers going for "09:00" minutes and just gives "9:00" minutes
    const removeLeadingZeros = (str) => {
        str = "" + str;
        var i = 0;
        while (str[i] === "0") {
            i++;
        }
        return str.slice(i, str.length);
    }
    //this handles which error messages to display under which conditions.
    const handleSubmitPress = (event) => {
        noNameWarningRef.current.style.display = "none";
        noNameWarningRef.current.style.visibility = "hidden";
        noTaskWarningRef.current.style.display = "none";
        noTaskWarningRef.current.style.visibility = "hidden";
        if (document.getElementById("create-activity-name").value.length === 0) {
            noNameWarningRef.current.style.display = "block";
            noNameWarningRef.current.style.visibility = "visible";
            event.preventDefault();
        }
        //loop through all of the values to see which ones are empty
        for (var i = 0; i < activitiesInput.length; i++) {
            if (activitiesInput[i].input.length === 0 || typeof activitiesInput[i].minutes === "undefined" || activitiesInput[i].minutes === "") {
                noTaskWarningRef.current.style.display = "block";
                noTaskWarningRef.current.style.visibility = "visible";
                event.preventDefault();
                break;
            }
            
        }
        //if event.preventDefault() isn't run, it won't go to the next screen
        // and while this might be saved it's impossible to go to the complete activity screen with this being set to the wrong thing
        localStorage.setItem("in-progress-activity", JSON.stringify(
            {name: document.getElementById("create-activity-name").value,
            description: textAreaRef.current.value,
            tasks: JSON.stringify(activitiesInput.map((item) => {
               return {index: item.index, input: 
                item.input, total_minutes: removeLeadingZeros(item.minutes), 
                elapsed_seconds: 0, 
                isFinished: false, 
                isFocused: (item.index === 0 ? true : false)}
            }))}))
    }
    return (
        <div id="prayers-needed">
            <h1>Create Activity</h1>
            <form>
                <div className="create-activity-flex-div">
                    <div className="activity-static-input-container">
                        <label>Name</label>
                        <input type="text" id="create-activity-name" name="activity-name"/>
                    </div>
                    <div className="activity-static-input-container">
                        <label>Description</label>
                        <textarea ref={textAreaRef} id="create-activity-description" onInput={textAreaOnInputHandler} key={crypto.randomUUID}></textarea>
                    </div>
                    <div id="activity-input-container">
                        {activitiesInput.map((item) =>
                            <div className="flex-activity-container">
                                <div className="activity-input-container">
                                    <label>Task Name</label>
                                    <input 
                                        id={"activity-input-" + item.index} 
                                        key={crypto.randomUUID} 
                                        onFocus={handleOnFocus} 
                                        onKeyUp={handleKeyPress} 
                                        defaultValue={item.input} 
                                        type="text"
                                    />
                                </div>
                                <div className="activity-input-container">
                                    <label>Task Time (minutes)</label>
                                    <input 
                                        id={"activity-input-minutes-" + item.index} 
                                        onKeyUp={handleKeyPress} 
                                        onFocus={handleOnFocus} 
                                        type="number" 
                                        key={crypto.randomUUID} 
                                        defaultValue={item.minutes}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="create-activity-incomplete-warning" ref={noNameWarningRef}>Please enter a name for this activity.</p>
                    <p className="create-activity-incomplete-warning" ref={noTaskWarningRef}>Please enter both the task name and duration.</p>
                    <Link id="create-activity-submit" onClick={handleSubmitPress} to="/complete">Submit</Link>
                    </div>
            </form>
        </div>
    );
}

export default CreateActivity;