import { Link } from 'react-router-dom';
import ActivityList from './ActivityList'
import "./Home.css"
function Home() {
    return (
        <div id="swamp">
            <h1>Dashboard</h1>
            <Link id="link" to="/create">Create Activity</Link>
            <ActivityList/>
        </div>
    )
}
export default Home;