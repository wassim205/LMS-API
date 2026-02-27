"use client";

import {
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import CourseCard from "../../components/home/CourseCard";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { getMediaUrl } from "../../lib/media";
import { Course, courseApi, CourseFilters } from "../../lib/services/courseService";

const CATEGORIES = [
  "Development",
  "Design",
  "Marketing",
  "Data Science",
  "Business",
  "Finance",
  "Photography",
  "Music",
  "Personal Development",
  "Health & Fitness",
];

// --- Components ---

function CustomDropdown({
  options,
  selected,
  onChange,
  label
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  label: string;
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

  const handleSelect = (option: string) => {
    let newSelected;
    if (selected.includes(option)) {
      newSelected = selected.filter((item) => item !== option);
    } else {
      newSelected = [...selected, option];
    }
    onChange(newSelected);
  };

  const getDisplayText = () => {
    if (selected.length === 0) return label;
    if (selected.length === 1) return selected[0];
    return `${label} (${selected.length})`;
  };

  return (
    <div className="relative min-w-[200px]" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 bg-white border rounded text-sm transition-all ${isOpen ? "border-red-600 ring-1 ring-red-500/10" : "border-gray-200 hover:border-gray-300 text-gray-700"
          }`}
      >
        <span className="truncate">{getDisplayText()}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-lg shadow-lg z-50 py-1 max-h-60 overflow-y-auto">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center justify-between ${isSelected
                    ? "text-red-600 font-medium bg-red-50"
                    : "text-gray-600"
                  }`}
              >
                {option}
                {isSelected && <Check size={14} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CoursesInner() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  // Internal state for multi-select
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [filters, setFilters] = useState<CourseFilters>({
    category: undefined,
    level: undefined,
    search: undefined,
    page: 1,
    limit: 8,
  });

  // Sync from URL search params
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get("search");
    const categoryParam = urlParams.get("category");

    if (search || categoryParam) {
      setFilters(prev => {
        const next = { ...prev, page: 1 };
        if (search) next.search = search;
        if (categoryParam) {
          next.category = categoryParam;
          setSelectedCategories(categoryParam.split(','));
        }
        return next;
      });
    }
  }, []);

  // Sync selectedCategories to filters.category (comma separated)
  useEffect(() => {
    const categoryString = selectedCategories.length > 0 ? selectedCategories.join(',') : undefined;
    setFilters(prev => ({ ...prev, category: categoryString, page: 1 }));
  }, [selectedCategories]);

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllPublic(filters);
      setCourses(response.courses);
      setPagination({
        total: response.total,
        page: response.page,
        pages: response.pages,
      });
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFilters({
      page: 1,
      limit: 8,
      search: undefined,
      category: undefined
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFiltersCount = [filters.category, filters.search].filter(Boolean).length;

  return (
    <div className="flex flex-1 w-full bg-white">
      {/* Main Content */}
      <main className="flex-1">
        {/* Page Header Section */}
        <div className="bg-white px-6 pt-12 pb-8 md:px-10 border-b border-gray-100">
          <div className="max-w-[1370px] mx-auto">
            <h1 className="text-[#1a1a1a] text-3xl font-bold tracking-tight mb-2">
              Explore Courses
            </h1>
            <p className="text-gray-500 text-md leading-relaxed">
              Discover our wide range of courses designed to help you master new skills.
            </p>
          </div>
        </div>

        {/* Courses Content Section */}
        <div className="px-6 pt-10 pb-12 md:px-10 min-h-full">
          <div className="max-w-[1370px] mx-auto">

            {/* Controls Line (Count + Filter) */}
            <div className="flex flex-row items-center justify-between mb-8">
              <p className="text-gray-500 text-sm">
                Showing <span className="text-[#1a1a1a] font-bold">{courses.length}</span> of{" "}
                <span className="text-[#1a1a1a] font-bold">{pagination.total}</span> results
              </p>

              <CustomDropdown
                options={CATEGORIES}
                selected={selectedCategories}
                onChange={setSelectedCategories}
                label="All Categories"
              />
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 items-center mb-8">
                {selectedCategories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-1.5 bg-red-700/10 text-red-700 border border-red-700/20 rounded-full px-3 py-1 transition-colors hover:bg-red-700/20 cursor-pointer group"
                    onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== cat))}
                  >
                    <span className="text-xs font-bold">{cat}</span>
                    <X size={14} className="group-hover:text-red-800" />
                  </div>
                ))}
                {filters.search && (
                  <div className="flex items-center gap-1.5 bg-[#f4f0f1] text-[#1a1a1a] border border-[#e6dbdd] rounded-full px-3 py-1 transition-colors hover:bg-[#e6dbdd] cursor-pointer group" onClick={() => setFilters({ ...filters, search: undefined })}>
                    <span className="text-xs font-medium">"{filters.search}"</span>
                    <X size={14} className="text-gray-500 group-hover:text-[#1a1a1a]" />
                  </div>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-700 hover:underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
              </div>
            ) : courses.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Search className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 text-lg mb-2">No courses found</p>
                <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-sm hover:bg-gray-50 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  category={course.category}
                  imageUrl={getMediaUrl(course.thumbnail)}
                  rating="4.8"
                  reviewCount="0"
                  title={course.title}
                  description={course.description}
                  instructorName={`${course.instructorId.firstName} ${course.instructorId.lastName}`}
                  instructorAvatar={`https://ui-avatars.com/api/?name=${course.instructorId.firstName}+${course.instructorId.lastName}&background=random&color=fff&background=ef4444`}
                  price={`${course.price.toFixed(2)} DH`}
                  slug={course._id}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-12 mb-12">
                <nav className="flex items-center gap-2">
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    let pageNumber;
                    if (pagination.pages <= 5) {
                      pageNumber = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNumber = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNumber = pagination.pages - 4 + i;
                    } else {
                      pageNumber = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNumber}
                        className={`flex items-center justify-center w-10 h-10 rounded text-sm font-medium border transition-all ${pagination.page === pageNumber
                            ? "bg-red-700 text-white border-red-700 shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  {pagination.pages > 5 && pagination.page < pagination.pages - 2 && (
                    <>
                      <span className="flex items-center justify-center w-10 h-10 text-gray-400 font-medium">
                        ...
                      </span>
                      <button
                        className="flex items-center justify-center w-10 h-10 rounded text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
                        onClick={() => handlePageChange(pagination.pages)}
                      >
                        {pagination.pages}
                      </button>
                    </>
                  )}

                  <button
                    className="flex items-center justify-center w-10 h-10 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    <ChevronRight size={20} />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
        </div>
        </div>
      </main>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
          </div>
        }
      >
        <CoursesInner />
      </Suspense>
      <Footer />
    </div>
  );
}
