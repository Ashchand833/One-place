const mongoose = require('mongoose');

const calendarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String },
  deadlineDate: { type: Date, required: true },
  hours: { type: Number },
  addDate: { type: Date, default: Date.now },
  worker: { type: String }
});

module.exports = mongoose.model("CalendarEvent", calendarSchema);