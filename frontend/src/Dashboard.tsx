import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  User
} from "lucide-react";

export default function Dashboard() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const volunteerEvents = [
    { id: 1, title: "Dọn dẹp công viên", date: "2024-03-15", time: "08:00 - 12:00", location: "Công viên Thống Nhất" },
    { id: 2, title: "Dạy học cho trẻ em", date: "2024-03-18", time: "14:00 - 17:00", location: "Trung tâm thiếu nhi" },
    { id: 3, title: "Hiến máu nhân đạo", date: "2024-03-20", time: "07:30 - 11:30", location: "Bệnh viện Huyết học" },
    { id: 4, title: "Phân loại rác thải", date: "2024-03-22", time: "09:00 - 16:00", location: "Phường Kim Liên" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Volunteer Schedule */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Volunteer Schedule
                  </h2>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {volunteerEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex flex-col items-center justify-center">
                        <span className="text-indigo-900 font-semibold text-sm">
                          {new Date(event.date).getDate()}
                        </span>
                        <span className="text-indigo-600 text-xs">
                          {new Date(event.date).toLocaleString('en-US', { month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-indigo-900">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {event.time} • {event.location}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-medium rounded-lg transition">
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats & Quick Actions */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-indigo-900">12</div>
                  <div className="text-sm text-gray-500">Total Events</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-indigo-900">48</div>
                  <div className="text-sm text-gray-500">Hours Volunteered</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-indigo-900">4</div>
                  <div className="text-sm text-gray-500">Upcoming Events</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="text-2xl font-bold text-indigo-900">8</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition">
                    <div className="font-medium text-gray-900">Find New Events</div>
                    <div className="text-sm text-gray-500">Discover volunteering opportunities</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition">
                    <div className="font-medium text-gray-900">Create Blog Post</div>
                    <div className="text-sm text-gray-500">Share your experiences</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition">
                    <div className="font-medium text-gray-900">View Certificates</div>
                    <div className="text-sm text-gray-500">Your volunteering achievements</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for dropdown */}
      {userDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserDropdownOpen(false)}
        />
      )}
    </div>
  );
}
