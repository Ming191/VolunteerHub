import {useEffect, useState} from "react";
import { Search, Calendar, Filter } from "lucide-react";
import  type { Event } from "./model/Event";

export default function EventList () {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/events");
        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || event.category === category;
    const eventDate = new Date(event.date);
    const afterStart = startDate ? eventDate >= new Date(startDate) : true;
    const beforeEnd = endDate ? eventDate <= new Date(endDate) : true;
    return matchesSearch && matchesCategory && afterStart && beforeEnd;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        {/* Search */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full lg:w-1/3 shadow-sm">
          <Search className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            className="flex-1 outline-none text-sm text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Filter size={16} className="text-gray-400 mr-2" />
            <select
              className="outline-none text-sm text-gray-700 bg-transparent"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Môi trường">Môi trường</option>
              <option value="Giáo dục">Giáo dục</option>
              <option value="Sức khỏe">Sức khỏe</option>
            </select>
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <input
              type="date"
              className="text-sm text-gray-700 bg-transparent outline-none"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-gray-400 mr-2" />
            <input
              type="date"
              className="text-sm text-gray-700 bg-transparent outline-none"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-indigo-200 transition"
            >
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{event.location}</p>
                <p className="text-sm text-gray-600 mb-4">
                  <Calendar size={14} className="inline mr-1 text-indigo-600" />
                  {new Date(event.date).toLocaleDateString("vi-VN")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                  <button className="text-sm bg-indigo-900 hover:bg-indigo-800 text-white px-3 py-1.5 rounded-lg font-medium transition">
                    View Detail
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10">
            No events found.
          </div>
        )}
      </div>
    </div>
  );
}
