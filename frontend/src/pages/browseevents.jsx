
import { Navigate } from "react-router-dom"
import api from '../api/axiosmiddleware';
import {useState,useEffect, use} from "react"
const BrowseEvents = () => {
	const user = JSON.parse(localStorage.getItem("userData"))
	
	const [events,setEvents] = useState([])
	const [allEvents,setAllEvents] = useState([])
	const [trendingEvents,setTrendingEvents] = useState([])
	const [filter,setFilter] = useState("")
	const [selectedFilters,setSelectedFilters] = useState({})
	const [selectedCategories,setSelectedCategories] = useState({})
	const [eligibilityFilter,setEligibilityFilter] = useState("all")
	const [eventTypeFilter,setEventTypeFilter] = useState("all")
	const [categoryFilter,setCategoryFilter] = useState("all")
	const [followedClubsFilter,setFollowedClubsFilter] = useState("all")
	const [followedClubs,setFollowedClubs] = useState([])
	const [startDate,setStartDate] = useState("")
	const [endDate,setEndDate] = useState("")
	if (!user) {
		return <Navigate to="/login" />
	}
	const getAllEvents = async (searchFilter = null) => {
		try{
			const filterValue = searchFilter !== null ? searchFilter : filter
			const response = await api.post('/api/events/getAllEvents',{filters: filterValue});

			const eventList = response.data.events 
			setAllEvents(eventList)
			applyFilters(eventList, eligibilityFilter, eventTypeFilter, categoryFilter, followedClubsFilter, startDate, endDate)
			
			const tempobj = {}
			const tempCategories = {}
			for (const event of eventList) {
				if (event.eventTags) {
					for (const tag of event.eventTags) {
						tempobj[tag] = true
					}
				}
				if(event.eventCategory){
					tempCategories[event.eventCategory] = true
				}
			}
			
			if(Object.keys(selectedFilters).length === 0){
				setSelectedFilters(tempobj)
			}
			if(Object.keys(selectedCategories).length === 0){
				setSelectedCategories(tempCategories)
			}
		}
		catch(error){
			console.log(error)
		}

	}

	const getTrendingEvents = async () => {
		try{
			const response = await api.get('/api/events/getTrendingEvents');
			setTrendingEvents(response.data.events);
		}catch(error){
			console.log("Error fetching trending events:", error)
		}
	}

	const getOrganizerIdValue = (event) => {
		if (event?.organizerId && typeof event.organizerId === 'object') {
			return event.organizerId._id
		}
		return event?.organizerId
	}

	const applyFilters = (eventList, eligibility, eventType, category, followedClubsOnly, start, end) => {
		let filtered = eventList

		if(eligibility !== "all"){
			filtered = filtered.filter(event => event.eligibility && event.eligibility.toLowerCase() === eligibility.toLowerCase())
		}

		if(eventType !== "all"){
			filtered = filtered.filter(event => (event.eventType === eventType ))
		}

		if(category !== "all"){
			filtered = filtered.filter(event => event.eventCategory && event.eventCategory === category)
		}

		if(followedClubsOnly === "followed" && followedClubs.length > 0){
			filtered = filtered.filter(event => followedClubs.includes(getOrganizerIdValue(event)))
		}

		if(start) filtered = filtered.filter(e => new Date(e.eventStartDate) >= new Date(start))
		if(end) filtered = filtered.filter(e => new Date(e.eventEndDate) <= new Date(end))

		setEvents(filtered)
	}

	const changeSearchFilter = (e) => {
		setFilter(e.target.value)
	}
	const handleFilterChange = (e) => {
		const selectedTag = e.target.value
	
		setFilter(selectedTag)
		getAllEvents(selectedTag)
	}
	
	const handleEligibilityChange = (e) => {
		const selectedEligibility = e.target.value
		setEligibilityFilter(selectedEligibility)
		applyFilters(allEvents, selectedEligibility, eventTypeFilter, categoryFilter, followedClubsFilter, startDate, endDate)
	}

	const handleEventTypeChange = (e) => {
		const selectedType = e.target.value
		setEventTypeFilter(selectedType)
		applyFilters(allEvents, eligibilityFilter, selectedType, categoryFilter, followedClubsFilter, startDate, endDate)
	}

	const handleCategoryChange = (e) => {
		const selectedCategory = e.target.value
		setCategoryFilter(selectedCategory)
		applyFilters(allEvents, eligibilityFilter, eventTypeFilter, selectedCategory, followedClubsFilter, startDate, endDate)
	}

	const handleFollowedClubsChange = (e) => {
		const value = e.target.value
		setFollowedClubsFilter(value)
		applyFilters(allEvents, eligibilityFilter, eventTypeFilter, categoryFilter, value, startDate, endDate)
	}	
	const handleDateChange = (e) => {
		const {name, value} = e.target
		let start = startDate
		let end = endDate

		if(name === "start"){
			start = value
			setStartDate(value)
		} else {
			end = value
			setEndDate(value)
		}
		applyFilters(allEvents, eligibilityFilter, eventTypeFilter, categoryFilter, followedClubsFilter, start, end)
	}
	useEffect(()=>{
		const fetchFollowedClubs = async () => {
			try{
				const response = await api.get('/api/users/getProfile')
				if(response.data.followedClubs){
					setFollowedClubs(response.data.followedClubs.map(club => club._id))
				}
			}catch(error){
				console.log("Error fetching followed clubs:", error)
			}
		}
		fetchFollowedClubs()
		getAllEvents()
		getTrendingEvents()
	},[])

	const handleeventclick = (eventId) => {
		window.location.href = `/participanteventview/${eventId}`;
	}
	if(events.length === 0){
		return (
			<div>
			<h2>Browse Events</h2>
			<input placeholder="Search events..." value={filter} onChange={changeSearchFilter}></input>
			<button onClick={() => getAllEvents()}>Search</button>
			<br/>
			<label>Filter by Tag: </label>
			<select value={filter} onChange={handleFilterChange}>
				<option value="">All Tags</option>
				{Object.keys(selectedFilters).map((tag)=>(
					<option key={tag} value={tag}>{tag}</option>
				))}
			</select>
			<label> Eligibility: </label>
			<select value={eligibilityFilter} onChange={handleEligibilityChange}>
				<option value="all">All</option>
				<option value="iiit">IIIT</option>
				<option value="non-iiit">Non-IIIT</option>
			</select>
			<label> Event Type: </label>
			<select value={eventTypeFilter} onChange={handleEventTypeChange}>
				<option value="all">All</option>
				<option value="normal">Normal</option>
				<option value="merchandise">Merchandise</option>
			</select>
			<label> Followed Clubs: </label>
			<select value={followedClubsFilter} onChange={handleFollowedClubsChange}>
				<option value="all">All Clubs</option>
				<option value="followed">Followed Only</option>
			</select>
			<label> Category: </label>
			<select value={categoryFilter} onChange={handleCategoryChange}>
				<option value="all">All</option>
				{Object.keys(selectedCategories).map((cat)=>(
					<option key={cat} value={cat}>{cat}</option>
				))}
			</select>
			<label>Start Date:</label>
			<input type="date" name="start" value={startDate} onChange={handleDateChange} />
			<label>End Date:</label>
			<input type="date" name="end" value={endDate} onChange={handleDateChange} />
			<p>No events found.</p>
			</div>
			
		)
	}
	return (
		<div>
			<h2>Browse Events</h2>
			<input placeholder="Search events..." value={filter} onChange={changeSearchFilter}></input>
			<button onClick={() => getAllEvents()}>Search</button>
			<br/>
			<label>Filter by Tag: </label>
			<select value={filter} onChange={handleFilterChange}>
				<option value="">All Tags</option>
				{Object.keys(selectedFilters).map((tag)=>(
					<option key={tag} value={tag}>{tag}</option>
				))}
			</select>
			<label> Eligibility: </label>
			<select value={eligibilityFilter} onChange={handleEligibilityChange}>
				<option value="all">All</option>
				<option value="iiit">IIIT</option>
				<option value="non-iiit">Non-IIIT</option>
			</select>
			<label> Event Type: </label>
			<select value={eventTypeFilter} onChange={handleEventTypeChange}>
				<option value="all">All</option>
				<option value="normal">Normal</option>
				<option value="merchandise">Merchandise</option>
		</select>
		<label> Followed Clubs: </label>
		<select value={followedClubsFilter} onChange={handleFollowedClubsChange}>
			<option value="all">All Clubs</option>
			<option value="followed">Followed Only</option>
		</select>
		<label> Category: </label>
		<select value={categoryFilter} onChange={handleCategoryChange}>
			<option value="all">All</option>
			{Object.keys(selectedCategories).map((cat)=>(
				<option key={cat} value={cat}>{cat}</option>
			))}
		</select>
			<label>Start Date:</label>
			<input type="date" name="start" value={startDate} onChange={handleDateChange} />
			<label>End Date:</label>
			<input type="date" name="end" value={endDate} onChange={handleDateChange} />
		{events.map((event)=>(
			<div key={event._id} style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0'}}>
				<h3>{event.eventName}</h3>
				<p><strong>Organizer:</strong> {event.organizerId?.organizername || 'Unknown'}</p>
				<p><strong>Description:</strong> {event.eventDescription}</p>
				<p><strong>Type:</strong> {event.eventType}</p>
				<p><strong>Status:</strong> {event.eventStatus}</p>
				<p><strong>Eligibility:</strong> {event.eligibility}</p>
				<p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
				<p><strong>Event Start Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}</p>
				<p><strong>Event End Date:</strong> {new Date(event.eventEndDate).toLocaleDateString()}</p>
				<p><strong>Registration Limit:</strong> {event.registrationLimit}</p>
				<p><strong>Registered Count:</strong> {event.registeredCount}</p>
				<p><strong>Registration Fee:</strong> ₹{event.registrationFee}</p>
				<p><strong>Tags:</strong> {event.eventTags?.join(', ') || 'None'}</p>
				<p><strong>Event Category:</strong> {event.eventCategory}</p>
				<button onClick={() => handleeventclick(event._id)}> View Event</button>
			</div>
		))}
		
		<h2>Trending Events</h2>
		{trendingEvents.length === 0 ? <p>No trending events at the moment</p> : trendingEvents.map((event)=>(
			<div key={event._id} style={{border: '1px solid #ccc', padding: '15px', margin: '10px 0'}}>
				<h3>{event.eventName}</h3>
				<p><strong>Organizer:</strong> {event.organizerId?.organizername || 'Unknown'}</p>
				<p><strong>Description:</strong> {event.eventDescription}</p>
				<p><strong>Type:</strong> {event.eventType}</p>
				<p><strong>Status:</strong> {event.eventStatus}</p>
				<p><strong>Eligibility:</strong> {event.eligibility}</p>
				<p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleDateString()}</p>
				<p><strong>Event Start Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}</p>
				<p><strong>Event End Date:</strong> {new Date(event.eventEndDate).toLocaleDateString()}</p>
				<p><strong>Registration Limit:</strong> {event.registrationLimit}</p>
				<p><strong>Registered Count:</strong> {event.registeredCount}</p>
				<p><strong>Registration Fee:</strong> ₹{event.registrationFee}</p>
				<p><strong>Tags:</strong> {event.eventTags?.join(', ') || 'None'}</p>
				<p><strong>Event Category:</strong> {event.eventCategory}</p>
				<button onClick={() => handleeventclick(event._id)}> View Event</button>
			</div>
		))}
		</div>
	)
}

export default BrowseEvents
