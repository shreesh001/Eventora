const express = require('express');
const router = express.Router();
const {protect, admin} = require('../middleware/auth');
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');

// get all events
router.get('/', getAllEvents);

// Get event by ID
router.get('/:id', getEventById);

// create event
router.post('/',protect, admin, createEvent);

// update event
router.put('/:id', protect, admin, updateEvent);

// delete event
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;