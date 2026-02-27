"use client";

import { MoreVertical, ArrowRight } from "lucide-react";
import Link from "next/link";

const courses = [
  {
    id: 1,
    title: "Introduction to UX Design",
    category: "Design",
    students: 317,
    price: 49.99,
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: 2,
    title: "Advanced Python",
    category: "Development",
    students: 148,
    price: 89.99,
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: 3,
    title: "Digital Marketing 101",
    category: "Marketing",
    students: 0,
    price: 29.99,
    status: "Draft",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: 4,
    title: "Data Science Bootcamp",
    category: "Data",
    students: 84,
    price: 129.99,
    status: "Published",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=60",
  },
  {
    id: 5,
    title: "Project Management",
    category: "Business",
    students: 207,
    price: 59.99,
    status: "Archived",
    image:
      "https://images.unsplash.com/photo-1507537297725-24a1c434c67b?w=100&auto=format&fit=crop&q=60",
  },
];

export default function RecentCourses() {
  return (
    <div className="bg-white rounded-sm border border-gray-100 overflow-hidden">
      <div className="p-5 flex items-center justify-between border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">Recent Courses</h3>
        <Link
          href="/teacher/courses"
          className="text-sm font-medium text-red-700 hover:text-red-800 flex items-center gap-1"
        >
          View all courses <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Course Name
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Category
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Enrolled
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="text-left py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right py-3 px-5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {courses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-sm bg-gray-100 bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${course.image})` }}
                    ></div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        {course.title}
                      </h4>
                      <span className="text-xs text-gray-400">
                        ID: #C-{1024 + course.id}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span className="text-sm text-gray-600">
                    {course.category}
                  </span>
                </td>
                <td className="py-4 px-5">
                  {course.students > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(3, course.students))].map(
                          (_, i) => (
                            <div
                              key={i}
                              className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white"
                            ></div>
                          )
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        +{course.students}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      No enrollments yet
                    </span>
                  )}
                </td>
                <td className="py-4 px-5">
                  <span className="text-sm font-medium text-gray-900">
                    ${course.price}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      course.status === "Published"
                        ? "text-green-700"
                        : course.status === "Draft"
                          ? "text-red-700"
                          : "text-gray-600"
                    }`}
                  >
                    {course.status}
                  </span>
                </td>
                <td className="py-4 px-5 text-right">
                  <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">Showing 5 of 12 courses</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-1.5 text-xs border border-gray-200 rounded-sm text-gray-500 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
