import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ActivityList.css"
function ActivityList() {
    var [items, setItems] = useState([]);
    const emptyListTextRef = useRef();
    const itemsRefs = useRef([]);
    useEffect(() => {
        // localStorage.clear();
        setItems(JSON.parse(localStorage.getItem("activities-list")) || []); //runs only once, unpacks local storage into the items state
    }, [])
    useEffect(() => {
        emptyListTextRef.current.style.display = "none";
        if (items.length === 0) {
            emptyListTextRef.current.style.display = "block"; //renders an (empty) text box when there's nothing in the list
        }
        for (var i = 0; i < items.length; i++) {
            itemsRefs.current[i].style.backgroundColor = items[i].color; //every time the items array changes matcvh the colors to the color given in local storage
            //put this in a separate ref linked to items to make sure the state changes by the time this happens
        }
    }, [items])
    return (
        <div id="ActivityList">
            <h3>Activities <button onClick={() => {localStorage.clear(); window.location.reload()}}>Clear All Activities (permanent)</button></h3>
            <div id="activity-list-view">
                <p id="empty-list-text" ref={emptyListTextRef}>(empty)</p>
                {console.log(items)}
                {items.map((item, index) => {
                    console.log(items);
                    return <Link key={crypto.randomUUID()} id="show-activity-cell" state={{item: item}} ref={(el) => {(itemsRefs.current[index] = el); return el}} to="/view">
                        <p id="activity-name-p">{item.name}</p>
                        <p>{item.description || "(none)"}</p>
                    </Link>
                })}
            </div>
        </div>
    );
}
export default ActivityList;