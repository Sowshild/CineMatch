import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Star, Award, Bookmark, Film } from "lucide-react";

export function RatingStatsChart({ stats }) {
  if (!stats) return null;

  const { total_ratings, average_rating, total_favorites, rating_distribution, top_genres } = stats;

  const barColors = ["#EF4444", "#F97316", "#FBBF24", "#38BDF8", "#8B5CF6"];

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#12151D] border border-[#292E3A] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
            <Film size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Total Rated
            </p>
            <p className="text-xl font-extrabold text-[#F8FAFC]">{total_ratings}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12151D] border border-[#292E3A] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30">
            <Star size={18} className="fill-[#FBBF24]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Average Score
            </p>
            <p className="text-xl font-extrabold text-[#F8FAFC]">
              {average_rating > 0 ? `${average_rating}★` : "0.0"}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12151D] border border-[#292E3A] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
            <Bookmark size={18} className="fill-[#38BDF8]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Watchlist
            </p>
            <p className="text-xl font-extrabold text-[#F8FAFC]">{total_favorites}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12151D] border border-[#292E3A] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30">
            <Award size={18} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
              Top Genre
            </p>
            <p className="text-xl font-extrabold text-[#F8FAFC] truncate max-w-[100px]">
              {top_genres && top_genres[0] ? top_genres[0].genre : "None"}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rating Score Distribution Chart */}
        <div className="p-5 rounded-xl bg-[#12151D] border border-[#292E3A]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-4 flex items-center gap-2">
            <Star size={15} className="text-[#FBBF24]" />
            Rating Distribution (1 - 5 Stars)
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rating_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="stars"
                  tickFormatter={(val) => `${val}★`}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-2.5 rounded-lg bg-[#1B202B] border border-[#292E3A] text-xs shadow-xl">
                          <p className="font-bold text-[#FBBF24]">{data.stars} Stars</p>
                          <p className="text-[#F8FAFC]">{data.count} movie{data.count !== 1 ? "s" : ""}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {rating_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Genres Breakdown Chart */}
        <div className="p-5 rounded-xl bg-[#12151D] border border-[#292E3A]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-4 flex items-center gap-2">
            <Film size={15} className="text-[#8B5CF6]" />
            Most Rated Genres
          </h3>
          <div className="h-52 w-full">
            {top_genres && top_genres.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top_genres}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 15, bottom: 0 }}
                >
                  <XAxis type="number" stroke="#64748b" fontSize={11} allowDecimals={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="genre"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-lg bg-[#1B202B] border border-[#292E3A] text-xs shadow-xl">
                            <p className="font-bold text-[#8B5CF6]">{data.genre}</p>
                            <p className="text-[#F8FAFC]">{data.count} rating{data.count !== 1 ? "s" : ""}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#A1A1AA]">
                Rate more movies to see your genre breakdown!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
