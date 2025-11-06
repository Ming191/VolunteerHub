import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    MessageSquare,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User,
} from "lucide-react";

export default function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/");
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        { icon: Calendar, label: "Events", href: "/events" },
        { icon: FileText, label: "Blog", href: "/blog" },
        { icon: MessageSquare, label: "Inbox", href: "/inbox" },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 ${
                    sidebarOpen ? "w-64" : "w-20"
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center">
                                <span className="text-white text-sm font-bold">VH</span>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">VolunteerHub</span>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            to={item.href}
                            className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-900 transition group"
                        >
                            <item.icon size={20} />
                            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">VolunteerHub</h1>
                            <p className="text-gray-500 text-sm">Empowering your volunteering journey</p>
                        </div>

                        {/* User Avatar & Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition"
                            >
                                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center border-2 border-indigo-200">
                                    <User className="text-indigo-600" size={20} />
                                </div>
                                {userDropdownOpen && <ChevronDown size={16} className="text-gray-600" />}
                            </button>

                            {/* Dropdown Menu */}
                            {userDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">Nguyễn Văn A</p>
                                        <p className="text-xs text-gray-500">volunteer@example.com</p>
                                    </div>
                                    <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        <User size={16} />
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Nội dung của từng trang con */}
                <main className="flex-1 overflow-auto p-6">
                    <Outlet />
                </main>
            </div>

            {/* Overlay cho dropdown */}
            {userDropdownOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                />
            )}
        </div>
    );
}
