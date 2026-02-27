"use client";

import { Lightbulb } from "lucide-react";

export default function ProTipBanner() {
  return (
    <div className="bg-zinc-900 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between text-white relative overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-zinc-800 rounded-lg">
          <Lightbulb className="text-yellow-400" size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold mb-0.5">
            Pro Tip: Engage your students
          </h3>
          <p className="text-xs text-zinc-400 max-w-md">
            Courses with video quizzes have 30% higher completion rates. Try
            adding a quiz to "Advanced Python" today.
          </p>
        </div>
      </div>

      <button className="mt-4 md:mt-0 bg-white text-zinc-900 px-4 py-2 rounded-sm text-xs font-bold hover:bg-gray-100 transition-colors">
        Add Quiz Now
      </button>
    </div>
  );
}
