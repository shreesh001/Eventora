const Event = require('../models/event');

// get all events
const getAllEvents = async (req, res) => {
    try {
        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.maxPrice) {
            filters.ticketPrice = { $lte: Number(req.query.maxPrice) }; // range filter 
            // lte is less than or equal to, gte is greater than or equal to, lt is less than, gt is greater than  
        }

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// get event by id
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// create event
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, location, 
                category, totalSeats, availableSeats, 
                ticketPrice, imageUrl } = req.body;

        const event = new Event({
            title,
            description,
            date,
            time,          
            location,
            category,
            totalSeats,    
            availableSeats,
            ticketPrice,
            imageUrl: imageUrl || 'https://via.placeholder.com/400x200.png?text=Event+Image',
            createdBy: req.user._id
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// update event
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        const { title, description, date, time, 
                location, category, ticketPrice, imageUrl } = req.body;

        event.title = title ?? event.title;               
        event.description = description ?? event.description;
        event.date = date ?? event.date;
        event.time = time ?? event.time;                  
        event.location = location ?? event.location;
        event.category = category ?? event.category;
        event.ticketPrice = ticketPrice ?? event.ticketPrice; 
        event.imageUrl = imageUrl ?? event.imageUrl;

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// delete event
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};