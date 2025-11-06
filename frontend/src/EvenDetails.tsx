import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Event } from "./model/Event";
import { MapPin, CalendarDays, Tag } from "lucide-react";

export default function EventDetail() {
  const { id } = useParams(); // lấy id từ URL
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    // 🚀 Giả lập lấy dữ liệu (sau này thay bằng fetch API)
    const mockEvents: Event[] = [
      {
        id: 1,
        title: "Dọn dẹp công viên",
        location: "Công viên Thống Nhất",
        category: "Môi trường",
        date: "2024-03-15",
        imageUrl: "https://images.unsplash.com/photo-1503264116251-35a269479413",
        description:
          "Hoạt động dọn dẹp công viên Thống Nhất nhằm nâng cao ý thức bảo vệ môi trường. Tình nguyện viên sẽ tham gia thu gom rác thải, trồng cây xanh, và tuyên truyền nâng cao nhận thức cho người dân.",
      },
      {
        id: 2,
        title: "Dạy học cho trẻ em",
        location: "Trung tâm thiếu nhi",
        category: "Giáo dục",
        date: "2024-03-18",
        imageUrl: "https://images.unsplash.com/photo-1600880292089-90e6a5d1b9c5",
        description:
          "Chương trình dạy học miễn phí cho trẻ em có hoàn cảnh khó khăn. Tình nguyện viên sẽ hỗ trợ dạy kèm toán, tiếng Việt và kỹ năng sống.",
      },
    ];

    const found = mockEvents.find((e) => e.id === Number(id));
    setEvent(found || null);
  }, [id]);

  if (!event) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading event details...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Image */}
        <div className="flex-shrink-0 md:w-1/2">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>

        {/* Right: Info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              {event.title}
            </h1>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-indigo-600" />
                <span>{event.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-indigo-600" />
                <span>
                  {new Date(event.date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button className="px-6 py-3 bg-indigo-900 text-white rounded-lg hover:bg-indigo-800 font-medium transition">
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* Description section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Event Description
        </h2>
        <p className="text-gray-700 leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}
