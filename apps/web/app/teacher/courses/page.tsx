"use client";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ConfirmDeleteModal from "@/components/modals/ConfirmDeleteModal";
import {
  teacherCourseService,
  type Course,
} from "@/lib/services/teacher-course.service";
import {
  Check,
  ChevronDown,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const categories = [
  "All Categories",
  "Design",
  "Development",
  "Marketing",
  "Data Science",
  "Business",
  "Finance",
];
const statuses = ["All Status", "published", "draft", "archived"];

// --- Components ---

function CustomDropdown({
  options,
  value,
  onChange,
  minWidth = "min-w-[140px]",
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  minWidth?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${minWidth}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded text-sm text-gray-700 hover:border-gray-300 transition-colors"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                value === option
                  ? "text-red-600 font-medium bg-red-50"
                  : "text-gray-600"
              }`}
            >
              {option}
              {value === option && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionMenu({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <>
          {/* Invisible backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          {/* Dropdown menu - using fixed positioning */}
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
            className="w-40 bg-white border border-gray-100 rounded shadow-lg z-50 py-1.5 px-1"
          >
            <button
              onClick={() => {
                router.push(`/teacher/courses/${courseId}`);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded flex items-center gap-3 transition-colors"
            >
              <Eye size={16} /> View
            </button>
            <button
              onClick={() => {
                router.push(`/teacher/courses/${courseId}/edit`);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded flex items-center gap-3 transition-colors"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const deleteEvent = new CustomEvent("delete-course", {
                  detail: { courseId },
                });
                window.dispatchEvent(deleteEvent);
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Listen for delete events from ActionMenu
  useEffect(() => {
    const handleDeleteCourse = (event: Event) => {
      const customEvent = event as CustomEvent<{ courseId: string }>;
      setCourseToDelete(customEvent.detail.courseId);
      setDeleteModalOpen(true);
    };

    window.addEventListener("delete-course", handleDeleteCourse);
    return () => window.removeEventListener("delete-course", handleDeleteCourse);
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await teacherCourseService.getAllCourses();
      setCourses(data);
    } catch (error: any) {
      console.error("Failed to fetch courses:", error);
      toast.error(error.message || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      await teacherCourseService.deleteCourse(courseToDelete);
      toast.success("Course deleted successfully");
      setCourses(courses.filter((c) => c._id !== courseToDelete));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (error: any) {
      console.error("Failed to delete course:", error);
      toast.error(error.message || "Failed to delete course");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All Categories" ||
      course.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "All Status" || course.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper to get status display
  const getStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-700";
      case "draft":
        return "text-red-700";
      case "archived":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  // Helper for thumbnail URL
  const getThumbnailUrl = (thumbnail?: string) => {
    if (!thumbnail) return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=60";
    
    if (thumbnail.includes("localhost:3000/uploads")) {
        return thumbnail.replace("localhost:3000", "localhost:4000");
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    if (thumbnail.startsWith("http")) return thumbnail;
    return `${apiUrl}/${thumbnail.startsWith("/") ? thumbnail.slice(1) : thumbnail}`;
  };

  return (
    <>
      <DashboardHeader
        title="Courses"
        description="Manage your courses, lessons, and quizzes."
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Actions Bar: Search & Filters Grouped + Create Button */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Search + Filters Group */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-red-500/20 focus:border-red-300 outline-none transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Custom Dropdowns */}
            <CustomDropdown
              options={statuses}
              value={selectedStatus}
              onChange={setSelectedStatus}
              minWidth="w-full sm:w-40"
            />

            <CustomDropdown
              options={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
              minWidth="w-full sm:w-48"
            />
          </div>

          {/* Create Button */}
          <Link href="/teacher/courses/create">
            {" "}
            <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-medium text-sm transition-colors shadow-sm w-full md:w-auto justify-center">
              <Plus size={16} />
              <span>Create Course</span>
            </button>
          </Link>
        </div>

        {/* Table View */}
        <div className="bg-white rounded border border-gray-100 min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-red-600" />
            </div>
          ) : (
            <>
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
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <p className="text-sm text-gray-500">
                            No courses found. Create your first course!
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => (
                        <tr
                          key={course._id}
                          className="hover:bg-gray-50/50 transition-colors group"
                        >
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                                <div
                                className="h-10 w-10 rounded bg-gray-100 bg-cover bg-center shrink-0"
                                style={{
                                  backgroundImage: `url('${getThumbnailUrl(course.thumbnail)}')`,
                                }}
                              ></div>
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                                  {course.title}
                                </h4>
                                <span className="text-xs text-gray-400">
                                  ID: #{course._id.slice(-6)}
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
                            <span className="text-sm font-medium text-gray-900">
                              ${course.price || 0}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                course.status
                              )}`}
                            >
                              {getStatusDisplay(course.status)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <ActionMenu courseId={course._id} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Showing {filteredCourses.length} of {courses.length} courses
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCourseToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone and will remove all associated modules and lessons."
        isDeleting={isDeleting}
      />
    </>
  );
}
